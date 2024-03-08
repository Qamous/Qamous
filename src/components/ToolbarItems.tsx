import React from 'react';
import './ToolbarItems.scss';
import { useTranslation } from 'react-i18next';
import StyledNavLink from './StyledNavLink';

interface ToolbarItemsProps {
    language: string
}

const ToolbarItems: React.FC<ToolbarItemsProps> = ({ language }: ToolbarItemsProps) => {
    const { t } = useTranslation();

    return (
        <div className="toolbar-items">
            <nav>
                <ul>
                    <li>
                        <StyledNavLink to="/"
                                       language={language}
                        >
                            {t('toolbar_items.home')}
                        </StyledNavLink>
                    </li>
                    <li>
                        <StyledNavLink to="/advanced-search"
                                       language={language}
                        >
                            {t('toolbar_items.advanced_search')}
                        </StyledNavLink>
                    </li>
                    <li>
                        <StyledNavLink to="/word-of-the-day"
                                       language={language}
                        >
                            {t('toolbar_items.word_of_the_day')}
                        </StyledNavLink>
                    </li>
                    <li>
                        <StyledNavLink to="/advertise"
                                       language={language}
                        >
                            {t('toolbar_items.advertise')}
                        </StyledNavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default ToolbarItems;