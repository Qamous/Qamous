import i18n from 'i18next';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons';
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
        <NavLink to="/opportunities">
          {t('footer.opportunities')}
        </NavLink>
      </div>
      <div className="footer-socials">
        <FontAwesomeIcon icon={faFacebookF} href="www.instagram.com" />
        <FontAwesomeIcon icon={faInstagram} href="www.instagram.com" />
        <FontAwesomeIcon icon={faXTwitter} href="www.instagram.com" />
        <FontAwesomeIcon icon={faEnvelope} href="www.instagram.com" />
        <FontAwesomeIcon icon={faHandHoldingMedical} href="www.instagram.com" />
      </div>
    </footer>
  );
}

export default Footer;