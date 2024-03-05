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
                            {t('toolbar_items.home')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/advanced-search">
                            {t('toolbar_items.advanced_search')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/word-of-the-day">
                            {t('toolbar_items.word_of_the_day')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/advertise">
                            {t('toolbar_items.advertise')}
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default ToolbarItems;
