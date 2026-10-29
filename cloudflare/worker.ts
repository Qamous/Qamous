/// <reference path="./worker-configuration.d.ts" />
import {renderApplication, type RenderSeed} from 'qamous:ssr';
import {wordPage,browsePage,dialectPage,sitemapIndex,sitemapStatic,sitemapWords} from './seo-content.mjs';
import {requestPreferences} from '../src/rendering/preferences';
import {publicSnapshotResponse,snapshotEnabled,snapshotExpired,type SnapshotEnvironment} from './public-snapshot';

// EEA (EU + Iceland/Liechtenstein/Norway), UK and Switzerland. Unknown/Tor
// locations fail closed. Only Cloudflare's trusted request metadata is used.
const consentCountries = new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH'.split(' '));
export function requiresAnalyticsConsent(country: unknown): boolean {
  return typeof country !== 'string' || !/^[A-Z]{2}$/.test(country) || country === 'XX' || consentCountries.has(country);
}
class SeoNotFound extends Error {}
function unavailable() {
  // A temporary overload is not a removal from search. Google can retry this
  // URL without mistaking a quota response for a permanent noindex directive.
  return new Response('Qamous is temporarily unavailable. Please try again later.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Retry-After':'60','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"}});
}
export function sessionCookie(request:Request):string|undefined {
  return request.headers.get('Cookie')?.split(';').map(part=>part.trim()).find(part=>part.split('=',1)[0]==='qamous_session');
}
export function personalized(request:Request):boolean {
  return sessionCookie(request)!==undefined||request.headers.has('Authorization');
}
function privatePage(request:Request):boolean {
  const url=new URL(request.url);
  // The API caches the home candidate pool; keep each visit's weighted shuffle
  // fresh instead of sharing a previously randomized HTML page between visitors.
  return url.pathname==='/'||personalized(request)||(/^\/advanced-search(?:\/|$)/.test(url.pathname)&&Boolean(url.search))
    ||/^\/(?:login|signup|profile|add-definition|forgot-password|reset-password|search|chatbot|feeling-lucky)(?:\/|$)/.test(url.pathname);
}
export function publicCacheKey(request:Request,snapshotId?:string):Request {
  const url=new URL(request.url);
  const preferences=requestPreferences(url,request.headers.get('Cookie')||'',request.headers.get('Accept-Language')||'');
  // Only parameters that change rendered public content belong in its key.
  // Tracking tags and arbitrary query strings must not create new cache entries.
  const after=/^\/browse\/(en|ar)$/.test(url.pathname)?url.searchParams.get('after'):null;
  url.search='';
  if(after) url.searchParams.set('after',after);
  url.searchParams.set('__qamous_render','ssr-5');
  if(snapshotId)url.searchParams.set('__qamous_snapshot',snapshotId);
  url.searchParams.set('__qamous_language',preferences.language);
  url.searchParams.set('__qamous_theme',preferences.theme);
  // No cookies, credentials or visitor-specific headers enter Cache API keys.
  return new Request(url,{method:'GET'});
}
async function boundedJson(response:Response):Promise<any> {
  const reader=response.body?.getReader();
  if(!reader) throw new Error('Missing response body');
  const chunks:Uint8Array[]=[];let size=0;
  try {
    for(;;) {
      const {done,value}=await reader.read();if(done) break;
      size+=value.byteLength;if(size>262144) {await reader.cancel();throw new Error('Oversized response');}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function seoData(request:Request,env:Env,path:string) {
  const restored=await publicSnapshotResponse(new Request(new URL(path,request.url)),env as Env&SnapshotEnvironment);
  if(restored) {
    if(restored.status===404) {await restored.body?.cancel();throw new SeoNotFound();}
    if(!restored.ok) {await restored.body?.cancel();throw Object.assign(new Error('Public snapshot unavailable'),{status:restored.status});}
    return boundedJson(restored);
  }
  const headers=new Headers({'Accept':'application/json'});
  const ip=request.headers.get('CF-Connecting-IP');if(ip) headers.set('CF-Connecting-IP',ip);
  const internalSecret=(env as Env & {SEO_INTERNAL_SECRET?:string}).SEO_INTERNAL_SECRET;
  if(path.startsWith('/seo/')&&typeof internalSecret==='string'&&internalSecret.length>=32) headers.set('X-Qamous-Seo-Internal',internalSecret);
  const session=sessionCookie(request);
  if(!path.startsWith('/seo/')&&session) headers.set('Cookie',session);
  const apiUrl=new URL(path,request.url);
  // The first home page may warm several independent card buckets after an
  // outage. Allow that bounded request to finish without retrying D1 work.
  const timeoutMs=apiUrl.pathname==='/word/explore'&&apiUrl.searchParams.has('ids')?20000:10000;
  const response=await env.API.fetch(new Request(apiUrl,{headers,signal:AbortSignal.timeout(timeoutMs)}));
  if(response.status===404) {await response.body?.cancel();throw new SeoNotFound();}
  if(!response.ok) {await response.body?.cancel();throw Object.assign(new Error('SEO data unavailable'),{status:response.status});}
  return boundedJson(response);
}
async function cached(request:Request,ctx:ExecutionContext|undefined,produce:(request:Request)=>Promise<Response>,env?:Env&SnapshotEnvironment) {
  if(env&&snapshotExpired(env))return unavailable();
  if(!['GET','HEAD'].includes(request.method)||privatePage(request)||typeof caches==='undefined') return produce(request);
  const key=publicCacheKey(request,env?.PUBLIC_SNAPSHOT_ID);
  let hit:Response|undefined;
  try {hit=await caches.default.match(key);} catch { /* The API budget still protects an unavailable edge cache. */ }
  const response=hit||await produce(request.method==='HEAD'?new Request(request,{method:'GET'}):request);
  const headers=new Headers(response.headers);headers.set('X-Qamous-Cache',hit?'hit':'miss');
  const result=new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  if(!hit&&result.ok&&result.headers.get('Cache-Control')?.includes('public')&&!result.headers.has('Set-Cookie')&&ctx) {
    // Keep HTML short-lived so moderation is not hidden by a long stale page.
    // Invalidation-aware stale data and global coalescing live in the API cache.
    ctx.waitUntil(caches.default.put(key,result.clone()).catch(()=>undefined));
  }
  if(request.method==='HEAD') {await result.body?.cancel();return new Response(null,{status:result.status,headers:result.headers});}
  return result;
}
function xml(request:Request,body:string) {
  const headers={'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"};
  return new Response(request.method==='HEAD'?null:body,{headers});
}
async function applicationPage(request:Request,env:Env,meta?:{robots?:string},seed:RenderSeed={},status=200) {
  const asset=await env.ASSETS.fetch(new Request(new URL('/',request.url)));
  if(!asset.ok) return unavailable();
  try {
    const rendered=await renderApplication(request,path=>seoData(request,env,path),seed);
    const rewrite=new HTMLRewriter()
      .on('html',{element(e){e.setAttribute('lang',rendered.language);e.setAttribute('style',rendered.theme);}})
      .on('body',{element(e){if(rendered.grain)e.setAttribute('class','grain-mode');e.append(`<script id="qamous-state" type="application/json">${rendered.state}</script>`,{html:true});}})
      .on('head title,head meta[name="description"],head meta[name="robots"],head meta[property^="og:"],head meta[name^="twitter:"],head meta[property^="twitter:"],head link[rel="canonical"],head link[rel="alternate"]',{element(e){e.remove();}})
      .on('link[rel="stylesheet"],link[rel="modulepreload"]',{element(e){e.remove();}})
      .on('head',{element(e){e.append(rendered.head+rendered.assets,{html:true});}})
      .on('#root',{element(e){e.setAttribute('data-ssr','true');e.setInnerContent(rendered.html,{html:true});}});
    const response=rewrite.transform(asset);
    const headers=new Headers(response.headers);
    headers.set('Cache-Control',privatePage(request)||status!==200?'private, no-store':'public, max-age=60');
    headers.set('Vary','Cookie, Accept-Language');
    headers.set('X-Qamous-Rendering','react-ssr');
    headers.set('X-Robots-Tag',status!==200?'noindex, follow':meta?.robots||rendered.robots);
    headers.delete('ETag');headers.delete('Content-Length');
    if(request.method==='HEAD') await response.body?.cancel();
    return new Response(request.method==='HEAD'?null:response.body,{status,headers});
  } catch(error) {
    await asset.body?.cancel();
    console.error('Qamous server rendering failed',error instanceof Error?error.message:'Unknown render error');
    return unavailable();
  }
}
async function missingPage(request:Request,env:Env):Promise<Response> {
  return applicationPage(request,env,{robots:'noindex, follow'},{notFound:true},404);
}
function redirectPath(request:Request,path:string,keepSearch=true) {
  const url=new URL(path,request.url);
  if(keepSearch&&!path.includes('?')) url.search=new URL(request.url).search;
  return Response.redirect(url.toString(),308);
}
async function dynamic(request:Request,env:Env,ctx:ExecutionContext|undefined):Promise<Response|null> {
  const url=new URL(request.url),path=url.pathname;
  const word=path.match(/^\/word\/([1-9]\d*)(?:\/(en|ar))?\/?$/);
  const browse=path.match(/^\/browse\/(en|ar)\/?$/);
  const dialect=path.match(/^\/advanced-search\/([^/]+)\/?$/);
  const shard=path.match(/^\/sitemap-words-(0|[1-9]\d*)\.xml$/);
  const sitemap=['/sitemap.xml','/sitemap-static.xml'].includes(path)||!!shard;
  if(!word&&!browse&&!dialect&&!sitemap) return null;
  if(!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  if(word) {
    if(!Number.isSafeInteger(Number(word[1]))) return missingPage(request,env);
    const canonical='/word/'+word[1]+(word[2]==='ar'?'/ar':'');
    if(path!==canonical) return redirectPath(request,canonical);
    try {return await cached(request,ctx,async request=>{
      const data=await seoData(request,env,'/seo/word/'+word[1]);
      const meta=wordPage(data,word[2]==='ar'?'ar':'en',Number(word[1]));
      if(!meta) return missingPage(request,env);
      if(meta.robots==='index, follow'&&meta.canonicalPath!==canonical) return redirectPath(request,meta.canonicalPath);
      return applicationPage(request,env,meta,{word:true,wordData:data,personalized:personalized(request)&&!snapshotEnabled(env as Env&SnapshotEnvironment)});
    },env);} catch(error) {return error instanceof SeoNotFound?missingPage(request,env):unavailable();}
  }
  if(browse) {
    const canonical='/browse/'+browse[1];
    if(path!==canonical) return redirectPath(request,canonical);
    const after=url.searchParams.get('after');
    if(after!==null&&(!/^[1-9]\d*$/.test(after)||!Number.isSafeInteger(Number(after)))) return missingPage(request,env);
    if([...url.searchParams.keys()].some(key=>key!=='after')||url.searchParams.getAll('after').length>1) return redirectPath(request,canonical+(after?'?after='+encodeURIComponent(after):''),false);
    try {return await cached(request,ctx,async request=>{
      const data=await seoData(request,env,'/seo/browse/'+browse[1]+(after?'?after='+encodeURIComponent(after):''));
      const index=await seoData(request,env,'/seo/index');
      return applicationPage(request,env,browsePage(data,index,after),{browse:data,countries:index.countries});
    },env);} catch(error) {return error instanceof SeoNotFound?missingPage(request,env):unavailable();}
  }
  if(dialect) {
    let name:string;
    try {name=decodeURIComponent(dialect[1]);}
    catch {return missingPage(request,env);}
    const canonical='/advanced-search/'+encodeURIComponent(name);
    if(path!==canonical) return redirectPath(request,canonical);
    try {return await cached(request,ctx,async request=>{
      const data=await seoData(request,env,'/seo/dialect/'+encodeURIComponent(name));
      return applicationPage(request,env,dialectPage(data));
    },env);}
    catch(error) {return error instanceof SeoNotFound?missingPage(request,env):unavailable();}
  }
  try {
    if(path==='/sitemap.xml') return await cached(request,ctx,async request=>xml(request,sitemapIndex(await seoData(request,env,'/seo/index'))),env);
    if(path==='/sitemap-static.xml') return await cached(request,ctx,async request=>xml(request,sitemapStatic(await seoData(request,env,'/seo/index'))),env);
    const id=Number(shard![1]);
    if(!Number.isSafeInteger(id)) return missingPage(request,env);
    return await cached(request,ctx,async request=>xml(request,sitemapWords(await seoData(request,env,'/seo/sitemap/'+id))),env);
  } catch(error) {return error instanceof SeoNotFound?missingPage(request,env):unavailable();}
}
export default {
  async fetch(request:Request,env:Env,ctx?:ExecutionContext):Promise<Response> {
    const url=new URL(request.url);
    if(url.hostname==='www.qamous.org') {url.hostname='qamous.org';return Response.redirect(url.toString(),308);}
    if(url.pathname==='/api/privacy-region') {
      const headers = {'Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"};
      if(!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers:{...headers,Allow:'GET, HEAD'}});
      const response = Response.json({requiresConsent:requiresAnalyticsConsent(request.cf?.country)}, {headers});
      return request.method==='HEAD' ? new Response(null,{headers:response.headers}) : response;
    }
    if(url.pathname==='/api'||url.pathname.startsWith('/api/')) {
      const target=new URL(request.url);target.pathname=url.pathname.slice(4)||'/';
      const restored=await publicSnapshotResponse(new Request(target,request),env as Env&SnapshotEnvironment);
      if(restored)return restored;
      try {return await env.API.fetch(new Request(target,request));}
      catch {return Response.json({message:'Qamous is temporarily unavailable. Please try again later. / قاموس غير متاح مؤقتاً، يرجى المحاولة لاحقاً.'},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'60'}});}
    }
    const seo=await dynamic(request,env,ctx);if(seo) return seo;
    if(['GET','HEAD'].includes(request.method)&&(
      /^\/(?:|about|blog|advanced-search|login|signup|profile|add-definition|forgot-password|reset-password|search|chatbot|feeling-lucky|advertise|opportunities)\/?$/.test(url.pathname)
      ||/^\/(?:search|reset-password|contributors)\/[^/]+\/?$/.test(url.pathname)
    )) return cached(request,ctx,request=>applicationPage(request,env),env);
    const asset=await env.ASSETS.fetch(request);
    if(asset.status!==404) return asset;
    if(!['GET','HEAD'].includes(request.method)) {await asset.body?.cancel();return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});}
    if(/\.[a-z0-9]{2,8}$/i.test(url.pathname)) return asset;
    await asset.body?.cancel();return missingPage(request,env);
  }
} satisfies ExportedHandler<Env>;
