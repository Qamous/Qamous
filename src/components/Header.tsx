import React, { useRef, useState, useEffect } from 'react';
import ToolbarItems from "./ToolbarItems";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from "react-router-dom";
import './Header.scss';
import { US, EG } from 'country-flag-icons/react/3x2'
import * as styles from '../assets/Styles.module.scss';
import { setFunctionalCookie, getFunctionalCookie } from '../assets/utils';
import { useTranslation } from 'react-i18next';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import qamousLogo from '../assets/qamous-logo-transparent.png';
import ThemeModeToggle from './ThemeModeToggle';

const Header: React.FC = () => {
    const { i18n, t } = useTranslation();
    const root = document.documentElement;
    const [currentLang, setCurrentLang] = useState(getFunctionalCookie('language') || "en");
    const [languageButtonStyle, setLanguageButtonStyle] = useState({ opacity: 1 });
    const [themeMode, setThemeMode] = useState(getFunctionalCookie('themeMode') || 'dark');
    const [change, setChange] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    
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
        if (change) handleBurgerClick();
    };
    
    const handleHover = () => {
        // Update opacity
        setLanguageButtonStyle((prevStyle) => ({ ...prevStyle, opacity: 0.5 }));
    };
    
    const handleNoHover = () => {
        // Update opacity
        setLanguageButtonStyle((prevStyle) => ({ ...prevStyle, opacity: 1 }));
    };
    
    const setTheme = (mode: string): void => {
      const isDarkMode: boolean = mode === 'dark';
      const isGrainMode: boolean = mode === 'grain';
        
        if (isGrainMode) {
            // Orange grainy mode colors from styles
            root.style.setProperty('--primary-color', styles.primaryColorGrain);
            root.style.setProperty('--secondary-color', styles.secondaryColorGrain);
            root.style.setProperty('--tertiary-color', styles.tertiaryColorGrain);
            root.style.setProperty('--quaternary-color', styles.quaternaryColorGrain);
            root.style.setProperty('--primary-color-90', styles.primaryColorNinetyGrain);
            root.style.setProperty('--primary-color-75', styles.primaryColorSeventyFiveGrain);
            root.style.setProperty('--primary-color-50', styles.primaryColorFiftyGrain);
            root.style.setProperty('--primary-color-40', styles.primaryColorFortyGrain);
            root.style.setProperty('--secondary-color-90', styles.secondaryColorNinetyGrain);
            root.style.setProperty('--tertiary-color-90', styles.tertiaryColorNinetyGrain);
            root.style.setProperty('--header-border-color', styles.headerBorderColorGrain);
            root.style.setProperty('--icon-background-color', styles.iconBackgroundColorGrain);
        } else {
            // Original dark/light mode logic
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
        }
    };
    
    const toggleThemeMode = () => {
        const nextMode = themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'grain' : 'dark';
        setThemeMode(nextMode);
        setFunctionalCookie('themeMode', nextMode);
        document.body.classList.remove('grain-mode');
        
        if (nextMode === 'grain') {
            document.body.classList.add('grain-mode');
        }
        
        setTheme(nextMode);
        if (change) setTimeout(handleBurgerClick, 150);
    };
    
    const overlayNav = useRef<HTMLDivElement>(null);
    const burgerMenuRef = useRef<HTMLDivElement>(null);
    
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
    
    useEffect(() => {
        setCurrentLang(i18n.language);
    }, [i18n.language]);
    
    const isPhone = window.innerWidth <= 1200;
    
    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, index, action } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
        
        if (finishedStatuses.includes(status)) {
            setFunctionalCookie('tourCompleted', 'true');
            setRunTour(false);
        }
        
        // Open the nav-overlay and add .change class when the burger menu step is clicked
        if (isPhone && index === 0 && action === 'next') {
            handleBurgerClick();
        }
    };
    
    const steps: Step[] = isPhone ? [
        {
            target: '.header-right-side-burger',
            content: `Click here to open the menu\nاضغط هنا لفتح القائمة`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.report',
            content: `Click here to report a bug or suggest an improvement\nاضغط هنا للإبلاغ عن خطأ أو اقتراح تحسين`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.nav-overlay-content-bottom-mode',
            content: `Click here to switch between light and dark mode\nاضغط هنا للتبديل بين الوضع الفاتح والوضع الداكن`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.nav-overlay-content-bottom-language',
            content: `Click here to switch between Arabic and English\nاضغط هنا للتبديل بين العربية والإنجليزية`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.nav-overlay-content-bottom-user',
            content: `Click here to login or sign up\nاضغط هنا لتسجيل الدخول أو التسجيل`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.header-right-side-add',
            content: `Click here to add a new word or definition\nاضغط هنا لإضافة كلمة أو تعريف جديد`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
    ] : [
        {
            target: '.header-right-side-language',
            content: `Click here to switch between Arabic and English\nاضغط هنا للتبديل بين العربية والإنجليزية`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.header-right-side-mode',
            content: `Click here to switch between light and dark mode\nاضغط هنا للتبديل بين الوضع الفاتح والوضع الداكن`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.header-right-side-user',
            content: `Click here to login or sign up\nاضغط هنا لتسجيل الدخول أو التسجيل`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.header-right-side-add',
            content: `Click here to add a new word or definition\nاضغط هنا لإضافة كلمة أو تعريف جديد`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
        {
            target: '.report',
            content: `Click here to report a bug or suggest an improvement\nاضغط هنا للإبلاغ عن خطأ أو اقتراح تحسين`,
            locale: {
                next: 'Next',
                back: 'Back',
                skip: 'Skip',
                last: 'Finish',
            },
        },
    ];
    
    useEffect(() => {
        const controlHeader = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY) { // scrolling down
                setIsHeaderVisible(false);
            } else { // scrolling up
                setIsHeaderVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', controlHeader);
        return () => window.removeEventListener('scroll', controlHeader);
    }, [lastScrollY]);
    
    useEffect(() => {
      const storedMode = getFunctionalCookie('themeMode') || 'dark';
      setThemeMode(storedMode);
      setTheme(storedMode);
      
      if (storedMode === 'grain') {
        document.body.classList.add('grain-mode');
      }
    }, []);

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
                  <NavLink to="/" onClick={handleBurgerClick}>
                      {t('toolbar_items.home')}
                  </NavLink>
                  <NavLink to="/advanced-search" onClick={handleBurgerClick}>
                      {t('toolbar_items.advanced_search')}
                  </NavLink>
                  <NavLink to="/feeling-lucky" onClick={handleBurgerClick}>
                      {t('toolbar_items.word_of_the_day')}
                  </NavLink>
                  <NavLink to="/blog" onClick={handleBurgerClick}>
                      {t('toolbar_items.blog')}
                  </NavLink>
                  <NavLink to="/chatbot" onClick={handleBurgerClick}>
                      {t('toolbar_items.chatbot')}
                  </NavLink>
                  <div className="nav-overlay-content-bottom">
                      <ThemeModeToggle
                        className="header-right-side-mode"
                        mode={themeMode}
                        onChange={toggleThemeMode}
                      />
                      
                      <div
                        className="nav-overlay-content-bottom-language"
                        onClick={handleCountrySwitch}
                        style={languageButtonStyle}
                      >
                          {currentLang === 'en' ? (
                            <>
                                <US title="United States" />
                            </>
                          ) : (
                            <>
                                <EG title="Egypt" />
                            </>
                          )}
                      </div>
                      
                      <div className="nav-overlay-content-bottom-user">
                          <NavLink to="/login" onClick={handleBurgerClick}>
                              <i className="fa-solid fa-user"></i>
                              <FontAwesomeIcon icon={faUser} size="sm"/>
                              {/*<img src={userImage} alt={t('common_terms.user')} />*/}
                          </NavLink>
                      </div>
                  </div>
              </div>
          </div>
          <div className={`header ${!isHeaderVisible ? 'header-hidden' : ''}`}>
              <div className="header-left-side">
                <NavLink to="/">
                    <img
                        src={qamousLogo}
                        alt={t('common_terms.qamous')}
                        loading="lazy"
                    /> {/* TODO: do more research on lazy loading for a faster experience */}
                </NavLink>
                  <ToolbarItems
                    language={currentLang}
                    themeMode={themeMode}
                  /> {/* Insert the ToolbarItems component above the SearchBar */}
              </div>
              
              <div className="header-right-side">
                  <SearchBar />
                  <div className="header-right-side-add">
                      <NavLink to="/add-definition">
                          <FontAwesomeIcon icon={faPlus} size="2x" />
                      </NavLink>
                  </div>
                  <div className="header-right-side-divider"></div>
                  <div
                    className="header-right-side-language"
                    onClick={handleCountrySwitch}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleNoHover}
                    style={languageButtonStyle}
                  >
                      {currentLang === 'en' ? (
                        <>
                            <US title="United States" />
                            <p>EN</p>
                        </>
                      ) : (
                        <>
                            <EG title="Egypt" />
                            <p>AR</p>
                        </>
                      )}
                  </div>
                  
                  <ThemeModeToggle
                    className="header-right-side-mode"
                    mode={themeMode}
                    onChange={toggleThemeMode}
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
                    ref={burgerMenuRef}
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