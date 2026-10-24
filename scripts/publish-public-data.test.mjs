// @vitest-environment node
import {it as test,vi,afterAll} from 'vitest';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm,writeFile,access,mkdir,symlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {publicationFile,verifyLivePublication,publishPublicData,cleanupPublicationStage} from './publish-public-data.mjs';
vi.stubGlobal('window',{});
afterAll(()=>vi.unstubAllGlobals());
test('publication source paths cannot escape staged checkout',()=>{
  const root=resolve('sample-root');
  assert.equal(publicationFile(root,'src/App.tsx'),join(root,'src','App.tsx'));
  assert.throws(()=>publicationFile(root,'../private.sql'),/Unsafe/);
  assert.throws(()=>publicationFile(root,''),/Unsafe/);
  assert.throws(()=>publicationFile(root,resolve('outside-root')),/Unsafe/);
});
test('successful cleanup removes only owned staging directories and unlinks both shared junction targets',async()=>{
  const root=await mkdtemp(join(tmpdir(),'qamous-junction-cleanup-')),target=join(root,'output','public-publication-00000000-0000-0000-0000-000000000001'),shared=join(root,'shared');
  try {
    await mkdir(join(target,'web'),{recursive:true});await mkdir(shared);await writeFile(join(shared,'keep.txt'),'preserved');
    for(const path of [join(target,'web/node_modules'),join(target,'qamous-backend')])await symlink(shared,path,process.platform==='win32'?'junction':'dir');
    await cleanupPublicationStage(target,{rootDirectory:root});
    assert.equal(await readFile(join(shared,'keep.txt'),'utf8'),'preserved');
    await assert.rejects(access(target));
    await assert.rejects(cleanupPublicationStage(shared,{rootDirectory:root}),/Unsafe/);
    assert.equal(await readFile(join(shared,'keep.txt'),'utf8'),'preserved');
  }finally{await rm(root,{recursive:true,force:true});}
});
test('live checks require the deployed revision and all public routes',async()=>{
  const seen=[];
  const fetcher=async url=>{seen.push(url);return url.endsWith('/api/countries')?Response.json([],{headers:{'X-Qamous-Snapshot':'new-release'}}):new Response('ok');};
  assert.equal((await verifyLivePublication('new-release',{fetcher})).publicRoutes,4);
  assert.equal(seen.length,4);
  await assert.rejects(verifyLivePublication('wrong-release',{fetcher}),/not verified/);
  await assert.rejects(verifyLivePublication('new-release',{fetcher:async url=>url.endsWith('/api/countries')?Response.json([],{headers:{'X-Qamous-Snapshot':'new-release'}}):new Response('down',{status:503})}),/route failed/);
});
test('invalid publication input leaves the current release configuration unchanged',async()=>{
  const root=fileURLToPath(new URL('..',import.meta.url)),config=join(root,'wrangler.jsonc'),release=join(root,'cloudflare/public-snapshot-release.json');
  const before=await Promise.all([readFile(config),readFile(release)]),input=await mkdtemp(join(tmpdir(),'qamous-invalid-publication-'));
  try{await assert.rejects(publishPublicData(input));assert.deepEqual(await Promise.all([readFile(config),readFile(release)]),before);}
  finally{await rm(input,{recursive:true,force:true});}
});
test('a staged build failure leaves the original release and shared dependencies intact',async()=>{
  const root=fileURLToPath(new URL('..',import.meta.url)),config=join(root,'wrangler.jsonc'),release=join(root,'cloudflare/public-snapshot-release.json');
  const before=await Promise.all([readFile(config),readFile(release)]),input=await mkdtemp(join(tmpdir(),'qamous-stage-failure-'));
  const sha=value=>createHash('sha256').update(value).digest('hex'),resources=[],now=Date.now();
  try {
    for(const key of ['countries','posts','sources','discovery','feed:0','feed:1','seo-index','seo-browse:en:','seo-browse:ar:']) {
      const data=JSON.stringify({key,value:[]}),file=sha(key)+'.json';await writeFile(join(input,file),data);
      resources.push({key,file,bytes:Buffer.byteLength(data),sha256:sha(data)});
    }
    await writeFile(join(input,'manifest.json'),JSON.stringify({schemaVersion:1,snapshotId:'stage-fixture',generatedAt:new Date(now).toISOString(),exportStartedAt:new Date(now-1000).toISOString(),exportCompletedAt:new Date(now).toISOString(),expiresAt:new Date(now+86400000).toISOString(),resources}));
    const commands=[];
    const runProcess=(command,args)=>{commands.push([command,...args]);if(command==='git')return {status:0,stdout:''};return {status:args[0].includes('typescript')?1:0};};
    await assert.rejects(publishPublicData(input,{runProcess}),/typescript.*failed/);
    assert.equal(commands.some(args=>args.includes('cloudflare/deploy.mjs')),false);
    assert.deepEqual(await Promise.all([readFile(config),readFile(release)]),before);
    await access(join(root,'node_modules/typescript/bin/tsc'));
  } finally {await rm(input,{recursive:true,force:true});}
});
