/**
 * Edge HTML cache in front of the OpenNext worker.
 *
 * Every page renders on request, and one render costs 60–90 ms of CPU — far
 * above the Workers Free plan limit, which fails requests with Error 1102. A
 * cache HIT answers from the Cloudflare Cache API without loading the Next
 * server at all.
 *
 * Safe because page HTML depends only on the URL: locale comes from the path
 * (`localeDetection: false`, `localeCookie: false`), theme and booking state
 * live in `localStorage`, and auth routes are excluded. RSC payloads vary by
 * the request headers Next lists in `Vary`, so those are part of the key.
 *
 * Entries are isolated by Next build. Deployment-routing requests bypass this
 * layer so OpenNext can select the requested deployment.
 *
 * Trade-offs: this TTL adds to any upstream data-cache delay, the landing hero
 * rotates on a new render instead of per visit, and the cache is per data
 * center — a MISS still pays the full render.
 */

export const EDGE_CACHE_TTL_SECONDS = 600;

export const EDGE_CACHE_STATUS_HEADER = 'x-edge-cache';

const EXCLUDED_PATH_PREFIXES = ['/api', '/_next', '/cdn-cgi'] as const;

const EXCLUDED_SEGMENTS = new Set(['login', 'signup']);

/** The request headers Next.js declares in `Vary` for page and RSC responses. */
const VARY_HEADERS = [
  'rsc',
  'next-router-state-tree',
  'next-router-prefetch',
  'next-router-segment-prefetch',
  'next-url',
] as const;

const KEY_PARAM_PREFIX = '__edge_';

const CACHEABLE_CONTENT_TYPES = ['text/html', 'text/x-component'] as const;

/** Origin headers swapped out for the stored copy and restored on a HIT. */
const ORIGIN_CACHE_CONTROL_HEADER = 'x-edge-origin-cache-control';
const ORIGIN_VARY_HEADER = 'x-edge-origin-vary';

/** The subset of the Cloudflare Cache API this module uses. */
export interface EdgeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

export interface EdgeExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export type EdgeFetchHandler<Env> = (
  request: Request,
  env: Env,
  ctx: EdgeExecutionContext,
) => Promise<Response>;

export function isCacheableRequest(request: Request): boolean {
  if (request.method !== 'GET') return false;
  // Cookies are not a bypass: no page reads them, and analytics cookies (Meta
  // pixel) ride on nearly every request, which would turn every visit into a MISS.
  if (request.headers.has('authorization') || request.headers.has('x-deployment-id')) return false;

  const { pathname, searchParams } = new URL(request.url);
  if (searchParams.has('dpl')) return false;
  if (EXCLUDED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }

  return !pathname.split('/').some((segment) => EXCLUDED_SEGMENTS.has(segment));
}

export function isCacheableResponse(response: Response): boolean {
  if (response.status !== 200 || response.headers.has('set-cookie')) return false;

  const contentType = response.headers.get('content-type') ?? '';
  return CACHEABLE_CONTENT_TYPES.some((type) => contentType.startsWith(type));
}

/** Build, URL and `Vary` request headers isolate deployments and HTML/RSC variants. */
export function buildCacheKey(request: Request, buildId: string): Request {
  const url = new URL(request.url);
  // Drop client-supplied key params first: otherwise a plain HTML request could
  // spoof an RSC key and store HTML where client navigation expects a payload.
  for (const name of Array.from(url.searchParams.keys())) {
    if (name.startsWith(KEY_PARAM_PREFIX)) url.searchParams.delete(name);
  }
  url.searchParams.set(`${KEY_PARAM_PREFIX}build`, buildId);
  for (const name of VARY_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) url.searchParams.set(`${KEY_PARAM_PREFIX}${name}`, value);
  }
  return new Request(url.toString(), { method: 'GET' });
}

function toStoredResponse(response: Response, ttlSeconds: number): Response {
  const headers = new Headers(response.headers);
  headers.set(ORIGIN_CACHE_CONTROL_HEADER, response.headers.get('cache-control') ?? '');
  headers.set(ORIGIN_VARY_HEADER, response.headers.get('vary') ?? '');
  headers.set('cache-control', `public, max-age=${ttlSeconds}`);
  headers.delete('vary');
  headers.delete(EDGE_CACHE_STATUS_HEADER);

  return new Response(response.body, { status: response.status, headers });
}

/** Browsers get the origin caching policy back; only the edge holds the copy. */
function fromStoredResponse(stored: Response): Response {
  const headers = new Headers(stored.headers);
  const cacheControl = headers.get(ORIGIN_CACHE_CONTROL_HEADER);
  const vary = headers.get(ORIGIN_VARY_HEADER);

  if (cacheControl) headers.set('cache-control', cacheControl);
  else headers.delete('cache-control');
  if (vary) headers.set('vary', vary);
  headers.delete(ORIGIN_CACHE_CONTROL_HEADER);
  headers.delete(ORIGIN_VARY_HEADER);
  headers.delete('age');
  headers.set(EDGE_CACHE_STATUS_HEADER, 'HIT');

  return new Response(stored.body, { status: stored.status, headers });
}

function withStatus(response: Response, status: 'MISS' | 'BYPASS'): Response {
  const headers = new Headers(response.headers);
  headers.set(EDGE_CACHE_STATUS_HEADER, status);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function withEdgeCache<Env>(
  handler: EdgeFetchHandler<Env>,
  getCache: () => EdgeCache,
  buildId: string,
  ttlSeconds: number = EDGE_CACHE_TTL_SECONDS,
): EdgeFetchHandler<Env> {
  return async (request, env, ctx) => {
    if (!isCacheableRequest(request)) return handler(request, env, ctx);

    let cache: EdgeCache;
    const key = buildCacheKey(request, buildId);

    try {
      cache = getCache();
      const cached = await cache.match(key);
      if (cached) return fromStoredResponse(cached);
    } catch (error) {
      logCacheError('read', error);
      return withStatus(await handler(request, env, ctx), 'BYPASS');
    }

    const response = await handler(request, env, ctx);
    if (!isCacheableResponse(response)) return withStatus(response, 'BYPASS');

    const stored = toStoredResponse(response.clone(), ttlSeconds);
    ctx.waitUntil((async () => {
      try {
        await cache.put(key, stored);
      } catch (error) {
        logCacheError('write', error);
      }
    })());
    return withStatus(response, 'MISS');
  };
}

function logCacheError(operation: 'read' | 'write', error: unknown): void {
  console.warn(`[EdgeCache] ${operation} failed: ${error instanceof Error ? error.message : String(error)}`);
}
