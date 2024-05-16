import React, { useEffect, useState } from 'react';
import './ContentBox.scss';
import Snackbar from './Snackbar';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import ReactCountryFlag from 'react-country-flag';

interface HomeContentProps {
  item: {
    word: string,
    definition: string
  },
  index: number,
  lang: string,
  definitionId: number,
  countryCode?: string,
  //likeCount: number,
  //dislikeCount: number,
}

interface ButtonText {
  like: string,
  dislike: string,
  report: string
}

const ContentBox: React.FC<HomeContentProps> = ({ item, index, lang, definitionId, countryCode }) => {
  const { t } = useTranslation();
  const buttonText = t('content_box_buttons', {
    returnObjects: true,
  }) as ButtonText;
  
  const [likeClicked, setLikeClicked] = useState(false);
  const [dislikeClicked, setDislikeClicked] = useState(false);
  const [reportClicked, setReportClicked] = useState(false);
  const [reportSnackbarOpen, setReportSnackbarOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [excessiveClickSnackbarOpen, setExcessiveClickSnackbarOpen] = useState(false);
  
  const likeMutation = useMutation(() =>
      fetch(`http://localhost:3000/reactions/${definitionId}/${likeClicked ? 'unlike' : 'like'}`, {
        method: 'POST',
        credentials: 'include',
      }), {
      onError: (error) => {
        console.error('There has been a problem with your fetch operation:', error);
      },
    }
  );
  
  const dislikeMutation = useMutation(() =>
      fetch(`http://localhost:3000/reactions/${definitionId}/${dislikeClicked ? 'undislike' : 'dislike'}`, {
        method: 'POST',
        credentials: 'include',
      }), {
      onError: (error) => {
        console.error('There has been a problem with your fetch operation:', error);
      },
    }
  );
  
  const handleLikeClick = () => {
    if (clickCount < 5) {
      setClickCount(prevCount => prevCount + 1);
      setLikeClicked(!likeClicked);
      if (dislikeClicked) setDislikeClicked(false);
      
      // Use the mutation
      likeMutation.mutate();
    }
    else if (clickCount >= 5) {
      setExcessiveClickSnackbarOpen(true);
      setTimeout(() => setExcessiveClickSnackbarOpen(false), 3000);
    }
  };
  
  const handleDislikeClick = () => {
    if (clickCount < 5) {
      setClickCount(prevCount => prevCount + 1);
      setDislikeClicked(!dislikeClicked);
      if (likeClicked) setLikeClicked(false);
      
      // Use the mutation
      dislikeMutation.mutate();
    }
    else if (clickCount >= 5) {
      setExcessiveClickSnackbarOpen(true);
      setTimeout(() => setExcessiveClickSnackbarOpen(false), 3000);
    }
  };
  
  const reportWord = async ({ reportText }: { reportText: string }) => {
    const response = await fetch('http://localhost:3000/word-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportText,
      }),
      credentials: 'include',
    });
  
    if (!response.ok) {
      throw new Error('Failed to post word report');
    }
  
    return await response.json();
  };
  
  const reportMutation = useMutation(reportWord, {
    onError: (error) => {
      console.error('There has been a problem with your fetch operation:', error);
    },
  });
  
  const handleReportClick = () => {
    if (reportClicked) {
      setReportSnackbarOpen(true);
      setTimeout(() => setReportSnackbarOpen(false), 3000);
    } else {
      const reportType = window.prompt('Are you reporting the word or the definition? Please enter \'word\' or \'definition\':');
      if (reportType === null) {
        window.alert('Report canceled.');
      } else if (reportType === 'word' || reportType === 'definition') {
        const reason = window.prompt(`Please enter the reason for reporting this ${reportType}:`);
        if (reason || reason === '') {
          reportMutation.mutate({ reportText: reason });
          setReportClicked(true);
        } else if (reason === null) {
          window.alert('Report canceled.');
        }
      } else {
        window.alert('Invalid input. Report Cancelled.');
      }
    }
  };
  
  useEffect(() => {
    if (clickCount >= 5) {
      setTimeout(() => {
        setClickCount(0);
      }, 60000); // Reset after 1 minute
    }
  }, [clickCount]);
  
  return (
    <div className={'content-box' +
      (index === 0 ? ' content-box-first' : '') +
      (lang === 'ar' ? ' content-box-ar' : ' content-box-latin')}>
      <div className={'content-box-title'}>
        <h1>{item.word}</h1>
        {countryCode &&
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{
              width: '2em',
              height: '2em',
            }}
            title={countryCode}
          />
        }
      </div>
      <div className={'content-box-description'}>
        <p>
          {item.definition}
        </p>
      </div>
      {index !== 0 && (
        <div className="content-box-buttons">
          <button
            className={`content-box-buttons-like-button ${likeClicked ? 'clicked' : ''}`}
            onClick={handleLikeClick}
          >
            {buttonText.like}
          </button>
          <button
            className={`content-box-buttons-dislike-button ${dislikeClicked ? 'clicked' : ''}`}
            onClick={handleDislikeClick}
          >
            {buttonText.dislike}
          </button>
          <button
            className={`content-box-buttons-report-button ${reportClicked ? 'clicked' : ''}`}
            onClick={handleReportClick}
          >
            {buttonText.report}
          </button>
        </div>
      )}
      <Snackbar
        open={reportSnackbarOpen}
        message="You are unable to report the same word more than once"
      />
      <Snackbar
        open={excessiveClickSnackbarOpen}
        message="You have reacted too many times. Please wait before clicking again."
      />
    </div>
  );
};

export default ContentBox;