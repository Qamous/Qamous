import {readFile,writeFile,mkdir,copyFile,readdir,rm,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const sha=value=>createHash('sha256').update(value).digest('hex');
const readJson=async path=>JSON.parse(await readFile(path,'utf8'));
const fail=message=>{throw Error('Public snapshot refused: '+message);};
const keyPattern=/^(?:countries|posts|sources|discovery|feed:[01]|word:[1-9]\d*|cards:\d+|related:[A-Z]{2}:(?:ar|franco)|seo-index|seo-shard:\d+|seo-browse:(?:en|ar):\d*|seo-dialect:[^/\\]+|explore:[^/\\]+|contributor:[^/\\]+|license:[^/\\]+)$/;
const manifestFields=new Set(['schemaVersion','snapshotId','generatedAt','sourceExportedAt','exportStartedAt','exportCompletedAt','expiresAt','resources','skipped','counts']);
function publicValue(value) {
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){value.forEach(publicValue);return;}
  for(const [key,item] of Object.entries(value)) {
    if(/(?:password|secret|token|session|email|private|rawPayload|sourceFiles|storagePath|reportReason)/i.test(key))fail('private field '+key);
    if(['isLiked','isDisliked','isReported'].includes(key)&&item!==false&&item!==0)fail('personalized public data');
    publicValue(item);
  }
}
export async function auditSnapshot(directory,{fresh=false}={}) {
  const raw=await readFile(join(directory,'manifest.json')),manifest=JSON.parse(raw);
  if(Object.keys(manifest).some(key=>!manifestFields.has(key)))fail('unexpected manifest metadata');
  const start=Date.parse(manifest.exportStartedAt),end=Date.parse(manifest.exportCompletedAt),generated=Date.parse(manifest.generatedAt),expiry=Date.parse(manifest.expiresAt);
  if(manifest.schemaVersion!==1||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,100}$/.test(manifest.snapshotId)
    ||![start,end,generated,expiry].every(Number.isFinite)||start>end||end>generated||generated>Date.now()+300_000||expiry!==end+86_400_000
    ||(fresh&&(Date.now()-end>2*3_600_000||end>Date.now()+300_000)))fail('invalid or outdated export');
  if(!Array.isArray(manifest.resources)||manifest.resources.length<1||manifest.resources.length>19_000)fail('invalid resource count');
  const keys=new Set(),files=new Set(['manifest.json']);let bytes=0;
  for(const entry of manifest.resources) {
    if(Object.keys(entry).some(key=>!['key','file','bytes','sha256'].includes(key))||!keyPattern.test(entry.key)||keys.has(entry.key)
      ||entry.file!==sha(entry.key)+'.json'||!/^[a-f0-9]{64}$/.test(entry.sha256)||!Number.isSafeInteger(entry.bytes)||entry.bytes<1||entry.bytes>25_000_000)fail('invalid resource');
    keys.add(entry.key);files.add(entry.file);
    const content=await readFile(join(directory,entry.file));
    if(content.length!==entry.bytes||sha(content)!==entry.sha256)fail('asset hash mismatch for '+entry.key);
    const payload=JSON.parse(content);
    if(Object.keys(payload).sort().join(',')!=='key,value'||payload.key!==entry.key)fail('invalid public envelope');
    publicValue(payload.value);bytes+=content.length;
  }
  for(const required of ['countries','posts','sources','discovery','feed:0','feed:1','seo-index','seo-browse:en:','seo-browse:ar:'])if(!keys.has(required))fail('missing '+required);
  const actual=await readdir(directory,{withFileTypes:true});
  if(actual.length!==files.size||actual.some(entry=>!entry.isFile()||!files.has(entry.name)))fail('unexpected public asset');
  return {manifest,manifestSha256:sha(raw),bytes};
}
export async function verifyPublicSnapshot({built=false,rootDirectory=root}={}) {
  const projectRoot=resolve(rootDirectory);
  if(built) {
    const codeOnly=await access(join(projectRoot,'build/.qamous-code-only')).then(()=>true,()=>false);
    if(codeOnly)fail('code-only CI build cannot be deployed');
  }
  const config=await readJson(join(projectRoot,'wrangler.jsonc')),id=config.vars?.PUBLIC_SNAPSHOT_ID;
  if(!id) {
    // Removing the binding does not remove directly served assets. Refuse the
    // transition until both source and built copies are absent or empty, so a
    // later writer unpause cannot leave withdrawn content publicly available.
    for(const base of ['public','build']) {
      const directory=join(projectRoot,base,'public-data');
      const entries=await readdir(directory).catch(error=>{if(error.code==='ENOENT')return [];throw error;});
      if(entries.length)fail(`snapshot authority is disabled but ${base}/public-data still contains assets; remove the generated snapshot before rebuilding`);
    }
    return null;
  }
  const release=await readJson(join(projectRoot,'cloudflare/public-snapshot-release.json'));
  if(release.snapshotId!==id||release.frozen!==(config.vars.PUBLIC_SNAPSHOT_FROZEN==='true'))fail('release does not match Worker configuration');
  if(!release.frozen&&Date.parse(config.vars.PUBLIC_SNAPSHOT_EXPIRES_AT)<=Date.now())fail('snapshot expired');
  const directory=join(projectRoot,built?'build':'public','public-data');
  const installed=await readdir(directory,{withFileTypes:true});
  if(installed.length!==1||!installed[0].isDirectory()||installed[0].name!==id)fail('older or unreviewed snapshot assets present');
  const audited=await auditSnapshot(join(directory,id));
  if(release.manifestSha256!==audited.manifestSha256||release.resources!==audited.manifest.resources.length
    ||config.vars.PUBLIC_SNAPSHOT_EXPIRES_AT!==audited.manifest.expiresAt)fail('release digest mismatch');
  return {...release,bytes:audited.bytes};
}
export async function installPublicSnapshot(source,{frozen=false}={}) {
  const audited=await auditSnapshot(resolve(source),{fresh:true}),{manifest}=audited;
  const parent=resolve(root,'public/public-data'),destination=resolve(parent,manifest.snapshotId);
  if(!destination.startsWith(parent+sep)||destination===resolve(source))fail('invalid installation target');
  await mkdir(destination,{recursive:true});
  for(const entry of manifest.resources)await copyFile(join(source,entry.file),join(destination,entry.file));
  await copyFile(join(source,'manifest.json'),join(destination,'manifest.json'));
  await auditSnapshot(destination);
  // Remove only previously generated and independently audited snapshot folders
  // inside this dedicated ignored directory. Raw exports are never copied.
  for(const entry of await readdir(parent,{withFileTypes:true})) {
    if(entry.name===manifest.snapshotId)continue;
    const previous=resolve(parent,entry.name);
    if(!entry.isDirectory()||!previous.startsWith(parent+sep)||!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,100}$/.test(entry.name))fail('unexpected previous snapshot');
    const old=await auditSnapshot(previous);if(old.manifest.snapshotId!==entry.name)fail('unexpected previous snapshot identity');
    await rm(previous,{recursive:true});
  }
  const config=await readJson(join(root,'wrangler.jsonc'));
  config.vars={...config.vars,PUBLIC_SNAPSHOT_ID:manifest.snapshotId,PUBLIC_SNAPSHOT_EXPIRES_AT:manifest.expiresAt,PUBLIC_SNAPSHOT_FROZEN:String(frozen)};
  const release={schemaVersion:1,snapshotId:manifest.snapshotId,exportStartedAt:manifest.exportStartedAt,exportCompletedAt:manifest.exportCompletedAt,
    generatedAt:manifest.generatedAt,expiresAt:manifest.expiresAt,frozen,manifestSha256:audited.manifestSha256,resources:manifest.resources.length,bytes:audited.bytes};
  await writeFile(join(root,'wrangler.jsonc'),JSON.stringify(config,null,2)+'\n');
  await writeFile(join(root,'cloudflare/public-snapshot-release.json'),JSON.stringify(release,null,2)+'\n');
  return release;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [action,source,mode]=process.argv.slice(2);
  if(action==='install'&&source&&mode==='--frozen')console.log(JSON.stringify(await installPublicSnapshot(source,{frozen:true})));
  else if(action==='verify'&&!mode)console.log(JSON.stringify(await verifyPublicSnapshot({built:source==='--built'})));
  else throw Error('Use install <reviewed public-assets directory> --frozen, or verify [--built]');
}
