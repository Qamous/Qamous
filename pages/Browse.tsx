import React from 'react';
import {Link, useParams, useSearchParams} from 'react-router-dom';
import {useQuery} from 'react-query';
import Helmet from '../src/components/PageMetadata';
import {API_URL, apiJson} from '../src/api';
import LoadingSpinner from '../src/components/LoadingSpinner';
import './Browse.scss';

interface Word {wordId:number; canonicalId:number; canonicalArabic:string; francoArabicWord?:string; sortWord:string}
export interface BrowseData {language:string; words:Word[]; next:number|null}
export default function Browse() {
  const {language='en'} = useParams(), [params] = useSearchParams();
  const after = params.get('after'), ar = language === 'ar';
  const {data, isLoading, isError} = useQuery<BrowseData>(['browse', language, after], async ({signal}) =>
    apiJson<BrowseData>(await fetch(`${API_URL}/seo/browse/${language}${after?'?after='+encodeURIComponent(after):''}`, {signal})));
  const heading = ar ? 'تصفح كلمات ومعاني العربية' : 'Browse Arabic words and meanings';
  const first=data?.words[0]?.sortWord, last=data?.words.at(-1)?.sortWord;
  const canonical=`https://qamous.org/browse/${language}${after?'?after='+encodeURIComponent(after):''}`;
  return <main className="browse" dir={ar?'rtl':'ltr'}>
    <Helmet>
      <title>{`${first&&last?`${first}–${last} | `:''}${heading} | Qamous`}</title>
      <meta name="description" content={ar?'تصفح الكلمات العربية ومعانيها حسب الترتيب الأبجدي في قاموس Qamous.':'Browse Arabic and Franco-Arabic words alphabetically with community meanings on Qamous.'}/>
      <link rel="canonical" href={canonical}/><meta property="og:url" content={canonical}/>
      <meta name="robots" content={data?.words.length?'index, follow':'noindex, follow'}/>
      {data?.next&&<link rel="next" href={`https://qamous.org/browse/${language}?after=${data.next}`}/>}
    </Helmet>
    <h1>{heading}</h1>
    <p>{ar?'اكتشف كلمة جديدة، واقرأ معناها وأمثلتها.':'Find a new word, then explore its meanings and examples.'}</p>
    <Link to={`/browse/${ar?'en':'ar'}`}>{ar?'Browse English meanings':'تصفح المعاني بالعربية'}</Link>
    {isLoading&&<LoadingSpinner/>}
    {isError&&<p role="alert">{ar?'تعذر تحميل الكلمات. حاول مرة أخرى.':'Unable to load words. Please try again.'}</p>}
    <nav aria-label={heading}><ol className="browse-words">{data?.words.map(word=><li key={word.wordId}>
      <Link to={`/word/${word.canonicalId||word.wordId}${ar?'/ar':''}`}>
        {!ar&&word.francoArabicWord&&<span lang="ar-Latn">{word.francoArabicWord}</span>}
        <span lang="ar" dir="rtl">{word.canonicalArabic}</span>
      </Link>
    </li>)}</ol></nav>
    {data?.next&&<Link className="browse-next" rel="next" to={`/browse/${language}?after=${data.next}`}>{ar?'الصفحة التالية':'Next page'} <span aria-hidden="true">{ar?'←':'→'}</span></Link>}
  </main>;
}
