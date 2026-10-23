import React from 'react';
import { Link } from 'react-router-dom';
import type { SourceCredit } from '../types/provenance';
import './SourceCredits.scss';
import { sourceLicenseLabel } from '../utils/source-license.mjs';

export default function SourceCredits({ credits = [], language = 'en', expanded = false, children }: { credits?: SourceCredit[]; language?: string; expanded?: boolean; children?:React.ReactNode }) {
  if (!credits.some(c => c.attributionRequired)) return null;
  const ar = language === 'ar';
  return <details className="source-credits" data-testid="source-credits" open={expanded || undefined}>
    <summary>{ar ? 'المصدر' : 'Source'}</summary>
    <div className="source-credits-panel" dir={ar ? 'rtl' : 'ltr'}>
      {credits.map((credit, index) => <section key={credit.sourceId + ':' + credit.sourceEntryId + ':' + index}>
        <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">{credit.sourceName}</a>
        <p>{credit.credit}</p>
        <p>{ar ? 'معرّف المدخل: ' : 'Original entry: '}{credit.sourceEntryId}</p>
        <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{sourceLicenseLabel(credit, language)}</a>
        {credit.notice && <p className="source-credits-notice">{credit.notice}</p>}
        {credit.dialect && <p>{ar ? 'اللهجة: ' : 'Dialect: '}{credit.dialect}</p>}
        {credit.transliteration && <p>{ar ? 'النقل الصوتي: ' : 'Transliteration: '}{credit.transliteration}</p>}
        {credit.changes.length > 0 && <p>{ar ? 'التغييرات: ' : 'Changes: '}{credit.changes.join(' ')}</p>}
        <p>{ar ? 'المجموعة: ' : 'Collection: '}<Link to={'/contributors/' + encodeURIComponent(credit.importer.username)}>@{credit.importer.username}</Link></p>
      </section>)}
      {children}
    </div>
  </details>;
}
