import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {fetchConsentRequirement, privacySignal, readConsent, setConsent, trackPage} from '../utils/analytics';
import './AnalyticsConsent.scss';

export default function AnalyticsConsent() {
  const {pathname} = useLocation();
  const {i18n} = useTranslation();
  const ar = i18n.language?.startsWith('ar');
  const [consent, updateConsent] = useState(readConsent);
  const [required, setRequired] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const interacted = useRef(false);
  const protectedBrowser = privacySignal();
  useEffect(() => {
    const show = () => { interacted.current = true; setOpen(true); };
    window.addEventListener('qamous:privacy-open', show);
    return () => window.removeEventListener('qamous:privacy-open', show);
  }, []);
  useEffect(() => {
    // Native modal provides focus containment, Escape and focus restoration on phones.
    if (open && !dialog.current?.open) dialog.current?.showModal();
    else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let active = true;
    void fetchConsentRequirement(controller.signal).then(value => {
      if (active) {
        setRequired(value);
        if (!interacted.current) setOpen(value && readConsent() === null);
      }
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);
  useEffect(() => {
    if (required !== null) trackPage(pathname, consent === 'granted' || (consent === null && !required));
  }, [pathname, consent, required]);
  const choose = (value: 'granted' | 'denied') => {
    interacted.current = true;
    setConsent(value);
    updateConsent(value);
    setOpen(false);
  };
  return <dialog ref={dialog} className="analytics-preferences" dir={ar ? 'rtl' : 'ltr'} aria-labelledby="analytics-privacy-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
    <section className="analytics-notice" aria-label={ar ? 'ملفات تعريف الارتباط الاختيارية' : 'Optional analytics cookies'}>
      <div className="analytics-heading">
        <h2 id="analytics-privacy-title">{ar ? 'إعدادات الخصوصية' : 'Privacy settings'}</h2>
        <button type="button" aria-label={ar ? 'إغلاق' : 'Close privacy settings'} onClick={() => { interacted.current = true; setOpen(false); }}>
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false"><path d="m4 4 12 12M16 4 4 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        </button>
      </div>
      <p>{ar ? 'نستخدم ملفات Google Analytics الاختيارية لفهم زيارات الصفحات. لا نرسل بيانات حسابك أو كلمات بحثك. الاختيار لك، ويمكن تغييره في أي وقت.' : 'Optional Google Analytics cookies help us understand page visits. We don’t send account details or search text. Your choice—you can change it anytime.'}</p>
      {protectedBrowser && <p role="status">{ar ? 'الحماية من التتبع مفعّلة في متصفحك، لذلك ستبقى الإحصاءات معطّلة.' : 'Tracking protection is on in your browser, so analytics stays off.'}</p>}
      <div className="analytics-actions">
        <button type="button" onClick={() => choose('denied')}>{protectedBrowser ? (ar ? 'تم' : 'Done') : (ar ? 'لا، شكرًا' : 'No thanks')}</button>
        {!protectedBrowser && <button type="button" onClick={() => choose('granted')}>{ar ? 'السماح بالإحصاءات' : 'Allow analytics'}</button>}
      </div>
      <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">{ar ? 'خصوصية Google' : 'Google privacy'}</a>
    </section>
  </dialog>;
}
