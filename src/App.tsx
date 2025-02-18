import React, { ReactNode, useEffect, useState } from 'react';
import './App.scss';
import Header from './components/Header';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import WordOfTheDay from '../pages/WordOfTheDay';
import Home from '../pages/Home';
import translationEN from './assets/en/translation.json';
import translationAR from './assets/ar/translation.json';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { getFunctionalCookie } from './assets/utils';
import PageUnderConstruction from '../pages/PageUnderConstruction';
import LogIn from '../pages/LogIn';
import SignUp from '../pages/SignUp';
import AddWord from '../pages/AddWord';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import UserProfile from '../pages/UserProfile';
import SearchResults from '../pages/SearchResults';
import NotFound from '../pages/NotFound';
import Snackbar from './components/Snackbar';
import WordPage from '../pages/WordPage';
import About from '../pages/About';
import Footer from './components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import Blog from '../pages/Blog';
import AdvancedSearch from '../pages/AdvancedSearch';
import Chatbot from '../pages/Chatbot';
// Adverts bar: Uncomment the following line to enable the adverts bar
// import Adverts from './components/Adverts';

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

const CheckUserLoggedIn: React.FC<CheckUserStatusProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const checkUserStatus = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/session`, {
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
        if (status) {
          navigate('/profile', { state: { user: status } });
        }
      });
    }
  }, [location, navigate]);
  
  return children ? <>{children}</> : null;
};

const CheckUserLoggedOut: React.FC<CheckUserStatusProps & {
  setMustLoginSnackbarOpen: (open: boolean) => void
}> = ({ children, setMustLoginSnackbarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const checkUserStatus = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/session`, {
      credentials: 'include',
    });
    if (response.ok) {
      const { session, sessionId } = await response.json();
      if (session && sessionId && session.passport) {
        const { user } = session.passport;
        if (user) {
          return user;
        }
      }
    }
    return null;
  };
  
  const handleMustLoginSnackbarOpen = () => {
    setMustLoginSnackbarOpen(true);
    // A delay to allow the state to propagate before the snackbar opens
    setTimeout(() => {
      setMustLoginSnackbarOpen(false);
    }, 3000);
  };
  
  useEffect(() => {
    checkUserStatus().then(status => {
      if (!status) {
        handleMustLoginSnackbarOpen();
        navigate('/login');
      }
    });
  }, [location, navigate]);
  
  return children ? <>{children}</> : null;
};

const App: React.FC = () => {
  const queryClient = new QueryClient();
  const [mustLoginSnackbarOpen, setMustLoginSnackbarOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { wordId, lang } = useParams<{ wordId: string; lang?: string }>();
  
  const handleReportClick = () => {
    // If a 'Bug Report Form' window is already open, the form submission will open in that existing window instead of
    // creating a new one.
    // If no window is open, a new window will be created.
    if (i18n.language === 'ar') {
      window.open('https://forms.gle/RLpZ56CngSzhGWQw9', 'Bug Report Form');
    } else {
      window.open('https://forms.gle/E91Ydr4aw68W5RWr7', 'Bug Report Form');
    }
  };
  
  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);
  
  // const [passwordCorrect, setPasswordCorrect] = useState(true);
  // if (!passwordCorrect) {
  //   return <PasswordScreen onPasswordCorrect={() => setPasswordCorrect(true)} />;
  // }
  
  return (
    <div className="app">
      <QueryClientProvider client={queryClient}>
        <SpeedInsights />
        <Analytics />
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={
              <Home />
            } />
            <Route path="/advanced-search" element={
              <AdvancedSearch />
            } />
            <Route path="/advanced-search/:countryName" element={
              <AdvancedSearch />
            } />
            {/*<div className="ads">*/}
            {/*  <Adverts />*/}
            {/*</div>*/}
            <Route path="/feeling-lucky" element={
              <WordOfTheDay />
            } />
            <Route path="/advertise" element={
              <PageUnderConstruction />
            } />
            <Route path="/add-definition" element={
              <CheckUserLoggedOut setMustLoginSnackbarOpen={setMustLoginSnackbarOpen}>
                <AddWord />
              </CheckUserLoggedOut>
            } />
            <Route path="/search/:query" element={
              <SearchResults />
            } />
            {/*
          TODO: Accept WordId or Word in Arabic or Word in Franco-Arabic
          <Route path="/word/:identifier" element={
          */}
            <Route path="/word/:wordId/:lang?" element={
              <WordPage />
            } />
            <Route path="/login" element={
              <CheckUserLoggedIn>
                <LogIn />
              </CheckUserLoggedIn>
            } />
            <Route path="/signup" element={
              <CheckUserLoggedIn>
                <SignUp />
              </CheckUserLoggedIn>
            } />
            <Route path="/forgot-password" element={
              <CheckUserLoggedIn>
                <ForgotPassword />
              </CheckUserLoggedIn>
            } />
            <Route path="/reset-password/:token" element={
              <ResetPassword />
            } />
            <Route path="/profile" element={
              <CheckUserLoggedOut setMustLoginSnackbarOpen={setMustLoginSnackbarOpen}>
                <UserProfile />
              </CheckUserLoggedOut>
            } />
            <Route path="/blog" element={
              <div className="app">
                <Blog />
              </div>
            } />
            <Route path="/opportunities" element={
              <PageUnderConstruction />
            } />
            <Route path="/about" element={
              <About />
            } />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="*" element={
              <NotFound />
            } /> {/* Catch-all route */}
          </Routes>
        </div>
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
        <Footer />
        <Snackbar
          open={mustLoginSnackbarOpen}
          message={t('login.must_login')}
        />
        {/* TODO: Only in the dev branch */}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </div>
  );
};

export default App;
