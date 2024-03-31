import React from 'react';
import './Home.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import ContentBox from '../ContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';

interface HomeContent {
    word: string,
    definition: string
}

const Home: React.FC = () => {
    const { t } = useTranslation();
    const sampleHome = t('sample_home', {
        returnObjects: true
    }) as HomeContent[];
    // get language
    const lang = i18n.language;

    const handleReportClick = () => {
        const report = window.prompt("Please describe the issue you encountered:");
        if (report) {
            // TODO: send report to the server
            alert("Thank you for your report!");
        } else {
            alert("Report canceled.");
        }
    }
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
            <div
              className={"home-report"}
              onClick={handleReportClick}
            >
                <FontAwesomeIcon
                  icon={faBug}
                  size="1x"
                  className={"home-report-icon"}
                />
            </div>
        </div>
    );
}

export default Home;