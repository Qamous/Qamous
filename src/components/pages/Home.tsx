import React, { useEffect, useState } from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import ContentBox from '../ContentBox';
import { useQuery } from 'react-query';
import Snackbar from '../Snackbar';
import CustomDialog from '../CustomDialog';
import AdSense from 'react-adsense';
import { Helmet } from 'react-helmet';

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
  fetch(`${process.env.REACT_APP_API_URL}/definitions/most-liked`, {
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
  const [showDialog, setShowDialog] = useState(true);
  
  useEffect(() => {
    if (isError) {
      setErrorSnackbarOpen(false);
      // A delay to allow the state to propagate before the snackbar opens
      setTimeout(() => {
        setErrorSnackbarOpen(true);
      }, 100);
    }
  }, [isError]);
  useEffect(() => {
    if (homeContent) {
      console.log(homeContent);
    }
  }, []);
  
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
          />
          <div className={'loading-ring'}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
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
    <div className={'feed'}>
      <Helmet>
        <title>Qamous - Arabic Slang Dictionary</title>
        <meta name="description" content="Explore Qamous, your go-to platform for learning Arabic slang and colloquial phrases. Discover a comprehensive Arabic dictionary for various dialects." />
        <meta name="keywords" content="arabic slang, arabic dictionary, colloquial arabic, arabic phrases, arabic dialects, dictionary" />
      </Helmet>
      <div className="feed-ad-space">
        <AdSense.Google
          client='ca-pub-4293590491700199'
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
        <div className="feed-posts-ad-space">
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
        </div>
        {homeContent && homeContent
          .filter(item => item.isArabic === (lang === 'ar' ? 1 : 0))
          .map((item, index) => (
            <React.Fragment key={index}>
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
            </React.Fragment>
          ))}
        {showDialog && (
          <CustomDialog
            text={t('common.beta_warning')}
            okButtonText={t('common.ok')}
            onOkButtonClick={() => setShowDialog(false)}
            onClose={() => setShowDialog(false)}
          />
        )}
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

export default Home;