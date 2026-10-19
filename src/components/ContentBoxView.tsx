import React, { forwardRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from 'react-country-flag';
import { getCountryName } from '../assets/utils';
import './ContentBox.scss';

export interface ContentBoxContent {
  item: { word: string; otherLangWord?: string; definition: string };
  lang: string;
  countryCode?: string;
  countryName?: string;
  definitionHuh?: boolean;
  example: string;
  arabicExample?: string | null;
  arabicSpellings?: readonly string[];
  francoSpellings?: readonly string[];
  alternateSpellings?: readonly string[];
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
  wordHref, highlighted = false, overlays, children,
}, ref) {
  const { t } = useTranslation();
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
  const shownExample = lang === 'ar' ? arabicExample || example : example || arabicExample;
  const exampleIsArabic = lang === 'ar' ? !!arabicExample : !example && !!arabicExample;

  return <div className={`content-box${highlighted ? ' content-box-first' : ''}${lang === 'ar' ? ' content-box-ar' : ' content-box-latin'}`} ref={ref}>
    {overlays}
    <div className="content-box-title">
      {wordHref ? <Link to={wordHref}><h1>{item.word}</h1></Link> : <h1>{item.word}</h1>}
      {countryCode && <ReactCountryFlag countryCode={countryCode} svg style={{ width: '2em', height: '2em' }} title={flagLabel} aria-label={flagLabel} />}
    </div>
    {spellings && spellings.length > 0 && <p className="content-box-spellings">{spellings.join(' · ')}</p>}
    {definitionHuh !== false && <div className="content-box-description"><p>{item.definition}</p></div>}
    {shownExample && <div className="content-box-example"><span className="content-box-example-label">{t('content_box.example', { lng: lang === 'ar' ? 'ar' : 'en' })}</span><span dir={exampleIsArabic ? 'rtl' : 'ltr'}>{shownExample}</span></div>}
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
