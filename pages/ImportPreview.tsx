import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import Helmet from '../src/components/PageMetadata';
import { API_URL, apiJson } from '../src/api';
import { ContentBoxPreview } from '../src/components/ContentBoxView';
import type { SourceCredit, SourceExample } from '../src/types/provenance';
import './ImportPreview.scss';

interface Sample {
  id: number; wordId: number; isArabic: boolean; definition: string; countryCode?: string;
  word: { arabicWord: string; francoArabicWord?: string };
  sourceCredits: SourceCredit[]; sourceExamples: SourceExample[]; sampleSource: string;
}
const number = (value: number | undefined) => (value || 0).toLocaleString();
const arabicCodes = new Set('ar arz ary arq aeb apc ajp acm acw acx adf ayp abv afb apd ars ayl ayn mey shu xaa arb'.split(' '));
const languageTotals = (counts: Record<string,number>) => Object.entries(counts).reduce((totals,[code,count]) => {
  const root=code.split('-')[0];totals[arabicCodes.has(root)?'ar':root==='en'?'en':'hidden']+=count;return totals;
},{ar:0,en:0,hidden:0});
const get = <T,>(path: string) => fetch(API_URL + path).then(response => apiJson<T>(response));

export default function ImportPreview() {
  const [tab, setTab] = useState<'cards' | 'ledger' | 'holds'>('cards');
  const [source, setSource] = useState(''), [query, setQuery] = useState(''), [page, setPage] = useState(1);
  const [language, setLanguage] = useState('all'), [showHeld, setShowHeld] = useState(false);
  const { data: report, isError } = useQuery<any>('import-preview-report', () => get('/imports/preview/report'), { retry: false });
  const { data: samples = [], isLoading } = useQuery<Sample[]>('import-preview-samples', () => get('/imports/preview/samples'), { retry: false });
  const status = tab === 'holds' ? 'held' : '';
  const ledgerParams = new URLSearchParams({ source, q: query, page: String(page), status });
  const { data: ledger } = useQuery<any>(['import-ledger', source, query, page, status], () => get('/imports/preview/ledger?' + ledgerParams), { enabled: tab !== 'cards', keepPreviousData: true });
  const totals = report?.totals;
  return <main className="import-preview">
    <Helmet><title>Import review — Qamous local preview</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <div className="import-preview-heading"><div><span className="import-preview-label">ISOLATED LOCAL PREVIEW</span>
      <h1>More words. Same Qamous.</h1><p>Review the complete collection, source credits, and import accounts. Live rollout progress is tracked separately.</p></div>
      </div>
    {isError && <p role="alert">The isolated import API is unavailable. Start the local preview backend first.</p>}
    {totals && <>
      <div className="import-preview-stats">
        {[['Source records', totals.candidate_records], ['Prepared definitions', totals.definitions], ['Words represented', totals.words], ['Held for review', totals.held]].map(([label, value]) =>
          <div key={String(label)}><strong>{number(Number(value))}</strong><span>{label}</span></div>)}
      </div>
      <div className="import-preview-notes"><span>Arabic meanings <b>{number(totals.definitions_by_display_language?.ar ?? totals.definitions_by_language.ar)}</b></span>
        <span>English meanings <b>{number(totals.definitions_by_display_language?.en ?? totals.definitions_by_language.en)}</b></span>
        <span>Other languages stored, hidden <b>{number(totals.definitions_by_display_language?.hidden)}</b></span>
        <span>30 disclosed import aliases</span><span>No initial votes</span>
        {!!totals.held_alternate_spellings && <span>{number(totals.held_alternate_spellings)} spelling variants held</span>}</div>
    </>}
    <nav className="import-preview-tabs" aria-label="Import review">
      {[['cards', 'Cards & attribution'], ['ledger', 'Source ledger'], ['holds', 'Review holds']].map(([id, label]) =>
        <button type="button" key={id} aria-pressed={tab === id} onClick={() => { setTab(id as typeof tab); setPage(1); }}>{label}</button>)}
    </nav>
    <div className="import-preview-filters">
      <label>Source<select aria-label="Source" value={source} onChange={e => { setSource(e.target.value); setPage(1); }}>
        <option value="">Every source</option>{report?.sources.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      {tab === 'cards' ? <label>Meaning language<select aria-label="Meaning language" value={language} onChange={e => setLanguage(e.target.value)}>
        <option value="all">Arabic + English</option><option value="ar">العربية</option><option value="en">English</option></select></label>
        : <label>Find a word, original ID, or alias<input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Word, ID, or qalam01…" /></label>}
    </div>
    {tab === 'cards' && <div className="import-preview-grid">{isLoading && <p>Loading source examples…</p>}
      {samples.filter(s => (!source || s.sourceCredits.some(c => c.sourceId === source)) && (language === 'all' || (s.isArabic ? 'ar' : 'en') === language)).map(sample =>
        <article key={sample.id + ':' + sample.sampleSource} className="import-preview-sample">
          <div className="import-preview-caption"><span>{sample.sampleSource}</span><Link to={'/word/' + sample.wordId + (sample.isArabic ? '/ar' : '')}>Open word ↗</Link></div>
          <ContentBoxPreview item={{ word: sample.isArabic ? sample.word.arabicWord : sample.word.francoArabicWord || sample.word.arabicWord, definition: sample.definition }}
            lang={sample.isArabic ? 'ar' : 'en'} example="" countryCode={sample.countryCode}
            sourceCredits={sample.sourceCredits} sourceExamples={sample.sourceExamples} />
        </article>)}</div>}
    {tab === 'holds' && <section className="import-preview-holds"><h2>Kept out of publication</h2>
      <p>Entries can be flagged by source labels or sensitive text in a word, meaning, or example. These are automated holds and may include false positives.</p>
      <div>{Object.entries(report?.held_reasons || {}).map(([reason, count]) => <span className="import-preview-reason" key={reason}>{reason.replaceAll('_', ' ')} · {number(Number(count))}</span>)}</div>
      <button type="button" onClick={() => setShowHeld(!showHeld)}>{showHeld ? 'Hide held words' : 'Show held words for review'}</button>
    </section>}
    {tab !== 'cards' && (tab !== 'holds' || showHeld) && <div className="import-preview-ledger">
      <table><thead><tr><th>Word / spelling</th><th>Source / original ID</th><th>Import alias</th><th>Status</th><th>Qamous IDs</th></tr></thead><tbody>
        {ledger?.results.map((row: any) => <tr key={row.recordKey}>
          <td><b dir="auto">{row.arabic}</b><small>{row.franco || row.transliteration}</small><small>{row.dialect}</small></td>
          <td><a href={row.sourceUrl} target="_blank" rel="noreferrer">{row.sourceId}</a><small>{row.sourceEntryId}</small></td>
          <td><Link to={'/contributors/' + row.username}>@{row.username}</Link></td>
          <td>{row.status}<small>{row.reasons.join(', ')}</small></td>
          <td>{row.wordId ? <Link to={'/word/' + row.wordId}>Word {row.wordId}</Link> : 'Held locally'}<small>{row.definitionOwners?.map((d: any) => d.definitionId + ' (@' + d.username + ')').join(', ') || row.definitionIds.join(', ')}</small></td>
        </tr>)}</tbody></table>
      <div className="import-preview-pagination"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}</span>
        <button type="button" disabled={!ledger?.hasMore} onClick={() => setPage(page + 1)}>Next</button></div>
    </div>}
    <details className="import-preview-audit"><summary>Collection counts, checks & remaining blockers</summary>
      <table><thead><tr><th>Source</th><th>Arabic definitions</th><th>English definitions</th><th>Held records</th><th>Rights</th></tr></thead><tbody>
        {report?.sources.map((s: any) => <tr key={s.id}><td>{s.name}</td><td>{number(languageTotals(s.definitions).ar)}</td><td>{number(languageTotals(s.definitions).en)}</td><td>{number(s.records.held)}</td><td>{s.rightsStatus}</td></tr>)}
      </tbody></table>
      <p>Existing member data preserved: {report?.existing_members_preserved ? 'Yes' : 'Check required'}. Human moderation completed: No.</p>
      <ul>{report?.production_blockers.map((text: string) => <li key={text}>{text}</li>)}</ul>
      <p>Review manifest: <code>{report?.manifest_sha256}</code></p>
    </details>
  </main>;
}
