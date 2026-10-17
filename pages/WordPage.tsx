import { API_URL } from "../src/api";
import { Helmet } from 'react-helmet';
import ContentBox, { HomeContentProps } from '../src/components/ContentBox';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import AdSenseWrapper from '../src/components/AdSenseWrapper';
import LoadingSpinner from '../src/components/LoadingSpinner';

const fetchHomeContent = async (wordId: number): Promise<HomeContentProps[]> => {
  const res = await fetch(`${API_URL}/definitions/word/${wordId}`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.map((item: any) => ({
    item: {
      word: item.isArabic ? item.word.arabicWord : item.word.francoArabicWord,
      otherLangWord: item.isArabic ? item.word.francoArabicWord : item.word.arabicWord,
      definition: item.definition
    },
    index: item.id,
    lang: item.isArabic ? 'ar' : 'en',
    wordId: item.wordId,
    definitionId: item.id,
    isLiked: !!item.isLiked,
    isDisliked: !!item.isDisliked,
    isReported: !!item.isReported,
    countryCode: item.countryCode,
    example: item.example
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
  const filteredHomeContent = homeContent?.filter(content => content.lang === (lang || i18n.language));
  const displayWord=filteredHomeContent?.[0]||homeContent?.[0];
  const pageTitle=`${displayWord?.item.word||'Word'}${displayWord?.item.otherLangWord?' / '+displayWord.item.otherLangWord:''} — ${i18n.language==='ar'?'معنى في قاموس العامية':'Arabic slang meaning | Qamous'}`;
  const pageDescription=(displayWord?.item.definition||'Explore community Arabic dialect definitions on Qamous.').replace(/\s+/g,' ').slice(0,170);
  
  return (
    <div className='feed'>
      <Helmet>
        <meta property="og:title" content={pageTitle}/>
        <meta property="og:description" content={pageDescription}/>
        <meta name="twitter:title" content={pageTitle}/>
        <meta name="twitter:description" content={pageDescription}/>
        {homeContent?.some(c=>c.lang==='en')&&<link rel="alternate" hrefLang="en" href={`https://qamous.org/word/${wordIdNumber}`}/>}
        {homeContent?.some(c=>c.lang==='ar')&&<link rel="alternate" hrefLang="ar" href={`https://qamous.org/word/${wordIdNumber}/ar`}/>}
        {!filteredHomeContent?.length&&<meta name="robots" content="noindex, follow"/>}
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
              lang={lang || i18n.language}
              definitionId={content.definitionId}
              wordId={content.wordId}
              countryCode={content.countryCode}
              isLiked={content.isLiked}
              isDisliked={content.isDisliked}
              isReported={content.isReported}
              example={content.example}
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
