import React, { useEffect, useState } from 'react';
import './WordOfTheDay.scss';
import { useQuery } from 'react-query';
import Snackbar from '../Snackbar';

interface WordOfTheDayContent {
    wordId: number,
    word: string,
    definition: string,
    likeCount: number,
    dislikeCount: number,
    likeDislikeDifference: number,
    isArabic: number,
    francoArabicWord: string,
    reportCount: number
}

const fetchWordOfTheDayContent = () =>
    fetch('http://localhost:3000/definitions/most-liked', {
        mode: 'cors',
        credentials: 'include',
    })
        .then(response => response.json());

const WordOfTheDay: React.FC = () => {
    const {
        data,
        isLoading,
        isError,
    } = useQuery<WordOfTheDayContent[]>('wordOfTheDayContent', fetchWordOfTheDayContent, {
        staleTime: 86400000, // 24 hours in milliseconds
        cacheTime: 100000000,
    });
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    useEffect(() => {
        if (isError) {
            setErrorSnackbarOpen(true);
            setTimeout(() => setErrorSnackbarOpen(false), 3000);
        }
    }, [isError]);


    if (isLoading) {
        return (
            <div className={'word-of-day'}>
                <div className={'loading-ring'}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={'word-of-day'}>
                <Snackbar open={errorSnackbarOpen} message={'Data fetching error occurred. Please try again later.'} />
            </div>
        );
    }

    //randomize data order
    data?.sort(() => Math.random() - 0.5);
    // Find the first Arabic word
    const arabicWord = data?.find((word: WordOfTheDayContent) => word.isArabic === 1);

    // Find the English word that has the same definition as the Arabic word
    const englishWord = data?.find((word: WordOfTheDayContent) => word.isArabic === 0 && word.wordId === arabicWord?.wordId);
    return (
        <div className={'word-of-day'}>
            {arabicWord && englishWord && (
                <>
                    <p className={'word-of-day-word'} dir={'rtl'} lang={'ar'}>
                        {arabicWord.word}
                    </p>
                    <div className={'word-of-day-definition'}>
                        <p className={'word-of-day-definition-ar'} dir={'rtl'} lang={'ar'}>
                            {arabicWord.definition}
                        </p>
                        <p className={'word-of-day-definition-en'} lang={'en'}>
                            {englishWord.definition}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default WordOfTheDay;