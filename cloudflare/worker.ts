/// <reference path="./worker-configuration.d.ts" />
function unavailable() {
  return new Response('Qamous is temporarily unavailable. Please try again later.', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Retry-After':'60','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"}});
}
function escapeHtml(value:string) {
  return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
}
// Used only for paths missing from the static build, including newly added words.
// Bound upstream data so a public contribution cannot cause unbounded buffering.
async function boundedJson(response:Response):Promise<unknown> {
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
async function shell(request:Request,env:Env,source:string,path:string,word?:{title:string;description:string;lang:string}) {
  const asset=await env.ASSETS.fetch(new Request(new URL(source,request.url)));
  if(!asset.ok) return unavailable();
  const canonical='https://qamous.org'+path;
  let rewrite=new HTMLRewriter()
    .on('link[rel="canonical"]',{element(element){element.setAttribute('href',canonical);}})
    .on('meta[property="og:url"]',{element(element){element.setAttribute('content',canonical);}});
  if(word) {
    rewrite=rewrite.on('html',{element(element){element.setAttribute('lang',word.lang);}})
      .on('title',{element(element){element.setInnerContent(word.title);}})
      .on('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]',{element(element){element.setAttribute('content',word.description);}})
      .on('meta[property="og:title"],meta[name="twitter:title"]',{element(element){element.setAttribute('content',word.title);}})
      .on('noscript',{element(element){element.setInnerContent(`<style>#initial-loader{display:none}</style><main><h1>${escapeHtml(word.title)}</h1><p>${escapeHtml(word.description)}</p><a href="/advanced-search">Explore Arabic dialects</a></main>`,{html:true});}});
  }
  const response=rewrite.transform(asset);
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');
  headers.delete('ETag');headers.delete('Content-Length');
  if(!word) headers.set('X-Robots-Tag','noindex, follow');
  if(request.method==='HEAD') {await response.body?.cancel();return new Response(null,{headers});}
  return new Response(response.body,{headers});
}
async function missingPage(request:Request,env:Env):Promise<Response> {
  const url=new URL(request.url);
  const path=url.pathname.replace(/\/+$/,'');
  if(/^\/search\/[^/]+$/.test(path)) return shell(request,env,'/search','/search');
  if(/^\/reset-password\/[^/]+$/.test(path)) return shell(request,env,'/reset-password','/reset-password');
  const match=path.match(/^\/word\/([1-9]\d*)(?:\/(en|ar))?$/);
  if(match&&Number.isSafeInteger(Number(match[1]))) {
    const canonical='/word/'+match[1]+(match[2]==='ar'?'/ar':'');
    if(match[2]==='en') {
      const existing=await env.ASSETS.fetch(new Request(new URL(canonical,request.url)));
      await existing.body?.cancel();
      if(existing.status===200) {url.pathname=canonical;return Response.redirect(url.toString(),308);}
    }
    try {
      const headers=new Headers({'Accept':'application/json'});
      const ip=request.headers.get('CF-Connecting-IP');if(ip) headers.set('CF-Connecting-IP',ip);
      const upstream=await env.API.fetch(new Request(new URL('/definitions/word/'+match[1],request.url),{headers,signal:AbortSignal.timeout(10000)}));
      if(!upstream.ok) {await upstream.body?.cancel();return unavailable();} // A quota/outage is not a permanent 404.
      const data=await boundedJson(upstream);
      if(!Array.isArray(data)) return unavailable();
      const rows=data.filter((row):row is {isArabic:boolean|number;definition:string;word:{id:number;arabicWord:string;francoArabicWord:string|null}}=>Boolean(row&&typeof row==='object'&&typeof row.definition==='string'&&row.word&&row.word.id===Number(match[1])&&typeof row.word.arabicWord==='string'));
      const row=rows.find(row=>Boolean(row.isArabic)===(match[2]==='ar'));
      if(!row&&!match[2]&&rows.some(row=>Boolean(row.isArabic))) {url.pathname='/word/'+match[1]+'/ar';return Response.redirect(url.toString(),308);}
      if(row) {
        if(match[2]==='en'||url.pathname!==path) {url.pathname=canonical;return Response.redirect(url.toString(),308);}
        return shell(request,env,'/',canonical,{title:`${row.word.arabicWord}${row.word.francoArabicWord?' / '+row.word.francoArabicWord:''} | Qamous`,description:row.definition.replace(/\s+/g,' ').slice(0,170),lang:match[2]==='ar'?'ar':'en'});
      }
    } catch {return unavailable();}
  }
  const asset=await env.ASSETS.fetch(new Request(new URL('/404',request.url)));
  const headers=new Headers(asset.headers);headers.set('X-Robots-Tag','noindex, follow');
  headers.set('Cache-Control','no-store');headers.delete('ETag');headers.delete('Content-Length');
  if(request.method==='HEAD') await asset.body?.cancel();
  return new Response(request.method==='HEAD'?null:asset.body,{status:404,headers});
}
export default {
  async fetch(request:Request,env:Env):Promise<Response> {
    const url=new URL(request.url);
    if(url.hostname==='www.qamous.org') {url.hostname='qamous.org';return Response.redirect(url.toString(),308);}
    if(url.pathname==='/api'||url.pathname.startsWith('/api/')) {
      const target=new URL(request.url);
      // Service bindings select the API Worker; retain the public origin while
      // stripping the gateway prefix.
      target.pathname=url.pathname.slice(4)||'/';
      try {return await env.API.fetch(new Request(target,request));}
      catch {return Response.json({message:'Qamous is temporarily unavailable. Please try again later. / قاموس غير متاح مؤقتاً، يرجى المحاولة لاحقاً.'},{status:503,headers:{'Cache-Control':'no-store'}});}
    }
    const asset=await env.ASSETS.fetch(request);
    if(asset.status!==404||!['GET','HEAD'].includes(request.method)) return asset;
    await asset.body?.cancel();
    return missingPage(request,env);
  }
} satisfies ExportedHandler<Env>;
