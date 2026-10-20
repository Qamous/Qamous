import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { ContentBoxPreview } from '../src/components/ContentBoxView';
import Pronunciation, { OriginalNotation, type SourcePronunciation } from '../src/components/Pronunciation';
import type { SourceCredit } from '../src/types/provenance';
import data from './pronunciation-samples.json';
import './PronunciationPreview.scss';

export default function PronunciationPreview() {
  const [language,setLanguage]=useState('en');
  const [readable,setReadable]=useState(true);
  const [expanded,setExpanded]=useState(false);
  const ar=language==='ar';
  const samples=data.samples.flatMap(sample=>sample.definitions.filter(d=>Boolean(d.isArabic)===ar).map(definition=>({sample,definition})));
  return <main className="pronunciation-preview">
    <Helmet><title>Pronunciation proposal — Qamous</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <header className="pronunciation-preview-heading"><span className="pronunciation-preview-eyebrow">QAMOUS / LOCAL DESIGN PREVIEW</span>
      <h1>A little help saying it.</h1><p>A quiet line beneath the word. Original source notation, with the details one tap away.</p>
      <div className="pronunciation-preview-controls">
        <div role="group" aria-label="Definition language"><button type="button" aria-pressed={!ar} onClick={()=>setLanguage('en')}>English</button><button type="button" aria-pressed={ar} onClick={()=>setLanguage('ar')}>العربية</button></div>
        <label><input type="checkbox" checked={readable} onChange={e=>setReadable(e.target.checked)} />Transliteration first <span>recommended</span></label>
        <label><input type="checkbox" checked={expanded} onChange={e=>setExpanded(e.target.checked)} />Expand all details</label>
      </div>
    </header>
    <div className="pronunciation-preview-grid">{samples.map(({sample,definition},index)=><article key={definition.id}>
      <ContentBoxPreview item={{word:ar?sample.arabic:sample.franco,definition:definition.definition}} lang={language} example="" countryCode={definition.countryCode||undefined} countryName={definition.countryCode==='PS'?'Palestine':definition.countryCode||undefined}
        sourceDetails={<OriginalNotation entries={sample.pronunciations as SourcePronunciation[]} language={language} />}
        sourceCredits={sample.credits as SourceCredit[]} pronunciation={<Pronunciation key={language+':'+readable+':'+expanded+':'+index} entries={sample.pronunciations as SourcePronunciation[]} language={language} preferTransliteration={readable} expanded={expanded} />} />
    </article>)}</div>
    <footer className="pronunciation-preview-notes"><span>Real entries from the local collection</span><span>Franco stays separate</span><span>Text only · no audio controls</span><span>Awaiting your approval</span></footer>
  </main>;
}
