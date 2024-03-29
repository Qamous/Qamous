import React, { useState } from 'react';
import './SearchBar.scss';

const SearchBar: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        // Perform your search operation here
        console.log(`Searching for "${searchQuery}"`);
        // Reset the search field
        setSearchQuery('');
    };

    return (
        <form className="search-box" onSubmit={handleSearch}>
            <input
                type="text"
                placeholder=" "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="reset"></button>
        </form>
    );
}

export default SearchBar;