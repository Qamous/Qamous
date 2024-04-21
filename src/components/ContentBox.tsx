import React, { useEffect, useState } from 'react';
import './ContentBox.scss';
import Snackbar from './Snackbar';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import ReactCountryFlag from 'react-country-flag';

interface HomeContentProps {
  item: {
    word: string,
    definition: string
  },
  index: number,
  lang: string,
  definitionId: number,
  //likeCount: number,
  //dislikeCount: number,
}

interface ButtonText {
  like: string,
  dislike: string,
  report: string
}

interface Country {
  countryCode: string,
  countryName: string
}

const fetchCountry = async (definitionId: number): Promise<Country> => {
  const response = await fetch(`http://localhost:3000/definitions/${definitionId}/country`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const ContentBox: React.FC<HomeContentProps> = ({ item, index, lang, definitionId }) => {
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
  const { data: country, isError, isLoading } =
    useQuery(['country', definitionId], () => fetchCountry(definitionId), {
      enabled: definitionId !== 0,
    });
  
  const handleLikeClick = () => {
    if (clickCount < 5) {
      setClickCount(prevCount => prevCount + 1);
      setLikeClicked(!likeClicked);
      if (dislikeClicked) setDislikeClicked(false);
    }
    if (clickCount >= 5) {
      setExcessiveClickSnackbarOpen(true);
      setTimeout(() => setExcessiveClickSnackbarOpen(false), 3000);
    }
  };
  
  const handleDislikeClick = () => {
    if (clickCount < 5) {
      setClickCount(prevCount => prevCount + 1);
      setDislikeClicked(!dislikeClicked);
      if (likeClicked) setLikeClicked(false);
    }
    if (clickCount >= 5) {
      setExcessiveClickSnackbarOpen(true);
      setTimeout(() => setExcessiveClickSnackbarOpen(false), 3000);
    }
  };
  
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
          // TODO: use the 'reason' and 'reportType' variables here to send them to the server
          console.log(`Report Type: ${reportType}, Reason: ${reason}`);
          setReportClicked(true);
        } else if (reason === null) {
          window.alert('Report canceled.');
        }
      } else {
        window.alert('Invalid input. Please enter \'word\' or \'definition\'.');
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
        {!isLoading && !isError && country &&
          <ReactCountryFlag
            countryCode={country.countryCode}
            svg
            style={{
              width: '2em',
              height: '2em',
            }}
            title={country.countryName}
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