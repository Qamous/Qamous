import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.scss';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1300);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1300);
      if (window.innerWidth > 1300) {
        setIsOverlayOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
      setSearchQuery('');
      setIsExpanded(false);
      setIsOverlayOpen(false);
    }
  };

  const handleIconClick = () => {
    if (isMobile) {
      setIsOverlayOpen(true);
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 300);
    } else {
      setIsExpanded(true);
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 300);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsOverlayOpen(false);
    setSearchQuery('');
  };

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      isOverlayOpen
    ) {
      handleClose();
    }
  };

  // Desktop search bar
  const desktopSearchBar = (
    <div className={`search-container ${isExpanded ? 'expanded' : ''}`}>
      {!isExpanded ? (
        <div className="search-icon" onClick={handleIconClick}>
          <FontAwesomeIcon icon={faSearch} size="2x"/>
        </div>
      ) : (
        <form onSubmit={handleSearch} className="search-form">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <FontAwesomeIcon icon={faSearch}/>
          </button>
          <div className="search-close" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </div>
        </form>
      )}
    </div>
  );

  // Mobile search overlay
  const mobileSearchOverlay = (
    <div
      className={`search-overlay ${isOverlayOpen ? 'open' : ''}`}
      onClick={handleClickOutside}
    >
      <div className="search-overlay-content">
        <form onSubmit={handleSearch} className="search-form-mobile">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="search-input-mobile"
          />
          <button type="submit" className="search-button-mobile">
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <div className="search-close-mobile" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </div>
        </form>
      </div>
    </div>
  );

  // Search icon for mobile view
  const mobileSearchIcon = (
    <div className="search-icon-mobile" onClick={handleIconClick}>
      <FontAwesomeIcon icon={faSearch} size="2x"/>
    </div>
  );

  return (
    <>
      {isMobile ? mobileSearchIcon : desktopSearchBar}
      {mobileSearchOverlay}
    </>
  );
};

export default SearchBar;