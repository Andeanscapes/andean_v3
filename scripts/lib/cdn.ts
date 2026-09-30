/**
 * Reading and invalidating `cdn.andeanscapes.com`.
 *
 * The CDN in front of R2 caches **HEAD and GET under separate keys**, which is
 * the trap this module exists to close. A HEAD can report the object just
 * uploaded while a GET on the same URL still returns the previous bytes for the
 * rest of its TTL — observed live at `max-age=14400`:
 *
 *   HEAD  content-length: 219674   cf-cache-status: DYNAMIC
 *   GET   content-length: 125404   cf-cache-status: HIT   age: 5703
 *
 * Anything that compares sizes therefore has to say which of the two it means:
 *
 *   `origin`  what R2 holds — a cache-busted GET, so the answer is authoritative
 *             and is the only sound basis for deciding whether to upload
 *   `edge`    what a browser gets — a plain GET, the same cache key the site
 *             hits, and the only way to know a change is actually visible
 *
 * Both use a ranged request: only the first bytes are needed to read a length,
 * and pulling multi-megabyte objects to compare a number is waste.
 */

const RANGE_BYTES = 1024;

/** The MD5 an ETag carries, or undefined when it is not a plain content hash. */
function md5FromEtag(etag: string | null): string | undefined {
  const value = etag?.replace(/^W\//, '').replace(/"/g, '').trim().toLowerCase();
  return value && /^[0-9a-f]{32}$/.test(value) ? value : undefined;
}

export type CdnRead =
  /**
   * `md5` is the object's content hash when the ETag carries one. R2 sets the
   * ETag of a single-part upload to the MD5 of its bytes, which is how every
   * object here is written (`wrangler r2 object put`). A multipart ETag
   * (`<hash>-<parts>`) is not a content hash, so it is left undefined and callers
   * fall back to comparing lengths.
   */
  | { status: 'found'; length: number; md5?: string }
  | { status: 'absent' }
  | { status: 'unavailable'; reason: string };

/**
 * Length of the object at `url`.
 *
 * `bypassCache` appends a unique query string. That is a different cache key, so
 * the edge cannot answer it and the request reaches R2 — the standard way to read
 * origin state through a cache that cannot be asked to revalidate.
 */
export async function readLength(url: string, bypassCache: boolean): Promise<CdnRead> {
  const target = bypassCache ? `${url}${url.includes('?') ? '&' : '?'}__origin=${Date.now()}` : url;

  try {
    const response = await fetch(target, { headers: { Range: `bytes=0-${RANGE_BYTES - 1}` } });

    if (response.status === 404) return { status: 'absent' };

    if (response.status === 206) {
      // `content-range: bytes 0-1023/219674` — the total is after the slash.
      const total = response.headers.get('content-range')?.split('/')[1];
      const length = Number(total);

      if (!Number.isFinite(length)) {
        return { status: 'unavailable', reason: 'range response carried no total length' };
      }
      return { status: 'found', length, md5: md5FromEtag(response.headers.get('etag')) };
    }

    // 200 means the origin ignored the Range header and sent the whole body.
    if (response.status === 200) {
      const length = Number(response.headers.get('content-length') ?? Number.NaN);

      if (!Number.isFinite(length)) {
        return { status: 'unavailable', reason: 'response carried no content-length' };
      }
      return { status: 'found', length, md5: md5FromEtag(response.headers.get('etag')) };
    }

    return { status: 'unavailable', reason: `HTTP ${response.status} ${response.statusText}` };
  } catch (error) {
    return { status: 'unavailable', reason: error instanceof Error ? error.message : String(error) };
  }
}

/** What a local file is compared on: its size, and its bytes' MD5 (hex). */
export interface LocalFingerprint {
  size: number;
  md5: string;
}

/**
 * True when a remote read holds exactly the local bytes.
 *
 * Content, not size, whenever the ETag carries an MD5. Comparing
 * `content-length` alone reported a replaced image as "up to date" whenever the
 * new file happened to encode to the same byte count, so the upload was skipped
 * and the site kept the old picture. Size remains the fallback only for ETags
 * that are not a content hash (multipart uploads).
 */
export function sameContent(
  remote: { length: number; md5?: string },
  local: LocalFingerprint,
): boolean {
  return remote.md5 ? remote.md5 === local.md5.toLowerCase() : remote.length === local.size;
}

/** Download the whole object, always from origin, so a stale edge copy cannot be written to disk. */
export async function downloadFromOrigin(
  url: string,
): Promise<{ ok: true; body: ArrayBuffer } | { ok: false; reason: string }> {
  const target = `${url}${url.includes('?') ? '&' : '?'}__origin=${Date.now()}`;

  try {
    const response = await fetch(target);
    if (!response.ok) return { ok: false, reason: `HTTP ${response.status} ${response.statusText}` };

    return { ok: true, body: await response.arrayBuffer() };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

export type PurgeResult =
  | { ok: true; count: number }
  | { ok: false; reason: string; manual: string[] };

/**
 * Invalidate the edge copies of `urls`.
 *
 * Best effort by design. The credential in `.env.wrangler` is a deploy token and
 * may well lack `Zone · Cache Purge`; failing the whole push over that would be
 * worse than uploading and telling the operator the change is not visible yet.
 * The caller reports `manual` so the work can be finished in the dashboard.
 */
export async function purgeCache(urls: readonly string[]): Promise<PurgeResult> {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!token) {
    return { ok: false, reason: 'CLOUDFLARE_API_TOKEN is not set', manual: Array.from(urls) };
  }

  const zone = await resolveZoneId(urls[0], token);
  if (!zone.ok) return { ok: false, reason: zone.reason, manual: Array.from(urls) };

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zone.id}/purge_cache`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: urls }),
      },
    );

    const payload = (await response.json()) as {
      success?: boolean;
      errors?: { message?: string }[];
    };

    if (!payload.success) {
      const reason =
        payload.errors?.map((error) => error.message).filter(Boolean).join('; ') ||
        `HTTP ${response.status}`;
      return { ok: false, reason, manual: Array.from(urls) };
    }

    return { ok: true, count: urls.length };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
      manual: Array.from(urls),
    };
  }
}

type ZoneLookup = { ok: true; id: string } | { ok: false; reason: string };

/**
 * The zone that owns the CDN hostname.
 *
 * Set `CLOUDFLARE_ZONE_ID` — that is the intended configuration. It short-circuits
 * the lookup, which lets the token in `.env.wrangler` carry nothing but
 * `Zone · Cache Purge · Purge` on the single zone it needs.
 *
 * The fallback derives the apex from the host (`cdn.andeanscapes.com` is a record
 * inside the `andeanscapes.com` zone) and asks the API to name it. Convenient,
 * but it only works with an account-wide `Zone · Zone · Read`, so relying on it
 * means provisioning a broader credential than purging requires.
 */
async function resolveZoneId(sampleUrl: string, token: string): Promise<ZoneLookup> {
  const configured = process.env.CLOUDFLARE_ZONE_ID?.trim();
  if (configured) return { ok: true, id: configured };

  let apex: string;
  try {
    apex = new URL(sampleUrl).hostname.split('.').slice(-2).join('.');
  } catch {
    return { ok: false, reason: `cannot derive a zone from "${sampleUrl}"` };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(apex)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const payload = (await response.json()) as {
      success?: boolean;
      result?: { id: string }[];
      errors?: { message?: string }[];
    };

    if (!payload.success || !payload.result?.length) {
      const reason =
        payload.errors?.map((error) => error.message).filter(Boolean).join('; ') ||
        `no zone found for ${apex}`;
      return { ok: false, reason };
    }

    return { ok: true, id: payload.result[0].id };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
