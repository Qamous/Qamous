import React from 'react';
import ToolbarItems from "./ToolbarItems";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import './Header.css';

const Header: React.FC = () => {
    return (
        <div className="header">
            <ToolbarItems /> {/* Insert the ToolbarItems component above the SearchBar */}

            <div className="header-bottom">
                <SearchBar />

                <div className="header-bottom-add">
                    <NavLink to="/add-definition">
                        <FontAwesomeIcon icon={faPlus} size="2x" />
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default Header;
