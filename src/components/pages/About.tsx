import React from 'react';
import './About.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

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
      <a href="https://www.github.com/sponsors/anthonyyoussef01" className="about-sponsor" aria-label="Sponsor @anthonyyoussef01" data-hydro-click="{&quot;event_type&quot;:&quot;sponsors.button_click&quot;,&quot;payload&quot;:{&quot;button&quot;:&quot;DASHBOARD_NEXT_STEPS_PREVIEW_SPONSOR&quot;,&quot;sponsorable_login&quot;:&quot;anthonyyoussef01&quot;,&quot;originating_url&quot;:&quot;https://github.com/sponsors/anthonyyoussef01/dashboard&quot;,&quot;user_id&quot;:30884253}}" data-hydro-click-hmac="251cc7738c7d90cac44416b7e70f7ee41515a741b76b394a2bba9ac2970f6318" data-view-component="true" style={{outline: 'rgb(201, 209, 217) none 0px', boxShadow: 'none', backgroundColor: 'rgb(43, 48, 56)', borderColor: 'rgb(48, 54, 61)', color: 'rgb(201, 209, 217)', fill: 'rgb(141, 150, 160)', fontSize: '0.75rem', gap: '4px', height: '28px', minWidth: '28px', padding: '0px 8px', textDecoration: 'none solid rgb(201, 209, 217)', transitionDuration: '0.08s', alignItems: 'center', borderTopStyle: 'solid', borderTopWidth: '0.666667px', borderRightStyle: 'solid', borderRightWidth: '0.666667px', borderBottomStyle: 'solid', borderBottomWidth: '0.666667px', borderLeftStyle: 'solid', borderLeftWidth: '0.666667px', borderImageSource: 'none', borderImageSlice: '100%', borderImageWidth: 1, borderImageOutset: 0, borderImageRepeat: 'stretch', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', flexDirection: 'row', fontWeight: 500, justifyContent: 'space-between', position: 'relative', textAlign: 'center', transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)', transitionDelay: '0s', transitionProperty: 'color, fill, background-color, border-color', userSelect: 'none', outlineOffset: '-2px', boxSizing: 'border-box'}}> <span style={{alignItems: 'center', display: 'grid', flex: '1 0 auto', gridTemplateAreas: '"leadingVisual text trailingVisual"', gridTemplateColumns: 'min-content minmax(0px, auto) min-content', placeContent: 'center', boxSizing: 'border-box'}}>
        <span style={{lineHeight: '19.9992px', gridArea: 'text', whiteSpace: 'nowrap', boxSizing: 'border-box'}}><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" style={{overflow: 'visible', transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.13, 2) 0s', transform: 'matrix(1, 0, 0, 1, 0, 0)', marginRight: '4px', verticalAlign: 'middle', color: 'rgb(219, 97, 162)', animationName: 'pulse-in', animationDuration: '0.5s', display: 'inline-block', fill: 'rgb(219, 97, 162)', boxSizing: 'border-box'}}>
                <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z" style={{boxSizing: 'border-box'}}></path>
            </svg> <span style={{verticalAlign: 'middle', boxSizing: 'border-box', color: 'white'}}>
                {t('about.sponsor')}
            </span></span> </span> </a>
      <p>
        <br />
        {t('about.text_16')}
        <br /> <br/>
        {t('about.text_17')}
      </p>
    </div>
  );
};

export default About;