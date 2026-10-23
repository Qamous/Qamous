const escape = value => String(value || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url,label) => {
  try {
    const parsed=new URL(String(url));
    if(['http:','https:'].includes(parsed.protocol)&&!parsed.username&&!parsed.password)
      return '<a href="'+escape(parsed.href)+'">'+escape(label)+'</a>';
  } catch {}
  return escape(label);
};
export function renderSourceCredits(credits=[]) {
  const required=credits.filter(c=>c.attributionRequired);
  if(!required.length) return '';
  return '<details><summary>Source</summary>' + required.map(c =>
    '<section>'+link(c.sourceUrl,c.sourceName)+'<p>'+escape(c.credit)+'</p>' +
    link(c.licenseUrl,c.license) +
    (c.notice?'<p>'+escape(c.notice)+'</p>':'') +
    (c.changes?'<p>Changes: '+escape(Array.isArray(c.changes)?c.changes.join(' '):c.changes)+'</p>':'') +
    '</section>').join('') + '</details>';
}
