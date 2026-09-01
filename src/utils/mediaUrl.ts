/**
 * CDN-aware media URL resolution.
 *
 * Business media published by the remote feed is served from Cloudflare R2
 * behind a CDN (default `https://cdn.andeanscapes.com`). Feed payloads store
 * CDN-relative paths (`/images/...`, `/videos/...`) so the same data works on
 * any origin; this module turns them into absolute URLs at consumption time.
 *
 * Anything else that starts with `/` — local assets (`/landing/...`), internal
 * hrefs (`/experiences`, `#anchors`) — is left untouched, as are absolute
 * `http(s)` URLs. This mirrors the `src.startsWith('/images/')` guard used by
 * the media components.
 */

const CDN_BASE_URL_DEFAULT = 'https://cdn.andeanscapes.com';

function getCdnBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim();
  if (!base) return CDN_BASE_URL_DEFAULT;
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function isCdnMediaPath(value: string): boolean {
  return value.startsWith('/images/') || value.startsWith('/videos/');
}

/** Prefixes a CDN-relative media path with the CDN base; everything else passes through. */
export function resolveMediaUrl(value: string): string {
  if (!isCdnMediaPath(value)) return value;
  return `${getCdnBaseUrl()}${value}`;
}

/**
 * Recursively resolves every string in an object/array tree via `resolveMediaUrl`.
 *
 * Call this on **feed-shaped data, before translation** — the services all
 * normalize at that point. Running it over translated output would put locale
 * copy through the media walk.
 *
 * The tree is rebuilt from plain objects and arrays, so it is only safe for JSON
 * payloads: any class instance (a `Date`, a `Map`) would lose its prototype.
 */
export function resolveMediaUrlsDeep<T>(value: T): T {
  if (typeof value === 'string') return resolveMediaUrl(value) as T;
  if (Array.isArray(value)) return value.map((item) => resolveMediaUrlsDeep(item)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        resolveMediaUrlsDeep(item),
      ]),
    ) as T;
  }
  return value;
}
