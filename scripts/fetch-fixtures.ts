/**
 * Download the live remote feed into the gitignored `fixtures/` directory.
 *
 * The feed is real business data, so it is deliberately **not committed**. Tests
 * still must not reach the network (see `.github/copilot-instructions.md`), so
 * the payloads are fetched once here and served from disk by
 * `src/test/fixtures/index.ts`.
 *
 * Runs automatically via the `pretest` hook. Run it directly with:
 *   npm run fixtures:fetch
 *
 * Behaviour on failure is deliberate:
 *   - fetch fails but a local copy exists  -> warn, keep the copy, exit 0
 *     (so `npm test` works offline / on a plane / during a CDN outage)
 *   - fetch fails and no local copy exists -> exit 1 with instructions
 *   - payload fails its schema             -> exit 1, and the stale copy is kept
 *     rather than overwritten with something the app would reject on read
 */

import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
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
import {
  DEFAULT_FEED_BASE_URL,
  fetchFeedJson,
  resolveExperienceIds,
  resolveFeedBaseUrl,
} from './lib/feed';

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

const baseUrlResult = resolveFeedBaseUrl(DEFAULT_FEED_BASE_URL);

if (!baseUrlResult.ok) {
  console.error(`[fetch-fixtures] ${baseUrlResult.reason}`);
  process.exit(1);
}

/**
 * Falling back to the committed default is a convenience for local runs, never
 * for CI: there the variable is supplied by `vars.REMOTE_DATA_BASE_URL_PROD`, so
 * an unset or misspelled repository variable must fail the job instead of
 * quietly testing against production anyway.
 */
if (baseUrlResult.source === 'default' && process.env.CI) {
  console.error(
    '[fetch-fixtures] REMOTE_DATA_BASE_URL is unset in CI. Refusing to fall back to ' +
      `"${DEFAULT_FEED_BASE_URL}" — check the REMOTE_DATA_BASE_URL_PROD repository variable.`,
  );
  process.exit(1);
}

const baseUrl = baseUrlResult.url;
const baseUrlSource = baseUrlResult.source === 'env' ? 'REMOTE_DATA_BASE_URL' : 'committed default';

let failures = 0;
let written = 0;
let kept = 0;

function hasLocalCopy(file: string): boolean {
  return existsSync(path.join(FIXTURES_DIR, file));
}

/**
 * Fetch, validate, write. Returns the parsed payload so the list can drive which
 * experience files to pull next.
 */
async function pull<T>(file: string, schema: ZodType<T>): Promise<T | null> {
  const url = `${baseUrl}/${file}`;
  const result = await fetchFeedJson(url);

  if (!result.ok) {
    if (hasLocalCopy(file)) {
      console.warn(`  ~ ${file}: ${result.reason} — keeping the existing local copy`);
      kept += 1;
      return null;
    }

    console.error(`  ✗ ${file}: ${result.reason} (${url}) and no local copy to fall back to`);
    failures += 1;
    return null;
  }

  const parsed = schema.safeParse(result.json);
  if (!parsed.success) {
    console.error(
      `  ✗ ${file}: the live payload does not satisfy the schema the app validates on read.\n` +
        JSON.stringify(parsed.error.format(), null, 2),
    );
    failures += 1;
    return null;
  }

  // Writes the payload as fetched rather than Zod's output, so nothing a schema
  // does not model is dropped from the local copy. Pretty-printed purely so a
  // re-download produces a readable diff.
  writeFileSync(path.join(FIXTURES_DIR, file), `${JSON.stringify(result.json, null, 2)}\n`, 'utf8');
  console.log(`  ✓ ${file}`);
  written += 1;

  return parsed.data;
}

async function main(): Promise<void> {
  mkdirSync(FIXTURES_DIR, { recursive: true });

  console.log(`[fetch-fixtures] ${baseUrl} (from ${baseUrlSource}) -> fixtures/`);

  await pull(LANDING_FEED_FILE, LandingFeedV2Schema);
  const list = await pull(EXPERIENCES_LIST_FEED_FILE, ExperiencesListFeedV2Schema);

  // Derive the experience files from the list rather than hardcoding them, so
  // publishing a new experience needs no change here.
  for (const experienceId of list ? resolveExperienceIds(list.experiences) : []) {
    await pull(experienceFeedFile(experienceId), ExperienceFeedV2Schema);
  }

  // With no list there is no way to know which experience files are expected;
  // accept whatever was already downloaded rather than failing a valid cache.
  if (!list && !hasLocalCopy(EXPERIENCES_LIST_FEED_FILE)) {
    console.error('  ✗ experiences-list.json is required to resolve the experience files');
    failures += 1;
  }

  console.log(`[fetch-fixtures] ${written} downloaded, ${kept} kept`);

  if (failures > 0) {
    console.error(
      `[fetch-fixtures] FAILED with ${failures} problem(s). ` +
        'Tests need these payloads — check REMOTE_DATA_BASE_URL and your network.',
    );
    process.exit(1);
  }
}

main();
