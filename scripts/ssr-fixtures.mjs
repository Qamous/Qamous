export const countries=[{countryCode:'EG',countryName:'Egypt'},{countryCode:'JO',countryName:'Jordan'}];
const sourceCredits=[{sourceId:'fixture',sourceName:'Fixture dictionary',sourceUrl:'https://example.com/dictionary',credit:'Fixture authors',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',sourceEntryId:'entry-1',rightsStatus:'verified',notice:'',importer:{username:'fixture'},attributionRequired:true,changes:[]}];
export const rows=[
  {id:101,wordId:2,definitionId:101,isArabic:0,word:{id:2,arabicWord:'معلش',francoArabicWord:'ma3lish'},arabicWord:'معلش',francoArabicWord:'ma3lish',canonicalWordId:2,definition:'Never mind',example:'ma3lish',arabicExample:'معلش',countryCode:'EG',isLiked:0,isDisliked:0,isReported:0,sourceCredits},
  {id:102,wordId:2,definitionId:102,isArabic:1,word:{id:2,arabicWord:'معلش',francoArabicWord:'ma3lish'},arabicWord:'معلش',francoArabicWord:'ma3lish',canonicalWordId:2,definition:'ولا يهمك',example:'ma3lish',arabicExample:'معلش',countryCode:'EG',isLiked:0,isDisliked:0,isReported:0,sourceCredits},
];
export function fixtureData(path) {
  const url=new URL(path,'https://fixture.test');
  if(url.pathname==='/countries') return countries;
  if(url.pathname.startsWith('/countries/')) return countries.find(c=>c.countryCode===url.pathname.split('/').at(-1))||{};
  if(url.pathname==='/definitions/feed') return {definitionIds:[url.searchParams.get('script')==='ar'?102:101]};
  if(url.pathname==='/word/explore') {
    const results=rows.filter(row=>Boolean(row.isArabic)===(url.searchParams.get('script')==='ar')).map(row=>({...row,word:row.isArabic?row.arabicWord:row.francoArabicWord}));
    return {results,total:results.length,page:1,limit:12};
  }
  if(url.pathname==='/definitions/word/2') return rows;
  if(url.pathname==='/seo/word/2') return {rows,related:{country:countries[0],words:[]}};
  if(url.pathname==='/seo/dialect/Egypt') return {country:countries[0],words:[{id:2,canonicalArabic:'معلش',francoArabicWord:'ma3lish'}]};
  if(url.pathname==='/seo/index') return {buckets:[0],countries};
  if(url.pathname==='/seo/sitemap/0') return [{id:2,en:1,ar:1}];
  if(/^\/seo\/browse\/(en|ar)$/.test(url.pathname)) return {language:url.pathname.endsWith('/ar')?'ar':'en',words:[{wordId:2,canonicalId:2,canonicalArabic:'معلش',francoArabicWord:'ma3lish',sortWord:'ma3lish'}],next:url.searchParams.has('after')?null:2};
  if(url.pathname==='/definitions/random-matching') return rows.map(row=>({...row,word:row.arabicWord}));
  if(url.pathname.startsWith('/word/search/')) return rows.map(row=>({...row,word:row.isArabic?row.arabicWord:row.francoArabicWord}));
  if(url.pathname==='/posts'||url.pathname==='/sources') return [];
  if(url.pathname.startsWith('/contributors/')) return {definitions:1,sources:[]};
  if(url.pathname==='/auth/session') return {session:null};
  const error=new Error('Fixture not found: '+path);error.status=404;throw error;
}
