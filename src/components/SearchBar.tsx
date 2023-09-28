import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const expand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="SearchBar">
            <form id="content" className={isExpanded ? 'on' : ''}>
                <input
                    type="text"
                    name="input"
                    className={`input ${isExpanded ? 'square' : ''}`}
                    id="search-input"
                />
                <button
                    type="reset"
                    className={`search ${isExpanded ? 'close' : ''}`}
                    id="search-btn"
                    onClick={expand}
                />
            </form>
        </div>
    );
}

export default SearchBar;
