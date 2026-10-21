import {describe,it,expect,vi,beforeEach} from 'vitest';
import worker,{requiresAnalyticsConsent} from './worker.ts';
import {renderApplication} from 'qamous:ssr';
vi.mock('qamous:ssr',()=>({renderApplication:vi.fn(async(request,fetchData,seed={})=>{
  if(seed.word) await fetchData('/definitions/word/2');
  return {html:'<div class="app">Shared React page</div>',head:'<title data-rh="true">Shared page</title>',robots:'index, follow',assets:'<link rel="stylesheet" href="/assets/page.css">',state:'{"language":"en"}',language:'en',theme:'--primary-color:#fff',grain:false};
})}));
const rewrites=[];
class TestRewriter {
  handlers=[];
  on(selector,handler){this.handlers.push([selector,handler]);return this;}
  transform(response){
    for(const [selector,handler] of this.handlers) handler.element({
      setAttribute:(name,value)=>rewrites.push([selector,name,value]),
      setInnerContent:value=>rewrites.push([selector,value]),
      append:value=>rewrites.push([selector,value]),remove:()=>rewrites.push([selector,'removed']),
    });
    return response;
  }
}
const row={isArabic:0,canonicalWordId:2,arabicWord:'معلش',francoArabicWord:'ma3lish',definition:'Never mind',countryCode:'EG'};
function bindings(payload={rows:[row],related:{words:[]}},status=200){
  const api=vi.fn(async request=>new Response(JSON.stringify(new URL(request.url).pathname==='/seo/index'?{buckets:[0],countries:[{countryCode:'EG',countryName:'Egypt'}]}:payload),{status}));
  const assets=vi.fn(async request=>new URL(request.url).pathname!=='/'?new Response('Missing',{status:404}):new Response('<html><head><title>Qamous</title></head><body><div id="root"></div></body></html>',{headers:{'Content-Type':'text/html','Content-Security-Policy':"script-src 'self'"}}));
  return {env:{API:{fetch:api},ASSETS:{fetch:assets}},api,assets};
}
beforeEach(()=>{rewrites.length=0;vi.clearAllMocks();vi.stubGlobal('HTMLRewriter',TestRewriter);});
describe('regional analytics policy',()=>{
  it('uses trusted country metadata and never caches consent',async()=>{
    for(const country of ['FR','DE','GB','CH',undefined,'','XX']) expect(requiresAnalyticsConsent(country)).toBe(true);
    for(const country of ['US','EG','CA']) expect(requiresAnalyticsConsent(country)).toBe(false);
    const {env,api}=bindings();const request=new Request('https://qamous.org/api/privacy-region',{headers:{'CF-IPCountry':'US'}});
    expect(await(await worker.fetch(request,env)).json()).toEqual({requiresConsent:true});
    Object.defineProperty(request,'cf',{value:{country:'US'}});const response=await worker.fetch(request,env);
    expect(await response.json()).toEqual({requiresConsent:false});expect(response.headers.get('Cache-Control')).toContain('no-store');expect(api).not.toHaveBeenCalled();
  });
});
describe('shared rendering and public discovery routing',()=>{
  it('renders the application and bootstrap state with CSP intact',async()=>{
    const {env}=bindings();const response=await worker.fetch(new Request('https://qamous.org/word/2'),env);
    expect(response.status).toBe(200);expect(response.headers.get('X-Qamous-Rendering')).toBe('react-ssr');
    expect(response.headers.get('Content-Security-Policy')).toBe("script-src 'self'");
    expect(rewrites).toContainEqual(['#root','data-ssr','true']);
    expect(rewrites.find(item=>item[0]==='#root'&&item.length===2)[1]).toContain('Shared React page');
    expect(rewrites.find(item=>item[0]==='body'&&item.length===2)[1]).toContain('type="application/json"');
    expect(rewrites.find(item=>item[0]==='head')[1]).toContain('/assets/page.css');
  });
  it('isolates cookies and internal service credentials and bypasses shared caching',async()=>{
    const {env,api}=bindings();env.SEO_INTERNAL_SECRET='s'.repeat(64);
    const response=await worker.fetch(new Request('https://qamous.org/word/2',{headers:{Cookie:'session=private',Authorization:'private-token'}}),env);
    expect(response.headers.get('Cache-Control')).toContain('private, no-store');
    const seo=api.mock.calls[0][0],personal=api.mock.calls[1][0];
    expect(new URL(seo.url).pathname).toBe('/seo/word/2');
    expect(seo.headers.get('Cookie')).toBeNull();expect(seo.headers.get('Authorization')).toBeNull();expect(seo.headers.get('X-Qamous-Seo-Internal')).toBe(env.SEO_INTERNAL_SECRET);
    expect(personal.headers.get('Cookie')).toBe('session=private');expect(personal.headers.get('Authorization')).toBeNull();expect(personal.headers.get('X-Qamous-Seo-Internal')).toBeNull();
  });
  it.each(['/','/about','/blog','/advanced-search','/login','/signup','/profile','/add-definition','/forgot-password','/reset-password/token','/search/hello','/chatbot','/feeling-lucky','/advertise','/opportunities','/sources','/contributors/test'])('uses the shared renderer for %s',async path=>{
    const {env}=bindings();const response=await worker.fetch(new Request('https://qamous.org'+path),env);
    expect(response.status).toBe(200);expect(renderApplication).toHaveBeenCalled();
    if(/^\/(login|signup|profile|search|reset-password|chatbot)/.test(path)) expect(response.headers.get('Cache-Control')).toContain('no-store');
  });
  it('keeps aliases, genuine 404s and temporary outages distinct',async()=>{
    const {env}=bindings();expect((await worker.fetch(new Request('https://qamous.org/word/2/en?keep=1'),env)).headers.get('Location')).toBe('https://qamous.org/word/2?keep=1');
    expect((await worker.fetch(new Request('https://qamous.org/word/2'),bindings({rows:[{...row,canonicalWordId:1}]}).env)).headers.get('Location')).toBe('https://qamous.org/word/1');
    for(const path of ['/word/not-an-id','/word/999999','/advanced-search/%ZZ','/missing']){
      const response=await worker.fetch(new Request('https://qamous.org'+path),bindings({},404).env);
      expect(response.status).toBe(404);expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
      expect(renderApplication.mock.calls.at(-1)[2].notFound).toBe(true);
    }
    expect((await worker.fetch(new Request('https://qamous.org/word/2'),bindings({},503).env)).status).toBe(503);
    expect((await worker.fetch(new Request('https://qamous.org/word/2'),bindings({rows:[{...row,definition:'x'.repeat(270000)}]}).env)).status).toBe(503);
  });
  it('keeps missing-language pages noindex with their shared word data',async()=>{
    const response=await worker.fetch(new Request('https://qamous.org/word/2/ar'),bindings().env);
    expect(response.status).toBe(200);expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow');
    expect(renderApplication.mock.calls[0][2].word).toBe(true);
  });
  it('keeps bounded XML sitemaps and hydrates browse pages',async()=>{
    const index=await worker.fetch(new Request('https://qamous.org/sitemap.xml'),bindings().env);
    expect(index.headers.get('Content-Type')).toContain('application/xml');expect(await index.text()).toContain('/sitemap-words-0.xml');
    const shard=await worker.fetch(new Request('https://qamous.org/sitemap-words-250.xml'),bindings([{id:250001,en:1,ar:1}]).env);
    expect(await shard.text()).toContain('/word/250001/ar');
    const data={language:'en',words:[{canonicalId:2,wordId:2,canonicalArabic:'معلش',francoArabicWord:'ma3lish'}],next:2};
    const response=await worker.fetch(new Request('https://qamous.org/browse/en'),bindings(data).env);
    expect(response.status).toBe(200);expect(renderApplication.mock.calls.at(-1)[2].browse).toEqual(data);
    expect(rewrites.some(item=>item[0]==='script'&&item[1]==='removed')).toBe(false);
  });
});
