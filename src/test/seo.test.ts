import {describe,it,expect} from 'vitest';
import {canonicalPath,isPrivateOrUtilityPath} from '../components/SeoMetadata';
import {renderSeoHtml} from '../../cloudflare/generate-seo.mjs';
import {wordPage,sitemapIndex,sitemapStatic,sitemapWords,jsonLd,browsePage} from '../../cloudflare/seo-content.mjs';

const row={isArabic:0,canonicalWordId:2,arabicWord:'معلش',francoArabicWord:'ma3lish',definition:'Never mind',countryCode:'EG'};

describe('public SEO output',()=>{
  it('canonicalizes English aliases and excludes private utility pages',()=>{
    expect(canonicalPath('/word/2/en/')).toBe('/word/2');
    expect(canonicalPath('/word/2/ar')).toBe('/word/2/ar');
    for(const path of ['/profile','/login','/reset-password/token','/search/query','/chatbot']) expect(isPrivateOrUtilityPath(path)).toBe(true);
  });
  it('puts safe, semantic bilingual word content in the initial HTML',()=>{
    const page=wordPage({rows:[{...row,definition:'Never mind </script><script>evil()</script>'},{...row,isArabic:1,definition:'لا بأس'}],related:{country:{countryCode:'EG',countryName:'Egypt'},words:[{id:3,canonicalArabic:'يلا',francoArabicWord:'yalla'}]}},'en',2)!;
    expect(page.title).toContain('meaning in English');
    expect(page.description).toContain('What does ma3lish mean?');
    expect(page.html).toContain('<main');expect(page.html).toContain('<h1>');
    expect(page.html).toContain('lang="ar"');expect(page.html).toContain('href="/word/3"');
    expect(page.html).toContain('href="/browse/en"');
    expect(page.html).not.toContain('<script>evil()');
    expect(page.alternates).toHaveLength(2);
    expect(page.schema['@type']).toBe('DefinedTerm');
    expect(jsonLd(page.schema)).not.toContain('<script>');
    const ar=wordPage({rows:[{...row,isArabic:1,definition:'لا بأس'}]},'ar',2)!;
    expect(ar.title).toContain('معنى معلش');expect(ar.description).toContain('ما معنى معلش؟');
    expect(ar.alternates).toHaveLength(0);
    const missing=wordPage({rows:[row]},'ar',2)!;
    expect(missing.robots).toBe('noindex, follow');expect(missing.canonicalPath).toBe('/word/2');
  });
  it('escapes static initial content and avoids noscript dependence',()=>{
    const template='<html lang="en"><head><title>Old</title></head><body><noscript>Old</noscript><div id="initial-loader"><div></div></div><div id="root"></div></body></html>';
    const html=renderSeoHtml(template,{path:'/',title:'Qamous',description:'<script>evil()</script>',links:[{href:'/browse/en',label:'Browse'}]});
    expect(html).toContain('<main class="seo-initial"');expect(html).toContain('href="/browse/en"');
    expect(html).not.toContain('<noscript>');expect(html).not.toContain('<script>evil()');
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
  });
  it('partitions 500,000 words into bounded XML sitemaps',()=>{
    const index=sitemapIndex({buckets:Array.from({length:500},(_,i)=>i)});
    expect(index.match(/<sitemap>/g)).toHaveLength(501);
    let urls=0;
    for(let bucket=0;bucket<500;bucket++) {
      const rows=Array.from({length:1000},(_,i)=>({id:bucket*1000+i+1,en:1,ar:1}));
      const xml=sitemapWords(rows);
      const count=xml.match(/<url>/g)?.length||0;
      expect(count).toBe(2000);expect(xml.length).toBeLessThan(50_000_000);
      urls+=count;
    }
    expect(urls).toBe(1_000_000);
    expect(sitemapStatic({countries:[{countryName:'A&B'}]})).toContain('A%26B');
  });
  it('exposes next pages and word links through ordinary anchors',()=>{
    const page=browsePage({language:'en',words:[{canonicalId:2,canonicalArabic:'معلش',francoArabicWord:'ma3lish',sortWord:'ma3lish'}],next:2},{countries:[{countryName:'Egypt'}]},null);
    expect(page.html).toContain('href="/word/2"');
    expect(page.html).toContain('href="/browse/en?after=2"');
    expect(page.html).toContain('href="/advanced-search/Egypt"');
  });
});
