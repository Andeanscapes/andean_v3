/**
 * Verify the live remote feed.
 * Usage: REMOTE_DATA_BASE_URL=https://cdn.andeanscapes.com/services npm run verify:feed
 *
 * The feed is hand-edited and uploaded, and services have no local fallback, so
 * a malformed payload is a site-wide outage. This is the only write-side gate:
 * it fetches what is actually published and checks
 *   1. every expected file exists and is valid JSON,
 *   2. each payload satisfies the same Zod schema the app validates on read,
 *   3. every translation key it references exists in en/es/fr,
 *   4. every routable card has the fields the catalog needs for a route.
 *
 * Exits non-zero on the first category that fails, so it can gate a deploy.
 */

import type { ZodType } from 'zod';
import {
  ExperienceFeedV2Schema,
  ExperiencesListFeedV2Schema,
  LandingFeedV2Schema,
} from '../src/lib/schemas/feed/v2';
import { EXPERIENCE_I18N, EXPERIENCE_METADATA_NAMESPACE } from '../src/i18n/mappings/experience';

import {
  EXPERIENCES_LIST_FEED_FILE,
  LANDING_FEED_FILE,
  experienceFeedFile,
} from '../src/utils/feedPaths';
import enMessages from '../src/i18n/messages/en.json';
import esMessages from '../src/i18n/messages/es.json';
import frMessages from '../src/i18n/messages/fr.json';
import { fetchFeedJson, resolveExperienceIds, resolveFeedBaseUrl } from './lib/feed';

const LOCALES: Record<string, unknown> = { en: enMessages, es: esMessages, fr: frMessages };
const KEY_PATTERN = /^(Landing|ExperiencesList|experiences)\.[A-Za-z0-9_.]+$/;

// No default: this gates a deploy, so it must verify the URL it was pointed at
// rather than one it assumed.
const baseUrlResult = resolveFeedBaseUrl();
const failures: string[] = [];

function fail(message: string): void {
  failures.push(message);
  console.error(`  ✗ ${message}`);
}

async function fetchJson(baseUrl: string, file: string): Promise<unknown | null> {
  const url = `${baseUrl}/${file}`;
  const result = await fetchFeedJson(url);

  if (!result.ok) {
    fail(`${file}: ${result.reason} (${url})`);
    return null;
  }

  return result.json;
}

function validate<T>(file: string, schema: ZodType<T>, raw: unknown): T | null {
  const result = schema.safeParse(raw);
  if (!result.success) {
    fail(`${file}: schema validation failed\n${JSON.stringify(result.error.format(), null, 2)}`);
    return null;
  }
  return result.data;
}

function resolveKey(messages: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

function collectKeys(value: unknown, acc: Set<string> = new Set()): Set<string> {
  if (typeof value === 'string') {
    if (KEY_PATTERN.test(value)) acc.add(value);
    return acc;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, acc);
    return acc;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectKeys(item, acc);
  }
  return acc;
}

/** Copy lives in local message bundles, so feed keys must resolve in all locales. */
function checkKeys(file: string, payload: unknown): void {
  const keys = Array.from(collectKeys(payload));

  for (const [locale, messages] of Object.entries(LOCALES)) {
    const missing = keys.filter((key) => typeof resolveKey(messages, key) !== 'string');
    if (missing.length > 0) {
      fail(
        `${file}: ${missing.length} key(s) missing in ${locale}: ${missing.slice(0, 10).join(', ')}` +
          (missing.length > 10 ? ` … +${missing.length - 10} more` : ''),
      );
    }
  }

  console.log(`  ✓ ${file}: ${keys.length} translation key(s) resolve in en/es/fr`);
}

async function main(): Promise<void> {
  if (!baseUrlResult.ok) {
    console.error(`[verify-feed] ${baseUrlResult.reason}`);
    process.exit(1);
  }

  const baseUrl = baseUrlResult.url;

  console.log(`[verify-feed] ${baseUrl}\n`);

  // 1. landing.json
  const landingRaw = await fetchJson(baseUrl, LANDING_FEED_FILE);
  if (landingRaw) {
    const landing = validate('landing.json', LandingFeedV2Schema, landingRaw);
    if (landing) {
      console.log('  ✓ landing.json: schema OK');
      checkKeys('landing.json', landing);

      const { reviews, reviewSummary, flagshipExperienceId, experiences } = landing;

      // The trust panel advertises the total, so the aggregate must cover at
      // least the reviews actually shipped.
      if (reviewSummary.count < reviews.length) {
        fail(
          `landing.json: reviewSummary.count (${reviewSummary.count}) is lower than ` +
            `reviews.length (${reviews.length})`,
        );
      }

      // The hero renders the flagship; an id with no entry takes the page down.
      if (!experiences.some((entry) => entry.id === flagshipExperienceId)) {
        fail(
          `landing.json: flagshipExperienceId "${flagshipExperienceId}" is not in experiences[]`,
        );
      }

      // Every review needs mapped comment copy or its card renders empty.
      const commentKeys = EXPERIENCE_I18N[flagshipExperienceId]?.reviews ?? {};
      for (const review of reviews) {
        if (!(review.id in commentKeys)) {
          fail(
            `landing.json: review "${review.id}" has no comment mapping — ` +
              'add it to src/i18n/mappings/experience.ts',
          );
        }
      }
    }
  }

  // 2. experiences-list.json — also the routing source
  const listRaw = await fetchJson(baseUrl, EXPERIENCES_LIST_FEED_FILE);
  const list = listRaw
    ? validate('experiences-list.json', ExperiencesListFeedV2Schema, listRaw)
    : null;

  if (list) {
    console.log('  ✓ experiences-list.json: schema OK');
    checkKeys('experiences-list.json', list);

    // v2 drops metadataNamespace from the payload — the frontend owns it. An
    // experience with no entry produces no usable SEO namespace at render time.
    for (const entry of list.experiences) {
      if (entry.status !== 'published') continue;
      if (!(entry.id in EXPERIENCE_METADATA_NAMESPACE)) {
        fail(
          `experiences-list.json: "${entry.id}" has no EXPERIENCE_METADATA_NAMESPACE entry — ` +
            'its page metadata cannot resolve. Add it to src/i18n/mappings/experience.ts',
        );
      }
    }
  }

  // 3. one file per experience referenced by the list
  const experienceIds = resolveExperienceIds(list?.experiences ?? []);

  if (experienceIds.length === 0) {
    fail('experiences-list.json: no entry declares an id — no detail page can render');
  }

  for (const experienceId of experienceIds) {
    const file = experienceFeedFile(experienceId);
    const raw = await fetchJson(baseUrl, file);
    if (!raw) continue;

    const data = validate(file, ExperienceFeedV2Schema, raw);
    if (!data) continue;

    console.log(`  ✓ ${file}: schema OK`);
    checkKeys(file, data);

    const upcoming = data.availableDates.filter(
      (d) => d.isAvailable && d.spots > 0 && d.startDate.slice(0, 10) >= new Date().toISOString().slice(0, 10),
    );
    if (upcoming.length === 0) {
      fail(`${file}: no future availability — the experience will show zero departures`);
    }
  }

  console.log('');

  if (failures.length > 0) {
    console.error(`[verify-feed] FAILED with ${failures.length} problem(s).`);
    process.exit(1);
  }

  console.log('[verify-feed] OK — feed is valid and fully translated.');
}

main();
