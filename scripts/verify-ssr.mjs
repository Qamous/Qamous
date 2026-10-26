import assert from 'node:assert/strict';
import {renderApplication,serializeState} from '../server-build/entry.js';
import {countries,rows,fixtureData} from './ssr-fixtures.mjs';
const data=async path=>fixtureData(path);
const paths=['/','/about','/blog','/advanced-search','/advanced-search/Egypt','/advanced-search?q=ma3lish','/login','/signup','/chatbot','/forgot-password','/reset-password/test','/profile','/add-definition','/search/ma3lish','/feeling-lucky','/advertise','/opportunities','/sources','/contributors/fixture','/word/2','/word/2/ar','/browse/en','/browse/ar','/missing'];
let count=0;
for(const path of paths) {
  const seed=path.startsWith('/word/')?{word:true,wordData:fixtureData('/seo/word/2')}:path.startsWith('/browse/')?{browse:fixtureData('/seo'+path),countries}:['/missing','/sources'].includes(path)?{notFound:true}:{};
  const page=await renderApplication(new Request('https://qamous.org'+path),data,seed);
  assert.match(page.html,/<div class="app">/);assert.match(page.html,/<footer/);
  assert.doesNotMatch(page.html,/seo-initial|initial-loader/);
  assert.doesNotMatch(page.html,/<script[^>]*>\s*(?:function|\$RC|\$RS)/);
  assert.equal((page.head.match(/<title\b/g)||[]).length,1);
  const initialStyles=[...page.assets.matchAll(/<style data-qamous-stylesheet="([^"]+)">([\s\S]*?)<\/style><link rel="stylesheet" href="\1">/g)];
  assert.ok(initialStyles.length>0,'Every page needs its layout before CSS downloads');
  assert.equal(initialStyles.length,(page.assets.match(/rel="stylesheet"/g)||[]).length);
  for(const [,file,css] of initialStyles) {
    assert.ok(css.length>0,'Empty initial stylesheet: '+file);
    assert.doesNotMatch(css,/@import\b/i,'Initial layout must not wait for remote styles');
  }
  assert.match(initialStyles.map(([, ,css])=>css).join(''),/\.svg-inline--fa\{[^}]*height:1em/);
  assert.ok(!page.theme.includes('undefined'));
  const state=JSON.parse(page.state);
  assert.ok(state.queries);assert.doesNotMatch(page.state,/sessionId|passport|SEO_INTERNAL_SECRET/);
  if(path==='/word/2') {
    assert.match(page.html,/Never mind/);assert.match(page.html,/Fixture dictionary/);
    assert.match(page.html,/CC BY-SA 4.0/);assert.match(page.head,/DefinedTerm/);
  }
  if(path==='/word/2/ar') assert.match(page.html,/ولا يهمك/);
  if(path.startsWith('/browse/')) assert.match(page.html,/href="\/word\/2/);
  if(['/missing','/sources'].includes(path)) {assert.doesNotMatch(page.head,/rel="canonical"/);assert.match(page.head,/noindex/);}
  count++;
}
const concurrent=await Promise.all(Array.from({length:12},(_,i)=>{
  const ar=i%2===1,theme=['dark','light','grain'][i%3];
  return renderApplication(new Request('https://qamous.org/',{headers:{Cookie:`language=${ar?'ar':'en'}; themeMode=${theme}`}}),data)
    .then(page=>({page,ar,theme}));
}));
for(const {page,ar,theme} of concurrent) {
  const state=JSON.parse(page.state);assert.equal(state.language,ar?'ar':'en');assert.equal(state.theme,theme);
  assert.match(page.html,ar?/ولا يهمك/:/Never mind/);
  assert.equal(page.grain,theme==='grain');
}
assert.doesNotMatch(serializeState({text:'</script><script>evil()</script>&\u2028'}),/[<>&\u2028]/);
// Repeated cold word URLs must use the shared SEO payload for actual visible
// meanings, provenance and related links, without any second database API call.
let duplicateWordCalls=0;
for(const path of ['/word/2','/word/2/ar','/word/2','/word/2/ar']) {
  const wordData=fixtureData('/seo/word/2');
  wordData.rows=[...wordData.rows,{...rows[0],id:103,definition:'A second visible meaning'}];
  const page=await renderApplication(new Request('https://qamous.org'+path),async()=>{duplicateWordCalls++;throw new Error('Duplicate word API call');},{word:true,wordData});
  assert.match(page.html,path.endsWith('/ar')?/يلا/:/yalla/);
  assert.match(page.html,path.endsWith('/ar')?/ولا يهمك/:/A second visible meaning/);
  const queries=JSON.parse(page.state).queries.queries;
  assert.ok(queries.find(query=>query.queryKey[0]==='relatedWords'));
}
assert.equal(duplicateWordCalls,0);
for(const language of ['en','ar']) {
  const rendered=await renderApplication(new Request('https://qamous.org/',{headers:{Cookie:'language='+language}}),async path=>{
    if(path.includes('&ids='))throw Object.assign(new Error('Quota closed'),{status:503});
    return fixtureData(path);
  });
  assert.match(rendered.html,language==='ar'?/ولا يهمك/:/Never mind/);
  const order=JSON.parse(rendered.state).queries.queries.find(query=>query.queryKey[0]==='homeFeedOrder');
  assert.deepEqual(order.state.data,[language==='ar'?102:101]);
}
const personalPaths=[];
const personal=await renderApplication(new Request('https://qamous.org/word/2',{headers:{Cookie:'qamous_session=private'}}),async path=>{
  personalPaths.push(path);
  return fixtureData(path).map(row=>({...row,isLiked:1}));
},{word:true,wordData:fixtureData('/seo/word/2'),personalized:true});
assert.deepEqual(personalPaths,['/definitions/word/2']);
assert.equal(JSON.parse(personal.state).queries.queries.find(query=>query.queryKey[0]==='homeContent').state.data[0].isLiked,true);
console.log(JSON.stringify({serverRenderedRoutes:count,concurrentIsolatedRenders:concurrent.length,scriptEscaping:true,sharedLayout:true,inlineInitialStyles:true,duplicateWordCalls,personalizedWordIsolated:true}));
