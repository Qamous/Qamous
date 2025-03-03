'use client';

import './Footer.scss';
import i18n from 'i18next';
import Link from 'next/link';
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
            <Link href="https://www.facebook.com/QamousAR/">
              <FontAwesomeIcon icon={faFacebookF} />
            </Link>
            <Link href="https://www.instagram.com/QamousAR/">
              <FontAwesomeIcon icon={faInstagram} />
            </Link>
            <Link href="https://github.com/Qamous">
              <FontAwesomeIcon icon={faGithub} />
            </Link>
            <Link href="mailto:QamousAR@gmail.com">
              <FontAwesomeIcon icon={faEnvelope} />
            </Link>
            <Link href="/about#buttons">
              <FontAwesomeIcon icon={faHandHoldingMedical} />
            </Link>
          </div>
        </div>
        <div className="footer-expanded">
          <div className="footer-links">
            <Link href="//francoarabic.com" target="_blank">
              {t('footer.franco_arabic_basics')}
            </Link>
            <Link href="/about">
              {t('footer.about')}
            </Link>
            <Link href="/advertise">
              {t('footer.advertise')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;