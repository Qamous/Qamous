import {Helmet} from 'react-helmet-async';
import {usePreferences} from '../rendering/preferences';
import {useLocation} from 'react-router-dom';

export function canonicalPath(pathname:string) {
  const trimmed=pathname.replace(/\/+$/,'')||'/';
  if(/^\/(?:search|reset-password)\//.test(trimmed)) return '/'+trimmed.split('/')[1];
  return trimmed.replace(/^(\/word\/\d+)\/en$/,'$1');
}
export function isPrivateOrUtilityPath(pathname:string) {
  return /^\/(?:login|signup|profile|add-definition|forgot-password|reset-password|chatbot|search|feeling-lucky|advertise|opportunities|contributors|404)(?:\/|$)/.test(pathname);
}
export default function SeoMetadata() {
  const {pathname,search}=useLocation();
  const {notFoundPath}=usePreferences();
  const missing=notFoundPath===pathname;
  const canonical='https://qamous.org'+canonicalPath(pathname);
  const preview=typeof window !== 'undefined' && window.location.hostname.endsWith('.workers.dev');
  const wordPage=/^\/word\/\d+(?:\/(?:en|ar))?\/?$/.test(pathname);
  return <Helmet>
    <title>Qamous</title>
    <meta property="og:site_name" content="Qamous"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="description" content="Arabic dialect dictionary and community."/>
    {!wordPage&&!missing&&<link rel="canonical" href={canonical}/>}
    {!wordPage&&!missing&&<meta property="og:url" content={canonical}/>}
    <meta property="og:image" content="https://qamous.org/preview.png"/>
    <meta name="twitter:image" content="https://qamous.org/preview.png"/>
    {(!wordPage||missing)&&<meta name="robots" content={missing||preview||isPrivateOrUtilityPath(pathname)||(pathname.startsWith('/advanced-search')&&Boolean(search))?'noindex, follow':'index, follow'}/>}
  </Helmet>;
}
