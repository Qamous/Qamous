import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import './StyledNavLink.scss';
import * as variables from '../assets/Variables.module.scss';

interface StyledNavLinkProps extends NavLinkProps {
  language: string;
  themeMode: string;
}

const StyledNavLink: React.FC<StyledNavLinkProps> = ({ language, themeMode, ...props }) => {
  const letterSpacing = language === 'ar' ? '0' : '0.2em';
  const fontFamily = language === 'ar' ? variables.fontStackArabic : variables.fontStack;
  const isDarkMode = themeMode === 'dark';
  const shadow = isDarkMode ? '1px 1px 1px rgba(0, 0, 0, 0.25)' : 'none';
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <NavLink {...props} style={{ letterSpacing: letterSpacing, fontFamily: fontFamily, textShadow: shadow, direction: direction }} />
  );
};

export default StyledNavLink;