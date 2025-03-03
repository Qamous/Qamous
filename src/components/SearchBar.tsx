import React, { useState, useEffect, lazy, Suspense } from 'react';
import './SearchBar.scss';
const FontAwesomeIcon = lazy(() => import('@fortawesome/react-fontawesome').then(module => ({ default: module.FontAwesomeIcon })));
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const closeSearch = () => {
    if (!isInputFocused) {
      const overlay = document.getElementById("myOverlay");
      if (overlay) {
        overlay.style.display = "none";
      }
    }
  };
  
  const openSearch = () => {
    const overlay = document.getElementById("myOverlay");
    if (overlay) {
      overlay.style.display = "block";
    }
  };
  
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search/${searchQuery}`);
    // Reset the search field after navigating
    setSearchQuery('');
    // Close the search bar after navigating
    closeSearch();
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1200) {
        openSearch();
      } else {
        closeSearch();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isInputFocused]);
  
  return (
    <>
      <div className="search-button" onClick={openSearch}>
        <button className="search-button-bar"></button>
      </div>
      <div id="myOverlay" className="search-overlay">
        <span
          className="search-overlay-closebtn"
          onClick={closeSearch}
          title="Close Overlay"
        >
          <Suspense fallback={<span>&times;</span>}>
            <FontAwesomeIcon icon={faXmark} />
          </Suspense>
        </span>
        <div className="search-overlay-content">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder=" "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)} // Set input focus state
              onBlur={() => setIsInputFocused(false)} // Reset input focus state
              onClick={(e) => e.stopPropagation()} // Prevent closing when input is clicked
            />
            <button type="reset" className="search-box-reset"></button>
            <button
              type="submit"
              className="search-box-submit"
            >
              {t('common.search')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SearchBar;