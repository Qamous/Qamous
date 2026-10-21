# Cloudflare frontend operations

Use Node 22.18+ and `npm ci`. `npm run build` creates the normal React/Vite build;
`npx vitest run` runs the UI/policy tests. `npm audit` checks all dependencies.

Production release: apply backend migration `0008_seo_discovery.sql`, deploy the API,
then run `npm run deploy:cloudflare` with the sibling `qamous-backend` checkout
available. Both deploy scripts require fresh, manually verified Workers Free billing
evidence. The build generates only a small set of static guide and private shell
pages. Word HTML, browse pages, and XML sitemaps come from public D1 data at request
time. No user records, credentials, or bulk dictionary JSON are shipped in static assets.

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

The build generates self-canonical HTML for the blog, about page and discovery page,
plus noindex shells for known app routes. The Worker renders word pages and country
guides in the initial HTML with bounded D1 reads. Countries with spaces use encoded
public URLs. A dynamic sitemap index points to ID-range word shards of at most 2,000
language URLs each and a small static sitemap. Keyset `/browse/en` and `/browse/ar`
pages link every eligible word through ordinary anchors without a large static export.
The interactive guides retain the search/filter/voting experience and support Arabic/English.

Assets remain first for static routes. Word, browse, dialect and sitemap routes run the
Worker before asset lookup; missing assets reach explicit 404 handling instead of
silently receiving the homepage. Unknown routes return a noindex 404; known search
and reset deep links receive their noindex shell. English word aliases redirect to the
canonical URL. Newly imported words use the same route immediately after their database
transaction commits. API quotas/outages yield 503, not a misleading permanent 404.
Reset tokens and search text are not copied into fallback canonical URLs.

Run `npx tsc -p cloudflare/tsconfig.json` separately from the browser typecheck to avoid
mixing Workers and DOM globals. `npx vitest run` includes route/generation/guide tests.
With both local Workers running, `node cloudflare/verify-seo.mjs http://127.0.0.1:8788`
checks real asset routing, navigation, country metadata and deep links. After release run
`node cloudflare/verify-seo.mjs` for read-only production verification. No Google Search
Console setup, individual blog URLs or changes to community definitions are included here.

The `/blog` route remains indexed and listed in the sitemap, with no links from the
site navigation, footer or no-JavaScript previews. Its bilingual learning guides
share a content source with the generated English no-JavaScript page
(`src/content/blog-guides.ts`). Existing community posts remain available below them.
