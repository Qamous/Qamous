import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';

export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const origin='https://qamous.org';
const absolute=path=>origin+path;
export function wordMetadata(word,lang='en') {
  if(!Number.isSafeInteger(word.id)||word.id<1) throw new Error('Invalid public word ID');
  const path=`/word/${word.id}`+(lang==='ar'?'/ar':'');
  const title=`${word.arabicWord}${word.francoArabicWord?' / '+word.francoArabicWord:''} — ${lang==='ar'?'معنى في قاموس العامية':'Arabic slang meaning | Qamous'}`;
  const description=(lang==='ar'?word.descriptionAr:word.descriptionEn)||word.descriptionEn||word.descriptionAr||title;
  const alternatives=[{lang:'en',path:`/word/${word.id}`}];
  if(word.descriptionAr) alternatives.push({lang:'ar',path:`/word/${word.id}/ar`});
  return {path,title,description,alternatives,lang};
}
export function renderSeoHtml(template,meta) {
  const e=escapeHtml;
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
    <link data-react-helmet="true" rel="canonical" href="${e(absolute(meta.path))}">
    ${(meta.alternatives||[]).map(a=>`<link data-react-helmet="true" rel="alternate" hreflang="${a.lang}" href="${e(absolute(a.path))}">`).join('\n    ')}`;
  const headClean=template.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|og:(?:title|description|url|image)|twitter:(?:card|title|description|image))["'])[^>]*>/gi,'').replace(/<link\b(?=[^>]*rel=["'](?:canonical|alternate)["'])[^>]*>/gi,'');
  const preview=`<noscript><style>#initial-loader{display:none}</style><main lang="${meta.lang||'en'}" dir="${meta.lang==='ar'?'rtl':'ltr'}"><h1>${e(meta.title)}</h1><p>${e(meta.description)}</p><p>Enable JavaScript for the full dictionary, search and contributions.</p><a href="/">Qamous</a> · <a href="/blog">Blog</a></main></noscript>`;
  return headClean.replace('<html lang="en">',`<html lang="${meta.lang||'en'}">`).replace('</head>',tags+'\n  </head>').replace(/<noscript>[\s\S]*?<\/noscript>/i,preview);
}
export function sitemap(paths) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+[...new Set(paths)].map(path=>`  <url><loc>${escapeHtml(absolute(path))}</loc></url>`).join('\n')+'\n</urlset>\n';
}
export async function generateSeo(root) {
  const data=JSON.parse(await readFile(join(root,'.seo-data.json'),'utf8'));
  if(!Array.isArray(data.words)||!data.words.length||Date.now()-Date.parse(data.exportedAt)>60*60*1000) throw new Error('Fresh authorized SEO export is required');
  const template=await readFile(join(root,'build/index.html'),'utf8');
  const paths=['/','/about','/blog','/advanced-search'];
  for(const country of data.countries) paths.push('/advanced-search/'+encodeURIComponent(country));
  for(const word of data.words) {
    for(const lang of word.descriptionAr?['en','ar']:['en']) {
      const meta=wordMetadata(word,lang),directory=join(root,'build',meta.path.slice(1));
      await mkdir(directory,{recursive:true});await writeFile(join(directory,'index.html'),renderSeoHtml(template,meta));
      paths.push(meta.path);
    }
  }
  const home=renderSeoHtml(template,{path:'/',title:'Qamous — Arabic Slang Dictionary',description:'Learn Arabic dialects with community definitions, English translations and Franco-Arabic examples. Explore Egyptian, Levantine, Gulf and other everyday Arabic.',lang:'en'});
  await writeFile(join(root,'build/index.html'),home);
  await writeFile(join(root,'build/sitemap.xml'),sitemap(paths));
  await writeFile(join(root,'build/seo-build-info.txt'),`Public SEO pages generated ${data.exportedAt}. No account data is included.\n`);
  console.log(JSON.stringify({seoGenerated:true,words:data.words.length,sitemapURLs:paths.length,publicAccountData:false}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) await generateSeo(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
