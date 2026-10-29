import type { ProvenanceContent } from '../src/types/provenance';
import React, { useEffect, useState } from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';
import ContentBox from '../src/components/ContentBox';
import { useHomeFeed } from '../src/hooks/useHomeFeed';
import Snackbar from '../src/components/Snackbar';
import CustomDialog from '../src/components/CustomDialog';
import HomeIntroduction from '../src/components/HomeIntroduction';
import { useIntersectionObserver } from '../src/assets/utils';
import LoadingSpinner from '../src/components/LoadingSpinner';

interface HomeContent extends ProvenanceContent {
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
  example: string;
  arabicExample?: string | null;
  arabicSpellings?: string[];
  francoSpellings?: string[];
}

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeFeed<HomeContent>(lang);
  
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
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, fetchNextPage, hasNextPage, isFetchingNextPage, data?.pages.length]);
  
  if (isLoading) {
    return (
      <div className={'feed'}>
        <div className="feed-posts">
          <HomeIntroduction language={lang}/>
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className={'feed'}>
        <div className="feed-posts">
          <HomeIntroduction language={lang}/>
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
        {/* TODO: Ads need to be fixed. Was working on a fix but it was not satisfactory */}
        <div className="feed-ad-space">
        {/*  <AdSenseWrapper*/}
        {/*    client="ca-pub-4293590491700199"*/}
        {/*    slot="7898075502"*/}
        {/*    adKey="home-top"*/}
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
          <HomeIntroduction language={lang}/>
          {/*<div className="feed-posts-ad-space">*/}
          {/*  <AdSenseWrapper*/}
          {/*    client="ca-pub-4293590491700199"*/}
          {/*    slot="6473874271"*/}
          {/*    adKey="home-middle"*/}
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
              .filter(item => Boolean(item.isArabic) === (lang === 'ar'))
              .map((item, index) => (
                <React.Fragment key={item.definitionId}>
                  <ContentBox
                    item={item}
                    index={index + 1}
                    lang={lang} definitionLanguage={item.isArabic?'ar':'en'} dialect={item.dialect} canonicalWordId={item.canonicalWordId}
                    definitionId={item.definitionId}
                    wordId={item.wordId}
                    countryCode={item.countryCode}
                    isLiked={Boolean(item.isLiked)}
                    isDisliked={Boolean(item.isDisliked)}
                    isReported={item.isReported !== 0}
                    example={item.example}
                    arabicExample={item.arabicExample} sourceCredits={item.sourceCredits} sourceExamples={item.sourceExamples} sourcePronunciations={item.sourcePronunciations}
                    arabicSpellings={item.arabicSpellings}
                    francoSpellings={item.francoSpellings}
                  />
                  {/*{((index + 1) % 4 === 0) && <div className="feed-posts-ad-space">*/}
                  {/*  <AdSenseWrapper*/}
                  {/*    client="ca-pub-4293590491700199"*/}
                  {/*    slot="6473874271"*/}
                  {/*    adKey={`home-content-${pageIndex}-${index}`}*/}
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
        {/*  <AdSenseWrapper*/}
        {/*    client="ca-pub-4293590491700199"*/}
        {/*    slot="1590891296"*/}
        {/*    adKey="home-bottom"*/}
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
        <LoadingSpinner />
      </div>
    </>
  );
};

export default Home;
