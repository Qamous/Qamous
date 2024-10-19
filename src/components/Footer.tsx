import './Footer.scss';
import i18n from 'i18next';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGithub, faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faHandHoldingMedical } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="footer">
      <p className="footer-copyright" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        {t('common.copyright')}
      </p>
      <div className="footer-links">
        <NavLink to="//francoarabic.com" target="_blank">
          {t('footer.franco_arabic_basics')}
        </NavLink>
        <NavLink to="/about">
          {t('footer.about')}
        </NavLink>
        <NavLink to="/blog">
          {t('footer.blog')}
        </NavLink>
      </div>
      <div className="footer-socials">
        <NavLink to="https://www.facebook.com/QamousAR/">
          <FontAwesomeIcon icon={faFacebookF} />
        </NavLink>
        <NavLink to="https://www.instagram.com/QamousAR/">
          <FontAwesomeIcon icon={faInstagram} />
        </NavLink>
        {/*<FontAwesomeIcon icon={faXTwitter} />*/}
        <NavLink to="https://github.com/Qamous">
          <FontAwesomeIcon icon={faGithub} />
        </NavLink>
        <NavLink to="mailto:QamousAR@gmail.com">
          <FontAwesomeIcon icon={faEnvelope} />
        </NavLink>
        <NavLink to="/about#buttons">
          <FontAwesomeIcon icon={faHandHoldingMedical} />
        </NavLink>
      </div>
    </footer>
  );
};

export default Footer;