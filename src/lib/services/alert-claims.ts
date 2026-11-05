/**
 * Once-per-channel alert claims — server only.
 *
 * No database yet: the Cloudflare Cache API is the shared memory and a Set is
 * the fallback inside one isolate. Best effort: a duplicate is possible across
 * data centers, and the Cache API is inert on `workers.dev` (dev).
 */

const CLAIM_TTL_SECONDS = 7 * 24 * 60 * 60;
const claimedInIsolate = new Set<string>();

interface AlertCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
  delete(request: Request): Promise<boolean>;
}

function edgeCache(): AlertCache | null {
  return (globalThis as { caches?: { default?: AlertCache } }).caches?.default ?? null;
}

function claimRequest(channel: string, paymentId: string, origin: string): Request {
  return new Request(`${origin}/__payment-alerts/${channel}/${encodeURIComponent(paymentId)}`);
}

/** Claim before sending, so concurrent status checks do not both alert. */
export async function claimAlert(channel: string, paymentId: string, origin: string): Promise<boolean> {
  const memoryKey = `${channel}:${paymentId}`;
  if (claimedInIsolate.has(memoryKey)) return false;
  claimedInIsolate.add(memoryKey);

  const cache = edgeCache();
  if (!cache) return true;
  const key = claimRequest(channel, paymentId, origin);
  try {
    if (await cache.match(key)) return false;
    await cache.put(key, new Response('1', { headers: { 'Cache-Control': `max-age=${CLAIM_TTL_SECONDS}` } }));
  } catch {
    // Cache unavailable: the isolate set still prevents repeats here.
  }
  return true;
}

/** Give the claim back after a transient failure so a later check can retry. */
export async function releaseAlert(channel: string, paymentId: string, origin: string): Promise<void> {
  claimedInIsolate.delete(`${channel}:${paymentId}`);
  try {
    await edgeCache()?.delete(claimRequest(channel, paymentId, origin));
  } catch {
    // Best effort.
  }
}
