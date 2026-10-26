// @vitest-environment node
import {describe,it,expect,vi,afterAll} from 'vitest';
import {validateMutableReadiness,verifyMutableReadiness} from './snapshot-deploy-guard.mjs';
vi.stubGlobal('window',{});afterAll(()=>vi.unstubAllGlobals());
const settings=vars=>({bindings:Object.entries(vars).map(([name,text])=>({name,text}))});
const api=pause=>({bindings:[...settings({PUBLIC_READ_ONLY:'false',PUBLIC_CARD_PAYLOADS:'true',PUBLIC_WRITES_PAUSED:pause}).bindings,{name:'DB',id:'d0587244-4f3d-4209-b246-55cefbce7555'}]});
describe('mutable public-read deployment readiness',()=>{
  it('keeps content writes paused until the live static snapshot is withdrawn',()=>{
    expect(validateMutableReadiness(settings({PUBLIC_SNAPSHOT_ID:'current'}),api('true'),settings({PUBLIC_READ_ONLY:'true'}),{schedules:[]})).toEqual({transition:true,writesPaused:true});
    expect(()=>validateMutableReadiness(settings({PUBLIC_SNAPSHOT_ID:'current'}),api('false'),settings({PUBLIC_READ_ONLY:'true'}),{schedules:[]})).toThrow('remain paused');
    expect(()=>validateMutableReadiness(settings({PUBLIC_SNAPSHOT_ID:'current'}),api('true'),settings({PUBLIC_READ_ONLY:'false'}),{schedules:[]})).toThrow('remain paused');
    expect(()=>validateMutableReadiness(settings({PUBLIC_SNAPSHOT_ID:'current'}),api('true'),settings({PUBLIC_READ_ONLY:'true'}),{schedules:[{cron:'* * * * *'}]})).toThrow('remain paused');
  });
  it('allows later normal deployments with resumed writers but rejects unverifiable API settings',()=>{
    expect(validateMutableReadiness(settings({}),api('false'),settings({PUBLIC_READ_ONLY:'false'}),{schedules:[{}]})).toEqual({transition:false,writesPaused:false});
    expect(()=>validateMutableReadiness(settings({}),settings({PUBLIC_READ_ONLY:'true'}),{},{})).toThrow('prepared public reads');
    expect(()=>validateMutableReadiness(settings({}),{bindings:api('true').bindings.filter(row=>row.name!=='DB')},{},{})).toThrow('unapproved');
  });
  it('requires countries, a feed and a hydrated card before deploying normal browsing',async()=>{
    const inspect=path=>path.startsWith('qamous-web')?settings({PUBLIC_SNAPSHOT_ID:'old'}):path==='qamous-api/settings'?api('true'):path.endsWith('/schedules')?{schedules:[]}:settings({PUBLIC_READ_ONLY:'true'});
    const requests=[];
    const fetcher=async url=>{requests.push(url);return Response.json(url.endsWith('/countries')?[]:url.includes('/definitions/feed')?{definitionIds:[2]}:{results:[{definitionId:2}]});};
    await expect(verifyMutableReadiness('unused','account',{inspect,fetcher})).resolves.toEqual({transition:true,writesPaused:true});
    expect(requests).toHaveLength(3);
    await expect(verifyMutableReadiness('unused','account',{inspect,fetcher:async()=>new Response('unavailable',{status:503})})).rejects.toThrow('probe failed');
  });
  it('accepts only a quota-denied random card when the same home fallback is verified',async()=>{
    const inspect=path=>path.startsWith('qamous-web')?settings({}):path==='qamous-api/settings'?api('false'):path.endsWith('/schedules')?{schedules:[]}:settings({PUBLIC_READ_ONLY:'false'});
    const fetcher=(status=503,code='D1_READ_BUDGET',results=[{definitionId:2,isArabic:0}])=>async url=>url.endsWith('/countries')?Response.json([]):url.includes('/definitions/feed')?Response.json({definitionIds:[99]}):url.includes('ids=')?Response.json({code},{status}):Response.json({results});
    await expect(verifyMutableReadiness('unused','account',{inspect,fetcher:fetcher()})).resolves.toEqual({transition:false,writesPaused:false});
    for(const [status,code] of [[403,'D1_READ_BUDGET'],[503,'PUBLIC_READ_ONLY'],[500,'D1_READ_BUDGET']])await expect(verifyMutableReadiness('unused','account',{inspect,fetcher:fetcher(status,code)})).rejects.toThrow('probe failed');
    for(const results of [[],[{definitionId:2,isArabic:1}],[{definitionId:0,isArabic:0}]])await expect(verifyMutableReadiness('unused','account',{inspect,fetcher:fetcher(503,'D1_READ_BUDGET',results)})).rejects.toThrow('fallback is unavailable');
  });
});
