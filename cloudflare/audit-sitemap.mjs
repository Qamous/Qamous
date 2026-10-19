// Read-only release audit: validate every published sitemap URL, not just samples.
import assert from 'node:assert/strict';
import {setTimeout as pause} from 'node:timers/promises';
const origin = 'https://qamous.org';
const sitemap = await fetch(`${origin}/sitemap.xml`, {signal:AbortSignal.timeout(15000)});
assert.equal(sitemap.status, 200);
assert.match(sitemap.headers.get('content-type') || '', /xml/);
const xml = await sitemap.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1].replace(/&amp;/g, '&')));
assert.ok(urls.length > 0);
assert.equal(new Set(urls.map(u => u.href)).size, urls.length, 'duplicate sitemap URLs');
const results = [];
let next = 0;
await Promise.all(Array.from({length:1}, async () => {
  while (next < urls.length) {
    const url = urls[next++];
    assert.equal(url.origin, origin);
    assert.ok(!url.username && !url.password && !url.search && !url.hash);
    const response = await fetch(url, {redirect:'manual', signal:AbortSignal.timeout(15000)});
    const html = await response.text();
    assert.equal(response.status, 200, url.href);
    assert.match(response.headers.get('content-type') || '', /text\/html/, url.href);
    assert.ok(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), url.href);
    assert.ok(!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html), url.href);
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);
    assert.equal(canonical?.[1], url.href, `${url.href} canonical`);
    assert.match(html, /<title[^>]*>[^<]+<\/title>/, url.href);
    assert.match(html, /<meta[^>]+name="description"[^>]+content="[^"]+"/, url.href);
    results.push({url:url.href,status:200,canonicalMatches:true,indexable:true});
    // Stay well below the site's anti-harvesting burst limit. Never bypass it.
    await pause(350);
  }
}));
console.log(JSON.stringify({checkedAt:new Date().toISOString(),sitemap:`${origin}/sitemap.xml`,passed:true,urlCount:urls.length,productionWrites:false,results}));
