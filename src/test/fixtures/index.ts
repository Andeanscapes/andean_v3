/**
 * Test fixtures — local copies of the live remote feed.
 *
 * The feed at `REMOTE_DATA_BASE_URL` is the single source of truth for site
 * data; there are no local mocks. The payloads are **real business data and are
 * never committed** — they live in the gitignored `fixtures/` directory at the
 * repo root, downloaded by `scripts/fetch-fixtures.ts`.
 *
 * Tests must stay deterministic and offline (see
 * `.github/copilot-instructions.md`), so they stub `fetch` and serve these
 * payloads instead of hitting the CDN. Reading from disk rather than importing
 * JSON is what keeps the data out of the repository and out of the bundle.
 *
 * Refresh with:
 *   npm run fixtures:fetch
 *
 * This runs automatically via the `pretest` hook, so `npm test` is always
 * checked against what is actually published.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ZodType } from 'zod';
import {
  ExperienceFeedV2Schema,
  ExperiencesListFeedV2Schema,
  LandingFeedV2Schema,
} from '@/lib/schemas/feed/v2';

const FIXTURES_DIR = path.resolve(__dirname, '../../../fixtures');

/**
 * Read a downloaded payload and parse it through the same schema the app
 * validates on read.
 *
 * This is what makes a local copy meaningful: if the schema tightens or the feed
 * shape drifts, it fails here at import time instead of quietly satisfying tests
 * with a payload production would reject. A cast would hide exactly the drift
 * these fixtures exist to catch.
 *
 * Filenames match the remote paths exactly, so there is no mapping to keep in
 * sync with `scripts/fetch-fixtures.ts`.
 */
/**
 * Defer loading until a fixture is actually read.
 *
 * These are module-scope exports, so an eager read makes one missing or
 * schema-violating payload fail *every* suite that imports this barrel — even
 * suites that never touch it. During the v1→v2 migration that is the difference
 * between one honest failure and a wall of unrelated ones.
 *
 * The returned value behaves like the parsed object; the proxy only intercepts
 * the first access to run `load`, then delegates to the real payload.
 */
function lazyFixture<T extends object>(load: () => T): T {
  let resolved: T | undefined;
  const target = () => (resolved ??= load());

  return new Proxy({} as T, {
    get: (_, prop, receiver) => Reflect.get(target(), prop, receiver),
    has: (_, prop) => Reflect.has(target(), prop),
    ownKeys: () => Reflect.ownKeys(target()),
    getOwnPropertyDescriptor: (_, prop) => Reflect.getOwnPropertyDescriptor(target(), prop),
  });
}

function loadFixture<T>(file: string, schema: ZodType<T>): T {
  let raw: unknown;

  try {
    raw = JSON.parse(readFileSync(path.join(FIXTURES_DIR, file), 'utf8'));
  } catch (err) {
    throw new Error(
      `[fixtures] Could not read fixtures/${file}. The feed is not committed — ` +
        'run `npm run fixtures:fetch` to download it.\n' +
        (err instanceof Error ? err.message : String(err)),
    );
  }

  const result = schema.safeParse(raw);

  if (!result.success) {
    throw new Error(
      `[fixtures] fixtures/${file} no longer satisfies its schema. ` +
        'Re-download it with `npm run fixtures:fetch`, or fix the live feed.\n' +
        JSON.stringify(result.error.format(), null, 2),
    );
  }

  return result.data;
}

export const LANDING_FIXTURE = lazyFixture(() =>
  loadFixture('landing.json', LandingFeedV2Schema),
);

export const EXPERIENCES_LIST_FIXTURE = lazyFixture(() =>
  loadFixture('experiences-list.json', ExperiencesListFeedV2Schema),
);

export const EXPERIENCE_EMERALD_MINING_FIXTURE = lazyFixture(() =>
  loadFixture('experience-emerald-mining.json', ExperienceFeedV2Schema),
);

/** Deep copy so a test mutating a payload cannot leak into another test. */
export function cloneFixture<T>(fixture: T): T {
  return JSON.parse(JSON.stringify(fixture)) as T;
}
