import React, { useState } from 'react';
import ToolbarItems from "./ToolbarItems";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from "react-router-dom";
import './Header.scss';
import { US, EG } from 'country-flag-icons/react/3x2'
import { DarkModeSwitch } from "react-toggle-dark-mode";
import styles from '../assets/Styles.scss';
import { setCookie, getCookie } from '../assets/utils';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
    const { i18n, t } = useTranslation();
    const root = document.documentElement;

    const [currentLang, setCurrentLang] =
        useState(getCookie('language') || "en");
    const [languageButtonStyle, setLanguageButtonStyle] =
        useState({ opacity: 1 });
    const [isDarkMode, setDarkMode] =
      React.useState<boolean>(getCookie('darkMode') === 'true' ?? true);

    const handleCountrySwitch = () => {
        // Toggle between US and EG on click
        setCurrentLang((prevLang) => {
            const lang = prevLang === 'en' ? 'ar' : 'en';
            // Save the language as a cookie
            setCookie('language', lang);
            // Actually change the language
            i18n.changeLanguage(lang);
            // document.documentElement.style.direction = i18n.getResourceBundle(
            //   lang,
            //   'direction'
            // );

            // Return the new country
            return lang;
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
    const setTheme = (isDarkMode: boolean): void => {
        root.style.setProperty('--primary-color', isDarkMode ? styles.primaryColorDark : styles.primaryColorLight);
        root.style.setProperty('--secondary-color', isDarkMode ? styles.secondaryColorDark : styles.secondaryColorLight);
        root.style.setProperty('--tertiary-color', isDarkMode ? styles.tertiaryColorDark : styles.tertiaryColorLight);
        root.style.setProperty('--quaternary-color', isDarkMode ? styles.quaternaryColorDark : styles.quaternaryColorLight);
        root.style.setProperty('--primary-color-90', isDarkMode ? styles.primaryColorNinetyDark : styles.primaryColorNinetyLight);
        root.style.setProperty('--header-border-color', isDarkMode ? styles.headerBorderColorDark : styles.headerBorderColorLight);
    };
    const toggleDarkMode = (checked: boolean) => {
        setDarkMode(checked);
        setCookie('darkMode', checked.toString());
    };
    setTheme(isDarkMode);

    return (
        <div className="header">
            <div className="header-left-side">
                <img
                  src={require("../assets/qamous-logo-transparent.png")}
                  alt={t("common_terms.qamous")}
                  loading="lazy"
                  title="This is Qamous for Arabic" /> {/* TODO: do more research on lazy loading for a faster experience */}
                <ToolbarItems
                  language={currentLang}
                  isDarkMode={isDarkMode}
                /> {/* Insert the ToolbarItems component above the SearchBar */}
            </div>

            <div className="header-right-side">
                <div
                    className="header-right-side-add">
                    <NavLink to="/add-definition">
                        <FontAwesomeIcon icon={faPlus} size="2x"/>
                    </NavLink>
                </div>

                <SearchBar />

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
                    {currentLang === 'en' ?
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

                <div className="header-right-side-user">
                    <NavLink to="/login">
                        <i className="fa-solid fa-user"></i>
                        <FontAwesomeIcon icon={faUser} size="xl"/>
                        {/*<img src={userImage} alt={t('common_terms.user')} />*/}
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default Header;
