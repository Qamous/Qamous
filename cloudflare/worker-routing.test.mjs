import {describe,it,expect,vi,beforeEach} from 'vitest';
import worker, {requiresAnalyticsConsent} from './worker.ts';

const rewrites=[];
class TestRewriter {
  handlers=[];
  on(selector,handler) {this.handlers.push([selector,handler]);return this;}
  transform(response) {
    for(const [selector,handler] of this.handlers) handler.element({
      setAttribute:(name,value)=>rewrites.push([selector,name,value]),
      setInnerContent:(value,options)=>rewrites.push([selector,value,options]),
    });
    return response;
  }
}
function bindings(rows=[],status=200) {
  const api=vi.fn(async()=>new Response(JSON.stringify(rows),{status}));
  const assets=vi.fn(async(input)=>{
    const path=new URL(input instanceof Request?input.url:String(input)).pathname;
    return new Response(path==='/404'?'Page not found':'<html><head></head><body>App</body></html>',{status:['/','/404','/search','/reset-password','/word/2'].includes(path)?200:404,headers:{'Content-Type':'text/html','Content-Security-Policy':"frame-ancestors 'none'"}});
  });
  // Only fetch is used; no live bindings or production credentials enter these tests.
  return {env:{API:{fetch:api},ASSETS:{fetch:assets}},api,assets};
}
beforeEach(()=>{rewrites.length=0;vi.stubGlobal('HTMLRewriter',TestRewriter);});

describe('regional analytics policy',()=>{
  it('requires opt-in across EEA/UK/Switzerland and unknown locations, not US or Egypt',()=>{
    for(const country of ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH',undefined,'','XX','T1']) expect(requiresAnalyticsConsent(country)).toBe(true);
    for(const country of ['US','EG','CA','AU','SA']) expect(requiresAnalyticsConsent(country)).toBe(false);
  });
  it('returns only a non-cacheable policy boolean from trusted metadata, not request headers',async()=>{
    const {env,api}=bindings();
    const request=new Request('https://qamous.org/api/privacy-region',{headers:{'CF-IPCountry':'US'}});
    const unknown=await worker.fetch(request,env);
    expect(await unknown.json()).toEqual({requiresConsent:true});
    Object.defineProperty(request,'cf',{value:{country:'US'}});
    const response=await worker.fetch(request,env);
    expect(await response.json()).toEqual({requiresConsent:false});
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(response.headers.get('CDN-Cache-Control')).toBe('no-store');
    expect(api).not.toHaveBeenCalled();
    expect((await worker.fetch(new Request(request.url,{method:'POST'}),env)).status).toBe(405);
    expect((await worker.fetch(new Request(request.url,{method:'HEAD'}),env)).body).toBeNull();
  });
});
describe('asset-first routing with genuine missing-page responses',()=>{
  it('returns 404/noindex for unknown routes and missing words, including navigation and HEAD',async()=>{
    for(const path of ['/missing','/word/999999','/word/not-an-id','/advanced-search/Unknown','/word/999999/fr']) {
      const {env}=bindings();
      const response=await worker.fetch(new Request('https://qamous.org'+path,{headers:{'Sec-Fetch-Mode':'navigate'}}),env);
      expect(response.status).toBe(404);expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
    }
    const {env}=bindings();expect((await worker.fetch(new Request('https://qamous.org/missing',{method:'HEAD'}),env)).body).toBeNull();
  });
  it('keeps reset/search deep links, avoids indexing their tokens, and redirects English aliases',async()=>{
    const {env}=bindings();
    for(const path of ['/reset-password/private-token','/search/hello']) {
      const response=await worker.fetch(new Request('https://qamous.org'+path),env);
      expect(response.status).toBe(200);expect(response.headers.get('X-Robots-Tag')).toContain('noindex');
    }
    expect(JSON.stringify(rewrites)).not.toContain('private-token');
    const alias=await worker.fetch(new Request('https://qamous.org/word/2/en?keep=1'),env);
    expect(alias.status).toBe(308);expect(alias.headers.get('Location')).toBe('https://qamous.org/word/2?keep=1');
  });
  it('serves words added after the static build and treats API limits as temporary failure, not 404',async()=>{
    const {env,api}=bindings([{isArabic:0,definition:'A public meaning',word:{id:99,arabicWord:'كلمة',francoArabicWord:'kalima'}}]);
    const response=await worker.fetch(new Request('https://qamous.org/word/99',{headers:{Cookie:'private-cookie',Authorization:'private-token'}}),env);
    expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(JSON.stringify(rewrites)).toContain('https://qamous.org/word/99');
    const sent=api.mock.calls[0];
    expect(sent[0].headers.get('Cookie')).toBeNull();expect(sent[0].headers.get('Authorization')).toBeNull();
    const outage=bindings({},503);expect((await worker.fetch(new Request('https://qamous.org/word/99'),outage.env)).status).toBe(503);
    const oversized=bindings([{definition:'x'.repeat(270000)}]);expect((await worker.fetch(new Request('https://qamous.org/word/99'),oversized.env)).status).toBe(503);
    const arabic=bindings([{isArabic:1,definition:'معنى',word:{id:99,arabicWord:'كلمة',francoArabicWord:null}}]);
    const localized=await worker.fetch(new Request('https://qamous.org/word/99'),arabic.env);
    expect(localized.status).toBe(308);expect(localized.headers.get('Location')).toBe('https://qamous.org/word/99/ar');
  });
});
