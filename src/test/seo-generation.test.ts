import {describe,it,expect} from 'vitest';
import {mkdtemp,mkdir,writeFile,readFile,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateSeo} from '../../cloudflare/generate-seo.mjs';
import {blogGuides} from '../content/blog-guides';

describe('bounded static SEO generation',()=>{
  it('generates guides, discovery links and private shells without word files or a stale sitemap',async()=>{
    const root=await mkdtemp(join(tmpdir(),'qamous-seo-'));
    try {
      await mkdir(join(root,'build'));
      await writeFile(join(root,'build/index.html'),'<html lang="en"><head><title>Old</title></head><body><noscript>Old</noscript><div id="initial-loader"><div></div></div><div id="root"></div></body></html>');
      await generateSeo(root);
      const read=(path:string)=>readFile(join(root,'build',path),'utf8');
      const home=await read('index.html');
      expect(home).toContain('href="/browse/en"');expect(home).toContain('href="/browse/ar"');
      const blog=await read('blog/index.html');
      for(const article of blogGuides) expect(blog).toContain(article.en.title);
      expect((await read('login/index.html'))).toContain('noindex, follow');
      const missing=await read('404.html');
      expect(missing).toContain('Page not found');expect(missing).not.toContain('rel="canonical"');
      const names=await readdir(join(root,'build'));
      expect(names).not.toContain('word');expect(names).not.toContain('sitemap.xml');
    } finally {await rm(root,{recursive:true,force:true});}
  });
});
