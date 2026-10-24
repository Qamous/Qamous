// @vitest-environment node
import {afterAll,afterEach,describe,it,expect,vi} from 'vitest';
import {mkdtemp,mkdir,writeFile,readFile,rm,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {verifyPublicSnapshot,withdrawPublicSnapshot} from './public-snapshot.mjs';

// The shared React test setup installs a scrollTo mock; these filesystem tests
// otherwise run in Node so import.meta.url retains its real file location.
vi.stubGlobal('window',{});
afterAll(()=>vi.unstubAllGlobals());

const temporary=[];
async function project() {
  const directory=await mkdtemp(join(tmpdir(),'qamous-snapshot-guard-'));
  temporary.push(directory);
  await writeFile(join(directory,'wrangler.jsonc'),JSON.stringify({vars:{PUBLIC_SNAPSHOT_FROZEN:'false'}}));
  return directory;
}
afterEach(async()=>{
  for(const directory of temporary.splice(0)) {
    const target=resolve(directory),parent=resolve(tmpdir());
    if(!target.startsWith(parent+sep)||!target.slice(parent.length+1).startsWith('qamous-snapshot-guard-'))throw Error('Unexpected test cleanup path');
    await rm(target,{recursive:true,force:true});
  }
});
async function frozenProject() {
  const directory=await project(),id='frozen-fixture',resources=[],sha=value=>createHash('sha256').update(value).digest('hex'),now=Date.now();
  const config={vars:{PUBLIC_SNAPSHOT_ID:id,PUBLIC_SNAPSHOT_FROZEN:'true',PUBLIC_SNAPSHOT_EXPIRES_AT:new Date(now+86400000).toISOString(),KEEP:'yes'}};
  for(const key of ['countries','posts','sources','discovery','feed:0','feed:1','seo-index','seo-browse:en:','seo-browse:ar:']) {
    const data=JSON.stringify({key,value:[]}),file=sha(key)+'.json';
    for(const base of ['public','build']){await mkdir(join(directory,base,'public-data',id),{recursive:true});await writeFile(join(directory,base,'public-data',id,file),data);}
    resources.push({key,file,bytes:Buffer.byteLength(data),sha256:sha(data)});
  }
  const manifest=JSON.stringify({schemaVersion:1,snapshotId:id,generatedAt:new Date(now).toISOString(),exportStartedAt:new Date(now-1000).toISOString(),exportCompletedAt:new Date(now).toISOString(),expiresAt:config.vars.PUBLIC_SNAPSHOT_EXPIRES_AT,resources});
  for(const base of ['public','build'])await writeFile(join(directory,base,'public-data',id,'manifest.json'),manifest);
  await mkdir(join(directory,'cloudflare'));await writeFile(join(directory,'wrangler.jsonc'),JSON.stringify(config));
  await writeFile(join(directory,'cloudflare/public-snapshot-release.json'),JSON.stringify({snapshotId:id,frozen:true,manifestSha256:sha(manifest),resources:resources.length}));
  return directory;
}
describe('disabling public snapshot authority',()=>{
  it('allows absent or empty generated directories',async()=>{
    const rootDirectory=await project();
    expect(await verifyPublicSnapshot({rootDirectory})).toBeNull();
    for(const base of ['public','build'])await mkdir(join(rootDirectory,base,'public-data'),{recursive:true});
    expect(await verifyPublicSnapshot({rootDirectory,built:true})).toBeNull();
  });
  it.each(['public','build'])('rejects retained %s assets in both build and deployment checks',async base=>{
    const rootDirectory=await project(),directory=join(rootDirectory,base,'public-data','previous-snapshot');
    await mkdir(directory,{recursive:true});await writeFile(join(directory,'manifest.json'),'{}');
    for(const built of [false,true])await expect(verifyPublicSnapshot({rootDirectory,built})).rejects.toThrow(`${base}/public-data still contains assets`);
  });
  it('does not treat unreadable or invalid asset paths as successfully removed',async()=>{
    const rootDirectory=await project();await mkdir(join(rootDirectory,'public'),{recursive:true});
    await writeFile(join(rootDirectory,'public/public-data'),'unexpected file');
    await expect(verifyPublicSnapshot({rootDirectory,built:true})).rejects.toThrow();
  });
  it('withdraws both directly served asset copies before disabling snapshot authority, retaining an ignored backup',async()=>{
    const rootDirectory=await frozenProject(),result=await withdrawPublicSnapshot({rootDirectory});
    expect(result.retiredSnapshotId).toBe('frozen-fixture');expect(result.writersResumed).toBe(false);
    await expect(verifyPublicSnapshot({rootDirectory,built:true})).resolves.toBeNull();
    const config=JSON.parse(await readFile(join(rootDirectory,'wrangler.jsonc'),'utf8'));
    expect(config.vars).toEqual({KEEP:'yes'});
    for(const base of ['public','build']) {
      await expect(access(join(rootDirectory,base,'public-data'))).rejects.toThrow();
      await expect(access(join(result.backupDirectory,base+'-public-data','frozen-fixture','manifest.json'))).resolves.toBeUndefined();
    }
  });
  it('refuses unrecognized build artifacts before changing the current release',async()=>{
    const rootDirectory=await frozenProject(),before=await readFile(join(rootDirectory,'wrangler.jsonc'));
    await writeFile(join(rootDirectory,'build/public-data','unexpected.sql'),'private');
    await expect(withdrawPublicSnapshot({rootDirectory})).rejects.toThrow('unexpected generated snapshot');
    expect(await readFile(join(rootDirectory,'wrangler.jsonc'))).toEqual(before);
    await expect(access(join(rootDirectory,'public/public-data/frozen-fixture/manifest.json'))).resolves.toBeUndefined();
  });
  it('restores both asset directories and original configuration if final validation fails',async()=>{
    const rootDirectory=await frozenProject(),before=await readFile(join(rootDirectory,'wrangler.jsonc'));
    await writeFile(join(rootDirectory,'build/.qamous-code-only'),'not publishable');
    await expect(withdrawPublicSnapshot({rootDirectory})).rejects.toThrow('code-only');
    expect(await readFile(join(rootDirectory,'wrangler.jsonc'))).toEqual(before);
    for(const base of ['public','build'])await expect(access(join(rootDirectory,base,'public-data/frozen-fixture/manifest.json'))).resolves.toBeUndefined();
  });
});
