import assert from 'node:assert/strict';
import {renderApplication,serializeState} from '../server-build/entry.js';
import {countries,rows,fixtureData} from './ssr-fixtures.mjs';
const data=async path=>fixtureData(path);
const paths=['/','/about','/blog','/advanced-search','/advanced-search/Egypt','/advanced-search?q=ma3lish','/login','/signup','/chatbot','/forgot-password','/reset-password/test','/profile','/add-definition','/search/ma3lish','/feeling-lucky','/advertise','/opportunities','/sources','/contributors/fixture','/word/2','/word/2/ar','/browse/en','/browse/ar','/missing'];
let count=0;
for(const path of paths) {
  const seed=path.startsWith('/word/')?{word:true}:path.startsWith('/browse/')?{browse:fixtureData('/seo'+path),countries}:path==='/missing'?{notFound:true}:{};
  const page=await renderApplication(new Request('https://qamous.org'+path),data,seed);
  assert.match(page.html,/<div class="app">/);assert.match(page.html,/<footer/);
  assert.doesNotMatch(page.html,/seo-initial|initial-loader/);
  assert.doesNotMatch(page.html,/<script[^>]*>\s*(?:function|\$RC|\$RS)/);
  assert.equal((page.head.match(/<title\b/g)||[]).length,1);
  assert.ok(!page.theme.includes('undefined'));
  const state=JSON.parse(page.state);
  assert.ok(state.queries);assert.doesNotMatch(page.state,/sessionId|passport|SEO_INTERNAL_SECRET/);
  if(path==='/word/2') {
    assert.match(page.html,/Never mind/);assert.match(page.html,/Fixture dictionary/);
    assert.match(page.html,/CC BY-SA 4.0/);assert.match(page.head,/DefinedTerm/);
  }
  if(path==='/word/2/ar') assert.match(page.html,/ولا يهمك/);
  if(path.startsWith('/browse/')) assert.match(page.html,/href="\/word\/2/);
  if(path==='/missing') {assert.doesNotMatch(page.head,/rel="canonical"/);assert.match(page.head,/noindex/);}
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
console.log(JSON.stringify({serverRenderedRoutes:count,concurrentIsolatedRenders:concurrent.length,scriptEscaping:true,sharedLayout:true}));
