import React, {useState} from 'react';
import ToolbarItems from "./ToolbarItems";
import SearchBar from "./SearchBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import './Header.scss';
import { US, EG } from 'country-flag-icons/react/3x2'
import {DarkModeSwitch} from "react-toggle-dark-mode";

const Header: React.FC = () => {
    const [parentWidth, setHeaderPadding] =
        useState('0');
    const [currentCountry, setCurrentCountry] =
        useState('US');
    const [languageButtonStyle, setLanguageButtonStyle] =
        useState({ opacity: 1 });
    const [isDarkMode, setDarkMode] = React.useState(true);

    const handleSearchClick = (isExpanded: boolean) => {
        if (isExpanded)
            setHeaderPadding('0');
        else
            setHeaderPadding('540px');
    };
    const handleCountrySwitch = () => {
        // Toggle between US and EG on click
        setCurrentCountry((prevCountry) => (prevCountry === 'US' ? 'EG' : 'US'));
        setLanguageButtonStyle((prevStyle) => ({ ...prevStyle, opacity: 1 }));
    };
    const handleHover = () => {
        console.log('hello');
        // Update opacity
        setLanguageButtonStyle((prevStyle) => ({ ...prevStyle, opacity: 0.5 }));
    };
    const handleNoHover = () => {
        // Update opacity
        setLanguageButtonStyle((prevStyle) => ({ ...prevStyle, opacity: 1 }));
    };
    const toggleDarkMode = (checked: boolean) => {
        setDarkMode(checked);
    };
    return (
        <div className="header">
            <div className="header-left-side">
                <img src={require("../assets/qamous-logo-transparent.png")}  alt="Qamous" />
                <ToolbarItems /> {/* Insert the ToolbarItems component above the SearchBar */}
            </div>

            <div className="header-right-side">
                <div
                    className="header-right-side-add"
                    style={{paddingRight: parentWidth}}>
                    <NavLink to="/add-definition">
                        <FontAwesomeIcon icon={faPlus} size="2x"/>
                    </NavLink>
                </div>

                <SearchBar
                    handleStateChange={handleSearchClick}/>

                <DarkModeSwitch
                    className="header-right-side-mode"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                    moonColor="#bfbfbf"
                    sunColor="#dd8500"
                />
                {/*TODO: link the DarkModeSwitch to a light mode theme*/}

                <div className="header-right-side-language"
                     onClick={handleCountrySwitch}
                     onMouseEnter={handleHover}
                     onMouseLeave={handleNoHover}
                     style={languageButtonStyle}>
                    {currentCountry === 'US' ?
                        <>
                            <US title="United States"/>
                            <p>EN</p>
                        </>
                        : <>
                            <EG title="Egypt"/>
                            <p>AR</p>
                        </>
                    }
                </div>
                {/*TODO: link the language button to a language switch*/}
            </div>
        </div>
    );
};

export default Header;
