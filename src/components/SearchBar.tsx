import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchBar.scss';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
      setSearchQuery('');
      setIsOverlayOpen(false);
    }
  };

  const handleIconClick = () => {
    setIsOverlayOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 300);
  };

  const handleClose = () => {
    setIsOverlayOpen(false);
    setSearchQuery('');
  };

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && isOverlayOpen) {
      handleClose();
    }
  };

  return (
    <>
      <div className="search-icon" onClick={handleIconClick}>
        <FontAwesomeIcon icon={faSearch} size="2x"/>
      </div>
      
      <div
        className={`search-overlay ${isOverlayOpen ? 'open' : ''}`}
        onClick={handleClickOutside}
      >
        <div className="search-overlay-content">
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
              <FontAwesomeIcon icon={faSearch} />
            </button>
            <div className="search-close" onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SearchBar;