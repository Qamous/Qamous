import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faMagic } from '@fortawesome/free-solid-svg-icons';
import './ThemeModeToggle.scss';

interface ThemeModeToggleProps {
  mode: string;
  onChange: () => void;
  className?: string;
}

const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({ mode, onChange, className = '' }) => {
  return (
    <div className={`theme-toggle ${className}`} onClick={onChange}>
      <FontAwesomeIcon
        icon={mode === 'dark' ? faMoon : mode === 'light' ? faSun : faMagic}
        color={mode === 'dark' ? "#bfbfbf" : mode === 'light' ? "#dd8500" : "#ffffff"}
      />
    </div>
  );
};

export default ThemeModeToggle;