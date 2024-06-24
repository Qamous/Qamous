import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ContentBox.scss';
import styles from '../assets/Styles.scss';
import Snackbar from './Snackbar';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import ReactCountryFlag from 'react-country-flag';
import CustomDialog from './CustomDialog';
import i18n from 'i18next';
import { Link, useNavigate } from 'react-router-dom';
import { getCountryName } from '../assets/utils';
import * as htmlToImage from 'html-to-image';
import logo from '../assets/qamous-logo-transparent.png';

export interface HomeContentProps {
  item: {
    word: string,
    definition: string
  },
  index: number,
  lang: string,
  wordId: number,
  definitionId: number,
  isLiked: boolean,
  isDisliked: boolean,
  isReported: boolean,
  countryCode?: string,
  definitionHuh?: boolean,
  // likeCount: number,
  // dislikeCount: number,
}

interface ButtonText {
  like: string,
  dislike: string,
  report: string,
  share: string,
}

const ContentBox: React.FC<HomeContentProps> = ({
                                                  item,
                                                  index,
                                                  lang,
                                                  wordId,
                                                  definitionId,
                                                  countryCode,
                                                  isLiked,
                                                  isDisliked,
                                                  isReported,
                                                  definitionHuh,
                                                }) => {
  const { t } = useTranslation();
  const buttonText = t('content_box_buttons', { returnObjects: true }) as ButtonText;
  
  const [likeClicked, setLikeClicked] = useState(isLiked);
  const [dislikeClicked, setDislikeClicked] = useState(isDisliked);
  const [reportClicked, setReportClicked] = useState(isReported);
  const [reportSnackbarOpen, setReportSnackbarOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [excessiveClickSnackbarOpen, setExcessiveClickSnackbarOpen] = useState(false);
  const [mustLoginSnackbarOpen, setMustLoginSnackbarOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [reportType, setReportType] = useState<string | null>(null);
  const [showInvalidInputDialog, setShowInvalidInputDialog] = useState(false);
  const [countryName, setCountryName] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (countryCode) {
      getCountryName(countryCode).then(setCountryName);
    }
  }, [countryCode]);
  
  const handleInvalidInputOkClick = () => {
    setShowInvalidInputDialog(false);
  };
  
  const handleMutationError = (error: Response) => {
    console.error('There has been a problem with your fetch operation:', error);
    if (error.status === 401 || error.status === 403) {
      setMustLoginSnackbarOpen(true);
      navigate('/login');
    }
  };
  
  const likeMutation = useMutation(() =>
    fetch(`http://localhost:3000/reactions/${definitionId}/${likeClicked ? 'unlike' : 'like'}`, {
      method: 'POST',
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    }), {
    onError: handleMutationError,
  });
  
  const dislikeMutation = useMutation(() =>
    fetch(`http://localhost:3000/reactions/${definitionId}/${dislikeClicked ? 'undislike' : 'dislike'}`, {
      method: 'POST',
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    }), {
    onError: handleMutationError,
  });
  
  const handleLikeClick = () => {
    if (clickCount < 5) {
      setClickCount(prevCount => prevCount + 1);
      if (dislikeClicked && !likeClicked) handleDislikeClick();
      setLikeClicked(!likeClicked);
      likeMutation.mutate();
    } else if (clickCount >= 5) {
      setExcessiveClickSnackbarOpen(false);
      setTimeout(() => {
        setExcessiveClickSnackbarOpen(true);
      }, 100);
    }
  };
  
  const handleDislikeClick = () => {
    if (clickCount < 5) {
      setClickCount(prevCount => prevCount + 1);
      if (likeClicked && !dislikeClicked) handleLikeClick();
      setDislikeClicked(!dislikeClicked);
      dislikeMutation.mutate();
    } else if (clickCount >= 5) {
      setExcessiveClickSnackbarOpen(false);
      setTimeout(() => {
        setExcessiveClickSnackbarOpen(true);
      }, 100);
    }
  };
  
  const reportWord = async ({ reportText }: { reportText: string }) => {
    const response: Response = await fetch('http://localhost:3000/word-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportText,
        wordId,
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to post word report');
    }
    
    return await response.json();
  };
  
  const handleReportClick = () => {
    if (reportClicked) {
      setReportSnackbarOpen(false);
      setTimeout(() => {
        setReportSnackbarOpen(true);
      }, 100);
    } else {
      setShowDialog(true);
    }
  };
  
  const postRef = useRef<HTMLDivElement>(null);
  
  const handleInstagramShareClick = useCallback(() => {
    if (!postRef.current) {
      return;
    }
    
    // Temporarily hide buttons and adjust to square dimensions
    const buttons = postRef.current.querySelector('.content-box-buttons') as HTMLElement;
    if (buttons) buttons.style.display = 'none';
    
    const contentBox = postRef.current as HTMLElement;
    const originalWidth = contentBox.style.width;
    const originalHeight = contentBox.style.height;
    
    const boundingRect = contentBox.getBoundingClientRect();
    const sideLength = Math.max(boundingRect.width, boundingRect.height);
    
    contentBox.style.width = `${sideLength}px`;
    contentBox.style.height = `${sideLength}px`;
    
    // Calculate font sizes based on the side length
    const fontSizeWord = Math.floor(sideLength * 0.06); // Adjust multiplier as needed
    const fontSizeDefinition = Math.floor(sideLength * 0.04); // Adjust multiplier as needed
    
    const wordElement = postRef.current.querySelector('.content-box-title h1') as HTMLElement;
    if (wordElement) wordElement.style.fontSize = `${fontSizeWord}px`;
    if (wordElement) wordElement.style.color = styles.secondaryColor;
    
    const definitionElement = postRef.current.querySelector('.content-box-description p') as HTMLElement;
    if (definitionElement) definitionElement.style.fontSize = `${fontSizeDefinition}px`;
    
    // Add the logo to the bottom left of the square
    const logoElement = document.createElement('img');
    logoElement.src = logo;
    logoElement.style.display = 'block';
    logoElement.style.position = 'relative';
    logoElement.style.width = '100px';
    logoElement.style.margin = 'auto';
    const contentBoxDiv = postRef.current.querySelector('.content-box');
    if (contentBoxDiv) {
      contentBoxDiv.appendChild(logoElement);
    }
    contentBox.appendChild(logoElement);
    
    htmlToImage
      .toPng(postRef.current, { cacheBust: true, pixelRatio: 2 }) // Set pixelRatio to 2 for higher quality
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${item.word}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('oops, something went wrong!', error);
      })
      .finally(() => {
        // Restore buttons and original dimensions
        if (buttons) buttons.style.display = 'flex';
        contentBox.style.width = originalWidth;
        contentBox.style.height = originalHeight;
        
        // Reset changes
        if (wordElement) wordElement.style.fontSize = ''; // Reset to default
        if (wordElement) wordElement.style.color = '';
        if (definitionElement) definitionElement.style.fontSize = '';
        if (logoElement) contentBox.removeChild(logoElement);
      });
  }, [postRef]);
  
  const handleFacebookShare = () => {
    const word = 'Example Word'; // Replace with your actual word
    const definition = 'Example definition goes here.'; // Replace with your actual definition
    const shareUrl = 'https://www.qamous.org'; // Example URL
    
    const quote = `${word}: ${definition}\n\nCheck out Qamous.org for more!`; // Message for Facebook share
    
    // Construct the Facebook feed dialog URL
    const facebookDialogUrl = `https://www.facebook.com/dialog/feed?
    app_id=${7661586273928712}
    &display=popup
    &link=${encodeURIComponent(shareUrl)}
    &quote=${encodeURIComponent(quote)}
    &redirect_uri=${encodeURIComponent('https://www.qamous.org')}`; // Replace with your actual redirect URI
    
    // Open the feed dialog in a new window
    window.open(facebookDialogUrl, '_blank', 'width=600,height=400');
  };
  
  const handleXShare = () => {
    const promoText = `\n\nCheck out Qamous.org for more!`;
    const separator = ': ';
    const maxTweetLength = 280;
    
    // Estimate the additional characters added by URL encoding
    const estimatedExtraChars = 14;
    
    // Calculate the maximum length for the definition
    const maxDefinitionLength = maxTweetLength - item.word.length - separator.length - promoText.length - estimatedExtraChars;
    
    let truncatedDefinition = item.definition;
    
    if (item.definition.length > maxDefinitionLength) {
      truncatedDefinition = item.definition.slice(0, maxDefinitionLength - 3) + '...';
    }
    
    const tweetText = `${item.word}${separator}${truncatedDefinition}${promoText}`;
    
    // Construct the Twitter intent URL
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    // Open the Twitter share dialog in a new window
    window.open(twitterUrl, '_blank');
  };
  
  const reportDefinition = async ({ reportText }: { reportText: string }) => {
    const response: Response = await fetch('http://localhost:3000/definition-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportText,
        definitionId,
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to post definition report');
    }
    
    return await response.json();
  };
  
  const handleShareClick = () => {
    setShowTooltip(!showTooltip);
  };
  
  const reportWordMutation = useMutation(reportWord, {
    onError: (error) => {
      console.error('There has been a problem with your fetch operation:', error);
      navigate('/login');
    },
  });
  
  const reportDefinitionMutation = useMutation(reportDefinition, {
    onError: (error) => {
      console.error('There has been a problem with your fetch operation:', error);
      navigate('/login');
    },
  });
  
  const handleReport = (reportType: string) => {
    if (reportType === 'definition') {
      setReportType(reportType);
      setShowDialog(true);
    } else if (reportType === 'word') {
      // handle word report
    } else {
      setShowInvalidInputDialog(true);
    }
  };
  
  const onSubmit = (input: string) => {
    if (input.trim() === '') {
      setShowInvalidInputDialog(true);
      setReportType(null);
      setShowDialog(false);
    } else {
      if (reportType === 'definition') {
        reportDefinitionMutation.mutate({ reportText: input });
      } else if (reportType === 'word') {
        reportWordMutation.mutate({ reportText: input });
      }
      setReportClicked(false);
      setShowDialog(false);
    }
  };
  
  useEffect(() => {
    if (clickCount >= 5) {
      setTimeout(() => {
        setClickCount(0);
      }, 60000); // Reset after 1 minute
    }
  }, [clickCount]);
  
  useEffect(() => {
    setLikeClicked(isLiked);
    setDislikeClicked(isDisliked);
    setReportClicked(isReported);
  }, [isLiked, isDisliked, isReported]);
  
  return (
    <div className={'content-box' +
      (index === 0 ? ' content-box-first' : '') +
      (lang === 'ar' ? ' content-box-ar' : ' content-box-latin')}
         ref={postRef}>
      {showDialog && (
        <CustomDialog
          text={
            reportType ?
              (i18n.language === 'ar' ?
                t('report_dialog.why', {
                  reportType:
                    reportType === 'word' ? 'هذه الكلمة' : 'هذا التعريف',
                }) :
                t('report_dialog.why', { reportType: reportType })) :
              t('report_dialog.what')
          }
          buttonText1={t('report_dialog.word')}
          buttonText2={t('report_dialog.definition')}
          onButton1Click={() => {
            setReportType('word');
            handleReport('word');
          }}
          onButton2Click={() => {
            setReportType('definition');
            handleReport('definition');
          }}
          onClose={() => {
            setShowDialog(false);
            setReportType(null);
          }}
          showTextInput={reportType !== null}
          onSubmit={onSubmit}
          onCancel={() => {
            setShowDialog(false);
            setReportType(null);
          }}
        />
      )}
      {showInvalidInputDialog && (
        <CustomDialog
          text={t('content_box_buttons.report_cancelled')}
          okButtonText={t('common.ok')}
          onOkButtonClick={handleInvalidInputOkClick}
          onClose={handleInvalidInputOkClick}
        />
      )}
      <div className={'content-box-title'}>
        {(wordId && (
          <Link to={`/word/${wordId}`} key={index + 1}>
            <h1>{item.word}</h1>
          </Link>
        )) || (
          <h1>{item.word}</h1>
        )}
        
        {countryCode &&
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{ width: '2em', height: '2em' }}
            title={countryName}
          />
        }
      </div>
      {definitionHuh !== false && (
        <div className={'content-box-description'}>
          <p>{item.definition}</p>
        </div>
      )}
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
          <div className="tooltip">
            <button
              className={`content-box-buttons-share-button`}
              onClick={handleShareClick}
            >
              {buttonText.share}
            </button>
            {showTooltip && (
              <div className="tooltiptext">
                <button onClick={handleInstagramShareClick}>Instagram</button>
                {/*<button onClick={handleFacebookShare}>Facebook</button>*/}
                <button onClick={handleXShare}>X / Twitter</button>
              </div>
            )}
          </div>
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
        message={t('content_box_buttons.repeated_report_error')}
      />
      <Snackbar
        open={excessiveClickSnackbarOpen}
        message={t('content_box_buttons.repeated_reaction_error')}
      />
      <Snackbar
        open={mustLoginSnackbarOpen}
        message={t('login.must_login')}
      />
    </div>
  );
};

export default ContentBox;
