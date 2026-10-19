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
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const manuallyToggled = useRef(false);
  const ar = i18n.language?.startsWith('ar');
  
  const toggleExpanded = () => {
    manuallyToggled.current = true;
    setIsExpanded(value => !value);
  };

  useEffect(() => {
    const handleScroll = () => {
      // Phones open only on an explicit tap; never undo a manual choice on scroll.
      if (manuallyToggled.current || window.innerWidth < 600) return;
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
        <button type="button"
          className={`footer-toggle-arrow ${isExpanded ? 'expanded' : ''}`}
          onClick={toggleExpanded}
          aria-label={isExpanded ? (ar ? 'إغلاق روابط الموقع' : 'Collapse footer') : (ar ? 'عرض روابط الموقع' : 'Expand footer')}
          aria-expanded={isExpanded}
          aria-controls="footer-details"
        >
          <FontAwesomeIcon icon={faChevronUp} />
          <span className="footer-toggle-label">{isExpanded ? (ar ? 'أقل' : 'Less') : (ar ? 'المزيد' : 'More')}</span>
        </button>
        <div className="footer-minimal">
          <p className="footer-copyright" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            {t('common.copyright')}
          </p>
          <div className="footer-socials">
            <NavLink to="https://www.facebook.com/QamousAR/" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </NavLink>
            <NavLink to="https://www.instagram.com/QamousAR/" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </NavLink>
            <NavLink to="https://github.com/Qamous" aria-label="GitHub">
              <FontAwesomeIcon icon={faGithub} />
            </NavLink>
            <NavLink to="mailto:QamousAR@gmail.com" aria-label={ar ? 'تواصل معنا' : 'Email Qamous'}>
              <FontAwesomeIcon icon={faEnvelope} />
            </NavLink>
            <NavLink to="/about#buttons" aria-label={ar ? 'ادعم قاموس' : 'Support Qamous'}>
              <FontAwesomeIcon icon={faHandHoldingMedical} />
            </NavLink>
          </div>
        </div>
        <div className="footer-expanded" id="footer-details" aria-hidden={!isExpanded}>
          <div className="footer-links">
            <NavLink to="//francoarabic.com" target="_blank" tabIndex={isExpanded ? 0 : -1}>
              {t('footer.franco_arabic_basics')}
            </NavLink>
            <NavLink to="/about" tabIndex={isExpanded ? 0 : -1}>
              {t('footer.about')}
            </NavLink>
            <NavLink to="/advertise" tabIndex={isExpanded ? 0 : -1}>
              {t('footer.advertise')}
            </NavLink>
            <button className="footer-privacy" type="button" tabIndex={isExpanded ? 0 : -1} onClick={() => window.dispatchEvent(new Event('qamous:privacy-open'))}>
              {i18n.language?.startsWith('ar') ? 'الخصوصية' : 'Privacy'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
