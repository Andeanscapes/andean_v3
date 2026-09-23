/**
 * Publish the staged feed payloads to `services/` in R2.
 *
 * This is the step that makes deployed environments read the CDN media: the
 * media objects can all be uploaded (`npm run media:push`) and nothing changes
 * on the site until the feed that points at them is published, because the feed
 * is the only source of truth the services read.
 *
 * Run it with:
 *   npm run feed:publish                # dry run: prints the plan
 *   npm run feed:publish -- --confirm   # uploads feed-migration/next/
 *   npm run feed:publish -- --rollback --confirm
 *
 * **Dry run is the default on purpose.** These payloads are real business data —
 * prices, availability, review counts — and publishing overwrites the live copy
 * with no versioning behind it. `feed:stage-cdn-media` writes a `rollback/`
 * snapshot precisely so this is reversible; `--rollback` republishes it.
 *
 * Every payload is validated against the same schema the app applies on read
 * before it is uploaded. A payload that fails is not published, and nothing else
 * is either: a partial publish would leave the projections in `landing.json` and
 * `experiences-list.json` disagreeing with their owner in
 * `experience-*.json`, which `src/test/feed-v2/contract.test.ts` treats as a
 * broken feed.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { ZodType } from 'zod';
import {
  ExperienceFeedV2Schema,
  ExperiencesListFeedV2Schema,
  LandingFeedV2Schema,
} from '../src/lib/schemas/feed/v2';
import {
  EXPERIENCES_LIST_FEED_FILE,
  LANDING_FEED_FILE,
  experienceFeedFile,
} from '../src/utils/feedPaths';

const REPO_ROOT = path.resolve(__dirname, '..');
const STAGING_DIR = path.join(REPO_ROOT, 'feed-migration');

/**
 * Target bucket. Configuration, not a credential — `wrangler.toml` declares no
 * R2 binding, so there is no existing source of truth to read this from.
 */
const BUCKET = process.env.R2_BUCKET?.trim() || 'andean-app-dev';

/** Matches `REMOTE_DATA_BASE_URL`, which is `<cdn>/services`. */
const KEY_PREFIX = 'services';

const confirmed = process.argv.includes('--confirm');
const rollback = process.argv.includes('--rollback');

const SOURCE_DIR = path.join(STAGING_DIR, rollback ? 'rollback' : 'next');

/**
 * The three payloads, each with the schema the app validates it against on read.
 * `experienceFeedFile` rather than a hand-built name, so this cannot drift from
 * the path the services request.
 */
const PAYLOADS = [
  { file: LANDING_FEED_FILE, schema: LandingFeedV2Schema as ZodType<unknown> },
  { file: EXPERIENCES_LIST_FEED_FILE, schema: ExperiencesListFeedV2Schema as ZodType<unknown> },
  { file: experienceFeedFile('emeraldMining'), schema: ExperienceFeedV2Schema as ZodType<unknown> },
] as const;

function fail(message: string): never {
  console.error(`[feed:publish] ${message}`);
  process.exit(1);
}

function upload(file: string): void {
  // `--remote` is not optional: without it wrangler writes to the local
  // Miniflare bucket under .wrangler/ and still reports success.
  execFileSync(
    'npx',
    [
      // Never resolve a missing binary from the registry: this step runs with
      // the R2 credentials loaded, so an unpinned fetch here is the worst place
      // to accept one. Absent locally must fail, not install.
      '--no-install',
      'dotenv',
      '-e',
      '.env.wrangler',
      '--',
      'wrangler',
      'r2',
      'object',
      'put',
      `${BUCKET}/${KEY_PREFIX}/${file}`,
      '--file',
      path.join(SOURCE_DIR, file),
      '--content-type',
      'application/json',
      '--remote',
    ],
    { cwd: REPO_ROOT, stdio: 'pipe' },
  );
}

function main(): void {
  if (!existsSync(SOURCE_DIR)) {
    fail(
      `${path.relative(REPO_ROOT, SOURCE_DIR)} does not exist. ` +
        'Run `npm run feed:stage-cdn-media` first.',
    );
  }

  console.log(
    `[feed:publish] ${path.relative(REPO_ROOT, SOURCE_DIR)}/ -> ${BUCKET}/${KEY_PREFIX}/` +
      `${rollback ? '  (ROLLBACK)' : ''}`,
  );

  // Validate everything before uploading anything, so a bad payload cannot
  // result in a half-published feed.
  for (const { file, schema } of PAYLOADS) {
    const location = path.join(SOURCE_DIR, file);

    if (!existsSync(location)) fail(`${file} is missing from ${path.relative(REPO_ROOT, SOURCE_DIR)}/`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(location, 'utf8'));
    } catch (error) {
      fail(`${file}: ${error instanceof Error ? error.message : String(error)}`);
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      fail(
        `${file} does not satisfy the schema the app validates on read:\n` +
          JSON.stringify(result.error.format(), null, 2),
      );
    }

    console.log(`  ✓ ${file} validated`);
  }

  if (!confirmed) {
    console.log(
      `[feed:publish] DRY RUN — ${PAYLOADS.length} payload(s) would be published.\n` +
        '[feed:publish] This overwrites live business data. Review ' +
        `${path.relative(REPO_ROOT, SOURCE_DIR)}/ against ` +
        'feed-migration/rollback/, then re-run with `-- --confirm`.',
    );
    return;
  }

  for (const { file } of PAYLOADS) {
    try {
      upload(file);
      console.log(`  ↑ ${file}`);
    } catch (error) {
      // No automatic revert: the earlier files are already live, and a failed
      // upload leaves the feed inconsistent. Say so plainly and name the fix.
      fail(
        `${file} failed to upload: ${error instanceof Error ? error.message : String(error)}\n` +
          'The feed may now be inconsistent. Republish the previous payloads with ' +
          '`npm run feed:publish -- --rollback --confirm`.',
      );
    }
  }

  console.log(`[feed:publish] published ${PAYLOADS.length} payload(s)`);
  console.log('');
  console.log('Verify with `npm run verify:feed`, then re-download with `npm run fixtures:fetch`.');
}

main();
