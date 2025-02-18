import React from 'react';
import './NotFound.scss';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className={'container'} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={'container-left'}>
        <img
          src="/unhappy-dog.jpg"
          loading="lazy"
          alt={'Unhappy Dog'}
          className={'container-left-image'}
        />
        <h1 className="not-found-text-header" style={{ width: '100%' }}>
          {t('page_not_found.404')}
        </h1>
        <p className="not-found-text" style={{ width: '100%' }}>
          {t('page_not_found.hmmm')}
        </p>
        <p className="not-found-text" style={{ width: '100%' }}>
          {t('page_not_found.text')}
        </p>
      </div>
    </div>
  );
};

export default NotFound;