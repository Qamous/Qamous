import React, {useEffect} from 'react';
import {I18nextProvider} from 'react-i18next';
import type {i18n} from 'i18next';
import {HelmetProvider} from 'react-helmet-async';
import {Hydrate, QueryClient, QueryClientProvider, type DehydratedState} from 'react-query';
import App from '../App';
import AnalyticsConsent from '../components/AnalyticsConsent';
import {PreferencesContext, type Preferences} from './preferences';

export interface Bootstrap extends Preferences { queries?: DehydratedState }
export const makeQueryClient = () => new QueryClient({defaultOptions:{queries:{
  refetchOnWindowFocus:false, staleTime:5 * 60 * 1000, retry:false,
}}});

export default function Application({bootstrap, client, language, helmetContext}: {
  bootstrap: Bootstrap; client: QueryClient; language: i18n; helmetContext?: object;
}) {
  useEffect(() => { document.getElementById('root')?.setAttribute('data-hydrated', 'true'); }, []);
  useEffect(() => {
    const syncLanguage=()=>{document.documentElement.lang=language.language;};
    syncLanguage();language.on('languageChanged',syncLanguage);
    return ()=>{language.off('languageChanged',syncLanguage);};
  }, [language]);
  return <HelmetProvider context={helmetContext}>
    <PreferencesContext.Provider value={bootstrap}>
      <I18nextProvider i18n={language}>
        <QueryClientProvider client={client}>
          <Hydrate state={bootstrap.queries}><App/><AnalyticsConsent/></Hydrate>
        </QueryClientProvider>
      </I18nextProvider>
    </PreferencesContext.Provider>
  </HelmetProvider>;
}
