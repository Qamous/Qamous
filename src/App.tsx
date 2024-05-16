import React, { ReactNode, useEffect, useState } from 'react';
import './App.scss';
import Header from './components/Header';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import WordOfTheDay from './components/pages/WordOfTheDay';
import Adverts from './components/Adverts';
import Home from './components/pages/Home';
import translationEN from './assets/en/translation.json';
import translationAR from './assets/ar/translation.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getFunctionalCookie } from './assets/utils';
import PageUnderConstruction from './components/pages/PageUnderConstruction';
import LogIn from './components/pages/LogIn';
import SignUp from './components/pages/SignUp';
import AddWord from './components/pages/AddWord';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import UserProfile from './components/pages/UserProfile';

// Set the default language to English unless the user's browser language is Arabic
let defaultLanguage = 'en';
const navigatorLang = navigator.language.split('-')[0];
if (navigator.language && navigatorLang === 'ar') {
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
  lng: getFunctionalCookie('language') || defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

interface CheckUserStatusProps {
  children: ReactNode;
}

const CheckUserStatus: React.FC<CheckUserStatusProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState(null);
  
  const checkUserStatus = async () => {
    const response = await fetch('http://localhost:3000/auth/session', {
      credentials: 'include', // Include credentials in the request
    });
    if (response.ok) {
      const { session, sessionId } = await response.json();
      if (session && sessionId && session.passport) {
        const { user } = session.passport;
        if (user) {
          //console.log("user", user);
          return user;
        }
      }
    }
    return null;
  };
  
  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/signup') {
      checkUserStatus().then(status => {
        setUserStatus(status);
        if (status) {
          navigate('/profile');
        }
      });
    }
  }, [location, navigate]);
  
  return userStatus == null ? <>{children}</> : null;
};

const App: React.FC = () => {
  const queryClient = new QueryClient();
  
  const handleReportClick = () => {
    // If a 'Bug Report Form' window is already open, the form submission will open in that existing window instead of
    // creating a new one.
    // If no window is open, a new window will be created.
    window.open('https://forms.gle/E91Ydr4aw68W5RWr7', 'Bug Report Form');
  };
  
  return (
    <QueryClientProvider client={queryClient}>
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
              {/*<div className="ads">*/}
              {/*  <Adverts />*/}
              {/*</div>*/}
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
            <CheckUserStatus>
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
            </CheckUserStatus>
          } />
          <Route path="/signup" element={
            <CheckUserStatus>
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
            </CheckUserStatus>
          } />
          <Route path="/forgot-password" element={
            <div className="app">
              <div className="header">
                <Header />
              </div>
              <div className="content">
                <ForgotPassword />
              </div>
              <div className="footer">
              </div>
            </div>
          } />
          <Route path="/reset-password/:token" element={
            <div className="app">
              <div className="header">
                <Header />
              </div>
              <div className="content">
                <ResetPassword />
              </div>
              <div className="footer">
              </div>
            </div>
          } />
          <Route path="/profile" element={
            <div className="app">
              <div className="header">
                <Header />
              </div>
              <div className="content">
                <UserProfile />
              </div>
              <div className="footer">
              </div>
            </div>
          } />
          <Route path="*" element={
            <div className="app">
              <div className="header">
                <Header />
              </div>
              <div className="not-found">
                <h1>
                  404 - Page not found
                </h1>
              </div>
              <div className="footer">
              </div>
            </div>
          } /> {/* Catch-all route */}
        </Routes>
        <div
          className={'report'}
          onClick={handleReportClick}
        >
          <FontAwesomeIcon
            icon={faBug}
            size="1x"
            className={'home-report-icon'}
          />
        </div>
      </BrowserRouter>
      {/* TODO: Only in the dev branch */}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
