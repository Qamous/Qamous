import React from 'react';
import type { SourcePronunciation } from '../types/provenance';
export type { SourcePronunciation } from '../types/provenance';
import './Pronunciation.scss';
type Format = 'pronunciation' | 'transliteration' | 'vocalization' | 'notation';
const format = (scheme: string): Format => scheme==='Arabic vocalization'?'vocalization':/^(IPA|phonemic|phonetic)$/i.test(scheme) ? 'pronunciation'
  : /romanization|^translit$/i.test(scheme) ? 'transliteration' : 'notation';
const priority = (row: SourcePronunciation) => row.scheme === 'phonemic' ? 0 : row.scheme === 'IPA' ? 1 : row.scheme === 'phonetic' ? 2 : format(row.scheme) === 'transliteration' ? 3 : 4;

export function OriginalNotation({entries = [],language = 'en'}: {entries?: readonly SourcePronunciation[];language?: string}) {
  const rows=[...new Map(entries.filter(e=>e.value.trim()&&format(e.scheme)==='notation').map(e=>[[e.sourceId,e.sourceEntryId,e.scheme,e.value].join('\0'),e])).values()];
  if(!rows.length)return null;
  return <details className="original-notation" dir={language==='ar'?'rtl':'ltr'}>
    <summary>{language==='ar'?'التدوين الأصلي':'Original notation'}</summary>
    {rows.map(entry=><div className="pronunciation-entry" key={[entry.sourceId,entry.sourceEntryId,entry.scheme,entry.value].join(':')}>
      <span className="pronunciation-format">{entry.scheme}</span><bdi dir="ltr" className="pronunciation-entry-value">{entry.value}</bdi>
    </div>)}
  </details>;
}

export default function Pronunciation({ entries = [], language = 'en', preferTransliteration = true, expanded = false }: {
  entries?: readonly SourcePronunciation[]; language?: string; preferTransliteration?: boolean; expanded?: boolean;
}) {
  const ar = language === 'ar';
  const unique = [...new Map(entries.filter(e => e.value.trim()).map(e => [[e.sourceId,e.sourceEntryId,e.scheme,e.value].join('\0'),e])).values()];
  const sorted = [...unique].sort((a,b) => priority(a)-priority(b));
  const sound = sorted.find(e => format(e.scheme) === 'pronunciation');
  const roman = sorted.find(e => format(e.scheme) === 'transliteration');
  const native=sorted.find(e=>format(e.scheme)==='vocalization');
  const primary = (ar&&native)|| (preferTransliteration ? roman || sound : sound || roman)||native;
  if (!primary) return null;
  const sameEntry = sorted.filter(e => e.sourceId === primary.sourceId && e.sourceEntryId === primary.sourceEntryId);
  // Different source variants are not necessarily paired with the romanization.
  const broadForms = [...new Set(sameEntry.filter(e => e.scheme === 'phonemic' || (e.scheme === 'IPA' && e.value.startsWith('/'))).map(e => e.value))];
  const multiple = broadForms.length > 1;
  const label = format(primary.scheme)==='vocalization'?(ar?'النطق':'With vowels'):format(primary.scheme)==='pronunciation'?(ar?'النطق':'Pronunciation'):(ar?'النقل الصوتي':'Transliteration');
  const secondary = sameEntry.find(e => format(e.scheme) === (format(primary.scheme) === 'transliteration' ? 'pronunciation' : 'transliteration'));
  return <details className="pronunciation" open={expanded || undefined} dir={ar ? 'rtl' : 'ltr'}>
    <summary aria-label={ar?'تفاصيل النطق':'Pronunciation details'}>
      <span className="pronunciation-main"><span className="pronunciation-label">{label}</span><bdi lang={format(primary.scheme)==='vocalization'?'ar':undefined} dir={format(primary.scheme)==='vocalization'?'rtl':'ltr'} className="pronunciation-value">{multiple && format(primary.scheme)==='pronunciation' ? (ar ? `${broadForms.length} صيغ` : `${broadForms.length} variants`) : primary.value}</bdi></span>
      {secondary && <span className="pronunciation-secondary"><span>{format(secondary.scheme) === 'pronunciation' ? 'IPA' : ar ? 'نقل صوتي' : 'Latin'}</span><bdi dir="ltr">{multiple && format(secondary.scheme)==='pronunciation' ? (ar ? `${broadForms.length} صيغ` : `${broadForms.length} variants`) : secondary.value}</bdi></span>}
      <span className="pronunciation-more" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg></span>
    </summary>
    <div className="pronunciation-panel">
      <p className="pronunciation-panel-title">{ar ? 'تفاصيل النطق' : 'Pronunciation details'}</p>
      {sorted.filter(entry=>format(entry.scheme)!=='notation').map(entry => <div className="pronunciation-entry" key={[entry.sourceId,entry.sourceEntryId,entry.scheme,entry.value].join(':')}>
        <span className="pronunciation-format">{format(entry.scheme)==='vocalization'?(ar?'بالتشكيل':'With vowels'):entry.scheme === 'phonetic' ? (ar ? 'النطق الدقيق · IPA' : 'Phonetic · IPA') : entry.scheme === 'phonemic' ? (ar ? 'النطق · IPA' : 'Phonemic · IPA') : format(entry.scheme) === 'transliteration' ? (ar ? 'نقل صوتي' : 'Transliteration') : entry.scheme}</span>
        <bdi lang={format(entry.scheme)==='vocalization'?'ar':undefined} dir={format(entry.scheme)==='vocalization'?'rtl':'ltr'} className="pronunciation-entry-value">{entry.value}</bdi>
        {(entry.sourceName||entry.dialect)&&<span className="pronunciation-origin">{entry.sourceName&&<a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer">{entry.sourceName}</a>}<span dir="auto">{entry.dialect}</span></span>}
      </div>)}
      <OriginalNotation entries={sorted} language={language} />
    </div>
  </details>;
}
