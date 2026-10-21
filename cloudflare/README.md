# Cloudflare frontend operations

Use Node 22.18+ and `npm ci`. `npm run build` checks the shared application and
creates browser assets plus the Worker renderer. `npx vitest run` checks UI and
routing policies; `npm run test:ssr` exercises the compiled production renderer.
`npm audit` checks dependencies.

Production release: run `npm run deploy:cloudflare` with the sibling `qamous-backend`
checkout available. Deployment requires fresh, manually verified Workers Free billing
evidence. The existing backend must already include `0008_seo_discovery.sql`; this
rendering migration needs no new migration or API deployment. No account records,
credentials, or bulk dictionary export are shipped in static assets.

API access is through the same-origin `/api` service binding. Both workers.dev mirrors are
disabled; use the approved custom domains. Static assets do not depend
on API request quotas. The account and service are pinned; paid bindings and command-line
configuration/account overrides are rejected. No automatic production deployment runs in
GitHub Actions because a release must reverify the account's free billing plan.

The old Vercel CI job and Git auto-deploys are disabled. The Vercel project itself remains
untouched for deliberate rollback; the site's canonical production host is Cloudflare.

`public/_headers` defines browser security and private-page indexing rules. Script execution
does not allow unsafe-inline or unsafe-eval. Runtime inline styles are retained for the existing
animation, icon, tour and ad components. Known Google advertising/Yamli script origins remain
explicit trust dependencies. Verify the browser console after changing third-party providers.

`public/robots.txt` discourages named training crawlers while permitting public search
rendering resources. It is advisory, not an access-control boundary. The API/Cloudflare
protections add enforcement, but indexed public pages can still be copied. Rankings are not
guaranteed. Dictionary changes appear in sitemap shards and word HTML automatically;
the edge cache can retain earlier public content for up to five minutes.

Private-data rollback and full security verification are documented in the backend's
`cloudflare/README.md` and `cloudflare/SECURITY.md`. AWS must not be reactivated for rollback.

## Explicit page routing and dialect guides

Every application document uses the same React page tree on the server and browser.
The Worker loads the page's bounded data through the API service binding, renders
`Application`, and supplies its query snapshot in escaped, non-executable JSON.
`hydrateRoot` attaches events to those same DOM nodes. There is no alternate SEO
preview, loading overlay, or bot-specific page. The same HTML remains readable
without JavaScript; account actions still require JavaScript.

Language and theme are resolved per request and used for both renders. English and
Arabic word/browse URLs take precedence over a saved language. Each request owns
its i18next instance, query client and metadata context. Server timestamps make
countdowns deterministic. Compiled CSS for the active route and its dependencies is
included directly in the initial head, using the browser build manifest. It does
not wait for stylesheet downloads or font imports, so Firefox cannot briefly paint
unconstrained SVGs or an unstyled layout on slow connections. Each normal stylesheet
link remains immediately after its inline copy to preserve cascade order and Vite's
client navigation behavior. The Worker bundle and browser assets must always be
deployed together.

Only fixed public data routes are requested while rendering. Public row reads may
forward the visitor's session cookie to preserve reaction flags. Cookies, tokens,
sessions and account records are never put in bootstrap JSON. Internal SEO credentials
are sent only to `/seo/*` through the existing service binding. Responses with cookies
or authorization, account/search/reset pages, and errors are not shared in cache.
Anonymous public cache entries distinguish rendering version and preferred language.

Static files bypass the Worker. Application pages, word/dialect/browse routes and XML
sitemaps reach explicit routing. Unknown pages return a rendered noindex 404; upstream
outages return 503. English word aliases and canonical IDs retain their redirects.
A sitemap index points to ID-range word shards of at most 2,000 language URLs each.
Keyset `/browse/en` and `/browse/ar` pages link every eligible word through ordinary
anchors. Reset tokens and search text stay out of canonical URLs.

Run `npx tsc -p cloudflare/tsconfig.json` separately from the browser typecheck to avoid
mixing Workers and DOM globals. `npx vitest run` includes routing and guide tests.
With both local Workers running, `node cloudflare/verify-seo.mjs http://127.0.0.1:8788`
checks real asset routing, navigation, country metadata and deep links. After release run
`node cloudflare/verify-seo.mjs` for read-only production verification. No Google Search
Console setup, individual blog URLs or changes to community definitions are included here.

The `/blog` route remains indexed and listed in the sitemap, with no links from the
site navigation or footer. Its bilingual learning guides use the same content on
the server and browser
(`src/content/blog-guides.ts`). Existing community posts remain available below them.

## Rendering verification

After `npm run build`, run `npm run test:ssr`. It checks direct rendering across
24 routes, concurrent English/Arabic/theme isolation, metadata, attribution and
safe bootstrap serialization. For browser verification start `npm run preview:ssr`;
it serves two local Workers on port 8795 with authored public fixtures and never
writes production data. In a named Playwright CLI session open that URL and run:

```
playwright-cli -s=qamous-ssr run-code --filename scripts/verify-hydration.js
playwright-cli -s=qamous-ssr run-code --filename scripts/verify-first-paint.js
```

The browser check delays startup scripts and verifies DOM reuse and absence of
hydration errors across 23 routes at desktop and mobile widths. Private pages may
redirect to login after hydration. Test live public routes, theme/language toggles,
search, and Worker outcomes after release. The fixture preview is a verification
helper, not a public deployment target. `npm start` remains the fast client dev server.
The first-paint check withholds all local stylesheets and startup JavaScript, then
checks the real layout and icon sizes before releasing them and checking hydration.
Run it in both Firefox and Chromium; Chromium's paint suppression can conceal a
Firefox flash of unstyled content.
