import {describe,it,expect} from 'vitest';
import {renderSourceCredits} from '../../cloudflare/source-credits.mjs';
const credit={sourceName:'Original dictionary',sourceUrl:'https://example.org/entry',
  credit:'Original authors <preserved>',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
  attributionRequired:1,notice:'Copyright notice',changes:'Extracted; text preserved.',rightsStatus:'licensed'};
describe('rendered source attribution',()=>{
  it.each(['Data license not verified','Dataset license not verified','Community contributions; bulk grant unverified'])(
    'uses a neutral website label for metadata placeholder %s', license => {
      const html=renderSourceCredits([{...credit,license,rightsStatus:'unverified'}]);
      expect(html).not.toContain(license);
      expect(html).toContain('Source website');
      expect(html).toContain(credit.sourceUrl);
      expect(html).toContain(credit.notice);
    });
  it('retains required licenses and original credit in attribution fragments',()=>{
    const html=renderSourceCredits([credit]);
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
