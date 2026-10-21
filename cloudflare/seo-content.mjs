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
  const alternates=english&&arabic?[{lang:'en',path:termUrl(canonicalId)},{lang:'ar',path:termUrl(canonicalId,'ar')}]:[];
  const schema={'@context':'https://schema.org','@type':'DefinedTerm',name:arabicWord,
    ...(franco?{alternateName:franco}:{}),description:definition,url:origin+canonicalPath,
    inDefinedTermSet:{'@type':'DefinedTermSet',name:'Qamous Arabic dialect dictionary',url:origin+'/'}};
  return {title,description,lang:language,canonicalPath,alternates,robots:preferred?'index, follow':'noindex, follow',schema};
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
  return {title,description,lang:language,canonicalPath:path,next,robots:words.length?'index, follow':'noindex, follow'};
}

export function dialectPage(data) {
  const {country,words}=data;
  const path='/advanced-search/'+encodeURIComponent(country.countryName);
  const title=dialectTitle(country.countryCode,country.countryName)+' | Qamous';
  const description=dialectIntro(country.countryCode,country.countryName);
  return {title,description,lang:'en',canonicalPath:path,robots:words.length?'index, follow':'noindex, follow'};
}

export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
}
