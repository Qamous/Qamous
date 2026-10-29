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
// Only component code is shared between requests. Language, queries and user
// state still belong to each Application. Preloaded routes can render without
// suspending, avoiding the streaming renderer's extra work on a small CPU budget.
const loadedPages: Partial<Record<keyof typeof pageModules, React.ComponentType>> = {};
export const preloadRoute = async (path: string) => {
  const key = routeModule(path);
  const module = await pageModules[key]();
  loadedPages[key] = module.default;
};
function routePage(key: keyof typeof pageModules) {
  const LazyPage = lazy<React.ComponentType>(pageModules[key]);
  return function RoutePage() {
    const LoadedPage = loadedPages[key];
    return LoadedPage ? <LoadedPage /> : <LazyPage />;
  };
}
const Browse = routePage('browse');

// Lazy load all page components with dynamic imports
const Home = routePage('home');
const WordOfTheDay = routePage('lucky');
const LogIn = routePage('login');
const SignUp = routePage('signup');

// Secondary routes with dynamic imports
const AddWord = routePage('contribute');
const SearchResults = routePage('search');
const WordPage = routePage('word');
const UserProfile = routePage('profile');

// Less frequently accessed routes with dynamic imports
const AdvancedSearch = routePage('explore');
const Blog = routePage('blog');
const About = routePage('about');
const Chatbot = routePage('chatbot');
const ForgotPassword = routePage('forgot');
const ResetPassword = routePage('reset');
const NotFound = routePage('missing');
const Contributor = routePage('contributor');
const ImportPreview = import.meta.env.DEV ? lazy(() => import('../pages/ImportPreview')) : NotFound;
const PronunciationPreview = import.meta.env.DEV ? lazy(() => import('../pages/PronunciationPreview')) : NotFound;
const PageUnderConstruction = routePage('construction');

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
