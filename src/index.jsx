import React from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import Application, {makeQueryClient} from './rendering/Application';
import {createLanguage} from './rendering/i18n';
import {requestPreferences} from './rendering/preferences';
import {preloadRoute} from './App';
import './index.scss';
import './assets/Styles.scss';

const container = document.getElementById('root');
const serialized = document.getElementById('qamous-state');
const bootstrap = serialized ? JSON.parse(serialized.textContent) : requestPreferences(new URL(location.href), document.cookie, navigator.language);
const language = createLanguage(bootstrap.language);
const client = makeQueryClient();
await preloadRoute(location.pathname);
const tree = <React.StrictMode><BrowserRouter><Application bootstrap={bootstrap} client={client} language={language}/></BrowserRouter></React.StrictMode>;
if (container.hasAttribute('data-ssr')) {
  hydrateRoot(container, tree, {onRecoverableError(error, info) { console.error('Qamous hydration error', error, info.componentStack); }});
} else createRoot(container).render(tree);
