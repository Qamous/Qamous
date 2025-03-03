'use client';

import Link, { LinkProps } from 'next/link';
import './StyledNavLink.scss';
import * as variables from '../assets/Variables.module.scss';

interface StyledNavLinkProps extends LinkProps {
  language: string;
  themeMode: string;
  className?: string;
  children?: React.ReactNode;
}

const StyledNavLink: React.FC<StyledNavLinkProps> = ({ language, themeMode, className, children, ...props }) => {
  const letterSpacing = language === 'ar' ? '0' : '0.2em';
  const fontFamily = language === 'ar' ? variables.fontStackArabic : variables.fontStack;
  const isDarkMode = themeMode === 'dark';
  const shadow = isDarkMode ? '1px 1px 1px rgba(0, 0, 0, 0.25)' : 'none';
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <Link {...props} className={className} style={{ letterSpacing, fontFamily, textShadow: shadow, direction }}>
      {children}
    </Link>
  );
};

export default StyledNavLink;