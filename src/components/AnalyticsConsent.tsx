import {useEffect, useState} from 'react';
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
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let active = true;
    void fetchConsentRequirement(controller.signal).then(value => {
      if (active) { setRequired(value); setOpen(value && readConsent() === null); }
    }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, []);
  useEffect(() => {
    if (required !== null) trackPage(pathname, consent === 'granted' || (consent === null && !required));
  }, [pathname, consent, required]);
  const choose = (value: 'granted' | 'denied') => {
    setConsent(value);
    updateConsent(value);
    setOpen(false);
  };
  return <aside className="analytics-preferences" dir={ar ? 'rtl' : 'ltr'} aria-label={ar ? 'إعدادات الخصوصية' : 'Privacy settings'}>
    {open ? <section className="analytics-notice" aria-label={ar ? 'ملفات تعريف الارتباط الاختيارية' : 'Optional analytics cookies'}>
      <strong>{ar ? 'ساعدنا نحسّن قاموس' : 'Help us improve Qamous'}</strong>
      <p>{ar ? 'نستخدم ملفات Google Analytics الاختيارية لفهم زيارات الصفحات. لا نرسل بيانات حسابك أو كلمات بحثك. الاختيار لك، ويمكن تغييره في أي وقت.' : 'Optional Google Analytics cookies help us understand page visits. We don’t send account details or search text. Your choice—you can change it anytime.'}</p>
      {privacySignal() && <p>{ar ? 'نحترم إشارة عدم التتبع في متصفحك.' : 'Your browser’s do-not-track preference is respected.'}</p>}
      <div className="analytics-actions">
        <button type="button" onClick={() => choose('denied')}>{ar ? 'لا، شكرًا' : 'No thanks'}</button>
        <button type="button" disabled={privacySignal()} onClick={() => choose('granted')}>{ar ? 'السماح بالإحصاءات' : 'Allow analytics'}</button>
      </div>
      <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">{ar ? 'خصوصية Google' : 'Google privacy'}</a>
    </section> : <button className="analytics-settings" type="button" onClick={() => setOpen(true)}>{ar ? 'الخصوصية' : 'Privacy'}</button>}
  </aside>;
}
