import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import {readFileSync} from 'node:fs';

describe('consent-based Qamous Analytics', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.querySelector('#qamous-google-analytics')?.remove();
    for (const name of ['dataLayer', 'gtag', 'ga-disable-G-434XST6YF3']) delete (window as unknown as Record<string, unknown>)[name];
    vi.stubGlobal('location', {hostname: 'qamous.org'});
  });
  afterEach(() => vi.unstubAllGlobals());
  it('never loads Google or sends events before consent or after rejection', async () => {
    const a = await import('../utils/analytics');
    a.trackPage('/');
    a.setConsent('denied');
    a.trackPage('/about');
    expect(document.querySelector('#qamous-google-analytics')).toBeNull();
    expect((window as unknown as {dataLayer?: unknown}).dataLayer).toBeUndefined();
  });
  it('uses the verified stream, counts SPA navigation once, and revokes consent', async () => {
    const a = await import('../utils/analytics');
    a.setConsent('granted');
    a.trackPage('/'); a.trackPage('/'); a.trackPage('/word/2');
    const commands = () => ((window as unknown as {dataLayer: IArguments[]}).dataLayer).map(x => Array.from(x));
    expect(commands().filter(x => x[0] === 'event')).toHaveLength(2);
    expect(document.querySelector('#qamous-google-analytics')?.getAttribute('src')).toBe('https://www.googletagmanager.com/gtag/js?id=G-434XST6YF3');
    expect(commands().find(x => x[0] === 'config')?.[2]).toMatchObject({send_page_view: false, allow_google_signals: false});
    document.cookie = '_ga=test; Path=/';
    a.setConsent('denied'); a.trackPage('/blog');
    expect(commands().filter(x => x[0] === 'event')).toHaveLength(2);
    expect(document.cookie).not.toContain('_ga=');
    expect(a.readConsent()).toBe('denied');
  });
  it('does not send searches, tokens, emails, arbitrary paths or user titles', async () => {
    const {analyticsPage} = await import('../utils/analytics');
    for (const path of ['/search/secret@example.com', '/reset-password/private-token', '/profile/123', '/unknown/secret']) {
      const result = JSON.stringify(analyticsPage(path));
      expect(result).not.toMatch(/secret|private-token|123/);
    }
    expect(analyticsPage('/word/2/ar').page_location).toBe('https://qamous.org/word/2/ar');
  });
  it('honors browser privacy signals and does not track preview/local hosts', async () => {
    const a = await import('../utils/analytics');
    a.setConsent('granted');
    vi.stubGlobal('navigator', {globalPrivacyControl: true});
    a.trackPage('/');
    expect(a.readConsent()).toBe('denied');
    expect(document.querySelector('#qamous-google-analytics')).toBeNull();
    vi.stubGlobal('navigator', {doNotTrack: '0'});
    vi.stubGlobal('location', {hostname: 'localhost'});
    a.trackPage('/');
    expect(document.querySelector('#qamous-google-analytics')).toBeNull();
  });
  it('permits GA4 destinations without permitting inline scripts or eval', () => {
    const policy = readFileSync('public/_headers', 'utf8').split('\n').find(x => x.includes('Content-Security-Policy:'))!;
    const scripts = policy.split('script-src ')[1].split(';')[0];
    expect(scripts).toContain('https://www.googletagmanager.com');
    expect(scripts).not.toMatch(/unsafe-inline|unsafe-eval/);
    expect(policy).toContain('https://*.google-analytics.com');
  });
  it('defaults to opt-in if regional lookup fails or has an unexpected response', async () => {
    const {fetchConsentRequirement} = await import('../utils/analytics');
    for (const body of [{requiresConsent:true}, {}, {requiresConsent:'false'}]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body))));
      expect(await fetchConsentRequirement(new AbortController().signal)).toBe(true);
    }
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await fetchConsentRequirement(new AbortController().signal)).toBe(true);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({requiresConsent:false}))));
    expect(await fetchConsentRequirement(new AbortController().signal)).toBe(false);
  });
});
