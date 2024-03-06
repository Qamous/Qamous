import React from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
    const { t } = useTranslation();
    const sampleHome = t('sample_home', {
        returnObjects: true
    }) as {
        word: string,
        definition: string
    }[];

    return (
        <div className={"home"}>
            {sampleHome.map((item, index) => (
                <div key={index} className={"home-content" +
                  (index === 0 ? " home-content-first" : "")}>
                    <div className={"home-content-title"}>
                        <h1>{item.word}</h1>
                    </div>
                    <div className={"home-content-description"}>
                        <p>
                            {item.definition}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Home;