import React, { useEffect, useState } from 'react';
import './WordOfTheDay.scss';

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

const WordOfTheDay: React.FC = () => {
    const [arabicWordOfTheDay, setArabicWordOfTheDay] = useState<WordOfTheDayContent | null>(null);
    const [englishWordOfTheDay, setEnglishWordOfTheDay] = useState<WordOfTheDayContent | null>(null);

    useEffect(() => {
    fetch('http://localhost:3000/definitions/most-liked', {
        mode: 'cors',
        credentials: 'include',
    })
        .then(response => response.json())
        .then(data => {
            //randomize data order
            data.sort(() => Math.random() - 0.5);
            // Find the first Arabic word
            const arabicWord = data.find((word: WordOfTheDayContent) => word.isArabic === 1);

            // Find the English word that has the same definition as the Arabic word
            const englishWord = data.find((word: WordOfTheDayContent) => word.isArabic === 0 && word.wordId === arabicWord.wordId);

            setArabicWordOfTheDay(arabicWord);
            setEnglishWordOfTheDay(englishWord);
        })
        .catch(error => console.error('Error:', error));
}, []);

    return (
        <div className={'word-of-day'}>
            {arabicWordOfTheDay && englishWordOfTheDay && (
                <>
                    <p className={'word-of-day-word'} dir={'rtl'} lang={'ar'}>
                        {arabicWordOfTheDay.word}
                    </p>
                    <div className={'word-of-day-definition'}>
                        <p className={'word-of-day-definition-ar'} dir={'rtl'} lang={'ar'}>
                            {arabicWordOfTheDay.definition}
                        </p>
                        <p className={'word-of-day-definition-en'} lang={'en'}>
                            {englishWordOfTheDay.definition}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default WordOfTheDay;