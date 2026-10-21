import {describe,it,expect} from 'vitest';
import {wordPage} from '../../cloudflare/seo-content.mjs';
import {renderSourceCredits} from '../../cloudflare/source-credits.mjs';
const credit={sourceName:'Original dictionary',sourceUrl:'https://example.org/entry',
  credit:'Original authors <preserved>',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
  attributionRequired:1,notice:'Copyright notice',changes:'Extracted; text preserved.',rightsStatus:'licensed'};
describe('rendered source attribution',()=>{
  it('retains the selected definition license and original credit in non-JavaScript word pages',()=>{
    const html=wordPage({rows:[{canonicalWordId:12,isArabic:0,arabicWord:'كتاب',definition:'A book',sourceCredits:[credit]}]},'en',12).html;
    expect(html).toContain('Original authors &lt;preserved&gt;');
    expect(html).toContain(credit.licenseUrl);
    expect(html).toContain(credit.notice);
  });
  it('does not add an optional CC0 credit',()=>{
    expect(renderSourceCredits([{...credit,attributionRequired:0}])).toBe('');
  });
  it('never emits script or credential-bearing attribution URLs',()=>{
    const html=renderSourceCredits([{...credit,sourceUrl:'javascript:alert(1)',licenseUrl:'https://name:secret@example.org/license'}]);
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('name:secret');
    expect(html).toContain('Original dictionary');
  });
});
