/// <reference path="./worker-configuration.d.ts" />
import {wordPage,browsePage,dialectPage,sitemapIndex,sitemapStatic,sitemapWords,jsonLd,escapeHtml} from './seo-content.mjs';

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
  if(typeof internalSecret==='string'&&internalSecret.length>=32) headers.set('X-Qamous-Seo-Internal',internalSecret);
  const response=await env.API.fetch(new Request(new URL(path,request.url),{headers,signal:AbortSignal.timeout(10000)}));
  if(response.status===404) {await response.body?.cancel();throw new SeoNotFound();}
  if(!response.ok) {await response.body?.cancel();throw new Error('SEO data unavailable');}
  return boundedJson(response);
}
async function cached(request:Request,ctx:ExecutionContext|undefined,produce:()=>Promise<Response>) {
  if(request.method!=='GET'||request.headers.has('Cookie')||request.headers.has('Authorization')||typeof caches==='undefined') return produce();
  const hit=await caches.default.match(request);
  if(hit) return hit;
  const response=await produce();
  if(response.ok&&response.headers.get('Cache-Control')?.includes('public')&&ctx) ctx.waitUntil(caches.default.put(request,response.clone()));
  return response;
}
function xml(request:Request,body:string) {
  const headers={'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"};
  return new Response(request.method==='HEAD'?null:body,{headers});
}
async function htmlPage(request:Request,env:Env,meta:any,staticOnly=false) {
  const asset=await env.ASSETS.fetch(new Request(new URL('/',request.url)));
  if(!asset.ok) return unavailable();
  const canonical='https://qamous.org'+meta.canonicalPath;
  let rewrite=new HTMLRewriter()
    .on('html',{element(e){e.setAttribute('lang',meta.lang);}})
    .on('title',{element(e){e.setInnerContent(meta.title);}})
    .on('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]',{element(e){e.setAttribute('content',meta.description);}})
    .on('meta[property="og:title"],meta[name="twitter:title"]',{element(e){e.setAttribute('content',meta.title);}})
    .on('meta[property="og:url"]',{element(e){e.setAttribute('content',canonical);}})
    .on('link[rel="canonical"]',{element(e){e.setAttribute('href',canonical);}})
    .on('#root',{element(e){e.setInnerContent(meta.html,{html:true});}})
    .on('head',{element(e){e.append(
      `<meta data-react-helmet="true" name="robots" content="${escapeHtml(meta.robots||'index, follow')}">`
      +(meta.alternates||[]).map((a:{lang:string;path:string})=>`<link data-react-helmet="true" rel="alternate" hreflang="${a.lang}" href="https://qamous.org${a.path}">`).join('')
      +(meta.next?`<link rel="next" href="https://qamous.org${escapeHtml(meta.next)}">`:'')
      +(meta.schema?`<script data-react-helmet="true" type="application/ld+json">${jsonLd(meta.schema)}</script>`:''),{html:true});}});
  if(staticOnly) rewrite=rewrite.on('script',{element(e){e.remove();}});
  const rendered=rewrite.transform(asset);
  const headers=new Headers(rendered.headers);
  headers.set('Cache-Control','public, max-age=60');
  headers.set('X-Robots-Tag',meta.robots||'index, follow');
  headers.delete('ETag');headers.delete('Content-Length');
  if(request.method==='HEAD') {await rendered.body?.cancel();return new Response(null,{headers});}
  return new Response(rendered.body,{headers});
}
async function privateShell(request:Request,env:Env,source:string,path:string) {
  const asset=await env.ASSETS.fetch(new Request(new URL(source,request.url)));
  if(!asset.ok) return unavailable();
  const canonical='https://qamous.org'+path;
  const response=new HTMLRewriter()
    .on('link[rel="canonical"]',{element(e){e.setAttribute('href',canonical);}})
    .on('meta[property="og:url"]',{element(e){e.setAttribute('content',canonical);}}).transform(asset);
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');headers.set('X-Robots-Tag','noindex, follow');
  headers.delete('ETag');headers.delete('Content-Length');
  if(request.method==='HEAD') {await response.body?.cancel();return new Response(null,{headers});}
  return new Response(response.body,{headers});
}
async function missingPage(request:Request,env:Env):Promise<Response> {
  const path=new URL(request.url).pathname.replace(/\/+$/,'');
  if(/^\/search\/[^/]+$/.test(path)) return privateShell(request,env,'/search','/search');
  if(/^\/reset-password\/[^/]+$/.test(path)) return privateShell(request,env,'/reset-password','/reset-password');
  const asset=await env.ASSETS.fetch(new Request(new URL('/404',request.url)));
  const headers=new Headers(asset.headers);headers.set('X-Robots-Tag','noindex, follow');
  headers.set('Cache-Control','no-store');headers.delete('ETag');headers.delete('Content-Length');
  if(request.method==='HEAD') await asset.body?.cancel();
  return new Response(request.method==='HEAD'?null:asset.body,{status:404,headers});
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
      return htmlPage(request,env,meta);
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
      return htmlPage(request,env,browsePage(data,index,after),true);
    });} catch(error) {return error instanceof SeoNotFound?missingPage(request,env):unavailable();}
  }
  if(dialect) {
    let name:string;
    try {name=decodeURIComponent(dialect[1]);}
    catch {return missingPage(request,env);}
    const canonical='/advanced-search/'+encodeURIComponent(name);
    if(path!==canonical) return redirectPath(request,canonical);
    try {return await cached(request,ctx,async()=>htmlPage(request,env,dialectPage(await seoData(request,env,'/seo/dialect/'+encodeURIComponent(name)))));}
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
    const asset=await env.ASSETS.fetch(request);
    if(asset.status!==404||!['GET','HEAD'].includes(request.method)) return asset;
    await asset.body?.cancel();return missingPage(request,env);
  }
} satisfies ExportedHandler<Env>;
