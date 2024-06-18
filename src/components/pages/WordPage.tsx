import { Helmet } from 'react-helmet';
import ContentBox, { HomeContentProps } from '../ContentBox';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCountryName } from '../../assets/utils';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

const fetchHomeContent = async (wordId: number): Promise<HomeContentProps[]> => {
  const res = await fetch(`http://localhost:3000/definitions/word/${wordId}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.map((item: any) => ({
    item: {
      word: item.isArabic ? item.word.arabicWord : item.word.francoArabicWord,
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
  const lang: string = i18n.language;
  const { wordId } = useParams<{ wordId: string }>();
  const wordIdNumber = Number(wordId) || 0;
  const { data: homeContent, isLoading, error } = useQuery(['homeContent', wordIdNumber], () => fetchHomeContent(wordIdNumber));
  const [countryName, setCountryName] = useState("");

  useEffect(() => {
    const fetchCountryName = async () => {
      if (homeContent && homeContent[0]) {
        const name = await getCountryName(homeContent[0].countryCode || "");
        setCountryName(name || "");
      }
    };

    fetchCountryName();
  }, [homeContent]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;

  // Filter the homeContent based on the current language
  const filteredHomeContent = homeContent?.filter(content => content.lang === lang);

  return (
    <div className='home'>
      <Helmet>
        <title>{homeContent?.[0]?.item.word}</title>
      </Helmet>
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
            lang={lang}
            definitionId={content.definitionId}
            wordId={content.wordId}
            countryCode={content.countryCode}
            isLiked={content.isLiked}
            isDisliked={content.isDisliked}
            isReported={content.isReported}
          />
        </>
      ))}
    </div>
  );
};

export default WordPage;