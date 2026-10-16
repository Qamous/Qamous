import {describe,it,expect} from 'vitest';
import {canonicalPath,isPrivateOrUtilityPath} from '../components/SeoMetadata';
import {renderSeoHtml,sitemap,wordMetadata} from '../../cloudflare/generate-seo.mjs';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
describe('public SEO and escaping',()=>{
  it('canonicalizes English duplicates and excludes private utility pages',()=>{
    expect(canonicalPath('/word/2/en/')).toBe('/word/2');
    expect(canonicalPath('/word/2/ar')).toBe('/word/2/ar');
    for(const path of ['/profile','/login','/reset-password/token','/search/query','/chatbot']) expect(isPrivateOrUtilityPath(path)).toBe(true);
    expect(isPrivateOrUtilityPath('/word/2')).toBe(false);
  });
  it('escapes community text in static metadata without executing HTML',()=>{
    const word={id:2,arabicWord:'معلش',francoArabicWord:'ma3lish',descriptionEn:'\"></title><script>alert(1)</script>',descriptionAr:''};
    const html=renderSeoHtml('<html lang="en"><head><title>Old</title><meta name="description" content="old"></head><body><noscript>old</noscript><div id="root"></div></body></html>',wordMetadata(word));
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).toContain('https://qamous.org/word/2');
    expect(html).toContain('id="root"');
    expect(wordMetadata({...word,descriptionAr:'معنى'},'ar').path).toBe('/word/2/ar');
    expect(()=>wordMetadata({...word,id:-1})).toThrow();
  });
  it('emits an HTTPS sitemap with no duplicate or unescaped URLs',()=>{
    const xml=sitemap(['/','/word/2','/word/2','/advanced-search/A&B']);
    expect(xml.match(/<url>/g)).toHaveLength(3);
    expect(xml).toContain('A&amp;B');
    expect(xml).not.toContain('http://qamous.org');
  });
  it('does not depend on third-party country lookups for word metadata',()=>{
    const page=readFileSync(resolve(process.cwd(),'pages/WordPage.tsx'),'utf8');
    expect(page).not.toContain('getDemonyms');
    expect(page).not.toContain('name="keywords"');
    expect(page).toContain('name="description"');
  });
});
