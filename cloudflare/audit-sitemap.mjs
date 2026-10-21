// Read-only: inspect every XML shard, then a small deterministic page sample.
import assert from 'node:assert/strict';
import {setTimeout as pause} from 'node:timers/promises';

const origin=process.argv[2]||'https://qamous.org';
const locations=xml=>[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1].replace(/&amp;/g,'&')));
async function get(path) {
  const response=await fetch(new URL(path,origin),{redirect:'manual',signal:AbortSignal.timeout(20000)});
  assert.equal(response.status,200,path);
  return {response,body:await response.text()};
}
const root=await get('/sitemap.xml');
assert.match(root.response.headers.get('content-type')||'',/xml/);
assert.ok(root.body.includes('<sitemapindex'));
const sitemaps=locations(root.body);
assert.ok(sitemaps.length>1);
assert.equal(new Set(sitemaps.map(url=>url.href)).size,sitemaps.length);
const allUrls=new Set();
const sample=[];
for(const sitemap of sitemaps) {
  assert.equal(sitemap.origin,'https://qamous.org');
  const {response,body}=await get(sitemap.pathname);
  assert.match(response.headers.get('content-type')||'',/xml/);
  assert.ok(body.includes('<urlset'));
  const urls=locations(body);
  assert.ok(urls.length<=50000);
  assert.ok(new TextEncoder().encode(body).length<=50_000_000);
  for(const url of urls) {
    assert.equal(url.origin,'https://qamous.org');
    assert.ok(!url.username&&!url.password&&!url.search&&!url.hash);
    assert.ok(!allUrls.has(url.href),`duplicate ${url.href}`);
    allUrls.add(url.href);
  }
  if(urls[0]) sample.push(urls[0]);
  if(urls.at(-1)&&urls.at(-1)!==urls[0]) sample.push(urls.at(-1));
  await pause(150);
}
assert.ok(allUrls.size>0);
const boundedSample=[...new Map(sample.map(url=>[url.href,url])).values()].slice(0,20);
for(const url of boundedSample) {
  const response=await fetch(new URL(url.pathname,origin),{redirect:'manual',signal:AbortSignal.timeout(20000)});
  const html=await response.text();
  assert.equal(response.status,200,url.href);
  assert.match(response.headers.get('content-type')||'',/text\/html/);
  assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag')||''),url.href);
  assert.ok(html.includes(`rel="canonical" href="${url.href}"`),url.href);
  assert.match(html,/<title[^>]*>[^<]+<\/title>/);
  assert.match(html,/<meta[^>]+name="description"[^>]+content="[^"]+"/);
  await pause(150);
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),sitemapCount:sitemaps.length,urlCount:allUrls.size,sampledPages:boundedSample.length,passed:true,productionWrites:false}));
