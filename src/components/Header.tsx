import React, { useRef, useState, useEffect } from 'react';
import ToolbarItems from "./ToolbarItems";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from "react-router-dom";
import './Header.scss';
import { US, EG } from 'country-flag-icons/react/3x2'
import { DarkModeSwitch } from "react-toggle-dark-mode";
import styles from '../assets/Styles.scss';
import { setFunctionalCookie, getFunctionalCookie } from '../assets/utils';
import { useTranslation } from 'react-i18next';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const Header: React.FC = () => {
    const { i18n, t } = useTranslation();
    const root = document.documentElement;

    const [currentLang, setCurrentLang] =
        useState(getFunctionalCookie('language') || "en");
    const [languageButtonStyle, setLanguageButtonStyle] =
        useState({ opacity: 1 });
    const [isDarkMode, setDarkMode] =
      React.useState<boolean>(getFunctionalCookie('darkMode') === 'true' ?? true);
    const [change, setChange] = useState(false);

    const handleCountrySwitch = () => {
        // Toggle between US and EG on click
        setCurrentLang((prevLang) => {
            const lang = prevLang === 'en' ? 'ar' : 'en';
            // Save the language as a cookie
            setFunctionalCookie('language', lang);
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
        if (change)
            handleBurgerClick();
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
        root.style.setProperty('--primary-color-75', isDarkMode ? styles.primaryColorSeventyFiveDark : styles.primaryColorSeventyFiveLight);
        root.style.setProperty('--primary-color-50', isDarkMode ? styles.primaryColorFiftyDark : styles.primaryColorFiftyLight);
        root.style.setProperty('--primary-color-40', isDarkMode ? styles.primaryColorFortyDark : styles.primaryColorFortyLight);
        root.style.setProperty('--secondary-color-90', isDarkMode ? styles.secondaryColorNinetyDark : styles.secondaryColorNinetyLight);
        root.style.setProperty('--tertiary-color-90', isDarkMode ? styles.tertiaryColorNinetyDark : styles.tertiaryColorNinetyLight);
        root.style.setProperty('--header-border-color', isDarkMode ? styles.headerBorderColorDark : styles.headerBorderColorLight);
        root.style.setProperty('--icon-background-color', isDarkMode ? styles.iconBackgroundColorDark : styles.iconBackgroundColorLight);
    };
    const toggleDarkMode = (checked: boolean) => {
        setDarkMode(checked);
        setFunctionalCookie('darkMode', checked.toString());
        if (change)
            setTimeout(handleBurgerClick, 150);
    };
    setTheme(isDarkMode);

    const overlayNav = useRef<HTMLDivElement>(null);

    const openNav = () => {
        if (overlayNav.current) {
            overlayNav.current.style.width = "100%";
            overlayNav.current.style.opacity = "100%";
        }
    };

    const closeNav = () => {
        if (overlayNav.current) {
            overlayNav.current.style.width = "0%";
            overlayNav.current.style.opacity = "0.3";
        }
    };

    const handleBurgerClick = () => {
        setChange(!change);
        if (!change) {
            openNav();
        } else {
            closeNav();
        }
    };

    const [runTour, setRunTour] = useState(false);

    useEffect(() => {
        if (!getFunctionalCookie('tourCompleted')) {
            setRunTour(true);
        }
    }, []);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setFunctionalCookie('tourCompleted', 'true');
            setRunTour(false);
        }
    };
    
    const steps: Step[] = [
        {
            target: '.header-right-side-language',
            content: 'Click here to switch between Arabic and English. \n' +
              'اضغط هنا للتبديل بين العربية والإنجليزية.',
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.header-right-side-mode',
            content: 'Click here to switch between light and dark mode. \n' +
              'اضغط هنا للتبديل بين الوضع الفاتح والوضع الداكن.',
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.header-right-side-user',
            content: 'Click here to login or sign up. \n' +
              'اضغط هنا لتسجيل الدخول أو التسجيل.',
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.header-right-side-add',
            content: 'Click here to add a new word or definition. \n' +
              'اضغط هنا لإضافة كلمة أو تعريف جديد.',
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
    ];

    return (
      <>
          <Joyride
              steps={steps}
              run={runTour}
              continuous
              showSkipButton
              callback={handleJoyrideCallback}
              styles={{
                  options: {
                      primaryColor: '#dd8500',
                  },
                  tooltipContent: {
                      color: '#000000', // Ensure the tooltip content text color is black (in case of dark mode)
                  },
              }}
          />
          <div ref={overlayNav} className="nav-overlay">
              <div className="nav-overlay-content">
                  <NavLink
                    to="/"
                    onClick={handleBurgerClick}
                  >
                      {t('toolbar_items.home')}
                  </NavLink>
                  <NavLink
                    to="/advanced-search"
                    onClick={handleBurgerClick}
                  >
                      {t('toolbar_items.advanced_search')}
                  </NavLink>
                  <NavLink
                    to="/feeling-lucky"
                    onClick={handleBurgerClick}
                  >
                      {t('toolbar_items.word_of_the_day')}
                  </NavLink>
                  <NavLink
                    to="/advertise"
                    onClick={handleBurgerClick}
                  >
                      {t('toolbar_items.advertise')}
                  </NavLink>
                  <div
                    className="nav-overlay-content-bottom"
                  >
                      <DarkModeSwitch
                        className="nav-overlay-content-bottom-mode"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        moonColor="#bfbfbf"
                        sunColor="#dd8500"
                        size={30}
                      />

                      <div
                        className="nav-overlay-content-bottom-language"
                        onClick={handleCountrySwitch}
                        style={languageButtonStyle}
                      >
                          {currentLang === 'en' ?
                            <>
                                <US title="United States" />
                            </>
                            : <>
                                <EG title="Egypt" />
                            </>
                          }
                      </div>

                      <div className="nav-overlay-content-bottom-user">
                          <NavLink
                            to="/login"
                            onClick={handleBurgerClick}
                          >
                              <i className="fa-solid fa-user"></i>
                              <FontAwesomeIcon icon={faUser} size="sm"/>
                              {/*<img src={userImage} alt={t('common_terms.user')} />*/}
                          </NavLink>
                      </div>
                  </div>
              </div>
          </div>
          <div className="header">
              <div className="header-left-side">
                  <NavLink to="/">
                      <img
                        src={require('../assets/qamous-logo-transparent.png')}
                        alt={t('common_terms.qamous')}
                        loading="lazy"
                      /> {/* TODO: do more research on lazy loading for a faster experience */}
                  </NavLink>
                  <ToolbarItems
                    language={currentLang}
                    isDarkMode={isDarkMode}
                  /> {/* Insert the ToolbarItems component above the SearchBar */}
              </div>
              
              <div className="header-right-side">
                  <SearchBar />
                  
                  <div
                    className="header-right-side-add">
                      <NavLink to="/add-definition">
                          <FontAwesomeIcon icon={faPlus} size="2x" />
                      </NavLink>
                  </div>
                  
                  <div className="header-right-side-divider"></div>
                  
                  <div className="header-right-side-language"
                       onClick={handleCountrySwitch}
                       onMouseEnter={handleHover}
                       onMouseLeave={handleNoHover}
                       style={languageButtonStyle}>
                      {currentLang === 'en' ?
                        <>
                            <US title="United States" />
                            <p>EN</p>
                        </>
                        : <>
                            <EG title="Egypt" />
                            <p>AR</p>
                        </>
                      }
                  </div>
                  
                  <DarkModeSwitch
                    className="header-right-side-mode"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                    moonColor="#bfbfbf"
                    sunColor="#dd8500"
                  />
                  
                  <div className="header-right-side-user">
                      <NavLink to="/login">
                          <i className="fa-solid fa-user"></i>
                          <FontAwesomeIcon icon={faUser} size="xl" />
                          {/*<img src={userImage} alt={t('common_terms.user')} />*/}
                      </NavLink>
                  </div>
                  
                  {/* Burger menu */}
                  <nav
                    className={`header-right-side-burger ${change ? 'change' : ''}`}
                    role="navigation"
                    onClick={handleBurgerClick}
                  >
                      <div className="bar1"></div>
                      <div className="bar2"></div>
                      <div className="bar3"></div>
                  </nav>
              </div>
          </div>
      </>
    );
};

export default Header;
