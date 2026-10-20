import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { API_URL, apiJson } from '../src/api';
import SourceCredits from '../src/components/SourceCredits';
import type { SourceCredit } from '../src/types/provenance';
import './ImportPreview.scss';

export default function SourceLibrary() {
  const { username } = useParams(), [params] = useSearchParams(), { i18n } = useTranslation();
  const definition = params.get('definition'), ar = i18n.language === 'ar';
  const { data, isError } = useQuery(['source-library', username, definition], async () => {
    const path = username ? '/contributors/' + encodeURIComponent(username)
      : definition ? '/definitions/' + encodeURIComponent(definition) + '/provenance' : '/sources';
    return apiJson<any>(await fetch(API_URL + path));
  });
  return <main className="import-preview source-library">
    <Helmet><title>{username ? '@' + username : ar ? 'المصادر' : 'Sources'} — Qamous</title></Helmet>
    <h1>{username ? '@' + username : ar ? 'المصادر والحقوق' : 'Sources & credits'}</h1>
    {!username && !definition && <p>Licensed imports retain their source licenses. Original authorship stays with the credited creators; Qamous import accounts manage the entries. Sources without verified reuse rights are marked below.</p>}
    {isError && <p role="alert">Unable to load these details.</p>}
    {username && data && <>
      <span className="import-preview-label">Import account</span>
      <p>{data.disclosure}</p><p>{Number(data.importedDefinitions).toLocaleString()} imported definitions · Login disabled</p>
      <ul>{data.sources.map((source: any) => <li key={source.id}><Link to={'/sources#' + source.id}>{source.name}</Link></li>)}</ul>
    </>}
    {definition && data && <SourceCredits credits={data.sourceCredits as SourceCredit[]} language={i18n.language} expanded />}
    {!username && !definition && Array.isArray(data) && data.map((source: any) => <section className="import-preview-source" id={source.id} key={source.id}>
      <h2><a href={source.sourceUrl}>{source.name}</a></h2><p>{source.credit}</p>
      <a href={source.licenseUrl}>{source.license}</a>
      {source.rightsStatus === 'unverified' && <p>Reuse rights are unverified. Attribution does not establish permission.</p>}
      {source.notice && <p className="source-credits-notice">{source.notice}</p>}
      {['freedict_ar_en', 'aramorph'].includes(source.id) && <p><a href={API_URL + '/sources/' + source.id + '/export'}>Editable collection (JSONL)</a> · <a href={API_URL + '/sources/' + source.id + '/license'}>License copy</a></p>}
    </section>)}
    <p><Link to="/">{ar ? 'العودة إلى قاموس' : 'Back to Qamous'}</Link></p>
  </main>;
}
