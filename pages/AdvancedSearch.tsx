import type { ProvenanceContent } from '../src/types/provenance';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBookOpen, faCheck, faChevronDown, faSearch, faSliders, faTimes } from '@fortawesome/free-solid-svg-icons';
import ReactCountryFlag from 'react-country-flag';
import { API_URL, apiJson } from '../src/api';
import ContentBox from '../src/components/ContentBox';
import { dialectIntro, dialectTitle } from '../src/seo/dialects';
import './AdvancedSearch.scss';

interface Country { countryCode: string; countryName: string }
interface DefinitionResult extends ProvenanceContent {
  word: string; definition: string; wordId: number; definitionId: number;
  isArabic: number; isLiked: number | boolean; isDisliked: number | boolean;
  isReported: number | boolean; countryCode: string; example: string | null;
  arabicExample?: string | null; arabicSpellings?: string[]; francoSpellings?: string[];
}
interface ExploreResults { results: DefinitionResult[]; total: number; page: number; limit: number }

const AdvancedSearch: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { countryName } = useParams<{ countryName: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';
  const query = params.get('q') || '';
  const [draft, setDraft] = useState(query);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [allDialects, setAllDialects] = useState(false);
  const script = params.get('script') || (isArabic ? 'ar' : 'franco');
  const scope = params.get('scope') || 'all';
  const sort = params.get('sort') || 'popular';
  const examples = params.get('examples') === '1';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const selectedCountries = [...new Set(params.getAll('country').map(code => code.toUpperCase()))];
  const { data: countries = [], isError: countriesError, refetch: refetchCountries } = useQuery<Country[]>('exploreCountries', async ({ signal }) => {
    return apiJson<Country[]>(await fetch(`${API_URL}/countries`, { signal }));
  }, { staleTime: 300000, refetchOnWindowFocus: false });
  const legacyCountry = countries.find(country => country.countryName.toLowerCase() === countryName?.toLowerCase());
  const unknownCountry = Boolean(countryName && countries.length && !legacyCountry);
  const countryCodes = selectedCountries.length ? selectedCountries : legacyCountry ? [legacyCountry.countryCode] : [];
  const regionNames = new Intl.DisplayNames([isArabic ? 'ar' : 'en'], { type: 'region' });
  const countryLabel = (code: string) => {
    try { return regionNames.of(code) || code; } catch { return code; }
  };
  const filterCount = countryCodes.length + Number(examples) + Number(scope !== 'all') + Number(script !== (isArabic ? 'ar' : 'franco'));
  const hasSelection = Boolean(query || filterCount || sort !== 'popular');
  useEffect(() => { setDraft(query); }, [query]);

  const request = new URLSearchParams();
  if (query) request.set('q', query);
  request.set('script', script);
  request.set('scope', scope);
  request.set('sort', sort);
  request.set('page', String(page));
  request.set('limit', '12');
  if (examples) request.set('examples', '1');
  countryCodes.forEach(code => request.append('country', code));
  const requestKey = request.toString();
  const { data, isLoading: queryLoading, isFetching, isError: queryError, refetch } = useQuery<ExploreResults>(['explore', requestKey, unknownCountry], async ({ signal }) => {
    return apiJson<ExploreResults>(await fetch(`${API_URL}/word/explore?${requestKey}`, { credentials: 'include', signal }));
  }, { enabled: !countryName || Boolean(legacyCountry), refetchOnWindowFocus: false, retry: 1 });
  const isError = queryError || Boolean(countryName && countriesError);
  const isLoading = queryLoading && !unknownCountry && !isError;

  function update(changes: Record<string, string | string[] | null>) {
    const next = new URLSearchParams(params);
    if (!next.has('script')) next.set('script', script);
    // Preserve a country reached through an existing flag/deep link on any edit.
    if (legacyCountry && !next.has('country')) next.append('country', legacyCountry.countryCode);
    next.delete('page');
    Object.entries(changes).forEach(([key, value]) => {
      next.delete(key);
      if (Array.isArray(value)) value.forEach(item => next.append(key, item));
      else if (value) next.set(key, value);
    });
    if (countryName) navigate(`/advanced-search?${next}`);
    else setParams(next);
  }
  function toggleCountry(code: string) {
    update({ country: countryCodes.includes(code) ? countryCodes.filter(country => country !== code) : [...countryCodes, code] });
  }
  function reset() {
    setDraft('');
    if (countryName) navigate('/advanced-search');
    else setParams({});
  }
  function submit(event: React.FormEvent) { event.preventDefault(); update({ q: draft.trim() }); }
  const visibleCountries = allDialects ? countries : countries.filter((country, index) => index < 6 || countryCodes.includes(country.countryCode));
  const results = data?.results || [];
  const maxPage = Math.ceil((data?.total || 0) / 12);
  const guide = legacyCountry && !params.toString() ? legacyCountry : undefined;
  const guideTitle = guide ? dialectTitle(guide.countryCode, guide.countryName, isArabic) : '';
  const guideIntro = guide ? dialectIntro(guide.countryCode, guide.countryName, isArabic) : '';
  const featured = results.filter((word, index, list) => list.findIndex(other => other.wordId === word.wordId) === index).slice(0, 6);

  return (
    <main className="explore" dir={isArabic ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{`${guideTitle || `${query ? `${query} · ` : ''}${t('explore.title')}`} | Qamous`}</title>
        <meta name="description" content={guideIntro || t('explore.subtitle')} />
        {unknownCountry && <meta name="robots" content="noindex, follow" />}
      </Helmet>
      <header className="explore-hero">
        <h1>{guideTitle || t('explore.title')}<span className="explore-period">.</span></h1>
        <span className="explore-watermark" aria-hidden="true"><span>كلمة</span></span>
        {guide && <p className="dialect-intro">{guideIntro}</p>}
        <form className="explore-search" role="search" onSubmit={submit}>
          <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
          <label className="explore-sr-only" htmlFor="explore-query">{t('explore.search_label')}</label>
          <input id="explore-query" type="search" dir="auto" value={draft} maxLength={200}
            onChange={event => setDraft(event.target.value)} placeholder={t('explore.placeholder')} />
          <button className="explore-submit" type="submit">{t('common.search')}<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></button>
        </form>
      </header>
      {guide && featured.length > 0 && <section className="dialect-guide" aria-label={isArabic ? 'كلمات مختارة' : 'Featured words'}>
        <h2>{isArabic ? 'ابدأ بهذه الكلمات' : 'Start with these words'}</h2>
        <nav className="dialect-links" aria-label={isArabic ? 'روابط الكلمات' : 'Word links'}>
          {featured.map(word => <Link key={word.wordId} to={`/word/${word.wordId}${word.isArabic ? '/ar' : ''}`}>{word.word}</Link>)}
        </nav>
      </section>}
      <div className="explore-layout">
        <aside className="explore-filters" aria-label={t('explore.filters')}>
          <h2 className="explore-filter-heading"><FontAwesomeIcon icon={faSliders} aria-hidden="true" />{t('explore.filters')}</h2>
          <button type="button" className="explore-filter-toggle" aria-expanded={filtersOpen} aria-controls="explore-filter-body" onClick={() => setFiltersOpen(open => !open)}>
            <span><FontAwesomeIcon icon={faSliders} aria-hidden="true" />{t('explore.filters')}{filterCount > 0 && <b>{filterCount}</b>}</span>
            <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
          </button>
          <div id="explore-filter-body" className={`explore-filter-body${filtersOpen ? ' is-open' : ''}`}>
            <fieldset>
              <legend>{t('explore.search_in')}</legend>
              <label className="explore-sr-only" htmlFor="explore-scope">{t('explore.search_in')}</label>
              <select id="explore-scope" value={scope} onChange={event => update({ scope: event.target.value })}>
                <option value="all">{t('explore.everywhere')}</option>
                <option value="words">{t('explore.words_only')}</option>
                <option value="definitions">{t('explore.meanings_examples')}</option>
              </select>
            </fieldset>
            <fieldset>
              <legend>{t('explore.definition_language')}</legend>
              <div className="explore-scripts">
                {['franco', 'ar', 'both'].map(value => <button type="button" key={value} aria-pressed={script === value}
                  onClick={() => update({ script: value })}>{t(`explore.script_${value}`)}</button>)}
              </div>
            </fieldset>
            <fieldset>
              <legend>{t('explore.dialects')}<span>{t('explore.choose_several')}</span></legend>
              {countriesError && <p role="alert">{t('explore.dialects_error')}</p>}
              <div className="explore-countries">
                {visibleCountries.map(country => <label key={country.countryCode}>
                  <input type="checkbox" checked={countryCodes.includes(country.countryCode)} onChange={() => toggleCountry(country.countryCode)} />
                  <ReactCountryFlag countryCode={country.countryCode} svg aria-hidden="true" />
                  <span>{countryLabel(country.countryCode)}</span>
                  <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
                </label>)}
              </div>
              {countries.length > 6 && <button className="explore-text-button" type="button" aria-expanded={allDialects}
                onClick={() => setAllDialects(value => !value)}>{t(allDialects ? 'explore.show_less' : 'explore.show_all', { count: countries.length })}<FontAwesomeIcon icon={faChevronDown} aria-hidden="true" /></button>}
            </fieldset>
            <label className="explore-example-filter">
              <input type="checkbox" checked={examples} onChange={event => update({ examples: event.target.checked ? '1' : null })} />
              <span>{t('explore.with_examples')}<small>{t('explore.examples_hint')}</small></span>
            </label>
            {hasSelection && <button className="explore-reset" type="button" onClick={reset}>{t('explore.reset')}</button>}
          </div>
        </aside>
        <section className="explore-results" aria-label={t('explore.results')}>
          <div className="explore-results-toolbar">
            <div aria-live="polite" role="status">
              <h2>{query ? t('explore.results_for', { query }) : t('explore.discover')}</h2>
              <span>{isFetching ? t('explore.searching') : isError ? t('explore.unavailable') : t('explore.result_count', { count: data?.total || 0 })}</span>
            </div>
            <label className="explore-sort"><span>{t('explore.sort')}</span>
              <select value={sort} onChange={event => update({ sort: event.target.value })}>
                <option value="popular">{t('explore.popular')}</option>
                <option value="newest">{t('explore.newest')}</option>
                <option value="az">{t('explore.alphabetical')}</option>
              </select>
            </label>
          </div>
          {hasSelection && <div className="explore-active" aria-label={t('explore.active_filters')}>
            {query && <button type="button" onClick={() => update({ q: null })}>{query}<FontAwesomeIcon icon={faTimes} aria-label={t('explore.remove')} /></button>}
            {countryCodes.map(code => <button type="button" key={code} onClick={() => toggleCountry(code)}>{countryLabel(code)}<FontAwesomeIcon icon={faTimes} aria-label={t('explore.remove')} /></button>)}
            {scope !== 'all' && <button type="button" onClick={() => update({ scope: null })}>{t(scope === 'words' ? 'explore.words_only' : 'explore.meanings_examples')}<FontAwesomeIcon icon={faTimes} aria-label={t('explore.remove')} /></button>}
            {examples && <button type="button" onClick={() => update({ examples: null })}>{t('explore.with_examples')}<FontAwesomeIcon icon={faTimes} aria-label={t('explore.remove')} /></button>}
            {script !== (isArabic ? 'ar' : 'franco') && <button type="button" onClick={() => update({ script: null })}>{t(`explore.script_${script}`)}<FontAwesomeIcon icon={faTimes} aria-label={t('explore.remove')} /></button>}
            <button type="button" className="explore-clear" onClick={reset}>{t('explore.clear_all')}</button>
          </div>}
          <div className="explore-cards" aria-busy={isFetching}>
            {isLoading && <div className="explore-skeleton" aria-hidden="true"><span /><span /><span /></div>}
            {isError ? <div className="explore-empty" role="alert">
              <FontAwesomeIcon icon={faBookOpen} aria-hidden="true" /><h3>{t('explore.error_title')}</h3>
              <p>{t('advanced_search.error_message')}</p><button className="explore-submit" type="button" onClick={() => countryName && countriesError ? refetchCountries() : refetch()}>{t('explore.retry')}</button>
            </div> : !isLoading && results.length === 0 ? <div className="explore-empty">
              <FontAwesomeIcon icon={faSearch} aria-hidden="true" /><h3>{t('explore.empty_title')}</h3>
              <p>{t('explore.empty_hint')}</p><button className="explore-submit" type="button" onClick={reset}>{t('explore.reset')}</button>
              <Link to="/add-definition">{t('explore.add_word')}<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></Link>
            </div> : results.map((result, index) => <ContentBox
              key={result.definitionId} item={{ word: result.word, definition: result.definition,arabicWord:result.arabicWord,francoArabicWord:result.francoArabicWord }} index={index + 1}
              lang={script==='ar'?'ar':script==='franco'?'en':i18n.language} definitionLanguage={result.isArabic?'ar':'en'} dialect={result.dialect} canonicalWordId={result.canonicalWordId} wordId={result.wordId} definitionId={result.definitionId}
              definitionLanguages={result.definitionLanguages}
              isLiked={Boolean(result.isLiked)} isDisliked={Boolean(result.isDisliked)} isReported={Boolean(result.isReported)}
              countryCode={result.countryCode} example={result.example || ''} arabicExample={result.arabicExample} sourceCredits={result.sourceCredits} sourceExamples={result.sourceExamples} sourcePronunciations={result.sourcePronunciations}
              arabicSpellings={result.arabicSpellings} francoSpellings={result.francoSpellings} />)}
          </div>
          {maxPage > 1 && <nav className="explore-pagination" aria-label={t('explore.pagination')}>
            <button type="button" disabled={page <= 1 || isFetching} onClick={() => update({ page: String(page - 1) })}>{t('explore.previous')}</button>
            <span>{t('explore.page', { page, total: maxPage })}</span>
            <button type="button" disabled={page >= maxPage || isFetching} onClick={() => update({ page: String(page + 1) })}>{t('explore.next')}<FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></button>
          </nav>}
        </section>
      </div>
      {!query && <nav className="dialect-guide" aria-label={isArabic ? 'تصفح اللهجات' : 'Browse dialect guides'}>
        <h2>{isArabic ? 'تصفح اللهجات' : 'Browse dialect guides'}</h2>
        <div className="dialect-links">{countries.filter(country => country.countryCode !== guide?.countryCode).map(country =>
          <Link key={country.countryCode} to={`/advanced-search/${encodeURIComponent(country.countryName)}`}>
            {dialectTitle(country.countryCode, country.countryName, isArabic)}
          </Link>)}</div>
      </nav>}
    </main>
  );
};
export default AdvancedSearch;
