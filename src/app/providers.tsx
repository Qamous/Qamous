'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import { getFunctionalCookie } from '../assets/utils';
import translationEN from '../assets/en/translation.json';
import translationAR from '../assets/ar/translation.json';

// Set the default language to English unless the user's browser language is Arabic
let defaultLanguage = 'en';

// Initialize i18n instance
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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize i18next on the client side
    if (!i18n.isInitialized) {
      // Check browser language on client side
      if (typeof navigator !== 'undefined') {
        const navigatorLang = navigator.language.split('-')[0];
        if (navigator.language && navigatorLang === 'ar') {
          defaultLanguage = navigatorLang;
        }
      }

      i18n.use(initReactI18next).init({
        resources,
        lng: getFunctionalCookie('language') || defaultLanguage,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
    }
    setMounted(true);
  }, []);

  // Prevents hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}