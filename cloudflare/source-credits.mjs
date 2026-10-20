const escape = value => String(value || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderSourceCredits(credits=[]) {
  const required=credits.filter(c=>c.attributionRequired);
  if(!required.length) return '';
  return '<details><summary>Source</summary>' + required.map(c =>
    '<section><a href="'+escape(c.sourceUrl)+'">'+escape(c.sourceName)+'</a><p>'+escape(c.credit)+'</p>' +
    '<a href="'+escape(c.licenseUrl)+'">'+escape(c.license)+'</a>' +
    (c.notice?'<p>'+escape(c.notice)+'</p>':'') +
    (c.rightsStatus==='unverified'?'<p>Reuse rights are unverified.</p>':'') +
    (c.changes?'<p>Changes: '+escape(Array.isArray(c.changes)?c.changes.join(' '):c.changes)+'</p>':'') +
    '</section>').join('') + '</details>';
}
