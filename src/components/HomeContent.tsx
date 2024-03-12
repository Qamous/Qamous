import React, { useState } from 'react';
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
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const handleLikeClick = () => {
        setLikeClicked(!likeClicked);
        if (dislikeClicked) setDislikeClicked(false);
    };

    const handleDislikeClick = () => {
        setDislikeClicked(!dislikeClicked);
        if (likeClicked) setLikeClicked(false);
    };

    const handleReportClick = () => {
        if (reportClicked) {
            setSnackbarOpen(true);
            setTimeout(() => setSnackbarOpen(false), 3000);
        } else {
            setReportClicked(true);
        }
    }

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
              open={snackbarOpen}
              message="You are unable to report the same word more than once"
            />
        </div>
    );
}

export default HomeContent;