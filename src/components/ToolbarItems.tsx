import React from 'react';
import './ToolbarItems.scss';
import { NavLink } from 'react-router-dom';

const ToolbarItems: React.FC = () => {

    return (
        <div className="toolbar-items">
            <nav>
                <ul>
                    <li>
                        <NavLink to="/">Home</NavLink>
                    </li>
                    <li>
                        <NavLink to="/advanced-search">Advanced Search</NavLink>
                    </li>
                    <li>
                        <NavLink to="/word-of-the-day">Word of the Day</NavLink>
                    </li>
                    <li>
                        <NavLink to="/advertise">Advertise</NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default ToolbarItems;
