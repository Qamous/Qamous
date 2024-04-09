import React, { useEffect, useState } from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import ContentBox from '../ContentBox';

interface HomeContent {
    word: string, // Add this line
    definition: string,
    likeCount: number,
    dislikeCount: number,
    likeDislikeDifference: number,
    isArabic: boolean,
    arabicWord: string,
    reportCount: number
}

interface JsonContent {
    word: string,
    definition: string
}

const Home: React.FC = () => {
    const { t } = useTranslation();
    const sampleHome = t('sample_home', {
        returnObjects: true
    }) as JsonContent[];
    const [homeContent, setHomeContent] = useState<JsonContent[]>(sampleHome);
    const lang = i18n.language;

    useEffect(() => {
        fetch('http://localhost:3000/definitions/most-liked', {
            mode: 'cors',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => setHomeContent([sampleHome[0], ...data]))
        .catch(error => console.error('Error:', error));
    }, []);
    console.log(homeContent);
    return (
        <div className={"home"}>
            {homeContent.map((item, index) => (
                <ContentBox
                  key={index}
                  item={item}
                  index={index}
                  lang={lang}
                />
            ))}
        </div>
    );
}

export default Home;