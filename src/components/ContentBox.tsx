import { API_URL, ApiError } from "../api";
import { useDefinitionReaction } from '../hooks/useDefinitionReaction';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ContentBoxView, { ContentBoxActions, type ContentBoxContent } from './ContentBoxView';
import * as variables from '../assets/Variables.module.scss';
import Snackbar from './Snackbar';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import CustomDialog from './CustomDialog';
import { useNavigate } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import logo from '../assets/qamous-logo-transparent.png';

export interface HomeContentProps extends ContentBoxContent {
  index: number,
  wordId: number,
  definitionId: number,
  isLiked: boolean,
  isDisliked: boolean,
  isReported: boolean,
  isAdvancedSearch?: boolean,
}

const ContentBox: React.FC<HomeContentProps> = ({ isLiked, isDisliked, isReported, countryCode, countryName, alternateSpellings, arabicSpellings, francoSpellings, arabicExample, item:givenItem, index, lang, wordId, definitionId, definitionHuh, isAdvancedSearch, example, sourceCredits, sourceExamples, sourcePronunciations,definitionLanguage,definitionLanguages,dialect,canonicalWordId,showMissingMeaningPrompt,headingLevel }) => {
  const item={...givenItem,word:lang==='ar'?(givenItem.arabicWord||givenItem.word):(givenItem.francoArabicWord||givenItem.word)};
  const { t, i18n } = useTranslation();
  
  const reaction = useDefinitionReaction(definitionId, isLiked, isDisliked);
  const { isLiked: likeClicked, isDisliked: dislikeClicked } = reaction;
  const [reportClicked, setReportClicked] = useState<boolean>(isReported);
  const [reportSnackbarOpen, setReportSnackbarOpen] = useState(false);
  const [mustLoginSnackbarOpen, setMustLoginSnackbarOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [reportType, setReportType] = useState<string | null>(null);
  const [showInvalidInputDialog, setShowInvalidInputDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [instagramSnackbarOpen, setInstagramSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (reaction.error instanceof ApiError && reaction.error.status === 401) navigate('/login');
  }, [reaction.error, navigate]);
  
  
  const handleInvalidInputOkClick = () => {
    setShowInvalidInputDialog(false);
  };
  
  const handleMutationError = async (error: any) => {
    if (error instanceof Response) {
      if (error.status === 401 || error.status === 403) {
        setMustLoginSnackbarOpen(true);
        navigate('/login');
        return; // Early return after navigation
      }
      // Handle other response errors if needed
      const errorData = await error.json();
      console.error('API Error:', errorData);
    } else {
      // Handle non-Response errors
      console.error('Mutation Error:', error);
    }
  };
  
  const handleLikeClick = () => reaction.vote('like');
  const handleDislikeClick = () => reaction.vote('dislike');
  
  const reportWord = async ({ reportText }: { reportText: string }) => {
    const response: Response = await fetch(`${API_URL}/word-reports`, {
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
    contentBox.dataset.exporting = 'true';
    const originalWidth = contentBox.style.width;
    const originalHeight = contentBox.style.height;
    
    const boundingRect = contentBox.getBoundingClientRect();
    const sideLength = Math.max(boundingRect.width, boundingRect.height, 1080);
    
    contentBox.style.width = `${sideLength}px`;
    contentBox.style.height = `${sideLength}px`;
    
    // Calculate font sizes based on the side length
    const fontSizeWord = Math.floor(sideLength * 0.06); // Adjust multiplier as needed
    const fontSizeDefinition = Math.floor(sideLength * 0.04); // Adjust multiplier as needed
    
    const wordElement = postRef.current.querySelector('.content-box-title h1, .content-box-title h2') as HTMLElement;
    if (wordElement) wordElement.style.fontSize = `${fontSizeWord}px`;
    if (wordElement) wordElement.style.color = variables.secondaryColor;
    
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
        setInstagramSnackbarOpen(false);
        setTimeout(() => {
          setInstagramSnackbarOpen(true);
        }, 100);
      })
      .catch((error) => {
        console.error('oops, something went wrong!', error);
      })
      .finally(() => {
        delete contentBox.dataset.exporting;
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
  }, [postRef, item.word, sourceCredits]);
  
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
    const promoText = '\n\nCheck out Qamous.org for more!';
    const separator = ': ';
    const maxTweetLength = 280;
    
    // Estimate the additional characters added by URL encoding
    const estimatedExtraChars = 47;
    
    // Calculate the maximum length for the definition
    const maxDefinitionLength = maxTweetLength - item.word.length - separator.length - estimatedExtraChars;
    
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
    const response: Response = await fetch(`${API_URL}/definition-reports`, {
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
    setReportClicked(isReported);
  }, [isReported, definitionId]);
  
  return (
    <ContentBoxView
      ref={postRef}
      sourceCredits={sourceCredits} sourceExamples={sourceExamples} sourcePronunciations={sourcePronunciations} definitionLanguage={definitionLanguage} dialect={dialect}
      definitionLanguages={definitionLanguages} showMissingMeaningPrompt={showMissingMeaningPrompt} addMeaningHref={wordId?`/add-definition?word=${canonicalWordId||wordId}`:undefined}
      item={item}
      lang={lang}
      countryCode={countryCode}
      countryName={countryName}
      alternateSpellings={alternateSpellings}
      arabicSpellings={arabicSpellings}
      francoSpellings={francoSpellings}
      arabicExample={arabicExample}
      definitionHuh={definitionHuh}
      example={example}
      wordHref={wordId ? `/word/${canonicalWordId||wordId}${lang==='ar'?'/ar':''}` : undefined}
      headingLevel={headingLevel}
      highlighted={index === 0}
      overlays={<>
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
      </>}
    >
      {index !== 0 && (
        <ContentBoxActions
          isLiked={likeClicked}
          isDisliked={dislikeClicked}
          isReported={reportClicked}
          pending={reaction.pending}
          viewHref={isAdvancedSearch ? `/word/${wordId}` : undefined}
          onLike={handleLikeClick}
          onDislike={handleDislikeClick}
          onShare={handleShareClick}
          onReport={handleReportClick}
          shareMenu={showTooltip && <div className="tooltiptext">
            <button type="button" onClick={handleInstagramShareClick}>Instagram</button>
            <button type="button" onClick={handleXShare}>X / Twitter</button>
          </div>}
        />
      )}
      <Snackbar open={!!reaction.error} message={reaction.error?.message || ''} />
      <Snackbar
        open={reportSnackbarOpen}
        message={t('content_box_buttons.repeated_report_error')}
      />
      <Snackbar
        open={mustLoginSnackbarOpen}
        message={t('login.must_login')}
      />
      <Snackbar
        open={instagramSnackbarOpen}
        message={t('content_box_buttons.instagram_download')}
      />
    </ContentBoxView>
  );
};

export default ContentBox;
