import './Footer.scss';
import i18n from 'i18next';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faHandHoldingMedical } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Check if user has scrolled to bottom
      setIsExpanded(documentHeight - (scrollTop + windowHeight) < 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <footer className={`footer ${isExpanded ? 'expanded' : ''}`}>
      <div className="footer-content">
        <div className="footer-minimal">
          <p className="footer-copyright" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            {t('common.copyright')}
          </p>
          <div className="footer-socials">
            <NavLink to="https://www.facebook.com/QamousAR/">
              <FontAwesomeIcon icon={faFacebookF} />
            </NavLink>
            <NavLink to="https://www.instagram.com/QamousAR/">
              <FontAwesomeIcon icon={faInstagram} />
            </NavLink>
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
        </div>
        <div className="footer-expanded">
          <div className="footer-links">
            <NavLink to="//francoarabic.com" target="_blank">
              {t('footer.franco_arabic_basics')}
            </NavLink>
            <NavLink to="/about">
              {t('footer.about')}
            </NavLink>
            <NavLink to="/advertise">
              {t('footer.advertise')}
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;