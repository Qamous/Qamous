import React, {createContext, useContext} from 'react';

export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light' | 'grain';
export interface Preferences { language: Language; theme: Theme; notFoundPath?: string; now?: number }
export const PreferencesContext = createContext<Preferences>({language:'en', theme:'dark'});
export const usePreferences = () => useContext(PreferencesContext);

export function requestPreferences(url: URL, cookie = '', acceptLanguage = ''): Preferences {
  const cookies = new Map(cookie.split(';').map(part => {
    const at = part.indexOf('=');
    return [part.slice(0, at).trim(), part.slice(at + 1).trim()];
  }));
  const word = url.pathname.match(/^\/word\/\d+(?:\/(en|ar))?\/?$/);
  const browse = url.pathname.match(/^\/browse\/(en|ar)\/?$/);
  const language = word ? (word[1] === 'ar' ? 'ar' : 'en') : browse ? browse[1] as Language
    : cookies.get('language') === 'ar' ? 'ar' : cookies.get('language') === 'en' ? 'en'
    : /^ar\b/i.test(acceptLanguage) ? 'ar' : 'en';
  const value = cookies.get('themeMode');
  return {language, theme:value === 'light' || value === 'grain' ? value : 'dark'};
}
