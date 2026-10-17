import assert from 'node:assert/strict';

const base=process.argv[2]||'https://qamous.org';
const checks=[];
async function inspect(path,status,validate,headers={}) {
  const response=await fetch(new URL(path,base),{redirect:'manual',headers,signal:AbortSignal.timeout(15000)});
  const body=await response.text();assert.equal(response.status,status,path);
  if(validate) validate(body,response);
  checks.push({path,status,passed:true});return body;
}
const canonical=(path)=>(body)=>assert.ok(body.includes(`rel="canonical" href="https://qamous.org${path}"`),path+' initial canonical');
const countries=JSON.parse(await inspect('/api/countries',200));
for(const path of ['/','/about','/blog','/advanced-search','/word/2','/word/11/ar']) await inspect(path,200,canonical(path));
for(const country of countries) {
  const path='/advanced-search/'+encodeURIComponent(country.countryName);
  await inspect(path,200,(body)=>{canonical(path)(body);assert.ok(/href="\/word\/\d+/.test(body),'crawlable vocabulary links');assert.ok(body.includes('href="/advanced-search/'),'cross-dialect links');}, {'Sec-Fetch-Mode':'navigate'});
}
for(const path of ['/word/99999999','/word/not-an-id','/this-page-does-not-exist-seo-check','/advanced-search/Unknown']) {
  for(const headers of [{},{'Sec-Fetch-Mode':'navigate'}]) await inspect(path,404,(body,response)=>{
    assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'));
    assert.ok(body.includes('Page not found'));assert.ok(!body.includes('rel="canonical"'));
  },headers);
}
for(const [path,canonicalPath] of [['/search/seo-check','/search'],['/reset-password/disposable-seo-check','/reset-password']]) {
  await inspect(path,200,(body,response)=>{canonical(canonicalPath)(body);assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'));assert.ok(!body.includes('disposable-seo-check'));},{'Sec-Fetch-Mode':'navigate'});
}
await inspect('/word/2/en?preserve=1',308,(_body,response)=>assert.equal(response.headers.get('location'),new URL('/word/2?preserve=1',base).toString()));
await inspect('/api/auth/health',200,body=>assert.equal(JSON.parse(body).status,'OK'),{'Sec-Fetch-Mode':'navigate'});
await inspect('/robots.txt',200,body=>{assert.ok(body.includes('User-agent: GPTBot'));assert.ok(body.includes('Allow: /api/definitions/word/'));});
await inspect('/sitemap.xml',200,body=>{
  const urls=[...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1].replace(/&amp;/g,'&')));
  assert.ok(urls.length>0);
  assert.ok(urls.every(url=>url.origin==='https://qamous.org'&&!url.username&&!url.password));
  assert.ok(urls.some(url=>url.pathname==='/advanced-search/Egypt'));
  assert.ok(urls.every(url=>!url.pathname.startsWith('/reset-password')));
});
console.log(JSON.stringify({verifiedAt:new Date().toISOString(),base,passed:true,checks:checks.length,dialectGuides:countries.length,productionWrites:false}));
