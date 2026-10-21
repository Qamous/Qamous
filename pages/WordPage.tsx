import { API_URL } from "../src/api";
import { Helmet } from 'react-helmet';
import ContentBox, { HomeContentProps } from '../src/components/ContentBox';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import AdSenseWrapper from '../src/components/AdSenseWrapper';
import LoadingSpinner from '../src/components/LoadingSpinner';
import RelatedWords from '../src/components/RelatedWords';
import {preferredMeanings} from '../src/utils/wordMeanings';

const fetchHomeContent = async (wordId: number): Promise<HomeContentProps[]> => {
  const res = await fetch(`${API_URL}/definitions/word/${wordId}`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.map((item: any) => ({
    item: {
      word: item.isArabic ? item.word.arabicWord : item.word.francoArabicWord || item.word.arabicWord,
      otherLangWord: item.isArabic ? item.word.francoArabicWord : item.word.arabicWord,
      definition: item.definition
      ,arabicWord:item.word.arabicWord,francoArabicWord:item.word.francoArabicWord
    },
    index: item.id,
    lang: item.isArabic ? 'ar' : 'en',
    wordId: item.wordId,
    definitionId: item.id,
    isLiked: !!item.isLiked,
    isDisliked: !!item.isDisliked,
    isReported: !!item.isReported,
    countryCode: item.countryCode,
    example: item.example,
    arabicExample: item.arabicExample,
    sourceCredits: item.sourceCredits,
    sourceExamples: item.sourceExamples,
    sourcePronunciations: item.sourcePronunciations,
    meaningForms:item.meaningForms,canonicalWordId:item.canonicalWordId,dialect:item.dialect,
    arabicSpellings: item.arabicSpellings,
    francoSpellings: item.francoSpellings,
  }));
};

const WordPage = () => {
  const { i18n } = useTranslation();
  const { wordId, lang } = useParams<{ wordId: string, lang?: string }>();
  const wordIdNumber = Number(wordId) || 0;
  const { data: homeContent, isLoading, error } = useQuery(['homeContent', wordIdNumber], () => fetchHomeContent(wordIdNumber));
  
  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error fetching data</div>;
  
  // Filter the homeContent based on the current language
  const shownLanguage=i18n.language;
  const filteredHomeContent = homeContent?preferredMeanings(homeContent,shownLanguage):[];
  const definitionLanguages=[...new Set(homeContent?.map(content=>content.lang)||[])];
  const displayWord=filteredHomeContent?.[0]||homeContent?.[0];
  const hasPreferred=definitionLanguages.includes(shownLanguage);
  const actualLanguage=hasPreferred?shownLanguage:displayWord?.lang||shownLanguage;
  const arabicWord=displayWord?.item.arabicWord||displayWord?.item.word||'';
  const franco=displayWord?.item.francoArabicWord||'';
  const term=franco||arabicWord;
  const pageTitle=actualLanguage==='ar'
    ?`معنى ${arabicWord}${franco?` (${franco})`:''} | قاموس Qamous`
    :`${term}${franco?` (${arabicWord})`:''} meaning in English | Qamous`;
  const definition=(displayWord?.item.definition||'').replace(/\s+/g,' ').trim();
  const pageDescription=(actualLanguage==='ar'?`ما معنى ${arabicWord}؟ `:`What does ${term} mean? `)+[...definition].slice(0,155).join('');
  const canonicalId=displayWord?.canonicalWordId||wordIdNumber;
  const canonical=`https://qamous.org/word/${canonicalId}${actualLanguage==='ar'?'/ar':''}`;
  const termSchema=displayWord?{
    '@context':'https://schema.org','@type':'DefinedTerm',name:arabicWord,
    ...(franco?{alternateName:franco}:{}),description:definition,url:canonical,
    inDefinedTermSet:{'@type':'DefinedTermSet',name:'Qamous Arabic dialect dictionary',url:'https://qamous.org/'}
  }:null;
  const safeSchema=termSchema?JSON.stringify(termSchema).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026'):null;
  
  return (
    <div className='feed'>
      <Helmet>
        {displayWord&&<link rel="canonical" href={canonical}/>}
        {displayWord&&<meta property="og:url" content={canonical}/>}
        <meta property="og:title" content={pageTitle}/>
        <meta property="og:description" content={pageDescription}/>
        <meta name="twitter:title" content={pageTitle}/>
        <meta name="twitter:description" content={pageDescription}/>
        {definitionLanguages.includes('en')&&definitionLanguages.includes('ar')&&<link rel="alternate" hrefLang="en" href={`https://qamous.org/word/${canonicalId}`}/>}
        {definitionLanguages.includes('en')&&definitionLanguages.includes('ar')&&<link rel="alternate" hrefLang="ar" href={`https://qamous.org/word/${canonicalId}/ar`}/>}
        <meta name="robots" content={hasPreferred?'index, follow':'noindex, follow'}/>
        {safeSchema&&<script type="application/ld+json">{safeSchema}</script>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription}/>
      </Helmet>
      <div className="feed-ad-space">
        <AdSenseWrapper
          client="ca-pub-4293590491700199"
          slot='7898075502'
          adKey='word-page-top'
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--tertiary-color)',
            border: '0',
            padding: '10px',
            fontFamily: 'var(--font-stack)',
            color: 'var(--primary-color)',
          }}
          format='auto'
          responsive='true'
        />
      </div>
      <div className="feed-posts">
        {filteredHomeContent && filteredHomeContent.map((content, index) => (
          <React.Fragment key={content.definitionId}>
            <ContentBox
              key={index + 1}
              item={content.item}
              index={index + 1}
              lang={shownLanguage} definitionLanguage={content.lang} dialect={content.dialect} canonicalWordId={content.canonicalWordId}
              definitionLanguages={definitionLanguages} showMissingMeaningPrompt={index===0}
              headingLevel={index===0?1:2}
              definitionId={content.definitionId}
              wordId={content.wordId}
              countryCode={content.countryCode}
              isLiked={content.isLiked}
              isDisliked={content.isDisliked}
              isReported={content.isReported}
              example={content.example}
              arabicExample={content.arabicExample} sourceCredits={content.sourceCredits} sourceExamples={content.sourceExamples} sourcePronunciations={content.sourcePronunciations}
              arabicSpellings={content.arabicSpellings} francoSpellings={content.francoSpellings}
            />
            {((index + 1) % 4 === 0) && <div className="feed-posts-ad-space">
              <AdSenseWrapper
                client='ca-pub-4293590491700199'
                slot='6473874271'
                adKey={`word-page-middle-${index}`}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'var(--tertiary-color)',
                  border: '0',
                  padding: '10px',
                  fontFamily: 'var(--font-stack)',
                  color: 'var(--primary-color)',
                }}
                format='auto'
                responsive='true'
              />
            </div>}
          </React.Fragment>
        ))}
        <RelatedWords countryCode={displayWord?.countryCode} wordId={wordIdNumber} lang={shownLanguage}/>
      </div>
      <div className="feed-ad-space">
        <AdSenseWrapper
          client='ca-pub-4293590491700199'
          slot='1590891296'
          adKey='word-page-bottom'
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--tertiary-color)',
            border: '0',
            padding: '10px',
            fontFamily: 'var(--font-stack)',
            color: 'var(--primary-color)',
          }}
          format='auto'
          responsive='true'
        />
      </div>
    </div>
  );
};

export default WordPage;
