# Feed Fixtures

This directory contains gitignored copies of the published remote feed. Refresh
them with `npm run fixtures:fetch`; do not commit the downloaded payloads.

For local development edits (e.g., testing pricing or copy changes), use
`fixtures-local/` — run `npm run feed:sync` to initialize it, edit the files,
then run `npm run feed:sync` again to upload your changes to the live R2 bucket.

**Deploy code before the feed.** A feed that uses a new code (experience id,
host, highlight, exclusion) fails the schema of the code already in production,
and the service throws for every page that reads that file — even when the new
entry is `draft`. Ship the schema change first, then run `feed:sync`.

Use `"status": "draft"` for an experience whose copy or media is not final:
drafts are skipped by the list, the landing page and routing.

To hide an experience, set `"status": "draft"` in all three places and keep them equal:
- `experiences-list.json` (routing, `/experiences`, sitemap, `llms.txt`), the source of truth
- `landing.json` entry (featured cards)
- `experience-<id>.json` (detail page)

Also remove it from `featuredExperienceIds`. The `flagshipExperienceId` must stay
`published`: the schema rejects a draft flagship. `npm run feed:sync` refuses to
upload, and `npm run verify:feed` fails, when the statuses disagree or a featured
id is not published.
