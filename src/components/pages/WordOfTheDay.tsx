import React, { useEffect, useState } from 'react';
import './WordOfTheDay.scss';
import { useQuery } from 'react-query';
import Snackbar from '../Snackbar';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

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

// TODO: use a different api endpoint to fetch the word of the day content, this
//  one does a lot of calculations
const fetchWordOfTheDayContent = () =>
    fetch(`${process.env.REACT_APP_API_URL}/definitions/most-liked?page=${1}&limit=${10}`, {
        mode: 'cors',
        credentials: 'include',
    })
        .then(response => response.json());

const WordOfTheDay: React.FC = () => {
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const { t } = useTranslation();
    
    const {
        data,
        isLoading,
        isError,
    } = useQuery<WordOfTheDayContent[]>('wordOfTheDayContent', fetchWordOfTheDayContent, {
        staleTime: 86400000, // 24 hours in milliseconds
        cacheTime: 100000000,
    });
    useEffect(() => {
        if (isError) {
            setErrorSnackbarOpen(false);
            // A delay to allow the state to propagate before the snackbar opens
            setTimeout(() => {
                setErrorSnackbarOpen(true);
            }, 100);
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
                <Snackbar
                  open={errorSnackbarOpen}
                  message={t('common.data_fetch_error')}
                />
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
            <Helmet>
                <title>Word of the Day - Enhance Your Vocabulary with Franco Arabic Slang</title>
                <meta name="description" content="Discover the word of the day in both Arabic and English. Enhance your vocabulary with detailed definitions, usage examples, and more." />
                <meta name="keywords" content="word of the day, Arabic words, English words, vocabulary, definitions, translations, language learning" />
            </Helmet>
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