import React from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import ContentBox from '../ContentBox';

const Home: React.FC = () => {
    const { t } = useTranslation();
    const sampleHome = t('sample_home', {
        returnObjects: true
    }) as {
        word: string,
        definition: string
    }[];
    // get language
    const lang = i18n.language;

    return (
        <div className={"home"}>
            {sampleHome.map((item, index) => (
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