/**
 * Remote data fetcher.
 *
 * Pattern: fetch remote JSON, validate against a schema, return it with source
 * metadata. On any failure (base URL unset, network, 404, 500, malformed JSON,
 * schema violation) it returns `{ data: null, source: 'local', reason }`.
 *
 * **There is no local fallback data.** `source: 'local'` means "no remote data",
 * not "served from a mock" — the local mocks and registries were deleted when the
 * feed became the single source of truth. Every caller is expected to throw on a
 * null payload, which is why `src/app/[locale]/error.tsx` exists. The `'local'`
 * label is kept because it is what the log lines and existing tests assert on.
 *
 * This function itself never throws — always returns a result.
 *
 * Every read logs one line so the active source is observable:
 *   [RemoteData] remote /landing.json 84ms
 *   [RemoteData] local  /landing.json 12ms reason="HTTP 404 from https://..."
 */

import type { ZodType } from 'zod';

export type RemoteResult<T> =
  | { data: T; source: 'remote' }
  | { data: null; source: 'local'; reason: string };

/**
 * Upper bound for a single remote read. Every SSR path awaits this fetch, so an
 * unbounded request would stall page render instead of falling back — the
 * fallback only fires on a *completed* failure.
 */
const DEFAULT_TIMEOUT_MS = 5000;

const warned = new Set<string>();

function warnOnce(key: string, message: string) {
  if (!warned.has(key)) {
    console.warn(message);
    warned.add(key);
  }
}

/**
 * One greppable line per feed read, so the active source is visible in
 * `wrangler tail`. Without this the fallback is completely silent and there is
 * no way to tell a working upload from a wrong URL.
 *
 * Format: `[RemoteData] <source> <path> <ms> [reason="..."]`
 * Filter with: `wrangler tail --format pretty | grep RemoteData`
 */
function logOutcome(
  source: 'remote' | 'local',
  path: string,
  elapsedMs: number,
  reason?: string
): void {
  const line = `[RemoteData] ${source.padEnd(6)} ${path} ${elapsedMs}ms`;

  if (source === 'remote') {
    console.log(line);
    return;
  }

  // Fallbacks are the actionable case — surface them at warn level.
  console.warn(`${line} reason="${reason}"`);
}

export async function fetchRemoteJson<T>(
  path: string,
  schema: ZodType<T>,
  options?: { revalidate?: number; tags?: string[]; timeoutMs?: number }
): Promise<RemoteResult<T>> {
  const startedAt = Date.now();

  /** Log then return — every fallback path goes through here. */
  const fallback = (reason: string): RemoteResult<T> => {
    logOutcome('local', path, Date.now() - startedAt, reason);
    return { data: null, source: 'local', reason };
  };

  const rawBaseUrl = process.env.REMOTE_DATA_BASE_URL?.trim();

  // 1. Base URL unset → offline, no network call. Warn in production.
  if (!rawBaseUrl) {
    if (process.env.NODE_ENV === 'production') {
      warnOnce(
        'REMOTE_DATA_BASE_URL',
        '[RemoteData] REMOTE_DATA_BASE_URL is unset in production. There are no local mocks, so every ' +
          'data-driven page will throw. Env files are not committed: in CI this means the ' +
          'REMOTE_DATA_BASE_URL_PROD / _DEV variable is missing, and on the deployed Worker it means ' +
          'the `wrangler.toml [vars]` entry is missing. Locally, copy `.env.example` to `.env.local`.'
      );
    }
    return fallback('REMOTE_DATA_BASE_URL unset');
  }

  // Strip trailing slashes so `${base}${path}` cannot produce `//`.
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');

  // Reject a misconfigured base URL loudly rather than letting a relative
  // fetch fail and look like a transient outage.
  if (!/^https?:\/\//i.test(baseUrl)) {
    warnOnce(
      'REMOTE_DATA_BASE_URL_INVALID',
      `[RemoteData] REMOTE_DATA_BASE_URL must be an absolute http(s) URL, got "${baseUrl}". No data will be available.`
    );
    return fallback('REMOTE_DATA_BASE_URL is not an absolute http(s) URL');
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      // Forward caching hints whenever either is supplied — `tags` alone is
      // still meaningful for revalidateTag.
      next:
        options?.revalidate !== undefined || options?.tags !== undefined
          ? { revalidate: options.revalidate, tags: options.tags }
          : undefined,
    });

    // 2. Non-OK response → fallback
    if (!response.ok) {
      return fallback(`HTTP ${response.status} from ${url}`);
    }

    // 3. Parse JSON
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return fallback(`Malformed JSON from ${url}`);
    }

    // 4. Validate against schema
    const parseResult = schema.safeParse(json);
    if (!parseResult.success) {
      console.warn(
        `[RemoteData] Schema validation failed for ${url}:`,
        JSON.stringify(parseResult.error.format())
      );
      return fallback(`Schema validation failed for ${path}`);
    }

    logOutcome('remote', path, Date.now() - startedAt);
    return { data: parseResult.data, source: 'remote' };
  } catch (err) {
    // Report the abort distinctly — a timeout is an operational signal, not a
    // transient network blip, and reads the same in logs either way otherwise.
    if (controller.signal.aborted) {
      return fallback(`Timed out after ${timeoutMs}ms fetching ${path}`);
    }

    const message = err instanceof Error ? err.message : String(err);
    return fallback(`Fetch error for ${path}: ${message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
