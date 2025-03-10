import './Footer.scss';
import i18n from 'i18next';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons/faFacebookF';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faHandHoldingMedical } from '@fortawesome/free-solid-svg-icons/faHandHoldingMedical';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Check if user has scrolled to bottom with a slightly larger threshold
      // and ensure we're checking against the viewport height
      const isAtBottom = documentHeight - (scrollTop + windowHeight) < 20;
      
      if (isAtBottom) {
        setIsExpanded(true);
      } else if (documentHeight - (scrollTop + windowHeight) > 100) {
        // Only collapse when scrolled significantly away from bottom
        setIsExpanded(false);
      }
    };

    // Initial check when component mounts
    handleScroll();
    
    // Passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Also listen for resize events as they can change document height
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);
  
  return (
    <footer className={`footer ${isExpanded ? 'expanded' : ''}`}>
      <div className="footer-content">
        <div
          className={`footer-toggle-arrow ${isExpanded ? 'expanded' : ''}`}
          onClick={toggleExpanded}
          aria-label={isExpanded ? t('footer.collapse') : t('footer.expand')}
        >
          <FontAwesomeIcon icon={faChevronUp} />
        </div>
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