# Qamous Google services

## Production configuration

- Google Analytics account: Qamous (`320034891`), existing property `qamous-blog` (`463915737`). The legacy property name is retained to preserve reporting history.
- Web stream: Qamous (`9843125591`), `https://qamous.org`, measurement ID `G-434XST6YF3`.
- Search Console: domain property `sc-domain:qamous.org`, verified through a DNS TXT record in the existing Cloudflare zone. Keep that verification record; changing website HTML does not invalidate DNS verification.
- No Analytics 360 upgrade, BigQuery export, paid Cloudflare feature, or paid integration was enabled.

## Tracking and privacy

`AnalyticsConsent` mounts inside the existing router, independently of the application session. Google code loads asynchronously only after optional analytics consent and only on `qamous.org`. The Privacy button allows visitors to withdraw consent; browser DNT/GPC signals also prevent tracking.

The Google tag is configured with `send_page_view: false`; the router explicitly sends one pageview per changed sanitized page location. **Keep enhanced measurement disabled in this stream** to avoid duplicate automatic history events, form tracking, and unfiltered URLs. The existing stream had enhanced measurement disabled when verified on October 19, 2026.

Search text, query strings, hashes, password-reset tokens, unknown paths, account details, and user-generated titles are not passed to GA4. Advertising storage, personalization, and Google signals are disabled for this integration. Consent rejection clears the stream's GA cookies and disables subsequent measurement in that page.

The first-party module replaces the dormant Firebase Analytics initialization; do not import `firebaseConfig.js` into the application. Firebase is not required for measurement or the migrated blog.

CSP allows Google's tag loader and Analytics collection endpoints without allowing inline scripts or eval. Do not solve tag diagnostics by weakening CSP globally or enabling automatic paid fallbacks.

## Verification on October 19, 2026

- Cloudflare billing dashboard: Workers Free Active, no payment method on file.
- Production Worker version: `2038c81a-81a4-4a2e-b650-1af44c7d7e24`.
- All 32 frontend tests, production build, Worker TypeScript check, and 38 live SEO checks passed.
- Browser network: zero Analytics/tag requests before consent; tag loader returned 200 after consent; homepage and SPA `/word/2` pageviews each returned 204 from Google's collection endpoint using the expected measurement ID.
- Analytics Realtime showed one active user, two pageviews, and separate Home/word rows.
- Browser network: zero new Analytics requests when navigating to About after withdrawing consent; no browser console errors in the test page.
- Search Console ownership verification succeeded and previous reporting history became accessible. Homepage inspection reported “URL is on Google” and “Page is indexed.”
- The sitemap returned HTTP 200, `application/xml`, with 122 canonical URLs. Google accepted resubmission. The older September 26 “Couldn't fetch” status remained pending a new Google read at the time of submission; submission alone is not proof of completed sitemap processing or new indexing.

Reports and indexing can lag. Do not promise immediate rankings, retroactive recovery of uncollected Analytics visits, or that every discovered URL will be indexed.

## Recheck

1. Open the existing Qamous property, not a similarly named unrelated property.
2. In a browser without a saved analytics choice, confirm no `gtag/js` or GA4 collection request occurs before acceptance.
3. Accept optional analytics, open a word using an internal link, and check Realtime and the browser network for exactly one pageview per navigation.
4. Use Privacy → No thanks, navigate again, and confirm collection stops.
5. Check Search Console → Ownership verification, Sitemaps, and a live URL inspection. Preserve the DNS TXT record and existing Googlebot-compatible robots/security rules.
6. Run `npx vitest run`, `npm run build`, `npx tsc -p cloudflare/tsconfig.json`, and `node cloudflare/verify-seo.mjs` before future releases. Production deployment remains behind the existing free-plan guard.
