import React from 'react';
import './App.scss';
import Header from './components/Header';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import WordOfTheDay from './components/pages/WordOfTheDay';
import Adverts from './components/Adverts';
import Home from './components/pages/Home';
import translationEN from './assets/en/translation.json';
import translationAR from './assets/ar/translation.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getCookie } from './assets/utils';
import PageUnderConstruction from './components/pages/PageUnderConstruction';
import LogIn from './components/pages/LogIn';
import SignUp from './components/pages/SignUp';
import AddWord from './components/pages/AddWord';

// Set the default language to English unless the user's browser language is Arabic
let defaultLanguage = 'en';
const navigatorLang = navigator.language.split('-')[0];
if (navigator.language && navigatorLang === "ar") {
  defaultLanguage = navigatorLang;
}

const resources = {
  en: {
    translation: translationEN,
    direction: 'ltr',
  },
  ar: {
    translation: translationAR,
    direction: 'rtl',
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getCookie('language') || defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <Home />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/advanced-search" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <PageUnderConstruction />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/word-of-the-day" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="ads">
              <Adverts />
            </div>
            <div className="content">
              <WordOfTheDay />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/advertise" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <PageUnderConstruction />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/add-definition" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <AddWord />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/login" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <LogIn />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
        <Route path="/signup" element={
          <div className="app">
            <div className="header">
              <Header />
            </div>
            <div className="content">
              <SignUp />
            </div>
            <div className="footer">
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
