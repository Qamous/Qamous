import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import Helmet from '../src/components/PageMetadata';
import { API_URL, apiJson } from '../src/api';
import './ImportPreview.scss';

export default function Contributor() {
  const { username } = useParams(), { i18n } = useTranslation();
  const ar = i18n.language === 'ar';
  const { data, isError } = useQuery(['contributor', username], async () =>
    apiJson<any>(await fetch(API_URL + '/contributors/' + encodeURIComponent(username!))));
  return <main className="import-preview">
    <Helmet><title>@{username} — Qamous</title></Helmet>
    <h1>@{username}</h1>
    {isError && <p role="alert">Unable to load these details.</p>}
    {data && <>
      <span className="import-preview-label">{ar ? 'مجموعة مفردات' : 'Vocabulary collection'}</span>
      <p>{ar ? 'المصادر الأصلية مذكورة مع كل مدخل.' : 'Original sources are credited with each entry.'}</p>
      <p>{Number(data.definitions ?? data.importedDefinitions).toLocaleString(ar ? 'ar-EG' : 'en-US')} {ar ? 'تعريف' : 'definitions'}</p>
      <ul>{data.sources.map((source: any) => <li key={source.id}>{source.name}</li>)}</ul>
    </>}
    <p><Link to="/">{ar ? 'العودة إلى قاموس' : 'Back to Qamous'}</Link></p>
  </main>;
}
