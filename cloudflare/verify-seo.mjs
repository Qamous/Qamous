import assert from 'node:assert/strict';

const base=process.argv[2]||'https://qamous.org';
const checks=[];
async function inspect(path,status,validate) {
  const response=await fetch(new URL(path,base),{redirect:'manual',signal:AbortSignal.timeout(20000)});
  const body=await response.text();
  assert.equal(response.status,status,path);
  if(validate) validate(body,response);
  checks.push(path);
  return body;
}
const locations=xml=>[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1].replace(/&amp;/g,'&')));
const canonical=(path)=>(body)=>assert.ok(body.includes(`rel="canonical" href="https://qamous.org${path}"`),path+' canonical');

await inspect('/',200,(body)=>{canonical('/')(body);assert.ok(body.includes('href="/browse/en"'));});
await inspect('/about',200,canonical('/about'));
await inspect('/blog',200,canonical('/blog'));
await inspect('/advanced-search',200,canonical('/advanced-search'));
await inspect('/robots.txt',200,body=>{assert.ok(body.includes('Sitemap: https://qamous.org/sitemap.xml'));assert.ok(body.includes('User-agent: GPTBot'));});
const index=await inspect('/sitemap.xml',200,(body,response)=>{
  assert.match(response.headers.get('content-type')||'',/xml/);
  assert.ok(body.includes('<sitemapindex'));
});
const sitemaps=locations(index);
assert.ok(sitemaps.some(url=>url.pathname==='/sitemap-static.xml'));
const staticXml=await inspect('/sitemap-static.xml',200);
const staticUrls=locations(staticXml);
assert.ok(staticUrls.some(url=>url.pathname==='/browse/en'));
assert.ok(staticUrls.some(url=>url.pathname==='/browse/ar'));
let word;
for(const shard of sitemaps.filter(url=>/^\/sitemap-words-\d+\.xml$/.test(url.pathname))) {
  const wordXml=await inspect(shard.pathname,200);
  word=locations(wordXml).find(url=>/^\/word\/\d+(?:\/ar)?$/.test(url.pathname));
  if(word) break;
}
assert.ok(word,'public word in sitemap shards');
await inspect(word.pathname,200,(body,response)=>{
  canonical(word.pathname)(body);
  assert.ok(body.includes('<h1>'));
  assert.ok(body.includes('"@type":"DefinedTerm"'));
  assert.ok(body.includes('class="seo-initial"'));
  assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'));
});
await inspect('/browse/en',200,(body)=>{canonical('/browse/en')(body);assert.ok(/href="\/word\/\d+/.test(body));});
await inspect('/browse/ar',200,canonical('/browse/ar'));
await inspect('/word/not-an-id',404,(_body,response)=>assert.ok(response.headers.get('x-robots-tag')?.includes('noindex')));
await inspect('/word/999999999999',404,(_body,response)=>assert.ok(response.headers.get('x-robots-tag')?.includes('noindex')));
await inspect('/api/auth/health',200,body=>assert.equal(JSON.parse(body).status,'OK'));
console.log(JSON.stringify({verifiedAt:new Date().toISOString(),base,passed:true,checks:checks.length,sitemapCount:sitemaps.length,sampleWord:word.pathname,productionWrites:false}));
