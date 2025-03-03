import React, { ReactNode, useEffect, useState, Suspense, lazy } from 'react';
const ReactQueryDevtools = process.env.NODE_ENV === 'development'
  ? lazy(() => import('react-query/devtools').then(mod => ({ default: mod.ReactQueryDevtools })))
  : () => null;
const FontAwesomeIcon = lazy(() => import('@fortawesome/react-fontawesome').then(mod => ({ default: mod.FontAwesomeIcon })));
const Header = lazy(() => import('./components/Header'));
const Snackbar = lazy(() => import('./components/Snackbar'));
const Footer = lazy(() => import('./components/Footer'));
import './App.scss';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { getFunctionalCookie } from './assets/utils';import { faBug } from '@fortawesome/free-solid-svg-icons/faBug';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import translationEN from './assets/en/translation.json';
import translationAR from './assets/ar/translation.json';
// Adverts bar: Uncomment the following line to enable the adverts bar
// import Adverts from './components/Adverts';

// Lazy load all page components with dynamic imports
const Home = lazy(() => import(/* webpackPrefetch: true */ '../pages/Home'));
const WordOfTheDay = lazy(() => import(/* webpackPreload: true */ '../pages/WordOfTheDay'));
const LogIn = lazy(() => import(/* webpackPreload: true */ '../pages/LogIn'));
const SignUp = lazy(() => import(/* webpackPreload: true */ '../pages/SignUp'));

// Secondary routes with dynamic imports
const AddWord = lazy(() => import('../pages/AddWord'));
const SearchResults = lazy(() => import('../pages/SearchResults'));
const WordPage = lazy(() => import('../pages/WordPage'));
const UserProfile = lazy(() => import('../pages/UserProfile'));

// Less frequently accessed routes with dynamic imports
const AdvancedSearch = lazy(() => import('../pages/AdvancedSearch'));
const Blog = lazy(() => import('../pages/Blog'));
const About = lazy(() => import('../pages/About'));
const Chatbot = lazy(() => import('../pages/Chatbot'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const NotFound = lazy(() => import('../pages/NotFound'));
const PageUnderConstruction = lazy(() => import('../pages/PageUnderConstruction'));

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
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

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
  const [mustLoginSnackbarOpen, setMustLoginSnackbarOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { wordId, lang } = useParams<{ wordId: string; lang?: string }>();
  const location = useLocation();
  
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
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // const [passwordCorrect, setPasswordCorrect] = useState(true);
  // if (!passwordCorrect) {
  //   return <PasswordScreen onPasswordCorrect={() => setPasswordCorrect(true)} />;
  // }
  
  return (
    <div className="app">
      <QueryClientProvider client={queryClient}>
        <SpeedInsights />
        <Analytics />
        <div className="grain-texture"></div>
        <Header />
        <div className="content">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/advanced-search" element={<AdvancedSearch />} />
              <Route path="/advanced-search/:countryName" element={<AdvancedSearch />} />
              {/*<div className="ads">*/}
              {/*  <Adverts />*/}
              {/*</div>*/}
              <Route path="/feeling-lucky" element={<WordOfTheDay />} />
              <Route path="/advertise" element={<PageUnderConstruction />} />
              <Route path="/add-definition" element={
                <CheckUserLoggedOut setMustLoginSnackbarOpen={setMustLoginSnackbarOpen}>
                  <AddWord />
                </CheckUserLoggedOut>
              } />
              <Route path="/search/:query" element={<SearchResults />} />
              <Route path="/word/:wordId/:lang?" element={<WordPage />} />
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
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/profile" element={
                <CheckUserLoggedOut setMustLoginSnackbarOpen={setMustLoginSnackbarOpen}>
                  <UserProfile />
                </CheckUserLoggedOut>
              } />
              <Route path="/blog" element={<Blog />} />
              <Route path="/opportunities" element={<PageUnderConstruction />} />
              <Route path="/about" element={<About />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="*" element={<NotFound />} /> {/* Catch-all route */}
            </Routes>
          </Suspense>
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
        {/* Only in development mode */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </div>
  );
};

export default App;
