import React, { useState } from 'react';
import './SearchBar.scss';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const closeSearch = () => {
    const overlay = document.getElementById("myOverlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  };

  const openSearch = () => {
    const overlay = document.getElementById("myOverlay");
    if (overlay) {
      overlay.style.display = "block";
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    if (window.innerWidth < 1200) {
      openSearch();
    }
    event.preventDefault();
    // Perform your search operation here
    console.log(`Searching for "${searchQuery}"`);
    // Reset the search field
    setSearchQuery('');
  };

  window.addEventListener('resize', function() {
    if (window.innerWidth > 1200) {
      openSearch();
    } else {
      closeSearch();
    }
  });
  return (
    <>
      <button
        className="search-button"
        placeholder=" "
        onClick={openSearch}
      >
        <button
          className="search-button-bar"
          onClick={openSearch}
        >
        </button>
      </button>
      <div id="myOverlay" className="search-overlay">
        <span
          className="search-overlay-closebtn"
          onClick={closeSearch}
          title="Close Overlay"
        >
          x
        </span>
        <div className="search-overlay-content">
          <form className="search-box" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder=" "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="reset" className="search-box-reset"></button>
            <button type="submit" className="search-box-submit">
              <i className="fa fa-search"></i>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SearchBar;