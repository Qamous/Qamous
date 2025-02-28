import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faMagic } from '@fortawesome/free-solid-svg-icons';
import './ThemeModeToggle.scss';

interface ThemeModeToggleProps {
  mode: string;
  onChange: () => void;
  className?: string;
}

const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({ mode, onChange, className = '' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(mode);

  useEffect(() => {
    // When mode changes, trigger animation
    if (currentIcon !== mode) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentIcon(mode);
        setIsAnimating(false);
      }, 800); // Significantly increased animation time
      return () => clearTimeout(timer);
    }
  }, [mode, currentIcon]);

  const handleClick = () => {
    setIsAnimating(true);
    onChange();
  };

  const getIcon = () => {
    switch (currentIcon) {
      case 'dark': return faMoon;
      case 'light': return faSun;
      default: return faMagic;
    }
  };

  const getIconColor = () => {
    switch (currentIcon) {
      case 'dark': return "#bfbfbf";
      case 'light': return "#dd8500";
      default: return "#b59155";
    }
  };

  return (
    <div
      className={`theme-toggle ${className} ${isAnimating ? 'animating' : ''}`}
      onClick={handleClick}
    >
      <FontAwesomeIcon
        icon={getIcon()}
        color={getIconColor()}
      />
    </div>
  );
};

export default ThemeModeToggle;