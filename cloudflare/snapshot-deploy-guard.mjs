import {spawnSync} from 'node:child_process';
import {join} from 'node:path';

export function validateFrozenWriters(api,importer,schedules) {
  const paused=settings=>settings?.bindings?.find(binding=>binding.name==='PUBLIC_READ_ONLY')?.text==='true';
  if(!paused(api)||!paused(importer)||!Array.isArray(schedules?.schedules)||schedules.schedules.length!==0)
    throw Error('Snapshot deployment refused: live API and importer must be paused, with no importer schedules');
}
function liveWorkerInspector(root,accountId) {
  const auth=spawnSync(process.execPath,[join(root,'node_modules/wrangler/bin/wrangler.js'),'auth','token','--json'],
    {cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:1024*1024});
  if(auth.status!==0)throw Error('Snapshot deployment refused: existing Wrangler authentication unavailable');
  const token=JSON.parse(auth.stdout).token;
  if(typeof token!=='string'||!token||/[\r\n]/.test(token))throw Error('Snapshot deployment refused: invalid authentication');
  // Header goes through stdin, never command arguments, files or console logs.
  const quote=value=>'"'+value.replaceAll('\\','\\\\').replaceAll('"','\\"')+'"';
  function inspect(path) {
    const url=`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${path}`;
    const result=spawnSync(process.platform==='win32'?'curl.exe':'curl',['--config','-'],{encoding:'utf8',windowsHide:true,maxBuffer:2*1024*1024,
      input:`silent\nshow-error\nfail\nmax-time = 20\nurl = ${quote(url)}\nheader = ${quote('Authorization: Bearer '+token)}\n`});
    if(result.status!==0)throw Error('Snapshot deployment refused: live writer inspection failed');
    const response=JSON.parse(result.stdout);if(response.success!==true)throw Error('Snapshot deployment refused: live writer inspection denied');
    return response.result;
  }
  return inspect;
}
export async function verifyFrozenWriters(root,accountId) {
  const inspect=liveWorkerInspector(root,accountId);
  validateFrozenWriters(inspect('qamous-api/settings'),inspect('qamous-import/settings'),inspect('qamous-import/schedules'));
  const check=await fetch('https://api.qamous.org/auth/session',{signal:AbortSignal.timeout(20_000)});
  if(check.status!==503||(await check.json()).code!=='PUBLIC_READ_ONLY')throw Error('Snapshot deployment refused: API pause is not effective');
  console.log(JSON.stringify({publicSnapshotFreezeVerifiedAt:new Date().toISOString(),apiPaused:true,importerPaused:true,importerSchedules:0}));
}
export function validateMutableReadiness(web,api,importer,schedules) {
  const binding=(settings,name)=>{
    const matches=settings?.bindings?.filter(item=>item.name===name);
    return matches?.length===1?matches[0]:null;
  };
  const text=(settings,name)=>binding(settings,name)?.text;
  if(!Array.isArray(web?.bindings)||text(api,'PUBLIC_READ_ONLY')!=='false'||text(api,'PUBLIC_CARD_PAYLOADS')!=='true'
    ||!['true','false'].includes(text(api,'PUBLIC_WRITES_PAUSED')))
    throw Error('Normal deployment refused: prepared public reads and an explicit write-pause state must be verified');
  const db=binding(api,'DB');
  if((db?.id??db?.database_id)!=='d0587244-4f3d-4209-b246-55cefbce7555')throw Error('Normal deployment refused: unapproved public database');
  const transition=web.bindings.some(item=>item.name==='PUBLIC_SNAPSHOT_ID');
  if(transition&&(text(api,'PUBLIC_WRITES_PAUSED')!=='true'||text(importer,'PUBLIC_READ_ONLY')!=='true'||!Array.isArray(schedules?.schedules)||schedules.schedules.length))
    throw Error('Normal deployment refused: snapshot withdrawal requires content writes and importer schedules to remain paused');
  return {transition,writesPaused:text(api,'PUBLIC_WRITES_PAUSED')==='true'};
}
export async function verifyMutableReadiness(root,accountId,{inspect=liveWorkerInspector(root,accountId),fetcher=fetch}={}) {
  const state=validateMutableReadiness(inspect('qamous-web/settings'),inspect('qamous-api/settings'),inspect('qamous-import/settings'),inspect('qamous-import/schedules'));
  const get=async path=>{
    const reply=await fetcher('https://api.qamous.org'+path,{signal:AbortSignal.timeout(20_000),cache:'no-store'});
    if(reply.status!==200){const detail=await reply.json().catch(()=>null);throw Object.assign(Error('Normal deployment refused: public API readiness probe failed'),{status:reply.status,code:detail?.code});}
    return reply.json();
  };
  const countries=await get('/countries'),feed=await get('/definitions/feed?script=franco');
  if(!Array.isArray(countries)||!Array.isArray(feed?.definitionIds)||!feed.definitionIds.length)throw Error('Normal deployment refused: public API readiness payload is invalid');
  const id=Number(feed.definitionIds[0]);
  if(!Number.isSafeInteger(id)||id<1)throw Error('Normal deployment refused: public feed identity is invalid');
  let fallback=false;
  try {
    const card=await get('/word/explore?ids='+id+'&script=both');
    if(!Array.isArray(card?.results)||!card.results.some(row=>Number(row.definitionId??row.id)===id))throw Error('Normal deployment refused: a prepared public card is unavailable');
  } catch(error) {
    if(error.status!==503||error.code!=='D1_READ_BUDGET')throw error;
    const page=await get('/word/explore?script=franco&scope=all&sort=popular&page=1&limit=12');
    if(!Array.isArray(page?.results)||!page.results.length||page.results.length>12||!page.results.every(row=>row&&Number.isSafeInteger(Number(row.definitionId??row.id))&&Number(row.definitionId??row.id)>0&&(row.isArabic===false||row.isArabic===0)))throw Error('Normal deployment refused: the public home fallback is unavailable');
    fallback=true;
  }
  console.log(JSON.stringify({mutablePublicReadsVerifiedAt:new Date().toISOString(),...state,publicProbes:fallback?4:3,homeFallbackVerified:fallback}));
  return state;
}
