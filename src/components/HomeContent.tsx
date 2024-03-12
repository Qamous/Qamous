import React, { useEffect, useState } from 'react';
import './HomeContent.scss';
import Snackbar from './Snackbar';

interface HomeContentProps {
    item: {
        word: string,
        definition: string
    },
    index: number,
    lang: string
}

const HomeContent: React.FC<HomeContentProps> = ({ item, index, lang }) => {
    const [likeClicked, setLikeClicked] = useState(false);
    const [dislikeClicked, setDislikeClicked] = useState(false);
    const [reportClicked, setReportClicked] = useState(false);
    const [reportSnackbarOpen, setReportSnackbarOpen] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [excessiveClickSnackbarOpen, setExcessiveClickSnackbarOpen] = useState(false);

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
            setReportClicked(true);
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
        <div className={"h-content" +
            (index === 0 ? " h-content-first" : "") +
            (lang === 'ar' ? " h-content-ar" : " home-content-latin")}>
            <div className={"h-content-title"}>
                <h1>{item.word}</h1>
            </div>
            <div className={"h-content-description"}>
                <p>
                    {item.definition}
                </p>
            </div>
            {index !== 0 && (
              <div className="h-content-buttons">
                  <button
                    className={`h-content-buttons-like-button ${likeClicked ? 'clicked' : ''}`}
                    onClick={handleLikeClick}
                  >
                      Like
                  </button>
                  <button
                    className={`h-content-buttons-dislike-button ${dislikeClicked ? 'clicked' : ''}`}
                    onClick={handleDislikeClick}
                  >
                      Dislike
                  </button>
                  <button
                    className={`h-content-buttons-report-button ${reportClicked ? 'clicked' : ''}`}
                    onClick={handleReportClick}
                  >
                      Report
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
}

export default HomeContent;