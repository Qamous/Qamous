import {describe,it,expect} from 'vitest';
import {wordMetadata,renderSeoHtml} from '../../cloudflare/generate-seo.mjs';
import {renderSourceCredits} from '../../cloudflare/source-credits.mjs';
const credit={sourceName:'Original dictionary',sourceUrl:'https://example.org/entry',
  credit:'Original authors <preserved>',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
  attributionRequired:1,notice:'Copyright notice',changes:'Extracted; text preserved.',rightsStatus:'licensed'};
describe('rendered source attribution',()=>{
  it('retains the selected definition license and original credit in non-JavaScript word pages',()=>{
    const meta=wordMetadata({id:12,arabicWord:'كتاب',descriptionEn:'A book',sourceCreditsEn:[credit]},'en');
    const html=renderSeoHtml('<html lang="en"><head><title>Qamous</title></head><body><noscript>Enable JS</noscript></body></html>',meta);
    expect(html).toContain('Original authors &lt;preserved&gt;');
    expect(html).toContain(credit.licenseUrl);
    expect(html).toContain(credit.notice);
  });
  it('does not add an optional CC0 credit',()=>{
    expect(renderSourceCredits([{...credit,attributionRequired:0}])).toBe('');
  });
});
