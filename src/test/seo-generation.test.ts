import {describe,it,expect} from 'vitest';
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateSeo} from '../../cloudflare/generate-seo.mjs';

describe('generated route metadata and discovery links',()=>{
  it('generates self-canonical guides/blog, related links, private shells and a noindex 404',async()=>{
    const root=await mkdtemp(join(tmpdir(),'qamous-seo-'));
    try {
      await mkdir(join(root,'build'));
      await writeFile(join(root,'build/index.html'),'<html lang="en"><head><title>Old</title></head><body><noscript>Old</noscript><div id="root"></div></body></html>');
      await writeFile(join(root,'.seo-data.json'),JSON.stringify({exportedAt:new Date().toISOString(),countries:[{countryCode:'EG',countryName:'Egypt'},{countryCode:'AE',countryName:'United Arab Emirates'}],words:[
        {id:2,arabicWord:'معلش',francoArabicWord:'ma3lish',descriptionEn:'Never mind',descriptionAr:'لا بأس',countryCodes:['EG']},
        {id:3,arabicWord:'يلا',francoArabicWord:'yalla',descriptionEn:'Let us go',descriptionAr:'هيا',countryCodes:['EG','AE']},
        {id:4,arabicWord:'اختبار',francoArabicWord:null,descriptionEn:'',descriptionAr:'معنى عربي',countryCodes:['EG']},
      ]}));
      await generateSeo(root);
      const read=(path:string)=>readFile(join(root,'build',path),'utf8');
      const blog=await read('blog/index.html');
      expect(blog).toContain('rel="canonical" href="https://qamous.org/blog"');
      const guide=await read('advanced-search/Egypt/index.html');
      expect(guide).toContain('Egyptian Arabic slang dictionary');
      expect(guide).toContain('href="https://qamous.org/advanced-search/Egypt"');
      expect(guide).toContain('href="/word/2"');
      expect(guide).toContain('href="/word/4/ar"');
      expect(guide).toContain('href="/advanced-search/United%20Arab%20Emirates"');
      expect(await read('advanced-search/United Arab Emirates/index.html')).toContain('Emirati Arabic');
      expect(await read('word/2/index.html')).toContain('href="/word/3"');
      expect(await read('word/2/ar/index.html')).toContain('href="/word/3/ar"');
      expect(await read('login/index.html')).toContain('content="noindex, follow"');
      const missing=await read('404.html');
      expect(missing).toContain('Page not found');expect(missing).toContain('noindex');expect(missing).not.toContain('rel="canonical"');
      expect(await read('sitemap.xml')).not.toContain('/login');
      expect(await read('word/4/ar/index.html')).not.toContain('hreflang="en"');
      expect(await read('sitemap.xml')).not.toContain('<loc>https://qamous.org/word/4</loc>');
    } finally {await rm(root,{recursive:true,force:true});}
  });
});
