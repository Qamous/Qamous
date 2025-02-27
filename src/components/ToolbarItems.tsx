import React from 'react';
import './ToolbarItems.scss';
import { useTranslation } from 'react-i18next';
import StyledNavLink from './StyledNavLink';

interface ToolbarItemsProps {
    language: string
    themeMode: string
}

const ToolbarItems: React.FC<ToolbarItemsProps> = ({ language, themeMode }: ToolbarItemsProps) => {
    const { t } = useTranslation();
    
    return (
      <div className="toolbar-items">
          <nav>
              <ul>
                  <li>
                      <StyledNavLink to="/"
                                     language={language}
                                     themeMode={themeMode}
                      >
                          {t('toolbar_items.home')}
                      </StyledNavLink>
                  </li>
                  <li>
                      <StyledNavLink to="/feeling-lucky"
                                     language={language}
                                     themeMode={themeMode}
                      >
                          {t('toolbar_items.word_of_the_day')}
                      </StyledNavLink>
                  </li>
                  <li>
                      <StyledNavLink to="/advanced-search"
                                     language={language}
                                     themeMode={themeMode}
                        // className={'toolbar-items-not-built-yet'}
                      >
                          {t('toolbar_items.advanced_search')}
                      </StyledNavLink>
                  </li>
                  <li>
                      <StyledNavLink to="/blog"
                                     language={language}
                                     themeMode={themeMode}
                      >
                          {t('toolbar_items.blog')}
                      </StyledNavLink>
                  </li>
                  <li>
                      <StyledNavLink to="/chatbot"
                                     language={language}
                                     themeMode={themeMode}
                      >
                          {t('toolbar_items.chatbot')}
                      </StyledNavLink>
                  </li>
              </ul>
          </nav>
      </div>
    );
};

export default ToolbarItems;