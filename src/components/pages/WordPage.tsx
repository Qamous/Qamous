import { Helmet } from 'react-helmet';
import ContentBox, { HomeContentProps } from '../ContentBox';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCountryName, getDemonyms } from '../../assets/utils';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import AdSense from 'react-adsense';

const fetchHomeContent = async (wordId: number): Promise<HomeContentProps[]> => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/definitions/word/${wordId}`);
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
    isLiked: item.likeCount > 0,
    isDisliked: item.dislikeCount > 0,
    isReported: item.reportCount > 0,
    countryCode: item.countryCode,
  }));
};

const WordPage = () => {
  const { i18n } = useTranslation();
  const { wordId, lang } = useParams<{ wordId: string, lang?: string }>();
  const wordIdNumber = Number(wordId) || 0;
  const { data: homeContent, isLoading, error } = useQuery(['homeContent', wordIdNumber], () => fetchHomeContent(wordIdNumber));
  const [countryName, setCountryName] = useState("");
  const [demonyms, setDemonyms] = useState("");
  
  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);
  
  useEffect(() => {
    const fetchCountryNameAndDemonyms = async () => {
      if (homeContent && homeContent[0]) {
        const name = await getCountryName(homeContent[0].countryCode || "");
        setCountryName(name || "");
        if (name) {
          const demonyms = await getDemonyms(name);
          setDemonyms(demonyms);
        }
      }
    };
    
    fetchCountryNameAndDemonyms();
  }, [homeContent]);
  
  if (isLoading) return (
    <div className="loading-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
  if (error) return <div>Error fetching data</div>;
  
  // Filter the homeContent based on the current language
  const filteredHomeContent = homeContent?.filter(content => content.lang === (lang || i18n.language));
  
  return (
    <div className='feed'>
      <Helmet>
        <title>
          {i18n.language === 'ar'
            ? `${homeContent?.[0]?.item.word} / ${homeContent?.[0]?.item.otherLangWord} معنى في قاموس العامية للهجات ${countryName}`
            : `${homeContent?.[0]?.item.word} / ${homeContent?.[0]?.item.otherLangWord} Meaning in ${countryName} Dialect Slang Dictionary`}
        </title>
        {i18n.language === 'ar'
          ? <meta name="description"
                    content={`تعريف ${homeContent?.[0]?.item.word} في لهجة ${demonyms.split(', ')[0] || 'العربية'} العامية ${demonyms.split(', ').slice(1).join(', ') || 'الترجمة إلى الإنجليزية'}`} />
          : <meta name="description"
                    content={`The definition of ${homeContent?.[0]?.item.word} in ${demonyms.split(', ')[0] || 'Arabic'} dialect slang ${demonyms.split(', ').slice(1).join(', ') || 'English translation'}`} />}
        {i18n.language === 'ar'
          ? <meta name="keywords"
                  content={`${homeContent?.[0]?.item.word}, ${demonyms}, عربي إلى إنجليزي, إنجليزي إلى عربي, تعريف, عامية `} />
          : <meta name="keywords"
                  content={`${countryName}, ${demonyms}, Arabic to English, English to Arabic, definition, slang, dialect`} />}
      </Helmet>
      <div className="feed-ad-space">
        <AdSense.Google
          client="ca-pub-4293590491700199"
          slot='7898075502'
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
          <>
            <Helmet>
              <meta name="defintion" content={content.item.definition} />
              <meta name="countryCode" content={content.countryCode} />
              <meta name="country" content={countryName} />
            </Helmet>
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
            />
            {((index + 1) % 4 === 0) && <div className="feed-posts-ad-space">
              <AdSense.Google
                client='ca-pub-4293590491700199'
                slot='6473874271'
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
          </>
        ))}
      </div>
      <div className="feed-ad-space">
        <AdSense.Google
          client='ca-pub-4293590491700199'
          slot='1590891296'
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