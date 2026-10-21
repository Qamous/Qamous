import {describe,it,expect,vi,beforeEach} from 'vitest';
import worker,{requiresAnalyticsConsent} from './worker.ts';

const rewrites=[];
class TestRewriter {
  handlers=[];
  on(selector,handler) {this.handlers.push([selector,handler]);return this;}
  transform(response) {
    for(const [selector,handler] of this.handlers) handler.element({
      setAttribute:(name,value)=>rewrites.push([selector,name,value]),
      setInnerContent:(value,options)=>rewrites.push([selector,value,options]),
      append:(value,options)=>rewrites.push([selector,value,options]),
      remove:()=>rewrites.push([selector,'removed']),
    });
    return response;
  }
}
const row={isArabic:0,canonicalWordId:2,arabicWord:'معلش',francoArabicWord:'ma3lish',definition:'Never mind',countryCode:'EG'};
function bindings(apiPayload={rows:[row],related:{country:{countryCode:'EG',countryName:'Egypt'},words:[]}},status=200) {
  const api=vi.fn(async(input)=>{
    const path=new URL(input.url).pathname;
    const payload=path==='/seo/index'&&!apiPayload?.countries?{buckets:[0],countries:[{countryName:'Egypt'}]}:apiPayload;
    return new Response(JSON.stringify(payload),{status});
  });
  const assets=vi.fn(async(input)=>{
    const path=new URL(input instanceof Request?input.url:String(input)).pathname;
    if(path==='/404') return new Response('Page not found',{headers:{'Content-Type':'text/html'}});
    if(['/','/search','/reset-password'].includes(path)) return new Response('<html><head><title>Qamous</title></head><body><div id="root"></div></body></html>',{headers:{'Content-Type':'text/html'}});
    return new Response('Missing',{status:404,headers:{'Content-Type':'text/html'}});
  });
  return {env:{API:{fetch:api},ASSETS:{fetch:assets}},api,assets};
}
beforeEach(()=>{rewrites.length=0;vi.stubGlobal('HTMLRewriter',TestRewriter);});

describe('regional analytics policy',()=>{
  it('requires opt-in across Europe and unknown locations',()=>{
    for(const country of ['FR','DE','GB','CH',undefined,'','XX']) expect(requiresAnalyticsConsent(country)).toBe(true);
    for(const country of ['US','EG','CA']) expect(requiresAnalyticsConsent(country)).toBe(false);
  });
  it('uses trusted metadata and never caches the consent decision',async()=>{
    const {env,api}=bindings();
    const request=new Request('https://qamous.org/api/privacy-region',{headers:{'CF-IPCountry':'US'}});
    expect(await (await worker.fetch(request,env)).json()).toEqual({requiresConsent:true});
    Object.defineProperty(request,'cf',{value:{country:'US'}});
    const response=await worker.fetch(request,env);
    expect(await response.json()).toEqual({requiresConsent:false});
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(api).not.toHaveBeenCalled();
  });
});
describe('dynamic search pages and sitemaps',()=>{
  it('renders actual public word data in root and strips private request headers',async()=>{
    const {env,api}=bindings({rows:[row,{...row,isArabic:1,definition:'ولا يهمك'}],related:{country:{countryCode:'EG',countryName:'Egypt'},words:[]}});
    const response=await worker.fetch(new Request('https://qamous.org/word/2',{headers:{Cookie:'private-cookie',Authorization:'private-token'}}),env);
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Robots-Tag')).toBe('index, follow');
    expect(rewrites.find(item=>item[0]==='#root')?.[1]).toContain('Never mind');
    const head=rewrites.find(item=>item[0]==='head')?.[1];
    expect(head).toContain('DefinedTerm');
    expect(head).toContain('<link data-react-helmet="true" rel="alternate"');
    expect(head).toContain('<script data-react-helmet="true" type="application/ld+json">');
    expect(new URL(api.mock.calls[0][0].url).pathname).toBe('/seo/word/2');
    expect(api.mock.calls[0][0].headers.get('Cookie')).toBeNull();
    expect(api.mock.calls[0][0].headers.get('Authorization')).toBeNull();
    expect(api.mock.calls[0][0].headers.get('X-Qamous-Seo-Internal')).toBeNull();
  });
  it('sends the private service token only to the SEO API binding',async()=>{
    const {env,api}=bindings();
    env.SEO_INTERNAL_SECRET='s'.repeat(64);
    await worker.fetch(new Request('https://qamous.org/word/2'),env);
    expect(api.mock.calls[0][0].headers.get('X-Qamous-Seo-Internal')).toBe(env.SEO_INTERNAL_SECRET);
  });
  it('redirects aliases, returns real 404s, and treats outages as temporary',async()=>{
    const {env}=bindings();
    const alias=await worker.fetch(new Request('https://qamous.org/word/2/en?keep=1'),env);
    expect(alias.status).toBe(308);expect(alias.headers.get('Location')).toBe('https://qamous.org/word/2?keep=1');
    const changed=bindings({rows:[{...row,canonicalWordId:1}],related:{words:[]}});
    expect((await worker.fetch(new Request('https://qamous.org/word/2'),changed.env)).headers.get('Location')).toBe('https://qamous.org/word/1');
    for(const path of ['/word/not-an-id','/word/999999','/advanced-search/%ZZ','/missing']) {
      const response=await worker.fetch(new Request('https://qamous.org'+path),bindings({},404).env);
      expect(response.status).toBe(404);expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
    }
    expect((await worker.fetch(new Request('https://qamous.org/word/2'),bindings({},503).env)).status).toBe(503);
    expect((await worker.fetch(new Request('https://qamous.org/word/2'),bindings({rows:[{...row,definition:'x'.repeat(270000)}]}).env)).status).toBe(503);
  });
  it('keeps missing-language pages noindex with the available canonical',async()=>{
    const {env}=bindings();
    const response=await worker.fetch(new Request('https://qamous.org/word/2/ar'),env);
    expect(response.status).toBe(200);expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow');
    expect(rewrites.find(item=>item[0]==='link[rel="canonical"]')?.[2]).toBe('https://qamous.org/word/2');
  });
  it('serves XML index/shards and crawlable browse pages without React scripts',async()=>{
    const index=bindings({buckets:[0,250],countries:[{countryName:'Egypt'}]});
    const xml=await worker.fetch(new Request('https://qamous.org/sitemap.xml'),index.env);
    expect(xml.headers.get('Content-Type')).toContain('application/xml');
    expect(await xml.text()).toContain('/sitemap-words-250.xml');
    const shard=bindings([{id:250001,en:1,ar:1}]);
    expect(await (await worker.fetch(new Request('https://qamous.org/sitemap-words-250.xml'),shard.env)).text()).toContain('/word/250001/ar');
    const browse=bindings({language:'en',words:[{canonicalId:2,canonicalArabic:'معلش',francoArabicWord:'ma3lish',sortWord:'ma3lish'}],next:2});
    const response=await worker.fetch(new Request('https://qamous.org/browse/en'),browse.env);
    expect(response.status).toBe(200);
    expect(rewrites.find(item=>item[0]==='#root')?.[1]).toContain('href="/browse/en?after=2"');
    expect(rewrites.some(item=>item[0]==='script'&&item[1]==='removed')).toBe(true);
  });
  it('preserves required source attribution in initial word HTML',async()=>{
    const sourceCredits=[{sourceName:'Original dictionary',sourceUrl:'https://example.org/entry',credit:'Original authors',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',attributionRequired:true,notice:'Copyright notice'}];
    const {env}=bindings({rows:[{...row,sourceCredits}],related:{words:[]}});
    expect((await worker.fetch(new Request('https://qamous.org/word/2'),env)).status).toBe(200);
    const html=rewrites.find(item=>item[0]==='#root')?.[1];
    for(const text of ['Original dictionary','Original authors','CC BY-SA 4.0','Copyright notice']) expect(html).toContain(text);
  });
  it('keeps token and search routes private',async()=>{
    const {env}=bindings();
    for(const path of ['/search/hello','/reset-password/private-token']) {
      const response=await worker.fetch(new Request('https://qamous.org'+path),env);
      expect(response.status).toBe(200);expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
    }
    expect(JSON.stringify(rewrites)).not.toContain('private-token');
  });
});
