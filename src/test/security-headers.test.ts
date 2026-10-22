import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
const read=(path:string)=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
describe('browser and crawler security policy',()=>{
  it('enforces CSP without unsafe inline scripts, eval or embedding',()=>{
    const headers=read('public/_headers');
    const scripts=headers.match(/script-src ([^;]+);/)?.[1];
    expect(scripts).toContain("'self'");
    expect(scripts).toContain('https://challenges.cloudflare.com');
    expect(scripts).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(headers).toMatch(/connect-src [^;]*https:\/\/challenges\.cloudflare\.com/);
    expect(headers).toMatch(/frame-src [^;]*https:\/\/challenges\.cloudflare\.com/);
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain('Referrer-Policy: no-referrer');
    expect(read('index.html')).not.toMatch(/<script\b(?![^>]*\bsrc=)[^>]*>/i);
  });
  it('blocks named training crawlers without blocking Google rendering assets',()=>{
    const robots=read('public/robots.txt');
    const [training,search]=robots.split('User-agent: *');
    expect(training).toContain('User-agent: GPTBot');
    expect(training).toContain('User-agent: Google-Extended');
    expect(training).not.toMatch(/User-agent: Googlebot\s/);
    expect(training).toContain('Disallow: /');
    expect(search).toContain('Allow: /api/definitions/word/');
    expect(search).not.toContain('Disallow: /js/');
    expect(search).not.toContain('Disallow: /assets/');
    expect(search).toContain('Sitemap: https://qamous.org/sitemap.xml');
    expect(search).toContain('Disallow: /advanced-search?');
    expect(search).toContain('Disallow: /advanced-search/*?');
    expect(search).not.toContain('Disallow: /word/');
    expect(search).not.toContain('Disallow: /browse/');
    expect(search).not.toMatch(/Disallow: \/advanced-search\s*(?:\n|$)/);
  });
});
