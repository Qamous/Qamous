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
});
