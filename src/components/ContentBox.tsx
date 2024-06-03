import React, { useEffect, useState } from 'react';
import './ContentBox.scss';
import Snackbar from './Snackbar';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import ReactCountryFlag from 'react-country-flag';
import CustomDialog from './CustomDialog';

interface HomeContentProps {
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
  //likeCount: number,
  //dislikeCount: number,
}

interface ButtonText {
  like: string,
  dislike: string,
  report: string
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
                                                }) => {
  const { t } = useTranslation();
  const buttonText = t('content_box_buttons', {
    returnObjects: true,
  }) as ButtonText;
  
  const [likeClicked, setLikeClicked] = useState(isLiked);
  const [dislikeClicked, setDislikeClicked] = useState(isDisliked);
  const [reportClicked, setReportClicked] = useState(isReported);
  const [reportSnackbarOpen, setReportSnackbarOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [excessiveClickSnackbarOpen, setExcessiveClickSnackbarOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [reportType, setReportType] = useState<string | null>(null);
  const [showInvalidInputDialog, setShowInvalidInputDialog] = useState(false);
  
  const handleInvalidInputOkClick = () => {
    setShowInvalidInputDialog(false);
  };
  
  const likeMutation = useMutation(() =>
      fetch(`http://localhost:3000/reactions/${definitionId}/${likeClicked ? 'unlike' : 'like'}`, {
        method: 'POST',
        credentials: 'include',
      }), {
      onError: (error) => {
        console.error('There has been a problem with your fetch operation:', error);
      },
    },
  );
  
  const dislikeMutation = useMutation(() =>
      fetch(`http://localhost:3000/reactions/${definitionId}/${dislikeClicked ? 'undislike' : 'dislike'}`, {
        method: 'POST',
        credentials: 'include',
      }), {
      onError: (error) => {
        console.error('There has been a problem with your fetch operation:', error);
      },
    },
  );
  
  const handleLikeClick = () => {
    if (clickCount < 5) {
      setClickCount(prevCount => prevCount + 1);
      setLikeClicked(!likeClicked);
      if (dislikeClicked) setDislikeClicked(false);
      
      // Use the mutation
      likeMutation.mutate();
    } else if (clickCount >= 5) {
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
    } else if (clickCount >= 5) {
      setExcessiveClickSnackbarOpen(true);
      setTimeout(() => setExcessiveClickSnackbarOpen(false), 3000);
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
      setReportSnackbarOpen(true);
      setTimeout(() => setReportSnackbarOpen(false), 3000);
    } else {
      setShowDialog(true);
    }
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
  
  const reportWordMutation = useMutation(reportWord, {
    onError: (error) => {
      console.error('There has been a problem with your fetch operation:', error);
    },
  });
  
  const reportDefinitionMutation = useMutation(reportDefinition, {
    onError: (error) => {
      console.error('There has been a problem with your fetch operation:', error);
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
  
  // Update the like, dislike, and report buttons when language is changed
  useEffect(() => {
    setLikeClicked(isLiked);
    setDislikeClicked(isDisliked);
    setReportClicked(isReported);
  }, [isLiked, isDisliked, isReported]);
  
  return (
    <div className={'content-box' +
      (index === 0 ? ' content-box-first' : '') +
      (lang === 'ar' ? ' content-box-ar' : ' content-box-latin')}>
      {showDialog && (
        <CustomDialog
          text={reportType ? `Why are you reporting this ${reportType}?` : 'Are you reporting the word or the definition?'}
          buttonText1="Word"
          buttonText2="Definition"
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
          onSubmit={onSubmit} // Add this line
          onCancel={() => {
            // Handle the cancel action here
            setShowDialog(false);
            setReportType(null);
          }}
        />
      )}
      {showInvalidInputDialog && (
        <CustomDialog
          text="Invalid input. Report Cancelled."
          okButtonText="OK"
          onOkButtonClick={handleInvalidInputOkClick}
          onClose={handleInvalidInputOkClick}
        />
      )}
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