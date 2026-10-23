import { API_URL } from "./api";
import SeoMetadata from './components/SeoMetadata';
import {usePreferences} from './rendering/preferences';
import React, { ReactNode, useEffect, useState, Suspense, lazy } from 'react';
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('react-query/devtools').then(mod => ({ default: mod.ReactQueryDevtools })))
  : () => null;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FullScreenToggle from './components/FullScreenToggle';
import Header from './components/Header';
import Snackbar from './components/Snackbar';
import Footer from './components/Footer';
import './App.scss';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faBug } from '@fortawesome/free-solid-svg-icons/faBug';
// Import the ads loader utility
import { initAds } from './utils/deferAdsLoader';
// Adverts bar: Uncomment the following line to enable the adverts bar
// import Adverts from './components/Adverts';

export const pageModules = {
  home: () => import('../pages/Home'),
  lucky: () => import('../pages/WordOfTheDay'),
  login: () => import('../pages/LogIn'),
  signup: () => import('../pages/SignUp'),
  contribute: () => import('../pages/ContributionForm'),
  search: () => import('../pages/SearchResults'),
  word: () => import('../pages/WordPage'),
  profile: () => import('../pages/UserProfile'),
  explore: () => import('../pages/AdvancedSearch'),
  blog: () => import('../pages/Blog'),
  about: () => import('../pages/About'),
  chatbot: () => import('../pages/Chatbot'),
  forgot: () => import('../pages/ForgotPassword'),
  reset: () => import('../pages/ResetPassword'),
  missing: () => import('../pages/NotFound'),
  contributor: () => import('../pages/Contributor'),
  construction: () => import('../pages/PageUnderConstruction'),
  browse: () => import('../pages/Browse'),
};
export function routeModule(path: string): keyof typeof pageModules {
  if (path === '/') return 'home';
  for (const [prefix, name] of Object.entries({
    '/word/':'word', '/browse/':'browse', '/advanced-search':'explore', '/search/':'search',
    '/feeling-lucky':'lucky', '/login':'login', '/signup':'signup', '/profile':'profile',
    '/add-definition':'contribute', '/blog':'blog', '/about':'about', '/chatbot':'chatbot',
    '/forgot-password':'forgot', '/reset-password':'reset',
    '/contributors/':'contributor', '/advertise':'construction', '/opportunities':'construction',
  })) if (path === prefix || path.startsWith(prefix.endsWith('/') ? prefix : prefix + '/')) return name as keyof typeof pageModules;
  return 'missing';
}
export const preloadRoute = (path: string) => pageModules[routeModule(path)]();
const Browse = lazy(pageModules.browse);

// Lazy load all page components with dynamic imports
const Home = lazy(pageModules.home);
const WordOfTheDay = lazy(pageModules.lucky);
const LogIn = lazy(pageModules.login);
const SignUp = lazy(pageModules.signup);

// Secondary routes with dynamic imports
const AddWord = lazy(pageModules.contribute);
const SearchResults = lazy(pageModules.search);
const WordPage = lazy(pageModules.word);
const UserProfile = lazy(pageModules.profile);

// Less frequently accessed routes with dynamic imports
const AdvancedSearch = lazy(pageModules.explore);
const Blog = lazy(pageModules.blog);
const About = lazy(pageModules.about);
const Chatbot = lazy(pageModules.chatbot);
const ForgotPassword = lazy(pageModules.forgot);
const ResetPassword = lazy(pageModules.reset);
const NotFound = lazy(pageModules.missing);
const Contributor = lazy(pageModules.contributor);
const ImportPreview = import.meta.env.DEV ? lazy(() => import('../pages/ImportPreview')) : NotFound;
const PronunciationPreview = import.meta.env.DEV ? lazy(() => import('../pages/PronunciationPreview')) : NotFound;
const PageUnderConstruction = lazy(pageModules.construction);

interface CheckUserStatusProps {
  children: ReactNode;
}

const CheckUserLoggedIn: React.FC<CheckUserStatusProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const checkUserStatus = async () => {
    const response = await fetch(`${API_URL}/auth/session`, {
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
    const response = await fetch(`${API_URL}/auth/session`, {
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
// Import the dedicated LoadingSpinner component
import LoadingSpinner from './components/LoadingSpinner';

// Loading fallback component with improved error handling
const LoadingFallback = () => {
  // Use ErrorBoundary to catch any loading errors
  return <LoadingSpinner />;
};

const App: React.FC = () => {
  const [mustLoginSnackbarOpen, setMustLoginSnackbarOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { wordId, lang } = useParams<{ wordId: string; lang?: string }>();
  const location = useLocation();
  const {notFoundPath} = usePreferences();
  
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
  
  // Initialize deferred ad loading
  useEffect(() => {
    // Initialize ads with deferred loading
    if (!import.meta.env.DEV) initAds();
  }, []);
  
  // const [passwordCorrect, setPasswordCorrect] = useState(true);
  // if (!passwordCorrect) {
  //   return <PasswordScreen onPasswordCorrect={() => setPasswordCorrect(true)} />;
  // }
  
  return (
    <div className="app">
        <SeoMetadata />
        <div className="grain-texture"></div>
        <Header />
        <div className="content">
          {import.meta.env.VITE_PUBLIC_READ_ONLY === 'true' && <aside className="read-only-notice" role="status" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <p>{i18n.language === 'ar' ? 'يمكنك تصفح قاموس كالمعتاد. تسجيل الدخول والتصويت وإضافة التعريفات متوقفة مؤقتًا.' : 'You can browse Qamous as usual. Sign-in, voting and contributions are temporarily paused.'}</p>
          </aside>}
          <Suspense fallback={<LoadingFallback />}>
            {notFoundPath===location.pathname ? <NotFound/> : <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse/:language" element={<Browse />} />
              <Route path="/advanced-search" element={<AdvancedSearch />} />
              {import.meta.env.DEV && <Route path="/add-definition-preview" element={<AddWord />} />}
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
              <Route path="/contributors/:username" element={<Contributor />} />
              {import.meta.env.DEV && <Route path="/import-preview" element={<ImportPreview />} />}
              {import.meta.env.DEV && <Route path="/pronunciation-preview" element={<PronunciationPreview />} />}
              {import.meta.env.DEV && <Route path="/contribution-preview" element={<AddWord />} />}
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="*" element={<NotFound />} /> {/* Catch-all route */}
            </Routes>}
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
        <Suspense fallback={null}>
          <FullScreenToggle />
        </Suspense>
        <Footer />
        <Snackbar
          open={mustLoginSnackbarOpen}
          message={t('login.must_login')}
        />
        {/* Only in development mode */}
        {import.meta.env.DEV && <ReactQueryDevtools />}
    </div>
  );
};

export default App;
