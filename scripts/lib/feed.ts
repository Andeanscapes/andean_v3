/**
 * Shared plumbing for the feed CLI scripts (`fetch-fixtures`, `verify-feed`).
 *
 * Both scripts resolve the same base URL, read the same three paths, and derive
 * the same experience ids from the list. Keeping that in one place means a fix
 * like the fetch timeout lands for both instead of just one.
 *
 * Dependency-free apart from the app's own feed-path helper, so it can be run by
 * `vite-node` without pulling in Next.
 */

/**
 * Fallback for the CLI scripts, which run under `vite-node` and so never load
 * `.env` files. Must match `wrangler.toml [vars]`; the `repoHygiene` test
 * asserts that. The base URL is unauthenticated configuration, not a
 * credential.
 */
export const DEFAULT_FEED_BASE_URL = 'https://cdn.andeanscapes.com/services';

/**
 * Upper bound for a single read, mirroring `src/lib/remote-data.ts`.
 *
 * Without it a half-open connection hangs the caller indefinitely — and for
 * `fetch-fixtures` that means hanging `npm test`, because the offline fallback
 * only fires on a *completed* failure.
 */
export const FEED_FETCH_TIMEOUT_MS = 5000;

export type BaseUrlResult =
  | { ok: true; url: string; source: 'env' | 'default' }
  | { ok: false; reason: string };

/**
 * Resolve `REMOTE_DATA_BASE_URL`.
 *
 * Only the shell environment is read: `vite-node` does not load `.env` files
 * into `process.env`, so a `.env.local` override applies to `next dev` but not
 * to these scripts. Callers report the `source` so a silent fall back to the
 * committed default is visible rather than assumed.
 *
 * Pass no fallback to make the variable mandatory.
 */
export function resolveFeedBaseUrl(fallback?: string): BaseUrlResult {
  const raw = process.env.REMOTE_DATA_BASE_URL?.trim();

  if (!raw) {
    if (!fallback) return { ok: false, reason: 'REMOTE_DATA_BASE_URL is required.' };
    return { ok: true, url: stripTrailingSlashes(fallback), source: 'default' };
  }

  // Reject a relative or malformed value loudly instead of letting every fetch
  // fail and look like an outage.
  if (!/^https?:\/\//i.test(raw)) {
    return {
      ok: false,
      reason: `REMOTE_DATA_BASE_URL must be an absolute http(s) URL, got "${raw}".`,
    };
  }

  return { ok: true, url: stripTrailingSlashes(raw), source: 'env' };
}

/** Strip trailing slashes so `${base}/${file}` cannot produce `//`. */
function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

export type FeedFetchResult = { ok: true; json: unknown } | { ok: false; reason: string };

/**
 * Fetch and JSON-parse one feed file. Never throws — the caller decides whether
 * a failure is fatal.
 */
export async function fetchFeedJson(
  url: string,
  timeoutMs: number = FEED_FETCH_TIMEOUT_MS,
): Promise<FeedFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return { ok: false, reason: `HTTP ${response.status}` };

    try {
      return { ok: true, json: await response.json() };
    } catch {
      return { ok: false, reason: 'malformed JSON' };
    }
  } catch (err) {
    // A timeout reads identically to a network blip otherwise, and the two need
    // different responses from whoever is looking at the log.
    if (controller.signal.aborted) return { ok: false, reason: `timed out after ${timeoutMs}ms` };
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * The experience ids a list payload routes to, deduped.
 *
 * A type predicate rather than `filter(Boolean)`: the latter does not narrow,
 * which forces a cast at every call site.
 */
export function resolveExperienceIds(
  entries: readonly { readonly id?: string | undefined }[],
): string[] {
  return Array.from(
    new Set(
      entries
        .map((entry) => entry.id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );
}
