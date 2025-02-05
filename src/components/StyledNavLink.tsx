import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import './StyledNavLink.scss';
import styles from '../assets/Styles.scss';

interface StyledNavLinkProps extends NavLinkProps {
  language: string;
  isDarkMode: boolean;
}

const StyledNavLink: React.FC<StyledNavLinkProps> = ({ language, isDarkMode, ...props }) => {
  const letterSpacing = language === 'ar' ? '0' : '0.2em';
  const fontFamily = language === 'ar' ? styles.fontStackArabic : styles.fontStack;
  const shadow = isDarkMode ? '1px 1px 1px rgba(0, 0, 0, 0.25)' : 'none';
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <NavLink {...props} style={{ letterSpacing: letterSpacing, fontFamily: fontFamily, textShadow: shadow, direction: direction }} />
  );
};

export default StyledNavLink;