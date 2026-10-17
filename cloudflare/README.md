# Cloudflare frontend operations

Use Node 22.18+ and `npm ci`. `npm run build` creates the normal React/Vite build;
`npx vitest run` runs the UI/policy tests. `npm audit` checks all dependencies.

Production release: `npm run deploy:cloudflare`, with the sibling `qamous-backend`
checkout available. The deployment first requires fresh, manually verified Workers Free
billing evidence, then uses authenticated D1 access to export public SEO fields only.
`generate-seo.mjs` adds word-specific metadata and no-JavaScript previews plus the current
sitemap to the static build. No user records, credentials or aggregate JSON export are deployed.
The generated `.seo-data.json` is local and ignored; never add it to the public repository.

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
guaranteed. Rebuild after important content/moderation changes to refresh SEO snapshots.

Private-data rollback and full security verification are documented in the backend's
`cloudflare/README.md` and `cloudflare/SECURITY.md`. AWS must not be reactivated for rollback.

## Explicit page routing and dialect guides

The build generates self-canonical HTML for the blog, about page, discovery page and
country guides, plus the existing word pages and noindex shells for known app routes.
Countries with spaces use real directory names and encoded public URLs. Country guides
and word previews contain ordinary vocabulary/cross-dialect links, not a bulk dataset file.
Public-only export fields include country membership; user/ownership data remain excluded.
The interactive guides retain the search/filter/voting experience and support Arabic/English.

Assets remain first: valid static pages do not need a Worker invocation. Missing assets
reach the Worker (`not_found_handling: none`, `assets_navigation_has_no_effect`) instead
of silently receiving the homepage. Unknown routes return a noindex 404; known search
and reset deep links receive their noindex shell. English word aliases redirect to the
canonical URL. Words added since the build are checked against the existing public API,
with bounded response handling; API quotas/outages yield 503, not a misleading permanent 404.
Reset tokens and search text are not copied into fallback canonical URLs.

Run `npx tsc -p cloudflare/tsconfig.json` separately from the browser typecheck to avoid
mixing Workers and DOM globals. `npx vitest run` includes route/generation/guide tests.
With both local Workers running, `node cloudflare/verify-seo.mjs http://127.0.0.1:8788`
checks real asset routing, navigation, country metadata and deep links. After release run
`node cloudflare/verify-seo.mjs` for read-only production verification. No Google Search
Console setup, individual blog URLs or changes to community definitions are included here.
