# Feed Fixtures

This directory contains gitignored copies of the published remote feed. Refresh
them with `npm run fixtures:fetch`; do not commit the downloaded payloads.

For local development edits (e.g., testing pricing or copy changes), use
`fixtures-local/` — run `npm run feed:sync` to initialize it, edit the files,
then run `npm run feed:sync` again to upload your changes to the live R2 bucket.
