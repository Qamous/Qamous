import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';

interface StyledNavLinkProps extends NavLinkProps {
  language: string;
}

const StyledNavLink: React.FC<StyledNavLinkProps> = ({ language, ...props }) => {
  const letterSpacing = language === 'ar' ? '0' : '0.2em';
  const fontFamily = language === 'ar' ? '$fontStackArabic' : '$fontStack';

  return (
    <NavLink {...props} style={{ letterSpacing: letterSpacing, fontFamily: fontFamily }} />
  );
};

export default StyledNavLink;