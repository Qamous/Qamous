import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import './SearchBar.scss';
const FontAwesomeIcon = lazy(() => import('@fortawesome/react-fontawesome/index.js').then(module => ({ default: module.FontAwesomeIcon })));
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  
  const closeSearch = () => {
    if (!isInputFocused) {
      const overlay = document.getElementById("myOverlay");
      if (overlay) {
        overlay.classList.remove("show");
        setTimeout(() => {
          overlay.style.display = "none";
        }, 300); // Match the transition duration
      }
    }
  };
  
  const openSearch = () => {
    const overlay = document.getElementById("myOverlay");
    if (overlay) {
      overlay.style.display = "block";
      // Trigger reflow to ensure the transition works
      overlay.offsetHeight;
      overlay.classList.add("show");
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
  
  // Handle clicks outside the search overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only handle clicks when the overlay is shown and in mobile view
      const overlay = document.getElementById("myOverlay");
      if (overlay && overlay.classList.contains("show") && window.innerWidth <= 1200) {
        // Check if the click was outside the search overlay content
        if (searchOverlayRef.current && !searchOverlayRef.current.contains(event.target as Node)) {
          closeSearch();
        }
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInputFocused]);
  
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
        <div className="search-overlay-content" ref={searchOverlayRef}>
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
            <span
              className="search-overlay-closebtn"
              onClick={closeSearch}
              title="Close Overlay"
            >
              <Suspense fallback={<span>&times;</span>}>
                <FontAwesomeIcon icon={faXmark} />
              </Suspense>
            </span>
          </form>
        </div>
      </div>
    </>
  );
}

export default SearchBar;