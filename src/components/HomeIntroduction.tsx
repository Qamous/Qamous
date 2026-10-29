import {Link} from 'react-router-dom';
import PageMetadata from './PageMetadata';
import {jsonLd} from '../../cloudflare/seo-content.mjs';

const website = {
  '@context':'https://schema.org', '@type':'WebSite', '@id':'https://qamous.org/#website',
  url:'https://qamous.org/', name:'Qamous', alternateName:'قاموس', inLanguage:['en','ar'],
};
const dialects = [
  {path:'Egypt',en:'Egyptian Arabic',ar:'العامية المصرية'},
  {path:'Lebanon',en:'Lebanese Arabic',ar:'اللهجة اللبنانية'},
  {path:'Saudi Arabia',en:'Saudi Arabic',ar:'اللهجة السعودية'},
  {path:'Morocco',en:'Moroccan Darija',ar:'الدارجة المغربية'},
];

export default function HomeIntroduction({language}:{language:string}) {
  const ar = language === 'ar';
  const description = ar
    ? 'ابحث عن معاني الكلمات والتعبيرات العربية بالمصرية والشامية والخليجية والمغاربية. اقرأ الشروح والأمثلة بالعربية والإنجليزية وكتابة الفرانكو في قاموس.'
    : 'Find Arabic words and slang meanings across Egyptian, Levantine, Gulf and Maghrebi dialects, with English and Arabic definitions, examples and Franco-Arabic spellings.';
  return <section className="home-introduction" dir={ar?'rtl':'ltr'} aria-labelledby="home-title">
    <PageMetadata>
      <title>{ar?'قاموس Qamous | معجم اللهجات العربية ومعاني الكلمات':'Qamous | Arabic Dialect Dictionary & Slang Meanings'}</title>
      <meta name="description" content={description}/>
      <script type="application/ld+json">{jsonLd(website)}</script>
    </PageMetadata>
    <p className="home-brand">Qamous <span lang="ar">قاموس</span></p>
    <h1 id="home-title">{ar?'كلمات عربية ومعانيها اليومية':'Arabic words and everyday meanings'}</h1>
    <p>{description}</p>
    <nav className="home-browse-links" aria-label={ar?'تصفح القاموس':'Browse the dictionary'}>
      <Link to="/browse/en">{ar?'تصفح المعاني بالإنجليزية':'Browse English meanings'}</Link>
      <Link to="/browse/ar">{ar?'تصفح المعاني بالعربية':'Browse Arabic meanings'}</Link>
    </nav>
    <nav className="home-dialect-links" aria-label={ar?'استكشف اللهجات':'Explore Arabic dialects'}>
      {dialects.map(dialect=><Link key={dialect.path} to={'/advanced-search/'+encodeURIComponent(dialect.path)}>{ar?dialect.ar:dialect.en}</Link>)}
      <Link to="/advanced-search">{ar?'كل اللهجات':'All dialects'}</Link>
    </nav>
  </section>;
}
