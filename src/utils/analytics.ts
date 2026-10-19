// Existing Qamous GA4 web stream, not a new property or a paid product.
export const MEASUREMENT_ID = 'G-434XST6YF3';
export const CONSENT_KEY = 'qamous.analytics-consent.v1';
type Consent = 'granted' | 'denied' | null;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  'ga-disable-G-434XST6YF3'?: boolean;
};
const analyticsWindow = () => window as AnalyticsWindow;
let initialized = false;
let previousPage = '';

export function privacySignal() {
  return navigator.doNotTrack === '1' || (navigator as Navigator & {globalPrivacyControl?: boolean}).globalPrivacyControl === true;
}

export function readConsent(): Consent {
  if (privacySignal()) return 'denied';
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch { return null; }
}

// Never send arbitrary paths, query strings, hashes, searches, profile identifiers,
// reset tokens, or page titles containing user-entered text to Google.
export function analyticsPage(pathname: string) {
  let path = '/other';
  if (/^\/(?:|about|blog|advanced-search|feeling-lucky|chatbot|login|signup|profile|forgot-password|add-definition|advertise|opportunities)\/?$/.test(pathname)) path = pathname.replace(/\/$/, '') || '/';
  else if (/^\/word\/\d+(?:\/(?:en|ar))?\/?$/.test(pathname)) path = pathname.replace(/\/$/, '');
  else if (/^\/advanced-search\/[A-Za-z-]+\/?$/.test(pathname)) path = '/advanced-search';
  else if (pathname.startsWith('/search/')) path = '/search';
  else if (pathname.startsWith('/reset-password/')) path = '/reset-password';
  return {page_location: `https://qamous.org${path}`, page_title: `Qamous — ${path === '/' ? 'Home' : path.split('/')[1]}`};
}

function command(...args: unknown[]) {
  const w = analyticsWindow();
  w.dataLayer ??= [];
  // gtag consumes Arguments objects, as in Google's official bootstrap.
  w.gtag ??= function () { w.dataLayer!.push(arguments); };
  w.gtag(...args);
}

export function setConsent(value: Exclude<Consent, null>) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* session-only choice */ }
  analyticsWindow()['ga-disable-G-434XST6YF3'] = value !== 'granted' || privacySignal();
  if (initialized) command('consent', 'update', {analytics_storage: value, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
  if (value === 'denied') {
    previousPage = '';
    for (const name of document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(n => /^_ga(?:_|$)/.test(n))) {
      for (const domain of ['', '; Domain=qamous.org', '; Domain=.qamous.org']) document.cookie = `${name}=; Max-Age=0; Path=/; Secure; SameSite=Lax${domain}`;
    }
  }
}

export function trackPage(pathname: string, allowed = readConsent() === 'granted') {
  if (!allowed || privacySignal() || location.hostname !== 'qamous.org') return;
  const page = analyticsPage(pathname);
  if (previousPage === page.page_location) return;
  analyticsWindow()['ga-disable-G-434XST6YF3'] = false;
  if (!initialized) {
    initialized = true;
    command('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    command('js', new Date());
    command('config', MEASUREMENT_ID, {...page, page_referrer: '', send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false});
    const script = document.createElement('script');
    script.id = 'qamous-google-analytics';
    script.async = true;
    script.referrerPolicy = 'origin';
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }
  command('set', {...page, page_referrer: previousPage});
  command('event', 'page_view', {...page, page_referrer: previousPage, send_to: MEASUREMENT_ID});
  previousPage = page.page_location;
}
