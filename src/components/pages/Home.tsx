import React, { useState } from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import ContentBox from '../ContentBox';
import { useQuery } from 'react-query';

interface HomeContent {
    word: string,
    definition: string,
    likeCount: number,
    dislikeCount: number,
    likeDislikeDifference: number,
    isArabic: number,
    francoArabicWord: string,
    reportCount: number
}

interface JsonContent {
    word: string,
    definition: string
}

const fetchHomeContent = () =>
    fetch('http://localhost:3000/definitions/most-liked', {
        mode: 'cors',
        credentials: 'include',
    })
        .then(response => response.json());

const Home: React.FC = () => {
    const { t } = useTranslation();
    const sampleHome = t('sample_home', {
        returnObjects: true,
    }) as JsonContent[];
    const lang = i18n.language;

    const { data: homeContent, isLoading, isError } = useQuery<HomeContent[]>('homeContent', fetchHomeContent);

    if (isLoading) {
        return (
            <div className={'home'}>
                <ContentBox
                    item={sampleHome[0]}
                    index={0}
                    lang={lang}
                />
                <div className={'home lds-ring'}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        );
    }

    if (isError) {
        return <div className={'home'}>Error occurred while fetching data</div>;
    }

    return (
        <div className={'home'}>
            <ContentBox
                item={sampleHome[0]}
                index={0}
                lang={lang}
            />
            {homeContent && homeContent
                .filter(item => item.isArabic === (lang === 'ar' ? 1 : 0))
                .map((item, index) => (
                    <ContentBox
                        key={index + 1}
                        item={item}
                        index={index + 1}
                        lang={lang}
                    />
                ))}
        </div>
    );
};

export default Home;