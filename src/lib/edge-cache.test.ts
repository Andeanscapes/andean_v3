import { describe, expect, it, vi } from 'vitest';
import {
  EDGE_CACHE_STATUS_HEADER,
  buildCacheKey,
  isCacheableRequest,
  isCacheableResponse,
  withEdgeCache,
  type EdgeCache,
  type EdgeExecutionContext,
} from './edge-cache';

const ORIGIN = 'https://andeanscapes.com';
const BUILD_ID = 'build-a';

function htmlResponse(body = '<html></html>', headers: Record<string, string> = {}): Response {
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'private, no-cache, no-store, max-age=0, must-revalidate',
      vary: 'rsc, next-router-state-tree',
      ...headers,
    },
  });
}

/** In-memory stand-in for the Cloudflare Cache API, keyed by URL. */
function memoryCache(): EdgeCache {
  const store = new Map<string, Response>();
  return {
    match: async (key) => store.get(key.url)?.clone(),
    put: async (key, response) => {
      store.set(key.url, response.clone());
    },
  };
}

function context(): EdgeExecutionContext & { settled: () => Promise<unknown> } {
  const pending: Promise<unknown>[] = [];
  return {
    waitUntil: (promise) => pending.push(promise),
    settled: () => Promise.all(pending),
  };
}

describe('isCacheableRequest', () => {
  it('caches public page GETs, including those carrying analytics cookies', () => {
    expect(isCacheableRequest(new Request(`${ORIGIN}/es/experiences`))).toBe(true);
    expect(isCacheableRequest(new Request(`${ORIGIN}/`, { headers: { cookie: '_fbp=fb.1.123' } }))).toBe(true);
  });

  it('bypasses non-GET, API, Next internals and auth routes', () => {
    expect(isCacheableRequest(new Request(`${ORIGIN}/`, { method: 'POST' }))).toBe(false);
    expect(isCacheableRequest(new Request(`${ORIGIN}/`, { method: 'HEAD' }))).toBe(false);
    expect(isCacheableRequest(new Request(`${ORIGIN}/api/bookings`))).toBe(false);
    expect(isCacheableRequest(new Request(`${ORIGIN}/_next/data/x.json`))).toBe(false);
    expect(isCacheableRequest(new Request(`${ORIGIN}/es/login`))).toBe(false);
    expect(isCacheableRequest(new Request(`${ORIGIN}/signup`))).toBe(false);
    expect(isCacheableRequest(new Request(`${ORIGIN}/`, { headers: { authorization: 'Bearer x' } }))).toBe(false);
    expect(isCacheableRequest(new Request(`${ORIGIN}/es`, { headers: { 'x-deployment-id': 'old' } }))).toBe(false);
    expect(isCacheableRequest(new Request(`${ORIGIN}/es?dpl=old`))).toBe(false);
  });

  it('does not mistake a path that only starts like an excluded prefix', () => {
    expect(isCacheableRequest(new Request(`${ORIGIN}/apis-and-more`))).toBe(true);
  });
});

describe('isCacheableResponse', () => {
  it('accepts 200 HTML and RSC payloads', () => {
    expect(isCacheableResponse(htmlResponse())).toBe(true);
    expect(isCacheableResponse(new Response('', { headers: { 'content-type': 'text/x-component' } }))).toBe(true);
  });

  it('rejects errors, redirects, cookies and other content types', () => {
    expect(isCacheableResponse(new Response('', { status: 500, headers: { 'content-type': 'text/html' } }))).toBe(false);
    expect(isCacheableResponse(new Response('', { status: 404, headers: { 'content-type': 'text/html' } }))).toBe(false);
    expect(isCacheableResponse(new Response(null, { status: 307, headers: { location: '/es' } }))).toBe(false);
    expect(isCacheableResponse(htmlResponse('', { 'set-cookie': 'a=b' }))).toBe(false);
    expect(isCacheableResponse(new Response('{}', { headers: { 'content-type': 'application/json' } }))).toBe(false);
  });
});

describe('buildCacheKey', () => {
  it('keeps the query string, so booking selections get their own entry', () => {
    const key = buildCacheKey(new Request(`${ORIGIN}/experiences/x/booking?tier=borbur&people=1`), BUILD_ID);
    expect(key.url).toBe(`${ORIGIN}/experiences/x/booking?tier=borbur&people=1&__edge_build=${BUILD_ID}`);
  });

  it('separates the HTML document from its RSC payloads', () => {
    const html = buildCacheKey(new Request(`${ORIGIN}/es`), BUILD_ID);
    const rsc = buildCacheKey(new Request(`${ORIGIN}/es`, { headers: { rsc: '1', 'next-router-state-tree': 'tree' } }), BUILD_ID);
    expect(rsc.url).not.toBe(html.url);
  });

  it('ignores client-supplied key params, so HTML cannot be stored under an RSC key', () => {
    const rsc = buildCacheKey(new Request(`${ORIGIN}/es?_rsc=x`, { headers: { rsc: '1' } }), BUILD_ID);
    const spoofed = buildCacheKey(new Request(`${ORIGIN}/es?_rsc=x&__edge_rsc=1&__edge_build=other`), BUILD_ID);

    expect(spoofed.url).toBe(`${ORIGIN}/es?_rsc=x&__edge_build=${BUILD_ID}`);
    expect(spoofed.url).not.toBe(rsc.url);
  });
});

describe('withEdgeCache', () => {
  it('renders once, then serves the stored copy without calling the handler', async () => {
    const handler = vi.fn(async () => htmlResponse('<p>page</p>'));
    const cache = memoryCache();
    const wrapped = withEdgeCache(handler, () => cache, BUILD_ID);
    const ctx = context();

    const first = await wrapped(new Request(`${ORIGIN}/es`), {}, ctx);
    await ctx.settled();
    const second = await wrapped(new Request(`${ORIGIN}/es`), {}, context());

    expect(handler).toHaveBeenCalledTimes(1);
    expect(first.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe('MISS');
    expect(second.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe('HIT');
    expect(await second.text()).toBe('<p>page</p>');
  });

  it('gives browsers the origin caching policy back on a HIT', async () => {
    const cache = memoryCache();
    const wrapped = withEdgeCache(async () => htmlResponse(), () => cache, BUILD_ID);
    const ctx = context();

    await wrapped(new Request(`${ORIGIN}/`), {}, ctx);
    await ctx.settled();
    const hit = await wrapped(new Request(`${ORIGIN}/`), {}, context());

    expect(hit.headers.get('cache-control')).toBe('private, no-cache, no-store, max-age=0, must-revalidate');
    expect(hit.headers.get('vary')).toBe('rsc, next-router-state-tree');
    expect(hit.headers.has('x-edge-origin-cache-control')).toBe(false);
  });

  it('never stores a failed render', async () => {
    const cache = memoryCache();
    const handler = vi.fn(async () => new Response('boom', { status: 500, headers: { 'content-type': 'text/html' } }));
    const wrapped = withEdgeCache(handler, () => cache, BUILD_ID);
    const ctx = context();

    const first = await wrapped(new Request(`${ORIGIN}/`), {}, ctx);
    await ctx.settled();
    await wrapped(new Request(`${ORIGIN}/`), {}, context());

    expect(first.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe('BYPASS');
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('passes excluded requests straight through, untouched', async () => {
    const getCache = vi.fn(memoryCache);
    const original = new Response('ok', { headers: { 'content-type': 'application/json' } });
    const wrapped = withEdgeCache(async () => original, getCache, BUILD_ID);

    const response = await wrapped(new Request(`${ORIGIN}/api/x`), {}, context());

    expect(response).toBe(original);
    expect(getCache).not.toHaveBeenCalled();
  });

  it.each(['text/html', 'text/x-component'])('isolates %s across builds sharing a cache', async (contentType) => {
    const cache = memoryCache();
    const handlerA = vi.fn(async () => htmlResponse('A', { 'content-type': contentType }));
    const handlerB = vi.fn(async () => htmlResponse('B', { 'content-type': contentType }));
    const buildA = withEdgeCache(handlerA, () => cache, BUILD_ID);
    const buildB = withEdgeCache(handlerB, () => cache, 'build-b');
    const request = new Request(`${ORIGIN}/es`, {
      headers: contentType === 'text/x-component' ? { rsc: '1' } : {},
    });
    const ctxA = context();
    await buildA(request, {}, ctxA);
    await ctxA.settled();

    const ctxB = context();
    const missB = await buildB(request, {}, ctxB);
    await ctxB.settled();
    expect(missB.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe('MISS');
    expect(await missB.text()).toBe('B');

    const hitB = await buildB(request, {}, context());
    expect(hitB.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe('HIT');
    expect(await hitB.text()).toBe('B');

    const rollbackA = await buildA(request, {}, context());
    expect(rollbackA.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe('HIT');
    expect(await rollbackA.text()).toBe('A');
    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
  });

  it.each([
    new Request(`${ORIGIN}/es`, { headers: { 'x-deployment-id': 'old' } }),
    new Request(`${ORIGIN}/es?dpl=old`),
  ])('leaves deployment routing to OpenNext', async (request) => {
    const getCache = vi.fn(memoryCache);
    const handler = vi.fn(async () => htmlResponse());
    const wrapped = withEdgeCache(handler, getCache, BUILD_ID);
    const ctx = context();

    await wrapped(request, {}, ctx);

    expect(getCache).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith(request, {}, ctx);
  });

  it('renders normally when a cache read fails', async () => {
    const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const cache = memoryCache();
      cache.match = vi.fn().mockRejectedValue(new Error('cache unavailable'));
      const handler = vi.fn(async () => htmlResponse('fresh'));
      const wrapped = withEdgeCache(handler, () => cache, BUILD_ID);

      const response = await wrapped(new Request(`${ORIGIN}/es`), {}, context());

      expect(response.status).toBe(200);
      expect(response.headers.get(EDGE_CACHE_STATUS_HEADER)).toBe('BYPASS');
      expect(await response.text()).toBe('fresh');
      expect(handler).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith('[EdgeCache] read failed: cache unavailable');
    } finally {
      log.mockRestore();
    }
  });

  it('logs a failed cache write without failing the response or waitUntil', async () => {
    const log = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const cache = memoryCache();
      cache.put = vi.fn().mockRejectedValue(new Error('storage unavailable'));
      const wrapped = withEdgeCache(async () => htmlResponse('fresh'), () => cache, BUILD_ID);
      const ctx = context();

      const response = await wrapped(new Request(`${ORIGIN}/es`), {}, ctx);
      await ctx.settled();

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('fresh');
      expect(log).toHaveBeenCalledWith('[EdgeCache] write failed: storage unavailable');
    } finally {
      log.mockRestore();
    }
  });
});
