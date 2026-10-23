import {spawnSync} from 'node:child_process';
import {join} from 'node:path';

export function validateFrozenWriters(api,importer,schedules) {
  const paused=settings=>settings?.bindings?.find(binding=>binding.name==='PUBLIC_READ_ONLY')?.text==='true';
  if(!paused(api)||!paused(importer)||!Array.isArray(schedules?.schedules)||schedules.schedules.length!==0)
    throw Error('Snapshot deployment refused: live API and importer must be paused, with no importer schedules');
}
export async function verifyFrozenWriters(root,accountId) {
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
  validateFrozenWriters(inspect('qamous-api/settings'),inspect('qamous-import/settings'),inspect('qamous-import/schedules'));
  const check=await fetch('https://api.qamous.org/auth/session',{signal:AbortSignal.timeout(20_000)});
  if(check.status!==503||(await check.json()).code!=='PUBLIC_READ_ONLY')throw Error('Snapshot deployment refused: API pause is not effective');
  console.log(JSON.stringify({publicSnapshotFreezeVerifiedAt:new Date().toISOString(),apiPaused:true,importerPaused:true,importerSchedules:0}));
}
