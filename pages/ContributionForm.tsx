import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import Papa from 'papaparse';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { API_URL, ApiError, apiJson } from '../src/api';
import { ContentBoxPreview } from '../src/components/ContentBoxView';
import './ContributionForm.scss';

type Draft = { arabicWord: string; francoWord: string; arabicDefinition: string; englishDefinition: string; arabicExample: string; francoExample: string; country: string };
interface ExistingWord { id: number; arabicWord: string; francoArabicWord: string | null }
const empty: Draft = { arabicWord: '', francoWord: '', arabicDefinition: '', englishDefinition: '', arabicExample: '', francoExample: '', country: '' };

function Spellings({ script, values, onChange, ar }: { script: 'arabic' | 'franco'; values: string[]; onChange: (values: string[]) => void; ar: boolean }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const arabic = script === 'arabic';
  const label = arabic ? (ar ? 'تهجئات عربية أخرى' : 'Other Arabic spellings') : (ar ? 'تهجئات فرانكو أخرى' : 'Other Franco spellings');
  function add() {
    const spelling = value.trim();
    if (!spelling) return;
    if ((arabic && !/\p{Script=Arabic}/u.test(spelling)) || (!arabic && /\p{Script=Arabic}/u.test(spelling))) {
      setError(ar ? 'استخدم الحروف المناسبة لهذا الحقل.' : `Use ${arabic ? 'Arabic' : 'Latin'} letters in this field.`);
      return;
    }
    if (!values.some(item => item.toLocaleLowerCase() === spelling.toLocaleLowerCase())) onChange([...values, spelling]);
    setValue(''); setError('');
  }
  return <div className="contribute-field">
    <label htmlFor={`alias-${script}`}>{label}</label>
    <div className="contribute-alias-entry">
      <input id={`alias-${script}`} dir={arabic ? 'rtl' : 'ltr'} value={value} maxLength={255}
        placeholder={arabic ? 'مثلاً: معليش' : 'e.g. ma3lesh'} onChange={event => { setValue(event.target.value); setError(''); }}
        onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} aria-describedby={error ? `alias-error-${script}` : undefined} />
      <button type="button" onClick={add} aria-label={`${ar ? 'أضف' : 'Add'} ${label}`}><FontAwesomeIcon icon={faPlus} /></button>
    </div>
    {error && <span id={`alias-error-${script}`} className="contribute-error" role="alert">{error}</span>}
    <ul className="contribute-chips" aria-label={label}>{values.map(item => <li key={item} dir={arabic ? 'rtl' : 'ltr'}>{item}<button type="button" onClick={() => onChange(values.filter(value => value !== item))} aria-label={`${ar ? 'احذف' : 'Remove'} ${item}`}><FontAwesomeIcon icon={faXmark} /></button></li>)}</ul>
  </div>;
}

export default function ContributionForm() {
  const { i18n } = useTranslation();
  const ar = i18n.language === 'ar';
  const text = (en: string, arabic: string) => ar ? arabic : en;
  const [draft, setDraft] = useState<Draft>(empty);
  const [mode, setMode] = useState<'word' | 'meaning'>('word');
  const [existing, setExisting] = useState<ExistingWord | null>(null);
  const [existingQuery, setExistingQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ExistingWord[]>([]);
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [aliases, setAliases] = useState({ arabic: [] as string[], franco: [] as string[] });
  const [spellingsOpen, setSpellingsOpen] = useState(false);
  const [countries, setCountries] = useState<{ name: string; code: string }[]>([]);
  const localizedCountries = useMemo(() => {
    const locale = ar ? 'ar' : 'en';
    const names = new Intl.DisplayNames([locale], { type: 'region' });
    return countries.map(country => ({ ...country, label: ar ? names.of(country.code) || country.name : country.name }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));
  }, [countries, ar]);
  const [attempted, setAttempted] = useState(false);
  const [review, setReview] = useState(false);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const savingRef = useRef(false);
  const requestRef = useRef({ payload: '', id: '' });
  const navigate = useNavigate();
  const client = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const actualWord = mode === 'meaning' ? existing?.arabicWord || '' : draft.arabicWord.trim();
  const actualFranco = mode === 'meaning' ? existing?.francoArabicWord || '' : draft.francoWord.trim();
  const wordValid = !!actualWord && /\p{Script=Arabic}/u.test(actualWord);
  const meaningValid = !!(draft.arabicDefinition.trim() || draft.englishDefinition.trim());
  const field = (name: keyof Draft) => ({ value: draft[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setDraft(previous => ({ ...previous, [name]: event.target.value })); setNotice(''); } });
  useEffect(() => {
    let active = true;
    Papa.parse<{ CountryCode: string; ' CountryName': string }>('/countries.csv', { download: true, header: true,
      complete: result => {
        if (active) setCountries(result.data.map(row => ({ name: row[' CountryName']?.trim(), code: row.CountryCode?.trim() }))
          .filter(country => country.name && country.code).sort((a, b) => a.name.localeCompare(b.name)));
      },
    });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (review) headingRef.current?.focus(); }, [review]);
  useEffect(() => {
    const controller = new AbortController();
    const query = existingQuery.trim();
    if (mode !== 'meaning' || existing || !query) { setSuggestions([]); setSearchState('idle'); return; }
    setSearchState('loading');
    setSuggestions([]);
    const timer = window.setTimeout(() => {
      void fetch(`${API_URL}/word/suggestions?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(response => apiJson<ExistingWord[]>(response))
        .then(rows => { if (!controller.signal.aborted) { setSuggestions(rows); setSearchState('ready'); } })
        .catch(() => { if (!controller.signal.aborted) setSearchState('error'); });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [existingQuery, existing, mode]);
  async function submit() {
    if (savingRef.current) return;
    const payload = {
      ...(mode === 'meaning' ? { wordId: existing?.id } : { arabicWord: actualWord, francoArabicWord: actualFranco || null }),
      arabicDefinition: draft.arabicDefinition.trim() || null, englishDefinition: draft.englishDefinition.trim() || null,
      arabicExample: draft.arabicExample.trim() || null, francoExample: draft.francoExample.trim() || null,
      countryCode: countries.find(country => country.name === draft.country)?.code || null,
      arabicSpellings: mode === 'word' ? aliases.arabic : [], francoSpellings: mode === 'word' ? aliases.franco : [],
    };
    const serialized = JSON.stringify(payload);
    if (requestRef.current.payload !== serialized) requestRef.current = { payload: serialized, id: crypto.randomUUID() };
    savingRef.current = true; setSaving(true); setNotice(''); setNeedsLogin(false);
    try {
      const result = await apiJson<{ wordId: number; definitionIds: number[] }>(await fetch(`${API_URL}/contributions`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, requestId: requestRef.current.id }),
      }));
      if (!Number.isSafeInteger(result.wordId) || result.wordId < 1 || !result.definitionIds?.length) throw new Error('Invalid contribution response');
      await Promise.all(['homeContent', 'searchResults', 'explore', 'definitions', 'user'].map(key => client.invalidateQueries(key, { refetchActive: false })));
      navigate(`/word/${result.wordId}${ar ? '/ar' : ''}`);
    } catch (error) {
      const login = error instanceof ApiError && error.status === 401;
      setNeedsLogin(login);
      setNotice(login ? text('Sign in again, then retry. Your draft is still here.', 'سجّل دخولك من جديد وحاول تاني. مساهمتك لسه موجودة.')
        : error instanceof ApiError && error.status === 400 ? error.message
        : text('Could not save your contribution. Please try again. Your draft is still here.', 'مش قادرين نحفظ مساهمتك دلوقتي. حاول تاني، مساهمتك لسه موجودة.'));
    } finally { savingRef.current = false; setSaving(false); }
  }
  function validate(event: React.FormEvent) {
    event.preventDefault(); setAttempted(true);
    if (!wordValid || !meaningValid) {
      const id = !wordValid ? (mode === 'word' ? 'new-arabic-word' : 'existing-word') : 'arabic-definition';
      formRef.current?.querySelector<HTMLElement>(`#${id}`)?.focus(); return;
    }
    setReview(true);
  }
  const optional = <span className="contribute-optional">{text('Optional', 'اختياري')}</span>;
  const required = <span className="contribute-required">{text('Required', 'مطلوب')}</span>;
  return <main className="contribute" dir={ar ? 'rtl' : 'ltr'}>
    <header className="contribute-heading"><div><h1 ref={headingRef} tabIndex={review ? -1 : undefined}>{review ? text('Review your word', 'راجع الكلمة') : text('Share a word', 'شارك بكلمة')}<span>.</span></h1><p>{review ? text('This is how your contribution will appear in the feed.', 'دي طريقة ظهور مساهمتك في الصفحة الرئيسية.') : text('Add an Arabic word and explain what it means.', 'أضف كلمة عربية واشرح معناها.')}</p></div><span className="contribute-watermark" aria-hidden="true">ق</span></header>
    {review ? <section className="contribute-review" aria-label={text('Review contribution', 'مراجعة المساهمة')}>
      <div className="contribute-review-cards">{(draft.arabicDefinition.trim() ? ['ar'] : []).concat(draft.englishDefinition.trim() ? ['en'] : []).map(language => <div key={language}>
        <p className="contribute-review-label">{language === 'ar' ? text('Arabic meaning', 'المعنى بالعربية') : text('English meaning', 'المعنى بالإنجليزية')}</p>
        <ContentBoxPreview
          item={{ word: language === 'ar' ? actualWord : actualFranco || actualWord, definition: language === 'ar' ? draft.arabicDefinition : draft.englishDefinition }}
          lang={language}
          countryCode={countries.find(country => country.name === draft.country)?.code}
          countryName={localizedCountries.find(country => country.name === draft.country)?.label}
          example={draft.francoExample}
          arabicExample={draft.arabicExample}
          alternateSpellings={mode === 'word' ? (language === 'ar' ? aliases.arabic : aliases.franco) : undefined}
        />
      </div>)}</div>
      <div className="contribute-actions"><button type="button" className="contribute-back" disabled={saving} onClick={() => { setReview(false); setNotice(''); }}><FontAwesomeIcon icon={faArrowLeft} />{text('Keep editing', 'متابعة التعديل')}</button><button type="button" className="contribute-primary" disabled={saving} onClick={() => void submit()}>{saving ? text('Adding…', 'بنضيف…') : mode === 'word' ? text('Add word', 'أضف الكلمة') : text('Add meaning', 'أضف المعنى')}<FontAwesomeIcon icon={faCheck} /></button></div>
      {notice && <p role="alert" className="contribute-notice">{notice}{needsLogin && <> <Link to="/login" target="_blank" rel="noopener">{text('Sign in', 'تسجيل الدخول')}</Link></>}</p>}
    </section> : <>
      <div className="contribute-mode" role="group" aria-label={text('Contribution type', 'نوع المساهمة')}><button type="button" aria-pressed={mode === 'word'} onClick={() => { setMode('word'); setAttempted(false); }}>{text('New word', 'كلمة جديدة')}</button><button type="button" aria-pressed={mode === 'meaning'} onClick={() => { setMode('meaning'); setAttempted(false); }}>{text('Another meaning', 'معنى جديد')}</button></div>
      <form ref={formRef} onSubmit={validate} noValidate>
        <section className="contribute-section" aria-labelledby="word-heading"><div className="contribute-section-heading"><span>01</span><h2 id="word-heading">{mode === 'word' ? text('The word', 'الكلمة') : text('Choose the word', 'اختر الكلمة')}</h2></div>
          {mode === 'word' ? <>
            <div className="contribute-grid"><div className="contribute-field"><label htmlFor="new-arabic-word">{text('Arabic word', 'الكلمة بالعربية')}{required}</label><input id="new-arabic-word" dir="rtl" lang="ar" placeholder="مثلاً: معلش" maxLength={255} required {...field('arabicWord')} aria-invalid={attempted && !wordValid} aria-describedby={attempted && !wordValid ? 'word-error' : undefined} />{attempted && !wordValid && <span id="word-error" className="contribute-error" role="alert">{text('Enter the word in Arabic.', 'اكتب الكلمة بالعربية.')}</span>}</div>
            <div className="contribute-field"><label htmlFor="new-franco-word">{text('Franco spelling', 'الكلمة بالفرانكو')}{optional}</label><input id="new-franco-word" dir="ltr" placeholder="e.g. ma3lish" maxLength={255} {...field('francoWord')} /><span className="contribute-hint">{text('Arabic sounds, Latin letters. Numbers are welcome.', 'نفس النطق بحروف لاتينية، وممكن تستخدم أرقام.')}</span></div></div>
            <div className="contribute-spellings"><button className="contribute-disclosure" type="button" onClick={() => setSpellingsOpen(!spellingsOpen)} aria-expanded={spellingsOpen} aria-controls="alternate-spellings"><FontAwesomeIcon icon={spellingsOpen ? faXmark : faPlus} />{text('Other ways to spell it', 'طرق أخرى لكتابة الكلمة')}{optional}{aliases.arabic.length + aliases.franco.length > 0 && <span>({aliases.arabic.length + aliases.franco.length})</span>}</button>
              <div id="alternate-spellings" hidden={!spellingsOpen}><p className="contribute-hint">{text('Same word, different spelling. Not synonyms or different meanings.', 'نفس الكلمة بتهجئة مختلفة، مش مرادفات أو معاني تانية.')}</p><div className="contribute-grid"><Spellings script="arabic" values={aliases.arabic} onChange={arabic => setAliases(previous => ({ ...previous, arabic }))} ar={ar} /><Spellings script="franco" values={aliases.franco} onChange={franco => setAliases(previous => ({ ...previous, franco }))} ar={ar} /></div></div>
            </div>
          </> : <div className="contribute-field"><label htmlFor={existing ? undefined : 'existing-word'}>{text('Existing word', 'كلمة موجودة')}{required}</label>
            {existing ? <div className="contribute-selected-word"><span dir="auto">{existing.arabicWord} / {existing.francoArabicWord}</span><button type="button" onClick={() => { setExisting(null); setExistingQuery(''); }}>{text('Change word', 'غيّر الكلمة')}</button></div>
              : <><input id="existing-word" type="search" dir="auto" value={existingQuery} maxLength={200} placeholder={text('Search in Arabic or Franco', 'ابحث بالعربية أو الفرانكو')} onChange={event => setExistingQuery(event.target.value)} aria-invalid={attempted && !wordValid} aria-describedby="existing-word-hint" />
                <div role="status" className="contribute-hint">{searchState === 'loading' ? text('Searching…', 'بندور…') : searchState === 'error' ? text('Could not search. Please try again.', 'مش قادرين نبحث دلوقتي. حاول تاني.') : searchState === 'ready' && !suggestions.length ? text('No matching words. You can add a new word instead.', 'مفيش كلمات مطابقة. ممكن تضيف كلمة جديدة.') : ''}</div>
                {suggestions.length > 0 && <ul className="contribute-suggestions" aria-label={text('Matching words', 'الكلمات المطابقة')}>{suggestions.map(word => <li key={word.id}><button type="button" onClick={() => setExisting(word)}><span dir="rtl">{word.arabicWord}</span><span dir="ltr">{word.francoArabicWord}</span></button></li>)}</ul>}
              </>}
            <span id="existing-word-hint" className="contribute-hint">{text('Choose the word you want to add a meaning to.', 'اختار الكلمة اللي عايز تضيف لها معنى.')}</span>{attempted && !wordValid && <span role="alert" className="contribute-error">{text('Choose the word you’re defining.', 'اختر الكلمة اللي هتشرح معناها.')}</span>}</div>}
        </section>
        <section className="contribute-section" aria-labelledby="meaning-heading"><div className="contribute-section-heading"><span>02</span><h2 id="meaning-heading">{text('What does it mean?', 'معناها إيه؟')}</h2><span className="contribute-required">{text('At least one required', 'تعريف واحد على الأقل مطلوب')}</span></div>
          <p className="contribute-section-hint">{text('Arabic, English, or both. Keep both definitions about the same meaning.', 'بالعربية أو الإنجليزية أو الاتنين. لو كتبت الاتنين، اشرح نفس المعنى.')}</p>
          <div className="contribute-grid"><div className="contribute-field"><label htmlFor="arabic-definition">{text('Arabic definition', 'التعريف بالعربية')}</label><textarea id="arabic-definition" lang="ar" dir="rtl" rows={3} placeholder="اشرح الكلمة بطريقتك…" maxLength={10000} {...field('arabicDefinition')} aria-invalid={attempted && !meaningValid} aria-describedby="meaning-rule" /></div><div className="contribute-field"><label htmlFor="english-definition">{text('English definition', 'التعريف بالإنجليزية')}</label><textarea id="english-definition" lang="en" dir="ltr" rows={3} placeholder="Explain what the word means…" maxLength={10000} {...field('englishDefinition')} aria-invalid={attempted && !meaningValid} aria-describedby="meaning-rule" /></div></div>
          <span id="meaning-rule" className={attempted && !meaningValid ? 'contribute-error' : 'contribute-sr'} role={attempted && !meaningValid ? 'alert' : undefined}>{text('Write at least one definition, in Arabic or English.', 'اكتب تعريف واحد على الأقل بالعربية أو الإنجليزية.')}</span>
          <div className="contribute-field contribute-country"><label htmlFor="used-in">{text('Where is it used?', 'بتتقال فين؟')}{optional}</label><select id="used-in" {...field('country')}><option value="">{text('Choose a country', 'اختر البلد')}</option>{localizedCountries.map(country => <option key={country.code} value={country.name}>{country.label}</option>)}</select></div>
        </section>
        <section className="contribute-section" aria-labelledby="examples-heading"><div className="contribute-section-heading"><span>03</span><h2 id="examples-heading">{text('Put it in a sentence', 'حطها في جملة') }</h2>{optional}</div><p className="contribute-section-hint">{text('Show how you’d actually say it. Add either example, or both.', 'ورّينا بتتقال إزاي. ممكن تضيف مثال واحد أو الاتنين.')}</p><div className="contribute-grid"><div className="contribute-field"><label htmlFor="arabic-example">{text('Arabic example', 'مثال بالعربية')}{optional}</label><textarea id="arabic-example" dir="rtl" lang="ar" rows={2} placeholder="معلش، هتتعوض." maxLength={255} {...field('arabicExample')} /></div><div className="contribute-field"><label htmlFor="franco-example">{text('Franco example', 'مثال بالفرانكو')}{optional}</label><textarea id="franco-example" dir="ltr" rows={2} placeholder="Ma3lish, hatet3awwad." maxLength={255} {...field('francoExample')} /></div></div></section>
        <div className="contribute-actions"><p className="contribute-requirements"><span data-complete={wordValid}>{wordValid ? <FontAwesomeIcon icon={faCheck} /> : <span className="contribute-unchecked" aria-hidden="true" />}{text('Arabic word', 'الكلمة بالعربية')}</span><span data-complete={meaningValid}>{meaningValid ? <FontAwesomeIcon icon={faCheck} /> : <span className="contribute-unchecked" aria-hidden="true" />}{text('One definition', 'تعريف واحد')}</span></p><button type="submit" className="contribute-primary">{mode === 'word' ? text('Review word', 'راجع الكلمة') : text('Review meaning', 'راجع المعنى')}<FontAwesomeIcon icon={faArrowRight} /></button></div>
      </form>
    </>}
  </main>;
}
