# Restoring interactive operation

The frontend supports frozen static recovery and normal API-backed operation.
Snapshot withdrawal never unpauses a backend writer or starts an importer.

1. Keep the current frozen frontend deployed while the backend installs,
   verifies and primes its mutable public cache and prepared-card read model.
   Keep the importer paused with no schedules. Keep content writes paused.
2. Enable backend public reads with `PUBLIC_READ_ONLY=false`, while retaining
   `PUBLIC_WRITES_PAUSED=true` and `PUBLIC_CARD_PAYLOADS=true`. No content may
   change while the old public snapshot is still served. Verify backend cache
   readiness before moving on; the frontend's three bounded health probes are
   checks of representative routes, not proof that every resource was seeded.
3. In this frontend checkout, explicitly withdraw generated static data:

   ```powershell
   node scripts/public-snapshot.mjs withdraw
   npm run build
   npm run test:ssr
   npx tsc -p cloudflare/tsconfig.json
   node cloudflare/deploy.mjs --dry-run
   ```

   Withdrawal audits and moves both `public/public-data` and
   `build/public-data` into an ignored per-run backup. It removes
   `PUBLIC_SNAPSHOT_ID`, `PUBLIC_SNAPSHOT_EXPIRES_AT` and
   `PUBLIC_SNAPSHOT_FROZEN`, retaining a release record. Unknown files or unsafe
   paths stop the operation. Failed final validation restores the folders and
   original configuration. A normal build derives `VITE_PUBLIC_READ_ONLY=false`
   automatically, so the existing UI resumes without the recovery notice.
4. Publish the reviewed normal build with `node cloudflare/deploy.mjs`.
   Deployment independently checks the live API's read state, prepared-card
   flag, approved database and explicit write-pause state. When the deployed
   frontend still has snapshot authority, content writes and importer schedules
   must remain paused. Countries, the feed and one hydrated card must succeed.
5. Verify the deployed frontend has no snapshot binding, the former immutable
   JSON URLs return 404, normal browsing works, and shared HTML does not expose
   personalized data. Only then may the separately guarded backend release
   enable content writes and resume approved importer schedules.

Commit `wrangler.jsonc` and `cloudflare/public-snapshot-release.json` to record
the chosen mode. Keep retirement backups ignored. They are retained for audit,
not automatic rollback: previously withdrawn public data must not silently
become available again. Emergency frozen recovery remains supported through
the existing fresh-export packaging, snapshot installation and writer-pause
guards.
