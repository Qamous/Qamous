import React, {useState} from 'react';
import ToolbarItems from "./ToolbarItems";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import './Header.scss';
import { US, EG } from 'country-flag-icons/react/3x2'
import { DarkModeSwitch } from "react-toggle-dark-mode";
import styles from '../assets/Styles.scss';
import { setCookie, getCookie } from '../assets/utils';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
    const { i18n } = useTranslation();

    const [parentWidth, setHeaderPadding] =
        useState('0');
    const [currentCountry, setCurrentCountry] =
        useState('US');
    const [languageButtonStyle, setLanguageButtonStyle] =
        useState({ opacity: 1 });
    const [isDarkMode, setDarkMode] = React.useState(true);

    const handleSearchClick = (isExpanded: boolean) => {
        if (isExpanded)
            setHeaderPadding('0');
        else
            setHeaderPadding('540px');
    };
    const handleCountrySwitch = () => {
        // Toggle between US and EG on click
        setCurrentCountry((prevCountry) => {
            const newCountry = prevCountry === 'US' ? 'EG' : 'US';
            // Save the language as a cookie
            setCookie('language', newCountry);
            // Actually change the language
            i18n.changeLanguage(newCountry === 'US' ? 'en' : 'ar');
            return newCountry;
        });
        setLanguageButtonStyle((prevStyle) => ({ ...prevStyle, opacity: 1 }));
    };
    const handleHover = () => {
        // Update opacity
        setLanguageButtonStyle((prevStyle) => ({ ...prevStyle, opacity: 0.5 }));
    };
    const handleNoHover = () => {
        // Update opacity
        setLanguageButtonStyle((prevStyle) => ({ ...prevStyle, opacity: 1 }));
    };
    const toggleDarkMode = (checked: boolean) => {
        setDarkMode(checked);
        setCookie('darkMode', checked.toString());
        setTheme(checked);
    };

    React.useEffect(() => {
        // Load the dark mode and language settings from cookies
        const darkModeCookie = getCookie('darkMode');
        if (darkModeCookie !== null) {
            const isDarkMode = darkModeCookie === 'true';
            setDarkMode(isDarkMode);
            setTheme(isDarkMode);
        }
        // Load the language from cookies
        const languageCookie = getCookie('language');
        if (languageCookie !== null) {
            setCurrentCountry(languageCookie);
        }
    }, []);
    const setTheme = (isDarkMode: boolean): void => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', isDarkMode ? styles.primaryColorDark : styles.primaryColorLight);
        root.style.setProperty('--secondary-color', isDarkMode ? styles.secondaryColorDark : styles.secondaryColorLight);
        root.style.setProperty('--tertiary-color', isDarkMode ? styles.tertiaryColorDark : styles.tertiaryColorLight);
        root.style.setProperty('--quaternary-color', isDarkMode ? styles.quaternaryColorDark : styles.quaternaryColorLight);
        root.style.setProperty('--primary-color-90', isDarkMode ? styles.primaryColorNinetyDark : styles.primaryColorNinetyLight);
    };
    return (
        <div className="header">
            <div className="header-left-side">
                <img src={require("../assets/qamous-logo-transparent.png")}  alt="Qamous" />
                <ToolbarItems /> {/* Insert the ToolbarItems component above the SearchBar */}
            </div>

            <div className="header-right-side">
                <div
                    className="header-right-side-add"
                    style={{paddingRight: parentWidth}}>
                    <NavLink to="/add-definition">
                        <FontAwesomeIcon icon={faPlus} size="2x"/>
                    </NavLink>
                </div>

                <SearchBar
                    handleStateChange={handleSearchClick}/>

                <DarkModeSwitch
                    className="header-right-side-mode"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                    moonColor="#bfbfbf"
                    sunColor="#dd8500"
                />

                <div className="header-right-side-language"
                     onClick={handleCountrySwitch}
                     onMouseEnter={handleHover}
                     onMouseLeave={handleNoHover}
                     style={languageButtonStyle}>
                    {currentCountry === 'US' ?
                        <>
                            <US title="United States"/>
                            <p>EN</p>
                        </>
                        : <>
                            <EG title="Egypt"/>
                            <p>AR</p>
                        </>
                    }
                </div>
                {/*
                TODO: link the language button to a language switch
                Maybe use i18n?:
                https://www.honeybadger.io/blog/creating-multi-language-user-interface-with-react/
                */}
            </div>
        </div>
    );
};

export default Header;
