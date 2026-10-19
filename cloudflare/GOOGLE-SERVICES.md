# Qamous Google services

## Production configuration

- Google Analytics account: Qamous (`320034891`), existing property `qamous-blog` (`463915737`). The legacy property name is retained to preserve reporting history.
- Web stream: Qamous (`9843125591`), `https://qamous.org`, measurement ID `G-434XST6YF3`.
- Search Console: domain property `sc-domain:qamous.org`, verified through a DNS TXT record in the existing Cloudflare zone. Keep that verification record; changing website HTML does not invalidate DNS verification.
- No Analytics 360 upgrade, BigQuery export, paid Cloudflare feature, or paid integration was enabled.

## Tracking and privacy

`AnalyticsConsent` mounts inside the existing router, independently of the application session. Google code loads asynchronously only on `qamous.org`, after the region policy resolves. The automatic opt-in prompt is limited to the EEA (EU plus Iceland, Liechtenstein, Norway), UK, and Switzerland. Other known countries use analytics without an automatic prompt unless a prior opt-out or browser privacy signal prevents tracking. A small Privacy text control lives alongside the expanded footer links, not in a floating overlay.

`/api/privacy-region` evaluates Cloudflare's trusted `request.cf.country` and returns only `{requiresConsent:boolean}`. It does not forward IP addresses or locations to a geolocation service, does not use client-supplied country headers, and does not query D1. Responses are private/no-store to prevent cross-country cache contamination. Unknown/Tor locations, lookup failures, and timeouts keep opt-in required. No tracking begins while the lookup is pending; previous denials and DNT/GPC are never overridden by the regional default.

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

## Regional release and Search Console follow-through

- Worker version `1d16a487-84fc-426e-8744-3bde5923deb6` deployed the regional policy on October 19, 2026, under the existing Workers Free guard.
- 39 automated tests cover all EEA country codes, UK/Switzerland, US/Egypt and other outside countries, unknown/Tor locations, untrusted headers, non-cacheable policy responses, pending lookup, existing denial, optional acceptance, and opt-out.
- Fresh US-browser verification showed no automatic consent prompt, the policy endpoint returning 200, and a pageview accepted by Google with 204. The prior test opt-out was restored afterward. European prompt behavior is covered by automated country-policy and component tests, not a physical European-IP browser session.
- Read-only production audit passed for **all 122 sitemap URLs**: HTTP 200, HTML content, matching self-canonicals, titles/descriptions, and no noindex directive. The existing 38 SEO checks also passed. Run `node cloudflare/audit-sitemap.mjs` for the full audit; it deliberately paces requests below the anti-harvesting burst limit.
- Google's live sitemap inspection reported crawl allowed, successful page fetch, and indexing allowed. The stale sitemap-report failure was HTTP 403 from September 26, not a failure of the current live fetch. The current sitemap was resubmitted and Google displayed “Sitemap submitted successfully.” The sitemap itself is a discovery file, not a page that needs an indexing request.
- Search Console reported no manual actions, no security issues, and no HTTPS issues. Core Web Vitals has insufficient real-user data for both device types; there is no Search Console setting to manufacture field data or guarantee a ranking improvement.
- Started validation of the 17 “Crawled - currently not indexed” examples (last crawled before the SEO release). Google displayed “Validation Started,” October 19.
- Google accepted a priority indexing request for `/advanced-search/Egypt`. The homepage and `/advanced-search` were already indexed. Existing English aliases redirect to canonical word URLs; redirect exclusions are expected and should not be forced into the sitemap.
- Google processing, validation results, and individual indexing decisions remain pending; neither a successful live test nor accepted submission guarantees indexing of every URL.

## Recheck

### Mobile/desktop privacy follow-up, October 19

Worker `138496af-8327-477a-bc06-621ed62125ca` removes the floating Privacy button that covered mobile copyright and the desktop footer arrow. Preferences now open in a native modal with close/Escape and focus restoration. Browser DNT/GPC shows a clear tracking-protection message and a working Done button rather than a disabled Allow button. A delayed regional lookup cannot reopen a manually dismissed or accepted dialog.

Verified in the live browser at 390px mobile width and 1280px desktop width: no floating control, no copyright overlap, desktop arrow unobstructed and toggling both ways, Allow closes the modal and Google's pageview endpoint returns 204. Restored the test opt-out afterward. All 45 tests, production build, Worker typecheck, and 38 live SEO checks passed. This is browser viewport verification, not a reproduction on the user's physical phone.

1. Open the existing Qamous property, not a similarly named unrelated property.
2. For a consent-required or unknown region without a saved choice, confirm no `gtag/js` or GA4 collection request occurs before acceptance. For a known outside region, confirm no automatic prompt, tracking starts after policy resolution, and an existing denial still prevents it.
3. Accept optional analytics, open a word using an internal link, and check Realtime and the browser network for exactly one pageview per navigation.
4. Use Privacy → No thanks, navigate again, and confirm collection stops.
5. Check Search Console → Ownership verification, Sitemaps, and a live URL inspection. Preserve the DNS TXT record and existing Googlebot-compatible robots/security rules.
6. Run `npx vitest run`, `npm run build`, `npx tsc -p cloudflare/tsconfig.json`, and `node cloudflare/verify-seo.mjs` before future releases. Production deployment remains behind the existing free-plan guard.
