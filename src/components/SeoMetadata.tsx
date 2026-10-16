import {Helmet} from 'react-helmet';
import {useLocation} from 'react-router-dom';

export function canonicalPath(pathname:string) {
  const trimmed=pathname.replace(/\/+$/,'')||'/';
  return trimmed.replace(/^(\/word\/\d+)\/en$/,'$1');
}
export function isPrivateOrUtilityPath(pathname:string) {
  return /^\/(?:login|signup|profile|add-definition|forgot-password|reset-password|chatbot|search|feeling-lucky)(?:\/|$)/.test(pathname);
}
export default function SeoMetadata() {
  const {pathname}=useLocation();
  const canonical='https://qamous.org'+canonicalPath(pathname);
  const preview=window.location.hostname.endsWith('.workers.dev');
  return <Helmet>
    <link rel="canonical" href={canonical}/>
    <meta property="og:url" content={canonical}/>
    <meta property="og:image" content="https://qamous.org/preview.png"/>
    <meta name="twitter:image" content="https://qamous.org/preview.png"/>
    <meta name="robots" content={preview||isPrivateOrUtilityPath(pathname)?'noindex, follow':'index, follow'}/>
  </Helmet>;
}
