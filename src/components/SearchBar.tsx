import React, { useState } from 'react';
import './SearchBar.scss';

interface SearchBarProps {
    handleStateChange: (isExpanded: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ handleStateChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleClick = () => {
        setIsExpanded(!isExpanded);
        handleStateChange(isExpanded);
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
                    onClick={handleClick}
                />
            </form>
        </div>
    );
}

export default SearchBar;
