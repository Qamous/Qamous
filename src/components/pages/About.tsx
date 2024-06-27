import React from 'react';
import './About.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';

const About: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={'about'} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="about-hero">
        <div className="about-hero-txt">
          <h1>{t('about.title')}</h1>
          <p>
            {t('about.text_1')}
            <a href="http://www.elkommos.me"
               target="_blank"
               rel="noopener noreferrer">
              {t('about.founder')}
            </a>
            {t('about.text_2')}
          </p>
        </div>
        <div className="about-hero-img">
          <img className="about-hero-img-pic" src="./oud.webp"></img>
        </div>
      </div>
      <p>
        {t('about.text_3')}
        <a href="https://github.com/Qamous/Qamous"
           target="_blank"
           rel="noopener noreferrer">
          {t('about.github')}
        </a>
        {t('about.text_4')}
        <br /><br />
        <h2 style={{ margin: 0, textDecoration: 'underline' }}>
          {t('about.text_5')}
        </h2>
        <span style={{ fontWeight: 'bold' }}>
          {t('about.text_6')}
        </span>
        <br />
        {t('about.text_7')}
        <br />
        <span style={{ fontWeight: 'bold' }}>
          {t('about.text_8')}
        </span>
        <br />
        {t('about.text_9')}
        <br />
        <span style={{ fontWeight: 'bold' }}>
          {t('about.text_10')}
        </span>
        <br />
        {t('about.text_11')}
        <a
          href="https://github.com/Qamous/Qamous"
          target="_blank"
          rel="noopener noreferrer">
          {t('about.text_12')}
        </a>
        {t('about.text_13')}
        <br />
        <span style={{ fontWeight: 'bold' }}>
          {t('about.text_14')}
        </span>
        <br />
        {t('about.text_15')}
      </p>
      <div className="buttons buttons-evenly">
        <a
          href="https://www.github.com/sponsors/anthonyyoussef01"
          className="about-sponsor"
        >
          <button
            className="profile-post-buttons-button profile-post-buttons-button"
          >
            <svg
              aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"
              style={{
                overflow: 'visible',
                transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.13, 2) 0s',
                transform: 'matrix(1, 0, 0, 1, 0, 0)',
                marginRight: '4px',
                verticalAlign: 'middle',
                color: 'rgb(219, 97, 162)',
                animationName: 'pulse-in',
                animationDuration: '0.5s',
                display: 'inline-block',
                fill: 'rgb(219, 97, 162)',
                boxSizing: 'border-box',
              }}>
              <path
                d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"
                style={{ boxSizing: 'border-box' }}></path>
            </svg>
            Support on GitHub
          </button>
        </a>
        <a
          href="https://www.buymeacoffee.com/qamous"
          className="about-sponsor"
        >
          <button
            className="profile-post-buttons-button profile-post-buttons-button"
          >
            ☕
            Buy Me a Coffee
          </button>
        </a>
      </div>
      
      <p>
        <br />
        {t('about.text_16')}
        <br /> <br />
        {t('about.text_17')}
      </p>
    </div>
  );
};

export default About;