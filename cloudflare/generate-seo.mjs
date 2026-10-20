import {renderSourceCredits} from './source-credits.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {dialectIntro,dialectTitle} from '../src/seo/dialects.ts';

export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const origin='https://qamous.org';
const absolute=path=>origin+path;
export function wordMetadata(word,lang='en') {
  if(!Number.isSafeInteger(word.id)||word.id<1) throw new Error('Invalid public word ID');
  const path=`/word/${word.id}`+(lang==='ar'?'/ar':'');
  const title=`${word.arabicWord}${word.francoArabicWord?' / '+word.francoArabicWord:''} — ${lang==='ar'?'معنى في قاموس العامية':'Arabic slang meaning | Qamous'}`;
  const description=(lang==='ar'?word.descriptionAr:word.descriptionEn)||word.descriptionEn||word.descriptionAr||title;
  const alternatives=[];
  if(word.descriptionEn) alternatives.push({lang:'en',path:`/word/${word.id}`});
  if(word.descriptionAr) alternatives.push({lang:'ar',path:`/word/${word.id}/ar`});
  const sourceCredits=(lang==='ar'&&word.descriptionAr?word.sourceCreditsAr:word.descriptionEn?word.sourceCreditsEn:word.sourceCreditsAr)||[];
  return {path,title,description,alternatives,lang,sourceCredits};
}
export function renderSeoHtml(template,meta) {
  const e=escapeHtml;
  const sourceCreditHtml=renderSourceCredits(meta.sourceCredits);
  const tags=`<title data-react-helmet="true">${e(meta.title)}</title>
    <meta data-react-helmet="true" name="description" content="${e(meta.description)}">
    <meta data-react-helmet="true" property="og:title" content="${e(meta.title)}">
    <meta data-react-helmet="true" property="og:description" content="${e(meta.description)}">
    <meta data-react-helmet="true" property="og:url" content="${e(absolute(meta.path))}">
    <meta data-react-helmet="true" property="og:image" content="https://qamous.org/preview.png">
    <meta data-react-helmet="true" name="twitter:card" content="summary_large_image">
    <meta data-react-helmet="true" name="twitter:title" content="${e(meta.title)}">
    <meta data-react-helmet="true" name="twitter:description" content="${e(meta.description)}">
    <meta data-react-helmet="true" name="twitter:image" content="https://qamous.org/preview.png">
    ${meta.noCanonical?'':`<link data-react-helmet="true" rel="canonical" href="${e(absolute(meta.path))}">`}
    ${meta.robots?`<meta data-react-helmet="true" name="robots" content="${e(meta.robots)}">`:''}
    ${(meta.alternatives||[]).map(a=>`<link data-react-helmet="true" rel="alternate" hreflang="${a.lang}" href="${e(absolute(a.path))}">`).join('\n    ')}`;
  const headClean=template.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|robots|og:(?:title|description|url|image)|twitter:(?:card|title|description|image))["'])[^>]*>/gi,'').replace(/<link\b(?=[^>]*rel=["'](?:canonical|alternate)["'])[^>]*>/gi,'');
  const links=(meta.links||[]).map(link=>`<li><a href="${e(link.href)}">${e(link.label)}</a></li>`).join('');
  const preview=`<noscript><style>#initial-loader{display:none}</style><main lang="${meta.lang||'en'}" dir="${meta.lang==='ar'?'rtl':'ltr'}"><h1>${e(meta.title)}</h1><p>${e(meta.description)}</p>${links?`<nav aria-label="Explore Qamous"><ul>${links}</ul></nav>`:''}<p>Enable JavaScript for the full dictionary, search and contributions.</p><a href="/">Qamous</a> · <a href="/blog">Blog</a></main></noscript>`;
  return headClean.replace(/<html\b[^>]*lang="[^"]*"[^>]*>/i,`<html lang="${meta.lang||'en'}">`).replace('</head>',tags+'\n  </head>').replace(/<noscript>[\s\S]*?<\/noscript>/i,preview.replace('</p>','</p>'+sourceCreditHtml));
}
export function sitemap(paths) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+[...new Set(paths)].map(path=>`  <url><loc>${escapeHtml(absolute(path))}</loc></url>`).join('\n')+'\n</urlset>\n';
}
export async function generateSeo(root) {
  const data=JSON.parse(await readFile(join(root,'.seo-data.json'),'utf8'));
  const age=Date.now()-Date.parse(data.exportedAt);
  if(!Array.isArray(data.words)||!data.words.length||!Array.isArray(data.countries)||data.countries.some(c=>typeof c.countryCode!=='string'||typeof c.countryName!=='string')||!Number.isFinite(age)||age<0||age>60*60*1000) throw new Error('Fresh authorized SEO export is required');
  const template=await readFile(join(root,'build/index.html'),'utf8');
  const paths=['/','/about','/blog','/advanced-search'];
  async function page(meta) {
    const segments=meta.path.split('/').slice(1).filter(Boolean).map(decodeURIComponent);
    if(segments.some(segment=>segment==='.'||segment==='..'||/[\\/\x00-\x1f]/.test(segment))) throw new Error('Unsafe generated route');
    const directory=join(root,'build',...segments);
    await mkdir(directory,{recursive:true});await writeFile(join(directory,'index.html'),renderSeoHtml(template,meta));
  }
  const countryLinks=data.countries.map(country=>({href:'/advanced-search/'+encodeURIComponent(country.countryName),label:dialectTitle(country.countryCode,country.countryName)}));
  for(const country of data.countries) {
    const path='/advanced-search/'+encodeURIComponent(country.countryName);
    const words=data.words.filter(word=>word.countryCodes?.includes(country.countryCode));
    await page({path,title:dialectTitle(country.countryCode,country.countryName)+' | Qamous',description:dialectIntro(country.countryCode,country.countryName),lang:'en',links:[...words.map(word=>({href:`/word/${word.id}`+(!word.descriptionEn&&word.descriptionAr?'/ar':''),label:`${word.arabicWord}${word.francoArabicWord?' / '+word.francoArabicWord:''}`})),...countryLinks.filter(link=>link.href!==path)]});
    paths.push(path);
  }
  for(const word of data.words) {
    for(const lang of [...(word.descriptionEn?['en']:[]),...(word.descriptionAr?['ar']:[])]) {
      const meta=wordMetadata(word,lang);
      meta.links=[...data.countries.filter(country=>word.countryCodes?.includes(country.countryCode)).map(country=>({href:'/advanced-search/'+encodeURIComponent(country.countryName),label:dialectTitle(country.countryCode,country.countryName,lang==='ar')})),...data.words.filter(other=>other.id!==word.id&&other.countryCodes?.some(code=>word.countryCodes?.includes(code))).slice(0,4).map(other=>({href:`/word/${other.id}`+((lang==='ar'||!other.descriptionEn)&&other.descriptionAr?'/ar':''),label:`${other.arabicWord} / ${other.francoArabicWord||''}`}))];
      await page(meta);
      paths.push(meta.path);
    }
  }
  await page({path:'/',title:'Qamous — Arabic Slang Dictionary',description:'Learn Arabic dialects with community definitions, English translations and Franco-Arabic examples. Explore Egyptian, Levantine, Gulf and other everyday Arabic.',lang:'en',links:countryLinks});
  for(const [path,title,description] of [
    ['/about','About Qamous','Learn about Qamous, a community dictionary for Arabic dialects, English explanations and Franco-Arabic expressions.'],
    ['/blog','Blog - Qamous','Read Qamous community articles about Arabic dialects, Franco-Arabic writing and language learning.'],
    ['/advanced-search','Explore Arabic dialects | Qamous','Browse Arabic slang by dialect, discover community definitions and search Arabic and Franco-Arabic words.'],
  ]) await page({path,title,description,lang:'en',links:countryLinks});
  for(const path of ['/login','/signup','/profile','/add-definition','/forgot-password','/reset-password','/search','/chatbot','/feeling-lucky','/advertise','/opportunities']) {
    await page({path,title:'Qamous',description:'Arabic dialect dictionary and community.',lang:'en',robots:'noindex, follow'});
  }
  await writeFile(join(root,'build/404.html'),renderSeoHtml(template,{path:'/404',title:'Page not found | Qamous',description:'This page could not be found. Explore the Arabic dialect dictionary instead.',robots:'noindex, follow',noCanonical:true,links:countryLinks}));
  await writeFile(join(root,'build/sitemap.xml'),sitemap(paths));
  await writeFile(join(root,'build/seo-build-info.txt'),`Public SEO pages generated ${data.exportedAt}. No account data is included.\n`);
  console.log(JSON.stringify({seoGenerated:true,words:data.words.length,sitemapURLs:paths.length,publicAccountData:false}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) await generateSeo(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
