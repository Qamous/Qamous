/** @param {{license?: string, rightsStatus?: string}} source */
export function sourceLicenseLabel(source, language = 'en') {
  return source.rightsStatus === 'unverified' || /unverified|not verified|unknown/i.test(source.license || '')
    ? language === 'ar' ? 'الموقع الأصلي' : 'Source website'
    : source.license || (language === 'ar' ? 'الموقع الأصلي' : 'Source website');
}
