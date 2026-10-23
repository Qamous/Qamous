// @vitest-environment node
import {afterAll,afterEach,describe,it,expect,vi} from 'vitest';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {verifyPublicSnapshot} from './public-snapshot.mjs';

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
});
