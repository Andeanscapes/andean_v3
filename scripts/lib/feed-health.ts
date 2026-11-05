/**
 * Post-publish site health check for `feed:sync`.
 *
 * A feed the deployed app cannot parse fails every page that reads it (feed
 * schemas are strict), and that has reached production twice. The new-field
 * guard depends on the operator having deployed first; this check does not: it
 * asks the live site after the upload and lets the caller roll back.
 *
 * Verdicts:
 *   healthy       every URL answered 2xx/3xx on one full pass
 *   broken        a URL answered 4xx/5xx; roll back
 *   inconclusive  no full pass and no HTTP failure (network trouble); do not
 *                 roll back on a guess, tell the operator to check by hand
 *
 * Several passes, spaced out, because a running worker can keep serving its
 * cached copy of the previous feed for a while. A pass is cache-busted so the
 * edge HTML cache cannot answer for the origin.
 *
 * Pure apart from the injected `fetch` and `sleep`, so it is unit-tested.
 */

export type HealthVerdict =
  | { status: 'healthy' }
  | { status: 'broken'; url: string; httpStatus: number }
  | { status: 'inconclusive'; reason: string };

export interface HealthOptions {
  attempts: number;
  intervalMs: number;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function cacheBusted(url: string, attempt: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}__health=${Date.now()}-${attempt}`;
}

export async function checkSiteHealth(
  urls: readonly string[],
  { attempts, intervalMs, timeoutMs, fetchImpl = fetch, sleep = defaultSleep }: HealthOptions,
): Promise<HealthVerdict> {
  let lastNetworkError = 'no attempt completed';
  let healthyPasses = 0;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await sleep(intervalMs);

    let passOk = true;
    for (const url of urls) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(cacheBusted(url, attempt), {
          redirect: 'follow',
          signal: controller.signal,
        });
        if (response.status >= 400) return { status: 'broken', url, httpStatus: response.status };
      } catch (error) {
        passOk = false;
        lastNetworkError = error instanceof Error ? error.message : String(error);
      } finally {
        clearTimeout(timeoutId);
      }
    }
    if (passOk) healthyPasses += 1;
  }

  return healthyPasses > 0
    ? { status: 'healthy' }
    : { status: 'inconclusive', reason: lastNetworkError };
}
