import React from 'react';
import './ToolbarItems.scss';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ToolbarItems: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="toolbar-items">
            <nav>
                <ul>
                    <li>
                        <NavLink to="/">
                            {t('home')}
                        </NavLink>
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
