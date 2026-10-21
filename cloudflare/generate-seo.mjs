import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {blogCopy,blogGuides} from '../src/content/blog-guides.ts';

export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const origin='https://qamous.org';
const browseLinks=[
  {href:'/browse/en',label:'Browse meanings in English'},
  {href:'/browse/ar',label:'تصفح المعاني بالعربية'},
  {href:'/advanced-search',label:'Explore Arabic dialects'},
];

// React replaces this root on startup. Initial HTML remains useful and
// crawlable if JavaScript is delayed or unavailable.
export function renderSeoHtml(template,meta) {
  const e=escapeHtml;
  const tags=`<title data-react-helmet="true">${e(meta.title)}</title>
    <meta data-react-helmet="true" name="description" content="${e(meta.description)}">
    <meta data-react-helmet="true" property="og:title" content="${e(meta.title)}">
    <meta data-react-helmet="true" property="og:description" content="${e(meta.description)}">
    <meta data-react-helmet="true" property="og:url" content="${e(origin+meta.path)}">
    <meta data-react-helmet="true" property="og:image" content="https://qamous.org/preview.png">
    <meta data-react-helmet="true" name="twitter:card" content="summary_large_image">
    <meta data-react-helmet="true" name="twitter:title" content="${e(meta.title)}">
    <meta data-react-helmet="true" name="twitter:description" content="${e(meta.description)}">
    ${meta.noCanonical?'':`<link data-react-helmet="true" rel="canonical" href="${e(origin+meta.path)}">`}
    ${meta.robots?`<meta data-react-helmet="true" name="robots" content="${e(meta.robots)}">`:''}`;
  const headClean=template.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|robots|og:(?:title|description|url|image)|twitter:(?:card|title|description|image))["'])[^>]*>/gi,'').replace(/<link\b(?=[^>]*rel=["'](?:canonical|alternate)["'])[^>]*>/gi,'');
  const links=(meta.links||browseLinks).map(link=>`<li><a href="${e(link.href)}">${e(link.label)}</a></li>`).join('');
  const articles=(meta.articles||[]).map(article=>`<article id="${e(article.id)}"><h2>${e(article.title)}</h2>${article.paragraphs.map(paragraph=>`<p>${e(paragraph)}</p>`).join('')}<ul>${article.links.map(link=>`<li><a href="${e(link.href)}">${e(link.label)}</a></li>`).join('')}</ul></article>`).join('');
  const preview=`<main class="seo-initial" lang="${meta.lang||'en'}" dir="${meta.lang==='ar'?'rtl':'ltr'}"><h1>${e(meta.heading||meta.title)}</h1><p>${e(meta.intro||meta.description)}</p>${articles}<nav aria-label="Explore Qamous"><ul>${links}</ul></nav></main>`;
  return headClean.replace(/<html\b[^>]*lang="[^"]*"[^>]*>/i,`<html lang="${meta.lang||'en'}">`)
    .replace('</head>',tags+'\n    <link rel="stylesheet" href="/seo-preview.css">\n  </head>')
    .replace(/<noscript>[\s\S]*?<\/noscript>/i,'')
    .replace(/<div id="initial-loader"[\s\S]*?<div id="root"><\/div>/i,`<div id="root">${preview}</div>`);
}

export async function generateSeo(root) {
  const template=await readFile(join(root,'build/index.html'),'utf8');
  async function page(meta) {
    const segments=meta.path.split('/').slice(1).filter(Boolean);
    const directory=join(root,'build',...segments);
    await mkdir(directory,{recursive:true});
    await writeFile(join(directory,'index.html'),renderSeoHtml(template,meta));
  }
  await page({path:'/',title:'Qamous — Arabic Slang Dictionary',description:'Learn Arabic dialects with community definitions, English translations and Franco-Arabic spellings.',lang:'en'});
  await page({path:'/about',title:'About Qamous | Arabic dialect dictionary',description:'Qamous is a community dictionary for Arabic dialects, English explanations and Franco-Arabic expressions.',lang:'en'});
  await page({path:'/advanced-search',title:'Explore Arabic dialects | Qamous',description:'Browse Arabic slang by dialect, discover community definitions and search Arabic and Franco-Arabic words.',lang:'en'});
  await page({path:'/blog',title:blogCopy.en.title+' | Qamous',heading:blogCopy.en.title,description:blogCopy.en.description,intro:blogCopy.en.intro,lang:'en',articles:blogGuides.map(guide=>({id:guide.id,...guide.en}))});
  for(const path of ['/login','/signup','/profile','/add-definition','/forgot-password','/reset-password','/search','/chatbot','/feeling-lucky','/advertise','/opportunities']) {
    await page({path,title:'Qamous',description:'Arabic dialect dictionary and community.',lang:'en',robots:'noindex, follow'});
  }
  await writeFile(join(root,'build/404.html'),renderSeoHtml(template,{path:'/404',title:'Page not found | Qamous',description:'This page could not be found. Explore the Arabic dialect dictionary instead.',robots:'noindex, follow',noCanonical:true}));
  console.log(JSON.stringify({seoGenerated:true,staticPages:16,wordFiles:0}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) await generateSeo(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
