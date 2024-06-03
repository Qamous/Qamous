import React, { useEffect, useState } from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import ContentBox from '../ContentBox';
import { useQuery } from 'react-query';
import Snackbar from '../Snackbar';

interface HomeContent {
  word: string,
  wordId: number,
  definition: string,
  definitionId: number,
  likeCount: number,
  dislikeCount: number,
  likeDislikeDifference: number,
  isArabic: number,
  francoArabicWord: string,
  reportCount: number,
  countryCode: string
  isLiked: number,
  isDisliked: number,
  isReported: number
}

interface JsonContent {
  word: string,
  definition: string
}

const fetchHomeContent: () => Promise<HomeContent[]> = () =>
  // after fetching the data, console log the data and return it
  fetch('http://localhost:3000/definitions/most-liked', {
    mode: 'cors',
    credentials: 'include',
  }).then(response => response.json());

const Home: React.FC = () => {
  const { t } = useTranslation();
  const sampleHome = t('sample_home', {
    returnObjects: true,
  }) as JsonContent[];
  const lang = i18n.language;
  
  const { data: homeContent, isLoading, isError } = useQuery<HomeContent[]>('homeContent', fetchHomeContent);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  
  useEffect(() => {
    if (isError) {
      setErrorSnackbarOpen(true);
      setTimeout(() => setErrorSnackbarOpen(false), 3000);
    }
  }, [isError]);
  useEffect(() => {
    if (homeContent) {
      console.log(homeContent);
    }
  }, []);
  
  if (isLoading) {
    return (
      <div className={'home'}>
        <ContentBox
          item={sampleHome[0]}
          index={0}
          lang={lang}
          definitionId={0}
          wordId={0}
          isLiked={false}
          isDisliked={false}
          isReported={false}
        />
        <div className={'loading-ring'}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className={'home'}>
        <ContentBox
          item={sampleHome[0]}
          index={0}
          lang={lang}
          definitionId={0}
          wordId={0}
          isLiked={false}
          isDisliked={false}
          isReported={false}
        />
        <Snackbar
          open={errorSnackbarOpen}
          message={'Data fetching error occurred. Please try again later.'}
        />
      </div>
    );
  }
  
  return (
    <div className={'home'}>
      <ContentBox
        item={sampleHome[0]}
        index={0}
        lang={lang}
        definitionId={0}
        wordId={0}
        isLiked={false}
        isDisliked={false}
        isReported={false}
      />
      {homeContent && homeContent
        .filter(item => item.isArabic === (lang === 'ar' ? 1 : 0))
        .map((item, index) => (
          <ContentBox
            key={index + 1}
            item={item}
            index={index + 1}
            lang={lang}
            definitionId={item.definitionId}
            wordId={item.wordId}
            countryCode={item.countryCode}
            isLiked={item.isLiked !== 0}
            isDisliked={item.isDisliked !== 0}
            isReported={item.isReported !== 0}
          />
        ))}
    </div>
  );
};

export default Home;