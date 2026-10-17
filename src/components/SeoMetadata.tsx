import {Helmet} from 'react-helmet';
import {useLocation} from 'react-router-dom';

export function canonicalPath(pathname:string) {
  const trimmed=pathname.replace(/\/+$/,'')||'/';
  if(/^\/(?:search|reset-password)\//.test(trimmed)) return '/'+trimmed.split('/')[1];
  return trimmed.replace(/^(\/word\/\d+)\/en$/,'$1');
}
export function isPrivateOrUtilityPath(pathname:string) {
  return /^\/(?:login|signup|profile|add-definition|forgot-password|reset-password|chatbot|search|feeling-lucky|advertise|opportunities|404)(?:\/|$)/.test(pathname);
}
export default function SeoMetadata() {
  const {pathname,search}=useLocation();
  const canonical='https://qamous.org'+canonicalPath(pathname);
  const preview=window.location.hostname.endsWith('.workers.dev');
  return <Helmet>
    <link rel="canonical" href={canonical}/>
    <meta property="og:url" content={canonical}/>
    <meta property="og:image" content="https://qamous.org/preview.png"/>
    <meta name="twitter:image" content="https://qamous.org/preview.png"/>
    <meta name="robots" content={preview||isPrivateOrUtilityPath(pathname)||(pathname.startsWith('/advanced-search')&&Boolean(search))?'noindex, follow':'index, follow'}/>
  </Helmet>;
}
