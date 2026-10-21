import {renderSourceCredits} from './source-credits.mjs';
import {dialectIntro,dialectTitle} from '../src/seo/dialects.ts';

const origin='https://qamous.org';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const xmlHeader='<?xml version="1.0" encoding="UTF-8"?>\n';
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
const concise=(value,max=155)=>[...clean(value)].slice(0,max).join('');
const termUrl=(id,language='en')=>`/word/${id}${language==='ar'?'/ar':''}`;
const safeId=value=>Number.isSafeInteger(Number(value))&&Number(value)>0?Number(value):null;

export function sitemapIndex({buckets}) {
  const ids=[...new Set(buckets.filter(Number.isSafeInteger))].sort((a,b)=>a-b);
  const paths=['/sitemap-static.xml',...ids.map(id=>`/sitemap-words-${id}.xml`)];
  return xmlHeader+'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    +paths.map(path=>`  <sitemap><loc>${origin+path}</loc></sitemap>`).join('\n')+'\n</sitemapindex>\n';
}
export function sitemapStatic({countries}) {
  const paths=['/','/about','/blog','/advanced-search','/browse/en','/browse/ar',
    ...countries.map(country=>'/advanced-search/'+encodeURIComponent(country.countryName))];
  return sitemapUrls(paths);
}
export function sitemapWords(rows) {
  const paths=[];
  for(const row of rows) {
    const id=safeId(row.id);
    if(!id) continue;
    if(row.en) paths.push(termUrl(id));
    if(row.ar) paths.push(termUrl(id,'ar'));
  }
  return sitemapUrls(paths);
}
function sitemapUrls(paths) {
  return xmlHeader+'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    +[...new Set(paths)].map(path=>`  <url><loc>${escapeHtml(origin+path)}</loc></url>`).join('\n')+'\n</urlset>\n';
}
function wordsList(words,language='en') {
  return '<ol>'+words.map(word=>{
    const id=safeId(word.canonicalId??word.id);
    if(!id) return '';
    const arabic=clean(word.canonicalArabic);
    const franco=clean(word.francoArabicWord);
    const label=language==='ar'?`<span lang="ar">${escapeHtml(arabic)}</span>`
      :(franco?`<span lang="ar-Latn">${escapeHtml(franco)}</span> — `:'')+`<span lang="ar">${escapeHtml(arabic)}</span>`;
    return `<li><a href="${termUrl(id,language)}">${label}</a></li>`;
  }).join('')+'</ol>';
}
function countryLinks(countries) {
  return '<ul>'+countries.map(country=>`<li><a href="/advanced-search/${encodeURIComponent(country.countryName)}">${escapeHtml(country.countryName)}</a></li>`).join('')+'</ul>';
}

export function wordPage(data,requestedLanguage,id) {
  const rows=Array.isArray(data?.rows)?data.rows:[];
  const english=rows.find(row=>!row.isArabic&&clean(row.definition));
  const arabic=rows.find(row=>!!row.isArabic&&clean(row.definition));
  const preferred=requestedLanguage==='ar'?arabic:english;
  const row=preferred||english||arabic;
  if(!row) return null;
  const canonicalId=safeId(row.canonicalWordId)||safeId(id);
  if(!canonicalId) return null;
  const actualLanguage=row.isArabic?'ar':'en';
  const canonicalPath=termUrl(canonicalId,preferred?requestedLanguage:actualLanguage);
  const arabicWord=clean(row.arabicWord||row.word?.arabicWord);
  const franco=clean(row.francoArabicWord||row.word?.francoArabicWord);
  const definition=clean(row.definition);
  if(!arabicWord||!definition) return null;
  const term=franco||arabicWord;
  const language=preferred?requestedLanguage:actualLanguage;
  const title=language==='ar'
    ?`معنى ${arabicWord}${franco?` (${franco})`:''} | قاموس Qamous`
    :`${term}${franco?` (${arabicWord})`:''} meaning in English | Qamous`;
  const description=language==='ar'
    ?`ما معنى ${arabicWord}؟ ${concise(definition)}`
    :`What does ${term} mean? ${concise(definition)}`;
  const question=language==='ar'?`ما معنى ${arabicWord}؟`:`What does ${term} mean?`;
  const meaningHeading=language==='ar'?'المعنى بالعربية':'Meaning in English';
  const example=language==='ar'?clean(row.arabicExample):clean(row.example);
  const sourceCredits=renderSourceCredits(Array.isArray(row.sourceCredits)?row.sourceCredits:[]);
  const country=data.related?.country;
  const related=Array.isArray(data.related?.words)?data.related.words:[];
  const alternates=english&&arabic?[{lang:'en',path:termUrl(canonicalId)},{lang:'ar',path:termUrl(canonicalId,'ar')}]:[];
  const schema={'@context':'https://schema.org','@type':'DefinedTerm',name:arabicWord,
    ...(franco?{alternateName:franco}:{}),description:definition,url:origin+canonicalPath,
    inDefinedTermSet:{'@type':'DefinedTermSet',name:'Qamous Arabic dialect dictionary',url:origin+'/'}};
  const html=`<main class="seo-initial" lang="${language}" dir="${language==='ar'?'rtl':'ltr'}">
    <h1><span lang="ar">${escapeHtml(arabicWord)}</span>${franco?` <span lang="ar-Latn">${escapeHtml(franco)}</span>`:''}</h1>
    <article><h2>${escapeHtml(question)}</h2><h3>${escapeHtml(meaningHeading)}</h3>
      <p lang="${actualLanguage}" dir="${actualLanguage==='ar'?'rtl':'ltr'}">${escapeHtml(definition)}</p>
      ${example?`<h3>${language==='ar'?'مثال':'Example'}</h3><p lang="${language==='ar'?'ar':'ar-Latn'}">${escapeHtml(example)}</p>`:''}
      ${sourceCredits}</article>
    <nav aria-label="${language==='ar'?'روابط ذات صلة':'Related words and dialects'}"><h2>${language==='ar'?'استكشف المزيد':'Keep exploring'}</h2>
      ${country?`<p><a href="/advanced-search/${encodeURIComponent(country.countryName)}">${escapeHtml(country.countryName)} dialect words</a></p>`:''}
      ${wordsList(related,language)}<p><a href="/browse/${language}">${language==='ar'?'تصفح الكلمات العربية':'Browse Arabic words'}</a></p>
      ${english&&arabic?`<p><a href="${termUrl(canonicalId,language==='ar'?'en':'ar')}">${language==='ar'?'Read the English meaning':'اقرأ المعنى بالعربية'}</a></p>`:''}
    </nav></main>`;
  return {title,description,lang:language,canonicalPath,alternates,robots:preferred?'index, follow':'noindex, follow',html,schema};
}

export function browsePage(data,index,after) {
  const language=data.language;
  const words=Array.isArray(data.words)?data.words:[];
  const path='/browse/'+language+(after?'?after='+encodeURIComponent(after):'');
  const heading=language==='ar'?'تصفح كلمات ومعاني العربية':'Browse Arabic words and meanings';
  const first=clean(words[0]?.sortWord),last=clean(words.at(-1)?.sortWord);
  const title=(first&&last?`${first}–${last} | `:'')+heading+' | Qamous';
  const description=language==='ar'?'تصفح الكلمات العربية ومعانيها حسب الترتيب الأبجدي في قاموس Qamous.':'Browse Arabic and Franco-Arabic words alphabetically with community meanings on Qamous.';
  const next=data.next?`/browse/${language}?after=${data.next}`:null;
  const html=`<main class="seo-initial" lang="${language}" dir="${language==='ar'?'rtl':'ltr'}"><h1>${heading}</h1><p>${description}</p>
    <nav aria-label="Dictionary words">${wordsList(words,language)}${next?`<p><a rel="next" href="${next}">${language==='ar'?'الصفحة التالية':'Next page'}</a></p>`:''}</nav>
    <nav aria-label="Arabic dialects"><h2>${language==='ar'?'اللهجات العربية':'Arabic dialects'}</h2>${countryLinks(index.countries)}</nav>
    <p><a href="/browse/${language==='ar'?'en':'ar'}">${language==='ar'?'Browse English meanings':'تصفح المعاني بالعربية'}</a></p></main>`;
  return {title,description,lang:language,canonicalPath:path,html,next,robots:words.length?'index, follow':'noindex, follow'};
}

export function dialectPage(data) {
  const {country,words}=data;
  const path='/advanced-search/'+encodeURIComponent(country.countryName);
  const title=dialectTitle(country.countryCode,country.countryName)+' | Qamous';
  const description=dialectIntro(country.countryCode,country.countryName);
  const html=`<main class="seo-initial" lang="en"><h1>${escapeHtml(dialectTitle(country.countryCode,country.countryName))}</h1><p>${escapeHtml(description)}</p>
    <nav aria-label="Words in ${escapeHtml(country.countryName)}">${wordsList(words)}</nav>
    <nav aria-label="Browse the dictionary"><p><a href="/browse/en">Browse all English meanings</a> · <a href="/browse/ar" lang="ar">تصفح المعاني بالعربية</a></p></nav></main>`;
  return {title,description,lang:'en',canonicalPath:path,html,robots:words.length?'index, follow':'noindex, follow'};
}

export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
}
