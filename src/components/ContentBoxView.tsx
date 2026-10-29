import React, { forwardRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from 'react-country-flag';
import { getCountryName } from '../assets/utils';
import './ContentBox.scss';
import SourceCredits from './SourceCredits';
import Pronunciation, { OriginalNotation } from './Pronunciation';
import {stripTashkil} from '../utils/arabic';
import { attributionText, type ProvenanceContent } from '../types/provenance';
import ExampleList from './ExampleList';

export interface ContentBoxContent extends ProvenanceContent {
  item: { word: string; otherLangWord?: string; definition: string; arabicWord?:string;francoArabicWord?:string|null };
  lang: string;
  countryCode?: string;
  countryName?: string;
  definitionHuh?: boolean;
  example: string;
  arabicExample?: string | null;
  arabicSpellings?: readonly string[];
  francoSpellings?: readonly string[];
  alternateSpellings?: readonly string[];
  pronunciation?: React.ReactNode;
  sourceDetails?: React.ReactNode;
  definitionLanguage?: string;
  addMeaningHref?: string;
  showMissingMeaningPrompt?: boolean;
  headingLevel?: 1 | 2;
}

interface ContentBoxViewProps extends ContentBoxContent {
  wordHref?: string;
  highlighted?: boolean;
  overlays?: React.ReactNode;
  children?: React.ReactNode;
}

// All card markup and styling live here, shared by the feed and draft review.
// Persistence, reactions and sharing belong to the interactive ContentBox.
const ContentBoxView = forwardRef<HTMLDivElement, ContentBoxViewProps>(function ContentBoxView({
  item, lang, countryCode, countryName, definitionHuh, example, arabicExample, arabicSpellings, francoSpellings, alternateSpellings,
  wordHref, highlighted = false, overlays, children, sourceCredits, sourceExamples, sourcePronunciations, pronunciation, sourceDetails,definitionLanguage,definitionLanguages,dialect,addMeaningHref,showMissingMeaningPrompt=true,headingLevel=2,
}, ref) {
  const [resolvedCountry, setResolvedCountry] = useState({ code: '', name: '' });
  useEffect(() => {
    let active = true;
    if (countryCode && !countryName) {
      void getCountryName(countryCode).then(name => {
        if (active) setResolvedCountry({ code: countryCode, name });
      });
    }
    return () => { active = false; };
  }, [countryCode, countryName]);
  const flagLabel = countryName || (resolvedCountry.code === countryCode ? resolvedCountry.name : '') || countryCode;
  const spellings = alternateSpellings ?? (lang === 'ar' ? arabicSpellings : francoSpellings);
  const displayWord=lang==='ar'?(item.arabicWord||item.word):(item.francoArabicWord||item.word);
  const missingMeaning=showMissingMeaningPrompt&&definitionLanguage!==lang&&definitionLanguages&&!definitionLanguages.includes(lang);
  // Release names embedded in a generic Arabic label are provenance, not a
  // dialect. Keep the exact source label in credits rather than on the card.
  const displayDialect=/^Arabic(?:\s*\([^)]*\))?$/i.test(dialect||'')?'':dialect==='Modern Standard Arabic'||dialect==='MSA'?(lang==='ar'?'الفصحى':'Modern Standard Arabic'):dialect;

  return <div className={`content-box${highlighted ? ' content-box-first' : ''}${lang === 'ar' ? ' content-box-ar' : ' content-box-latin'}`} ref={ref}>
    {overlays}
    <div className="content-box-title">
      {wordHref ? <Link to={wordHref}>{headingLevel===1?<h1>{stripTashkil(displayWord)}</h1>:<h2>{stripTashkil(displayWord)}</h2>}</Link> : headingLevel===1?<h1>{stripTashkil(displayWord)}</h1>:<h2>{stripTashkil(displayWord)}</h2>}
      {countryCode && <ReactCountryFlag countryCode={countryCode} svg style={{ width: '2em', height: '2em' }} title={flagLabel} aria-label={flagLabel} />}
    </div>
    {!countryCode&&displayDialect&&<p className="content-box-dialect" dir="auto">{displayDialect}</p>}
    {pronunciation ?? <Pronunciation entries={sourcePronunciations} language={lang} />}
    {spellings && spellings.length > 0 && <p className="content-box-spellings">{spellings.join(' · ')}</p>}
    {definitionHuh !== false && <div className="content-box-description">
      {definitionLanguage&&definitionLanguage!==lang&&<div className="content-box-language">
        <span>{definitionLanguage==='en'?(lang==='ar'?'معنى بالإنجليزية':'English meaning'):(lang==='ar'?'معنى بالعربية':'Arabic meaning')}</span>
        {missingMeaning&&<span className="content-box-language-missing">{lang==='ar'?'لا يوجد معنى بالعربية بعد':'No English yet'}</span>}
        {missingMeaning&&addMeaningHref&&<Link className="content-box-add-meaning" to={addMeaningHref}><span aria-hidden="true">+</span> {lang==='ar'?'أضف معنى بالعربية':'Add English'}</Link>}
      </div>}
      <p lang={definitionLanguage||lang} dir={(definitionLanguage||lang)==='ar'?'rtl':'ltr'}>{item.definition}</p>
    </div>}
    <ExampleList entries={sourceExamples} arabicExample={arabicExample} example={example} language={lang}/>
    <SourceCredits credits={sourceCredits} language={lang}>{sourceDetails ?? <OriginalNotation entries={sourcePronunciations} language={lang} />}</SourceCredits>
    {attributionText(sourceCredits) && <div className="source-credit-export">{attributionText(sourceCredits)}</div>}
    {children}
  </div>;
});

interface ContentBoxActionsProps {
  disabled?: boolean;
  pending?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isReported?: boolean;
  viewHref?: string;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  shareMenu?: React.ReactNode;
}

export function ContentBoxActions({ disabled = false, pending = false, isLiked = false, isDisliked = false,
  isReported = false, viewHref, onLike, onDislike, onShare, onReport, shareMenu,
}: ContentBoxActionsProps) {
  const { t } = useTranslation();
  const labels = t('content_box_buttons', { returnObjects: true }) as { like: string; dislike: string; share: string; report: string };
  return <div className="content-box-buttons">
    {viewHref ? <Link to={viewHref}><button className="content-box-buttons-view-button" type="button">{t('user_profile.pick_other_definitions')}</button></Link> : <>
      <button type="button" className={`content-box-buttons-like-button ${isLiked ? 'clicked' : ''}`} aria-pressed={isLiked} disabled={disabled || pending} onClick={onLike}>{labels.like}</button>
      <button type="button" className={`content-box-buttons-dislike-button ${isDisliked ? 'clicked' : ''}`} aria-pressed={isDisliked} disabled={disabled || pending} onClick={onDislike}>{labels.dislike}</button>
    </>}
    <div className="tooltip">
      <button type="button" className="content-box-buttons-share-button" disabled={disabled} onClick={onShare}>{labels.share}</button>
      {shareMenu}
    </div>
    {!viewHref && <button type="button" className={`content-box-buttons-report-button ${isReported ? 'clicked' : ''}`} disabled={disabled} onClick={onReport}>{labels.report}</button>}
  </div>;
}

// A real feed card with no links, mutation hooks, fabricated IDs or live actions.
export function ContentBoxPreview(props: ContentBoxContent) {
  return <ContentBoxView {...props}><ContentBoxActions disabled /></ContentBoxView>;
}

export default ContentBoxView;
