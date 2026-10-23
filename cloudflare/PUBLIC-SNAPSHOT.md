# Public snapshot release and removal

The frozen snapshot stays authoritative while the API and importer are paused.
The deployment guard checks both live `PUBLIC_READ_ONLY` settings and the empty
importer schedule. Snapshot JSON is served directly as static assets; removing
`PUBLIC_SNAPSHOT_ID` alone does not remove those files.

To return to live data, keep both writers paused while preparing the replacement:

1. Remove the generated `public/public-data` and `build/public-data` directories
   from this checkout. Resolve and verify both absolute paths are inside the
   intended checkout before any recursive deletion. These are generated public
   assets; do not delete the separate private export or release evidence.
2. Remove the snapshot ID and expiry bindings and disable the frozen flag in
   `wrangler.jsonc`. Build normally. Both build and deployment reject any remaining
   files in either public-data directory when snapshot authority is disabled.
3. Publish the frontend without snapshot authority or assets, verify an old
   `/public-data/<snapshotId>/manifest.json` URL no longer serves the snapshot,
   and allow its existing 60-second browser/CDN cache lifetime to pass.
4. Only then use the guarded backend deployment to resume writes and imports.

`--code-only` is for CI compilation and fixture SSR. Its marked output cannot be
published through the production deployment command.
