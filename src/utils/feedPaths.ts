/**
 * Remote-feed file naming.
 *
 * Feed files are kebab-case, while internal experience ids stay camelCase —
 * ids also key localStorage (see `reservationStorage.ts`), so renaming them
 * would drop in-progress reservations.
 *
 * This is the single place that maps between the two. `book.service` reads with
 * it, and `scripts/fetch-fixtures.ts` and `scripts/verify-feed.ts` resolve
 * filenames with it, so a rename cannot make the published filename and the
 * requested path drift apart.
 *
 * Kept dependency-free so the build script can import it.
 */

/**
 * The two fixed feed files. Unlike the experience files these need no id
 * mapping, but the names were still being retyped in the services, both CLI
 * scripts and the test fixture loader — five copies of a string that must match
 * what is published. Naming them here removes that drift surface.
 */
export const LANDING_FEED_FILE = 'landing.json';
export const EXPERIENCES_LIST_FEED_FILE = 'experiences-list.json';

/** `/landing.json` — the path form `fetchRemoteJson` expects. */
export const LANDING_FEED_PATH = `/${LANDING_FEED_FILE}`;

/** `/experiences-list.json` — the path form `fetchRemoteJson` expects. */
export const EXPERIENCES_LIST_FEED_PATH = `/${EXPERIENCES_LIST_FEED_FILE}`;

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/** `emeraldMining` -> `experience-emerald-mining.json` */
export function experienceFeedFile(experienceId: string): string {
  return `experience-${toKebabCase(experienceId)}.json`;
}

/** `emeraldMining` -> `/experience-emerald-mining.json` */
export function experienceFeedPath(experienceId: string): string {
  return `/${experienceFeedFile(experienceId)}`;
}
