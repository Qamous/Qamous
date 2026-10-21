/// <reference path="./worker-configuration.d.ts" />
import {renderApplication, type RenderSeed} from 'qamous:ssr';
import {wordPage,browsePage,dialectPage,sitemapIndex,sitemapStatic,sitemapWords} from './seo-content.mjs';

// EEA (EU + Iceland/Liechtenstein/Norway), UK and Switzerland. Unknown/Tor
// locations fail closed. Only Cloudflare's trusted request metadata is used.
const consentCountries = new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH'.split(' '));
export function requiresAnalyticsConsent(country: unknown): boolean {
  return typeof country !== 'string' || !/^[A-Z]{2}$/.test(country) || country === 'XX' || consentCountries.has(country);
}
class SeoNotFound extends Error {}
function unavailable() {
  return new Response('Qamous is temporarily unavailable. Please try again later.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Retry-After':'60','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"}});
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
  const headers=new Headers({'Accept':'application/json'});
  const ip=request.headers.get('CF-Connecting-IP');if(ip) headers.set('CF-Connecting-IP',ip);
  const internalSecret=(env as Env & {SEO_INTERNAL_SECRET?:string}).SEO_INTERNAL_SECRET;
  if(path.startsWith('/seo/')&&typeof internalSecret==='string'&&internalSecret.length>=32) headers.set('X-Qamous-Seo-Internal',internalSecret);
  if(!path.startsWith('/seo/')&&request.headers.has('Cookie')) headers.set('Cookie',request.headers.get('Cookie')!);
  const response=await env.API.fetch(new Request(new URL(path,request.url),{headers,signal:AbortSignal.timeout(10000)}));
  if(response.status===404) {await response.body?.cancel();throw new SeoNotFound();}
  if(!response.ok) {await response.body?.cancel();throw new Error('SEO data unavailable');}
  return boundedJson(response);
}
async function cached(request:Request,ctx:ExecutionContext|undefined,produce:()=>Promise<Response>) {
  if(request.method!=='GET'||request.headers.has('Cookie')||request.headers.has('Authorization')||typeof caches==='undefined') return produce();
  const keyUrl=new URL(request.url);
  keyUrl.searchParams.set('__qamous_render','ssr-2');
  keyUrl.searchParams.set('__qamous_language',/^ar\b/i.test(request.headers.get('Accept-Language')||'')?'ar':'en');
  const key=new Request(keyUrl,request);
  const hit=await caches.default.match(key);
  if(hit) return hit;
  const response=await produce();
  if(response.ok&&response.headers.get('Cache-Control')?.includes('public')&&ctx) ctx.waitUntil(caches.default.put(key,response.clone()));
  return response;
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
      .on('head title,head meta[name="description"],head meta[name="robots"],head meta[property^="og:"],head meta[name^="twitter:"],head link[rel="canonical"],head link[rel="alternate"]',{element(e){e.remove();}})
      .on('link[rel="stylesheet"],link[rel="modulepreload"]',{element(e){e.remove();}})
      .on('head',{element(e){e.append(rendered.head+rendered.assets,{html:true});}})
      .on('#root',{element(e){e.setAttribute('data-ssr','true');e.setInnerContent(rendered.html,{html:true});}});
    const response=rewrite.transform(asset);
    const headers=new Headers(response.headers);
    const url=new URL(request.url);
    const privatePage=request.headers.has('Cookie')||request.headers.has('Authorization')||(/^\/advanced-search(?:\/|$)/.test(url.pathname)&&Boolean(url.search))||/^\/(?:login|signup|profile|add-definition|forgot-password|reset-password|search|chatbot|feeling-lucky)(?:\/|$)/.test(url.pathname);
    headers.set('Cache-Control',privatePage||status!==200?'private, no-store':'public, max-age=60');
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
function redirectPath(request:Request,path:string) {
  const url=new URL(request.url);url.pathname=path;return Response.redirect(url.toString(),308);
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
    try {return await cached(request,ctx,async()=>{
      const data=await seoData(request,env,'/seo/word/'+word[1]);
      const meta=wordPage(data,word[2]==='ar'?'ar':'en',Number(word[1]));
      if(!meta) return missingPage(request,env);
      if(meta.robots==='index, follow'&&meta.canonicalPath!==canonical) return redirectPath(request,meta.canonicalPath);
      return applicationPage(request,env,meta,{word:true});
    });} catch(error) {return error instanceof SeoNotFound?missingPage(request,env):unavailable();}
  }
  if(browse) {
    const canonical='/browse/'+browse[1];
    if(path!==canonical) return redirectPath(request,canonical);
    const after=url.searchParams.get('after');
    if([...url.searchParams.keys()].some(key=>key!=='after')) return redirectPath(request,canonical+(after?'?after='+encodeURIComponent(after):''));
    try {return await cached(request,ctx,async()=>{
      const data=await seoData(request,env,'/seo/browse/'+browse[1]+(after?'?after='+encodeURIComponent(after):''));
      const index=await seoData(request,env,'/seo/index');
      return applicationPage(request,env,browsePage(data,index,after),{browse:data,countries:index.countries});
    });} catch(error) {return error instanceof SeoNotFound?missingPage(request,env):unavailable();}
  }
  if(dialect) {
    let name:string;
    try {name=decodeURIComponent(dialect[1]);}
    catch {return missingPage(request,env);}
    const canonical='/advanced-search/'+encodeURIComponent(name);
    if(path!==canonical) return redirectPath(request,canonical);
    try {return await cached(request,ctx,async()=>{
      const data=await seoData(request,env,'/seo/dialect/'+encodeURIComponent(name));
      return applicationPage(request,env,dialectPage(data));
    });}
    catch(error) {return error instanceof SeoNotFound?missingPage(request,env):unavailable();}
  }
  try {
    if(path==='/sitemap.xml') return await cached(request,ctx,async()=>xml(request,sitemapIndex(await seoData(request,env,'/seo/index'))));
    if(path==='/sitemap-static.xml') return await cached(request,ctx,async()=>xml(request,sitemapStatic(await seoData(request,env,'/seo/index'))));
    const id=Number(shard![1]);
    if(!Number.isSafeInteger(id)) return missingPage(request,env);
    return await cached(request,ctx,async()=>xml(request,sitemapWords(await seoData(request,env,'/seo/sitemap/'+id))));
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
      try {return await env.API.fetch(new Request(target,request));}
      catch {return Response.json({message:'Qamous is temporarily unavailable. Please try again later. / قاموس غير متاح مؤقتاً، يرجى المحاولة لاحقاً.'},{status:503,headers:{'Cache-Control':'no-store'}});}
    }
    const seo=await dynamic(request,env,ctx);if(seo) return seo;
    if(['GET','HEAD'].includes(request.method)&&(
      /^\/(?:|about|blog|advanced-search|login|signup|profile|add-definition|forgot-password|reset-password|search|chatbot|feeling-lucky|advertise|opportunities|sources)\/?$/.test(url.pathname)
      ||/^\/(?:search|reset-password|contributors)\/[^/]+\/?$/.test(url.pathname)
    )) return cached(request,ctx,()=>applicationPage(request,env));
    const asset=await env.ASSETS.fetch(request);
    if(asset.status!==404) return asset;
    if(!['GET','HEAD'].includes(request.method)) {await asset.body?.cancel();return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});}
    if(/\.[a-z0-9]{2,8}$/i.test(url.pathname)) return asset;
    await asset.body?.cancel();return missingPage(request,env);
  }
} satisfies ExportedHandler<Env>;
