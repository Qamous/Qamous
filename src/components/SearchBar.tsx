import React from 'react';
import './SearchBar.scss';

const SearchBar: React.FC = () => {
    return (
        <form className="search-box">
            <input type="text" placeholder=" " />
            <button type="reset"></button>
        </form>
    );
}

export default SearchBar;
