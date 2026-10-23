import {describe,it,expect,vi} from 'vitest';
import {publicSnapshotResponse,shuffledFeed} from './public-snapshot.ts';
import {validateFrozenWriters} from './snapshot-deploy-guard.mjs';

const id='test-current-snapshot';
const english={id:1,definitionId:1,wordId:2,canonicalArabic:'كلمة',arabicWord:'كلمة',francoArabicWord:'kalima',
  definition:'A current meaning',isArabic:0,countryCode:'EG',likeCount:10,dislikeCount:0,word:'kalima',
  isLiked:false,isDisliked:false,isReported:false,arabicExample:null,example:'kalima example',sourceCredits:[{sourceId:'public',name:'Public source'}]};
const arabic={...english,id:2,definitionId:2,definition:'معنى عربي',isArabic:1,word:'كلمة',example:null,arabicExample:'مثال عربي'};
const other={...english,id:101,definitionId:101,wordId:3,canonicalArabic:'يلا',arabicWord:'يلا',francoArabicWord:'yalla',word:'yalla',definition:'Let us go',likeCount:2};
function fixture(overrides={}) {
  const countries=[{countryCode:'EG',countryName:'Egypt'}],related={results:[{wordId:3,word:'yalla',arabicWord:'يلا',francoArabicWord:'yalla'}]};
  const rows=[english,arabic].map(row=>({...row,canonicalWordId:2,word:{id:2,arabicWord:'كلمة',francoArabicWord:'kalima'}}));
  const resources={countries,posts:[],sources:[{id:'public',name:'Public source'}],
    'word:2':rows,'word:3':[{...other,canonicalWordId:3,word:{id:3,arabicWord:'يلا',francoArabicWord:'yalla'}}],
    'cards:0':[english,arabic],'cards:1':[other],discovery:[english,arabic,other],
    'feed:0':[english,other],'feed:1':[arabic],'related:EG:franco':related,'related:EG:ar':{results:[]},
    'seo-index':{buckets:[0],countries},'seo-shard:0':[{id:2,en:1,ar:1}],
    'seo-browse:en:':{language:'en',words:[{wordId:2,canonicalId:2,canonicalArabic:'كلمة'}],next:null},
    'seo-dialect:Egypt':{country:countries[0],words:[]},'contributor:publicuser':{username:'publicuser'},
    'license:public':{fileName:'LICENSE.txt',text:'Public source license terms'},...overrides};
  const files=new Map(),entries=[];
  for(const [index,[key,value]] of Object.entries(resources).entries()) {
    const file=index.toString(16).padStart(64,'0')+'.json',text=JSON.stringify({key,value});
    entries.push({key,file,bytes:new TextEncoder().encode(text).byteLength,sha256:'a'.repeat(64)});files.set('/public-data/'+id+'/'+file,text);
  }
  const exported=new Date(Date.now()-60_000).toISOString();
  const manifest={schemaVersion:1,snapshotId:id,generatedAt:new Date().toISOString(),exportStartedAt:exported,exportCompletedAt:exported,resources:entries};
  files.set('/public-data/'+id+'/manifest.json',JSON.stringify(manifest));
  const fetch=vi.fn(async request=>{const body=files.get(new URL(request.url).pathname);return new Response(body??'Missing',{status:body?200:404,headers:{'content-type':'application/json'}});});
  const api=vi.fn(()=>{throw Error('The unavailable API must never be contacted');});
  const env={ASSETS:{fetch},API:{fetch:api},PUBLIC_SNAPSHOT_ID:id,PUBLIC_SNAPSHOT_EXPIRES_AT:new Date(Date.now()+3600_000).toISOString()};
  return {env,api,fetch,files,manifest,call:(path,init)=>publicSnapshotResponse(new Request('https://qamous.org'+path,init),env)};
}

describe('zero-Durable-Object public recovery',()=>{
  it('returns full bilingual word data, provenance and bounded related links without API calls',async()=>{
    const f=fixture();const response=await f.call('/seo/word/2',{headers:{Cookie:'qamous_session=private; _ga=tracking'}});
    expect(response.status).toBe(200);const data=await response.json();
    expect(data.rows).toHaveLength(2);expect(data.rows[0].sourceCredits).toHaveLength(1);
    expect(data.related.country.countryCode).toBe('EG');expect(data.related.words[0].id).toBe(3);
    expect(data.rows.every(row=>row.isLiked===false)).toBe(true);expect(response.headers.has('set-cookie')).toBe(false);
    expect(f.api).not.toHaveBeenCalled();
    for(const [request] of f.fetch.mock.calls) {expect(request.headers.has('cookie')).toBe(false);expect(request.headers.has('authorization')).toBe(false);}
  });
  it('hydrates arbitrary weighted feed IDs from public card buckets in the requested order and language',async()=>{
    const f=fixture(),feed=await(await f.call('/definitions/feed?script=franco')).json();
    expect([...feed.definitionIds].sort((a,b)=>a-b)).toEqual([1,101]);
    const page=await(await f.call('/word/explore?ids=101,2,1&script=franco')).json();
    expect(page.results.map(row=>row.definitionId)).toEqual([101,1]);expect(page.limit).toBe(3);
    expect(shuffledFeed([english,other],()=>0.5)).toEqual([1,101]);
    expect((await f.call('/word/explore?ids=1,1')).status).toBe(400);expect(f.api).not.toHaveBeenCalled();
  });
  it('supports search, cross-language fallback, dialect filters and pagination without database queries',async()=>{
    const f=fixture();
    const search=await(await f.call('/word/search/kwd=kalima')).json();expect(search.map(row=>row.definitionId)).toEqual([1,2]);
    const explore=await(await f.call('/word/explore?script=ar&country=EG&limit=1')).json();
    expect(explore.total).toBe(1);expect(explore.results[0].definitionId).toBe(2);
    const fallback=await(await f.call('/word/explore?script=ar&q=yalla')).json();expect(fallback.results[0].definitionId).toBe(101);
    expect((await f.call('/word/explore?limit=999')).status).toBe(400);expect(f.api).not.toHaveBeenCalled();
  });
  it('serves browse, sitemap, sources, country and provenance projections',async()=>{
    const f=fixture();
    for(const path of ['/seo/index','/seo/sitemap/0','/seo/browse/en','/seo/dialect/Egypt','/countries','/countries/EG','/sources','/sources/public','/posts','/definitions/1/provenance']) {
      expect((await f.call(path)).status,path).toBe(200);
    }
    expect((await f.call('/seo/word/99999')).status).toBe(404);expect(f.api).not.toHaveBeenCalled();
  });
  it('fails closed for private/session endpoints and writes without clearing a saved session',async()=>{
    const f=fixture();
    for(const [path,method] of [['/auth/session','GET'],['/users/1','GET'],['/definitions/1','PATCH'],['/auth/logout','POST'],['/reactions/1/like','POST']]) {
      const response=await f.call(path,{method,headers:{Cookie:'qamous_session=keep'}});
      expect(response.status).toBe(503);expect(response.headers.get('retry-after')).toBe('60');expect(response.headers.has('set-cookie')).toBe(false);
      expect((await response.json()).code).toBe('PUBLIC_READ_ONLY');
    }
    expect(f.api).not.toHaveBeenCalled();
  });
  it('rejects expired snapshots and corrupt/missing assets instead of resurrecting earlier content',async()=>{
    const expired=fixture();expired.env.PUBLIC_SNAPSHOT_EXPIRES_AT=new Date(Date.now()-1).toISOString();
    expect((await expired.call('/seo/word/2')).status).toBe(503);expect(expired.fetch).not.toHaveBeenCalled();
    const missing=fixture();missing.files.delete('/public-data/'+id+'/'+missing.manifest.resources.find(row=>row.key==='word:2').file);
    expect((await missing.call('/seo/word/2')).status).toBe(503);
    const invalid=fixture();invalid.env.PUBLIC_SNAPSHOT_EXPIRES_AT=new Date(Date.now()+48*3600_000).toISOString();
    expect((await invalid.call('/seo/word/2')).status).toBe(503);
  });
  it('reuses immutable asset reads and preserves HEAD semantics',async()=>{
    const f=fixture();await f.call('/countries');const before=f.fetch.mock.calls.length;
    const head=await f.call('/countries',{method:'HEAD'});expect(head.status).toBe(200);expect(await head.text()).toBe('');
    expect(f.fetch).toHaveBeenCalledTimes(before);
    expect(await publicSnapshotResponse(new Request('https://qamous.org/countries'),{...f.env,PUBLIC_SNAPSHOT_ID:undefined})).toBeNull();
  });
  it('keeps a frozen release readable after its initial expiry and preserves public licenses',async()=>{
    const f=fixture();f.env.PUBLIC_SNAPSHOT_FROZEN='true';f.env.PUBLIC_SNAPSHOT_EXPIRES_AT=new Date(Date.now()-1).toISOString();
    expect((await f.call('/seo/word/2')).status).toBe(200);
    expect((await f.call('/contributors/PublicUser')).status).toBe(200);
    const license=await f.call('/sources/public/license');expect(license.headers.get('content-type')).toContain('text/plain');
    expect(await license.text()).toBe('Public source license terms');expect(f.api).not.toHaveBeenCalled();
  });
  it('refuses deployment unless both live writers are paused and importer schedules are empty',()=>{
    const paused={bindings:[{name:'PUBLIC_READ_ONLY',text:'true'}]},running={bindings:[{name:'PUBLIC_READ_ONLY',text:'false'}]};
    expect(()=>validateFrozenWriters(paused,paused,{schedules:[]})).not.toThrow();
    for(const evidence of [[running,paused,{schedules:[]}],[paused,running,{schedules:[]}],[paused,paused,{schedules:[{cron:'* * * * *'}]}],[paused,paused,{}]])
      expect(()=>validateFrozenWriters(...evidence)).toThrow('must be paused');
  });
});
