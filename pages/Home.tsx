import React, { useEffect, useState } from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import ContentBox from '../src/components/ContentBox';
import { useInfiniteQuery } from 'react-query';
import Snackbar from '../src/components/Snackbar';
import CustomDialog from '../src/components/CustomDialog';
import { Helmet } from 'react-helmet';
import { useIntersectionObserver } from '../src/assets/utils';
//import AdSense from 'react-adsense';

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
  isReported: number,
  example: string
}

interface JsonContent {
  word: string,
  definition: string
}

const fetchHomeContent: (page: number, limit: number) => Promise<HomeContent[]> = (page = 1, limit = 10) =>
  fetch(`${import.meta.env.VITE_API_URL}/definitions/most-liked?page=${page}&limit=${limit}`, {
    mode: 'cors',
    credentials: 'include',
  }).then(response => response.json());

const Home: React.FC = () => {
  const { t } = useTranslation();
  const sampleHome = t('sample_home', {
    returnObjects: true,
  }) as JsonContent[];
  const lang = i18n.language;
  
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<HomeContent[]>('homeContent', ({ pageParam = 1 }) => fetchHomeContent(pageParam, 10), {
    getNextPageParam: (lastPage, pages) => lastPage.length === 10 ? pages.length + 1 : undefined,
    refetchOnWindowFocus: false,
  });
  
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  useEffect(() => {
    if (isError) {
      setErrorSnackbarOpen(false);
      // A delay to allow the state to propagate before the snackbar opens
      setTimeout(() => {
        setErrorSnackbarOpen(true);
      }, 100);
    }
  }, [isError]);
  
  // Beta warning dialog (only shows once a week + disabled for now + has a visual glitch as it shows up on load and then re-renders once the data is fetched)
  // useEffect(() => {
  //   const lastShown = getCookie('betaWarningShown');
  //   if (!lastShown || (new Date().getTime() - new Date(lastShown).getTime()) > 7 * 24 * 60 * 60 * 1000) {
  //     setShowDialog(true);
  //     setCookieWithExpiration('betaWarningShown', new Date().toISOString(), 7);
  //   }
  // }, []);
  
  const [useIntersectionObserverElement, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  useEffect(() => {
    if (isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, fetchNextPage, hasNextPage]);
  
  if (isLoading) {
    return (
      <div className={'feed'}>
        <Helmet>
          <title>Qamous - Arabic Slang Dictionary</title>
          <meta name="description" content="Explore Qamous, your go-to platform for learning Arabic slang and colloquial phrases. Discover a comprehensive Arabic dictionary for various dialects." />
          <meta name="keywords" content="arabic slang, arabic dictionary, colloquial arabic, arabic phrases, arabic dialects, dictionary" />
        </Helmet>
        <div className="feed-posts">
          <ContentBox
            item={sampleHome[0]}
            index={0}
            lang={lang}
            definitionId={0}
            wordId={0}
            isLiked={false}
            isDisliked={false}
            isReported={false}
            example={""}
          />
          <div className={'loading-ring'}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className={'feed'}>
        <Helmet>
          <title>Qamous - Arabic Slang Dictionary</title>
          <meta name="description" content="Explore Qamous, your go-to platform for learning Arabic slang and colloquial phrases. Discover a comprehensive Arabic dictionary for various dialects." />
          <meta name="keywords" content="arabic slang, arabic dictionary, colloquial arabic, arabic phrases, arabic dialects, dictionary" />
        </Helmet>
        <div className="feed-posts">
          <ContentBox
            item={sampleHome[0]}
            index={0}
            lang={lang}
            definitionId={0}
            wordId={0}
            isLiked={false}
            isDisliked={false}
            isReported={false}
            example={""}
          />
        </div>
        <Snackbar
          open={errorSnackbarOpen}
          message={t('common.data_fetch_error')}
        />
      </div>
    );
  }
  
  return (
    <>
      <div className={'feed'}>
        <Helmet>
          <title>Qamous - Arabic Slang Dictionary</title>
          <meta name="description"
                content="Explore Qamous, your go-to platform for learning Arabic slang and colloquial phrases. Discover a comprehensive Arabic dictionary for various dialects." />
          <meta name="keywords"
                content="arabic slang, arabic dictionary, colloquial arabic, arabic phrases, arabic dialects, dictionary" />
        </Helmet>
        {/* TODO: Ads need to be fixed. Was working on a fix but it was not satisfactory */}
        <div className="feed-ad-space">
        {/*  <AdSense.Google*/}
        {/*    client="ca-pub-4293590491700199"*/}
        {/*    slot="7898075502"*/}
        {/*    style={{*/}
        {/*      display: 'block',*/}
        {/*      width: '100%',*/}
        {/*      height: '100%',*/}
        {/*      backgroundColor: 'var(--tertiary-color)',*/}
        {/*      border: '0',*/}
        {/*      padding: '10px',*/}
        {/*      fontFamily: 'var(--font-stack)',*/}
        {/*      color: 'var(--primary-color)',*/}
        {/*    }}*/}
        {/*    format="auto"*/}
        {/*    responsive="true"*/}
        {/*  />*/}
        </div>
        <div className="feed-posts">
          <ContentBox
            item={sampleHome[0]}
            index={0}
            lang={lang}
            definitionId={0}
            wordId={0}
            isLiked={false}
            isDisliked={false}
            isReported={false}
            example={""}
          />
          {/*<div className="feed-posts-ad-space">*/}
          {/*  <AdSense.Google*/}
          {/*    client="ca-pub-4293590491700199"*/}
          {/*    slot="6473874271"*/}
          {/*    style={{*/}
          {/*      display: 'block',*/}
          {/*      width: '100%',*/}
          {/*      height: '100%',*/}
          {/*      backgroundColor: 'var(--tertiary-color)',*/}
          {/*      border: '0',*/}
          {/*      padding: '10px',*/}
          {/*      fontFamily: 'var(--font-stack)',*/}
          {/*      color: 'var(--primary-color)',*/}
          {/*    }}*/}
          {/*    format="auto"*/}
          {/*    responsive="true"*/}
          {/*  />*/}
          {/*</div>*/}
          {data?.pages.map((page, pageIndex) =>
            page
              .filter(item => item.isArabic === (lang === 'ar' ? 1 : 0))
              .map((item, index) => (
                <React.Fragment key={`${pageIndex}-${index}`}>
                  <ContentBox
                    item={item}
                    index={index + 1}
                    lang={lang}
                    definitionId={item.definitionId}
                    wordId={item.wordId}
                    countryCode={item.countryCode}
                    isLiked={item.isLiked !== 0}
                    isDisliked={item.isDisliked !== 0}
                    isReported={item.isReported !== 0}
                    example={item.example}
                  />
                  {/*{((index + 1) % 4 === 0) && <div className="feed-posts-ad-space">*/}
                  {/*  <AdSense.Google*/}
                  {/*    client="ca-pub-4293590491700199"*/}
                  {/*    slot="6473874271"*/}
                  {/*    style={{*/}
                  {/*      display: 'block',*/}
                  {/*      width: '100%',*/}
                  {/*      height: '100%',*/}
                  {/*      backgroundColor: 'var(--tertiary-color)',*/}
                  {/*      border: '0',*/}
                  {/*      padding: '10px',*/}
                  {/*      fontFamily: 'var(--font-stack)',*/}
                  {/*      color: 'var(--primary-color)',*/}
                  {/*    }}*/}
                  {/*    format="auto"*/}
                  {/*    responsive="true"*/}
                  {/*  />*/}
                  {/*</div>}*/}
                </React.Fragment>
              )),
          )}
        </div>
        <div className="feed-ad-space">
        {/*  <AdSense.Google*/}
        {/*    client="ca-pub-4293590491700199"*/}
        {/*    slot="1590891296"*/}
        {/*    style={{*/}
        {/*      display: 'block',*/}
        {/*      width: '100%',*/}
        {/*      height: '100%',*/}
        {/*      backgroundColor: 'var(--tertiary-color)',*/}
        {/*      border: '0',*/}
        {/*      padding: '10px',*/}
        {/*      fontFamily: 'var(--font-stack)',*/}
        {/*      color: 'var(--primary-color)',*/}
        {/*    }}*/}
        {/*    format="auto"*/}
        {/*    responsive="true"*/}
        {/*  />*/}
        </div>
        {showDialog && (
          <CustomDialog
            text={t('common.beta_warning')}
            okButtonText={t('common.ok')}
            onOkButtonClick={() => setShowDialog(false)}
            onClose={() => setShowDialog(false)}
          />
        )}
      </div>
      <div ref={useIntersectionObserverElement} className={`feed-loading${!hasNextPage ? '-hidden' : ''}`}>
        <div className={"loading-ring"}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default Home;