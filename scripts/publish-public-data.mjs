// Publish a reviewed public snapshot without changing the current checkout's
// release configuration until its isolated build and production deploy pass.
import {mkdir,copyFile,symlink,unlink,rm,access} from 'node:fs/promises';
import {resolve,join,relative,dirname,sep,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {auditSnapshot,installPublicSnapshot} from './public-snapshot.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
export function publicationFile(rootDirectory,name) {
  const path=resolve(rootDirectory,name),rel=relative(resolve(rootDirectory),path);
  if(!rel||isAbsolute(name)||isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep)||resolve(rootDirectory)===path||name.includes('\0'))throw Error('Unsafe publication source path');
  return path;
}
export async function cleanupPublicationStage(stageParent,{rootDirectory=root}={}) {
  const target=resolve(stageParent),parent=resolve(rootDirectory,'output');
  if(dirname(target)!==parent||!/^public-publication-[0-9a-f-]{36}$/.test(relative(parent,target)))throw Error('Unsafe publication cleanup target');
  // Remove the two links explicitly before recursive cleanup. Never traverse
  // either shared directory, including when a Windows process briefly locks it.
  for(const link of [join(target,'web/node_modules'),join(target,'qamous-backend')]) {
    try{await unlink(link);}catch(error){if(error.code!=='ENOENT')throw error;}
  }
  await rm(target,{recursive:true,force:true,maxRetries:5,retryDelay:200});
}
export async function verifyLivePublication(snapshotId,{fetcher=fetch}={}) {
  const response=await fetcher('https://qamous.org/api/countries',{signal:AbortSignal.timeout(20000),cache:'no-store'});
  if(response.status!==200||response.headers.get('X-Qamous-Snapshot')!==snapshotId)throw Error('Deployment completed but the new public snapshot was not verified live');
  const countries=await response.json();if(!Array.isArray(countries))throw Error('Live public snapshot returned an invalid payload');
  for(const path of ['/','/robots.txt','/sitemap.xml']) {
    const check=await fetcher('https://qamous.org'+path,{signal:AbortSignal.timeout(20000),cache:'no-store'});
    if(check.status!==200){await check.body?.cancel();throw Error('Deployment completed but a public route failed live verification');}
    await check.body?.cancel();
  }
  return {snapshotId,verifiedAt:new Date().toISOString(),publicRoutes:4};
}
export async function publishPublicData(source,{validateOnly=false,runProcess=spawnSync}={}) {
  source=resolve(source);
  const audited=await auditSnapshot(source,{fresh:true});
  if(validateOnly)return {validated:true,snapshotId:audited.manifest.snapshotId,resources:audited.manifest.resources.length};
  const stageParent=resolve(root,'output','public-publication-'+randomUUID()),stage=join(stageParent,'web');
  if(!stageParent.startsWith(resolve(root,'output')+sep))throw Error('Unsafe publication staging target');
  await mkdir(stage,{recursive:true});
  const run=(script,args=[],cwd=stage)=>{
    const result=runProcess(process.execPath,[script,...args],{cwd,stdio:'inherit',windowsHide:true});
    if(result.status!==0)throw Error('Publication stopped: '+script+' failed');
  };
  try {
    const inventory=runProcess('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
    if(inventory.status!==0)throw Error('Could not inventory publication sources');
    for(const name of new Set(inventory.stdout.split('\0').filter(Boolean))) {
      const from=publicationFile(root,name),to=publicationFile(stage,name);
      // Deleted tracked files are intentionally absent from the working tree.
      if(!await access(from).then(()=>true,()=>false))continue;
      await mkdir(dirname(to),{recursive:true});await copyFile(from,to);
    }
    await symlink(resolve(root,'node_modules'),join(stage,'node_modules'),process.platform==='win32'?'junction':'dir');
    await symlink(resolve(root,'../qamous-backend'),join(stageParent,'qamous-backend'),process.platform==='win32'?'junction':'dir');
    run('scripts/public-snapshot.mjs',['install',source,'--frozen']);
    run('node_modules/typescript/bin/tsc',['-p','tsconfig.server.json']);
    run('scripts/build.mjs');
    run('scripts/verify-ssr.mjs');
    // Both invocations retain live Free-plan, writer-pause and snapshot guards.
    run('cloudflare/deploy.mjs',['--dry-run']);
    run('cloudflare/deploy.mjs');
    const live=await verifyLivePublication(audited.manifest.snapshotId);
    // Only now update the user's source configuration to match production.
    await installPublicSnapshot(source,{frozen:true});
    return {...live,resources:audited.manifest.resources.length,writersResumed:false};
  } finally {
    // Literal, resolved per-run directory checked above. rm removes junctions,
    // never traverses the shared dependency/backend link targets.
    await cleanupPublicationStage(stageParent);
  }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  if(args[0]!=='--source'||!args[1]||args.length>3||(args[2]&&args[2]!=='--validate-only'))throw Error('Use --source <reviewed public-assets directory> [--validate-only]');
  console.log(JSON.stringify(await publishPublicData(args[1],{validateOnly:args[2]==='--validate-only'})));
}
