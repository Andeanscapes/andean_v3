/**
 * Sync local feed edits in `fixtures-local/` to `services/` in R2.
 *
 * Run it with:
 *   npm run feed:sync:only   # feed JSON only
 *   npm run feed:sync        # media from r2-cache/ first, then this
 *
 * First run (no `fixtures-local/`): downloads the published feed from origin,
 * validates every payload, writes it plus a `.base/` snapshot, and stops so it
 * can be edited.
 *
 * Later runs:
 *   1. validate every local payload against the schema the app applies on read,
 *      and that `status` agrees across files — one failure uploads nothing
 *   2. classify each file against its `.base/` snapshot and the origin copy
 *      (cache-busted, byte-for-byte):
 *        unedited, live unchanged   -> skipped
 *        unedited, live changed     -> local copy refreshed from live
 *        edited,   live unchanged   -> uploaded
 *        edited,   live changed     -> conflict: nothing is uploaded
 *      so a stale local copy can never overwrite a newer publish
 *   2b. refuse the run if a changed payload references media (or a derived
 *      `-mobile` sibling) the CDN does not serve yet
 *   2c. refuse the run if a changed payload adds a field its live copy lacks:
 *      schemas are strict, so the deployed app would reject it. Deploy the
 *      reader first, then re-run with `-- --allow-new-fields`
 *   3. back up the live copy of every changed file to
 *      `fixtures-local/.previous/<timestamp>/` — a failed backup uploads nothing
 *   4. upload owners (`experience-*.json`) before projections, stopping at the
 *      first failure with restore instructions
 *   5. purge the CDN cache for the uploaded files (best effort)
 *   6. check the live site over ~1 minute; on a 4xx/5xx, re-upload the backed-up
 *      live copies and fail (`--skip-health-check` to opt out)
 *
 * **This uploads without confirmation**, by request. R2 object versioning is not
 * enabled, so the `.previous/` backup is the only undo.
 *
 * `R2_BUCKET` changes the upload target only. The diff and backup always read
 * `REMOTE_DATA_BASE_URL` (default: the production CDN), so set both together
 * when targeting another bucket.
 */

import { execFileSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
import { downloadFromOrigin, purgeCache, readLength } from './lib/cdn';
import { EDGE_CACHE_TTL_SECONDS } from '../src/lib/edge-cache';
import {
  collectMediaPaths,
  experienceResponsiveMediaKeys,
  findMissingResponsiveSiblings,
  findUnpublishedMedia,
  landingResponsiveMediaKeys,
} from './lib/feed-media';
import { DEFAULT_FEED_BASE_URL, resolveExperienceIds, resolveFeedBaseUrl } from './lib/feed';
import { findStatusIssues } from './lib/feed-status';
import { findNewKeyPaths } from './lib/feed-fields';
import { checkSiteHealth } from './lib/feed-health';
import { SITE_INFO } from '../src/constant/SiteConfig';

const REPO_ROOT = path.resolve(__dirname, '..');
const LOCAL_DIR = path.join(REPO_ROOT, 'fixtures-local');
/** The live bytes each local file was last synced from; the three-way merge base. */
const BASE_DIR = path.join(LOCAL_DIR, '.base');
const PREVIOUS_DIR = path.join(LOCAL_DIR, '.previous');

/**
 * Target bucket. Configuration, not a credential — `wrangler.toml` declares no
 * R2 binding, so there is no existing source of truth to read this from.
 */
const BUCKET = process.env.R2_BUCKET?.trim() || 'andean-app-dev';

/** Opt-in after deploying the code that reads a newly published field. */
const ALLOW_NEW_FIELDS = process.argv.includes('--allow-new-fields');

/**
 * Post-publish health check (see `requireHealthySite`). Targets the production
 * site by default; set `FEED_HEALTH_BASE_URL` when `R2_BUCKET` points elsewhere.
 * `--skip-health-check` exists for offline/CI runs, not for routine use.
 */
const SKIP_HEALTH_CHECK = process.argv.includes('--skip-health-check');
const HEALTH_BASE_URL = (process.env.FEED_HEALTH_BASE_URL?.trim() || SITE_INFO.url).replace(/\/+$/, '');
const HEALTH_PATHS = ['/', '/experiences'] as const;
const HEALTH_ATTEMPTS = 4;
const HEALTH_INTERVAL_MS = 15_000;

/** Matches `REMOTE_DATA_BASE_URL`, which is `<cdn>/services`. */
const KEY_PREFIX = 'services';

type Payload = { file: string; schema: ZodType<unknown> };

function fail(message: string): never {
  console.error(`[feed:sync] ${message}`);
  process.exit(1);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const baseUrlResult = resolveFeedBaseUrl(DEFAULT_FEED_BASE_URL);
if (!baseUrlResult.ok) fail(baseUrlResult.reason);
const baseUrl = baseUrlResult.url;

function urlFor(file: string): string {
  return `${baseUrl}/${file}`;
}

/**
 * Every payload the list routes to, owners first so a partial upload never
 * publishes a projection ahead of the data it projects.
 */
function payloadsFor(experienceIds: readonly string[]): Payload[] {
  return [
    ...experienceIds.map((id) => ({
      file: experienceFeedFile(id),
      schema: ExperienceFeedV2Schema as ZodType<unknown>,
    })),
    { file: EXPERIENCES_LIST_FEED_FILE, schema: ExperiencesListFeedV2Schema as ZodType<unknown> },
    { file: LANDING_FEED_FILE, schema: LandingFeedV2Schema as ZodType<unknown> },
  ];
}

/** Parse and validate raw bytes. Returns the parsed payload or a reason. */
function validate(
  file: string,
  bytes: Buffer,
  schema: ZodType<unknown>,
): { ok: true; data: unknown } | { ok: false; reason: string } {
  let json: unknown;
  try {
    json = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    return { ok: false, reason: `${file}: ${errorMessage(error)}` };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      ok: false,
      reason:
        `${file} does not satisfy the schema the app validates on read:\n` +
        JSON.stringify(result.error.format(), null, 2),
    };
  }
  return { ok: true, data: result.data };
}

function experienceIdsFrom(list: unknown): string[] {
  const parsed = ExperiencesListFeedV2Schema.safeParse(list);
  if (!parsed.success) fail(`${EXPERIENCES_LIST_FEED_FILE} does not satisfy its schema.`);
  return resolveExperienceIds(parsed.data.experiences);
}

async function downloadOrFail(file: string): Promise<Buffer> {
  const result = await downloadFromOrigin(urlFor(file));
  if (!result.ok) fail(`could not download ${file}: ${result.reason} (${urlFor(file)})`);
  return Buffer.from(result.body);
}

/** Record `bytes` as both the editable copy and its merge base. */
function writeSynced(file: string, bytes: Buffer): void {
  mkdirSync(BASE_DIR, { recursive: true });
  writeFileSync(path.join(LOCAL_DIR, file), bytes);
  writeFileSync(path.join(BASE_DIR, file), bytes);
}

/**
 * Download and validate the whole feed before writing anything, so a failure
 * never leaves a half-filled `fixtures-local/` behind.
 */
async function initialize(): Promise<void> {
  console.log(`[feed:sync] ${baseUrl} -> fixtures-local/ (first run)`);

  const listBytes = await downloadOrFail(EXPERIENCES_LIST_FEED_FILE);
  const list = validate(EXPERIENCES_LIST_FEED_FILE, listBytes, ExperiencesListFeedV2Schema);
  if (!list.ok) fail(list.reason);

  const downloaded = new Map<string, Buffer>();
  for (const { file, schema } of payloadsFor(experienceIdsFrom(list.data))) {
    const bytes = file === EXPERIENCES_LIST_FEED_FILE ? listBytes : await downloadOrFail(file);
    const result = validate(file, bytes, schema);
    if (!result.ok) fail(result.reason);
    downloaded.set(file, bytes);
  }

  // Written as fetched, so an unedited file matches origin byte-for-byte.
  downloaded.forEach((bytes, file) => {
    writeSynced(file, bytes);
    console.log(`  ✓ ${file}`);
  });

  console.log('[feed:sync] edit the files in fixtures-local/, then run `npm run feed:sync` again.');
}

/** The live bytes, or `null` when R2 does not hold the file. Unreadable aborts the run. */
async function readLive(file: string): Promise<Buffer | null> {
  const remote = await downloadFromOrigin(urlFor(file));
  if (remote.ok) return Buffer.from(remote.body);

  const probe = await readLength(urlFor(file), true);
  if (probe.status !== 'absent') {
    fail(`could not compare ${file}: ${remote.reason}. Nothing was uploaded.`);
  }
  return null;
}

function readBase(file: string): Buffer | null {
  const location = path.join(BASE_DIR, file);
  return existsSync(location) ? readFileSync(location) : null;
}

function sameBytes(a: Buffer | null, b: Buffer | null): boolean {
  if (a === null || b === null) return a === b;
  return a.equals(b);
}

type Change = { file: string; previous: Buffer | null };

/**
 * Three-way classification against `.base/` and origin. Unedited files that
 * moved live are refreshed in place; an edited file whose live copy also moved
 * is a conflict, and any conflict aborts the run before a single upload.
 */
async function findChanges(payloads: readonly Payload[]): Promise<Change[]> {
  const changes: Change[] = [];
  const conflicts: string[] = [];
  // Deferred until every file is classified. Refreshing in the loop meant a run
  // that then hit a conflict had already overwritten local copies — the
  // conflict aborted the upload but not the damage, and an unrelated edited file
  // was silently replaced by the live version.
  const refreshes: { file: string; live: Buffer; note: string | null }[] = [];

  for (const { file } of payloads) {
    const local = readFileSync(path.join(LOCAL_DIR, file));
    const live = await readLive(file);
    const base = readBase(file);

    // Folders created before `.base/` existed: adopt live as the base, which
    // reduces to a plain local-vs-live diff for this one run.
    if (base === null && live !== null) {
      console.warn(`  ! ${file}: no .base/ snapshot — comparing with live only`);
    }
    const effectiveBase = base ?? live;
    const edited = !sameBytes(local, effectiveBase);
    const liveMoved = !sameBytes(live, effectiveBase);

    if (!edited && !liveMoved) {
      if (base === null && live) refreshes.push({ file, live, note: null });
      continue;
    }

    if (!edited) {
      if (live) refreshes.push({ file, live, note: 'unedited, refreshed from live' });
      continue;
    }

    if (liveMoved) {
      conflicts.push(file);
      continue;
    }

    console.log(`  ${live ? '~' : '+'} ${file}`);
    changes.push({ file, previous: live });
  }

  if (conflicts.length > 0) {
    if (refreshes.length > 0) {
      console.error(
        `[feed:sync] left untouched: ${refreshes.map((entry) => entry.file).join(', ')} ` +
          '(would have been refreshed from live).',
      );
    }
    fail(
      'these files were edited locally AND changed live since your last sync:\n' +
        conflicts.map((file) => `    ${file}`).join('\n') +
        '\n[feed:sync] nothing was uploaded. Download the live copy from ' +
        `${baseUrl}/<file>, re-apply your edits to it,\n` +
        '[feed:sync] and save it as both fixtures-local/<file> and fixtures-local/.base/<file>.',
    );
  }

  for (const { file, live, note } of refreshes) {
    writeSynced(file, live);
    if (note) console.log(`  ↓ ${file} (${note})`);
  }

  return changes;
}

/** The `-mobile` siblings a page derives at render time for this payload. */
function responsiveKeysFor(file: string, json: unknown): string[] {
  if (file === LANDING_FEED_FILE) {
    const parsed = LandingFeedV2Schema.safeParse(json);
    return parsed.success ? landingResponsiveMediaKeys(parsed.data) : [];
  }
  if (file === EXPERIENCES_LIST_FEED_FILE) return [];

  const parsed = ExperienceFeedV2Schema.safeParse(json);
  return parsed.success ? experienceResponsiveMediaKeys(parsed.data) : [];
}

/**
 * Refuse to publish a payload that points at media the CDN does not serve yet.
 * Run `media:sync:new` first; publishing the feed ahead of its media breaks
 * every page that renders it.
 */
async function requirePublishedMedia(changes: readonly Change[]): Promise<void> {
  const keys = new Set<string>();
  const responsive: string[] = [];

  for (const { file } of changes) {
    const json: unknown = JSON.parse(readFileSync(path.join(LOCAL_DIR, file), 'utf8'));
    collectMediaPaths(json, keys);
    responsive.push(...responsiveKeysFor(file, json));
  }

  const [referenced, siblings] = await Promise.all([
    findUnpublishedMedia(Array.from(keys)),
    findMissingResponsiveSiblings(responsive),
  ]);
  const missing = [
    ...referenced.missing.map(({ key, reason }) => ({ key, reason })),
    ...siblings.missing.map(({ siblingKey, reason }) => ({ key: siblingKey, reason })),
  ];

  if (missing.length > 0) {
    fail(
      'these media keys are not published on the CDN:\n' +
        missing.map(({ key, reason }) => `    ${key} (${reason})`).join('\n') +
        '\n[feed:sync] nothing was uploaded. Run `npm run media:sync:new` first.',
    );
  }

  console.log(
    `[feed:sync] media OK: ${referenced.checked} referenced, ${siblings.checked} -mobile sibling(s)`,
  );
}

/**
 * Refuse to publish a field the live copy does not have yet. The deployed app
 * parses feeds with strict schemas, so a new key fails every page that reads
 * the file until code that knows it is deployed. Files not yet live are
 * skipped: nothing reads them, and the schema check already ran.
 */
function requireKnownFields(changes: readonly Change[]): void {
  if (ALLOW_NEW_FIELDS) return;

  const added: string[] = [];
  for (const { file, previous } of changes) {
    if (previous === null) continue;
    let live: unknown;
    try {
      live = JSON.parse(previous.toString('utf8'));
    } catch (error) {
      fail(`the live ${file} is not valid JSON (${errorMessage(error)}). Nothing was uploaded.`);
    }
    // Already schema-validated above, so this parse cannot fail.
    const local: unknown = JSON.parse(readFileSync(path.join(LOCAL_DIR, file), 'utf8'));
    for (const keyPath of findNewKeyPaths(live, local)) added.push(`${file}: ${keyPath}`);
  }

  if (added.length > 0) {
    fail(
      'these fields are not in the live feed yet:\n' +
        added.map((entry) => `    ${entry}`).join('\n') +
        '\n[feed:sync] nothing was uploaded. Feed schemas are strict: publishing a field\n' +
        '[feed:sync] before the code that reads it is deployed breaks every page that reads\n' +
        '[feed:sync] the file. Deploy first, then run `npm run feed:sync -- --allow-new-fields`.',
    );
  }
}

/**
 * Refuse to publish when `status` disagrees across files: a hidden experience
 * must be hidden everywhere, or a featured card links to a 404. Runs after
 * schema validation, so `parse` cannot throw here.
 */
function requireConsistentStatus(experienceIds: readonly string[]): void {
  const read = <T>(file: string, schema: ZodType<T>): T =>
    schema.parse(JSON.parse(readFileSync(path.join(LOCAL_DIR, file), 'utf8')));

  const issues = findStatusIssues({
    list: read(EXPERIENCES_LIST_FEED_FILE, ExperiencesListFeedV2Schema).experiences,
    landing: read(LANDING_FEED_FILE, LandingFeedV2Schema),
    experiences: experienceIds.map(
      (id) => read(experienceFeedFile(id), ExperienceFeedV2Schema).experience,
    ),
  });

  if (issues.length > 0) {
    fail(
      'status disagrees across feed files:\n' +
        issues.map((issue) => `    ${issue}`).join('\n') +
        '\n[feed:sync] nothing was uploaded.',
    );
  }
}

/** Write every live copy first; any failure aborts before uploading. */
function backUp(changes: readonly Change[]): string {
  const dir = path.join(PREVIOUS_DIR, new Date().toISOString().replace(/[:.]/g, '-'));

  try {
    mkdirSync(dir, { recursive: true });
    for (const { file, previous } of changes) {
      if (previous) writeFileSync(path.join(dir, file), previous);
    }
  } catch (error) {
    fail(
      `could not write the backup to ${path.relative(REPO_ROOT, dir)}: ${errorMessage(error)}. ` +
        'Nothing was uploaded.',
    );
  }

  return dir;
}

function upload(file: string, source: string = path.join(LOCAL_DIR, file)): void {
  // `--remote` is not optional: without it wrangler writes to the local
  // Miniflare bucket under .wrangler/ and still reports success.
  execFileSync(
    'npx',
    [
      // Never resolve a missing binary from the registry: this step runs with
      // the R2 credentials loaded. Absent locally must fail, not install.
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
      source,
      '--content-type',
      'application/json',
      '--remote',
    ],
    { cwd: REPO_ROOT, stdio: 'pipe' },
  );
}

/** Best effort: the credential may lack Cache Purge, and the upload already succeeded. */
async function invalidate(files: readonly string[]): Promise<void> {
  if (files.length === 0) return;

  const result = await purgeCache(files.map(urlFor));
  if (result.ok) {
    console.log(`[feed:sync] purged ${result.count} URL(s) from the CDN cache`);
    console.log(
      `[feed:sync] HTML edge TTL is ${EDGE_CACHE_TTL_SECONDS / 60} min; ` +
        'upstream Next data caching (revalidate: 3600) may delay updates further. ' +
        'Purge Everything clears the Cloudflare layer, not the Next data cache.',
    );
    return;
  }

  console.warn(
    `[feed:sync] could not purge the CDN cache: ${result.reason}\n` +
      '[feed:sync] set CLOUDFLARE_ZONE_ID in .env.wrangler and grant the token\n' +
      '[feed:sync] `Zone · Cache Purge · Purge`, or purge these URLs by hand:',
  );
  for (const url of result.manual) console.warn(`    ${url}`);
}

async function sync(): Promise<void> {
  console.log(`[feed:sync] fixtures-local/ -> ${BUCKET}/${KEY_PREFIX}/ (compared with ${baseUrl})`);

  const listPath = path.join(LOCAL_DIR, EXPERIENCES_LIST_FEED_FILE);
  if (!existsSync(listPath)) {
    fail(
      `fixtures-local/${EXPERIENCES_LIST_FEED_FILE} is missing. ` +
        'Delete fixtures-local/ and re-run to re-download.',
    );
  }

  const list = validate(
    EXPERIENCES_LIST_FEED_FILE,
    readFileSync(listPath),
    ExperiencesListFeedV2Schema,
  );
  if (!list.ok) fail(list.reason);
  const experienceIds = experienceIdsFrom(list.data);
  const payloads = payloadsFor(experienceIds);

  for (const { file, schema } of payloads) {
    const location = path.join(LOCAL_DIR, file);
    if (!existsSync(location)) fail(`fixtures-local/${file} is missing. Nothing was uploaded.`);
    const result = validate(file, readFileSync(location), schema);
    if (!result.ok) fail(`${result.reason}\nNothing was uploaded.`);
    console.log(`  ✓ ${file} validated`);
  }

  requireConsistentStatus(experienceIds);

  const changes = await findChanges(payloads);
  if (changes.length === 0) {
    console.log('[feed:sync] no local edits to publish — nothing to push.');
    return;
  }

  requireKnownFields(changes);
  await requirePublishedMedia(changes);

  const backupDir = backUp(changes);
  const backupPath = path.relative(REPO_ROOT, backupDir);
  console.log(`[feed:sync] live copies backed up to ${backupPath}/`);
  mkdirSync(BASE_DIR, { recursive: true });

  const uploaded: string[] = [];
  for (const { file } of changes) {
    try {
      upload(file);
      // The published bytes are now the merge base for the next run.
      writeFileSync(path.join(BASE_DIR, file), readFileSync(path.join(LOCAL_DIR, file)));
      console.log(`  ↑ ${file}`);
      uploaded.push(file);
    } catch (error) {
      await invalidate(uploaded);
      fail(
        `${file} failed to upload: ${errorMessage(error)}\n` +
          '[feed:sync] the feed may now be inconsistent. Restore by copying the files from\n' +
          `[feed:sync] ${backupPath}/ into fixtures-local/ and re-running \`npm run feed:sync\`.`,
      );
    }
  }

  console.log(`[feed:sync] ${uploaded.length} file(s) uploaded`);
  await invalidate(uploaded);
  await requireHealthySite(changes.filter(({ file }) => uploaded.includes(file)), backupDir);
  console.log('[feed:sync] deployed pages refresh within about 1 hour (services revalidate: 3600).');
}

/**
 * Ask the live site whether it still renders, and restore the previous feed if
 * it does not. Catches a publish the deployed code cannot parse — the failure
 * that reached production twice — whatever flags were passed.
 *
 * Limits, stated rather than hidden: it watches for HEALTH_ATTEMPTS passes, and
 * a worker that keeps its cached copy of the old feed beyond that window will
 * only fail later. `verify:feed` and the deploy-first order remain the guard;
 * this is the safety net.
 */
async function requireHealthySite(published: readonly Change[], backupDir: string): Promise<void> {
  if (published.length === 0 || SKIP_HEALTH_CHECK) return;

  const urls = HEALTH_PATHS.map((pathname) => `${HEALTH_BASE_URL}${pathname}`);
  console.log(`[feed:sync] checking the live site (${urls.join(', ')})…`);

  const verdict = await checkSiteHealth(urls, {
    attempts: HEALTH_ATTEMPTS,
    intervalMs: HEALTH_INTERVAL_MS,
    timeoutMs: 15_000,
  });

  if (verdict.status === 'healthy') {
    console.log('[feed:sync] live site healthy after publish');
    return;
  }

  if (verdict.status === 'inconclusive') {
    console.warn(
      `[feed:sync] could not reach the live site (${verdict.reason}). The feed stays published —\n` +
        `[feed:sync] check ${HEALTH_BASE_URL}/ now; to undo, copy ${path.relative(REPO_ROOT, backupDir)}/ ` +
        'into fixtures-local/ and run `npm run feed:sync:only`.',
    );
    return;
  }

  console.error(
    `[feed:sync] LIVE SITE BROKEN after publish: ${verdict.url} answered ${verdict.httpStatus}. ` +
      'Restoring the previous feed…',
  );

  const restored: string[] = [];
  const manual: string[] = [];
  for (const { file, previous } of published) {
    // A file that did not exist live has nothing to restore to.
    if (previous === null) {
      manual.push(file);
      continue;
    }
    try {
      upload(file, path.join(backupDir, file));
      writeFileSync(path.join(BASE_DIR, file), previous);
      restored.push(file);
      console.error(`  ↺ ${file} restored`);
    } catch (error) {
      manual.push(file);
      console.error(`  ✗ ${file} could not be restored: ${errorMessage(error)}`);
    }
  }
  await invalidate(restored);

  fail(
    'the publish was rolled back. Your local edits are kept in fixtures-local/.\n' +
      '[feed:sync] Most likely the deployed code does not accept a field you published: deploy first,\n' +
      '[feed:sync] then re-run.' +
      (manual.length > 0
        ? `\n[feed:sync] NOT restored, fix by hand: ${manual.join(', ')} (backup: ${path.relative(REPO_ROOT, backupDir)}/)`
        : ''),
  );
}

async function main(): Promise<void> {
  if (existsSync(LOCAL_DIR)) await sync();
  else await initialize();
}

main();
