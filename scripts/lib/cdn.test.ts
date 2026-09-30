/**
 * Unit coverage for the CDN reader.
 *
 * The behaviour under test is the one that caused a real incident: the CDN keys
 * HEAD and GET separately, so sizing an object with one method and fetching it
 * with the other reported a fresh upload while serving the previous bytes. These
 * assertions pin down that every read either bypasses the cache deliberately or
 * is labelled as an edge read.
 *
 * `fetch` is stubbed throughout — nothing here touches the network.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadFromOrigin, readLength, sameContent } from './cdn';

const URL_UNDER_TEST = 'https://cdn.andeanscapes.com/images/brand/landing-hero.webp';

function rangeResponse(total: number, etag?: string): Response {
  return new Response(new Uint8Array(1024), {
    status: 206,
    headers: { 'content-range': `bytes 0-1023/${total}`, ...(etag ? { etag } : {}) },
  });
}

const MD5 = 'd3e45a6f2393a39a749b6a0c40f73604';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('readLength', () => {
  it('reads the total length from a 206 content-range', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(rangeResponse(219674)));

    await expect(readLength(URL_UNDER_TEST, true)).resolves.toEqual({
      status: 'found',
      length: 219674,
    });
  });

  it('falls back to content-length when the origin ignores the range', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array(4), { status: 200, headers: { 'content-length': '4' } }),
      ),
    );

    await expect(readLength(URL_UNDER_TEST, false)).resolves.toEqual({ status: 'found', length: 4 });
  });

  /**
   * The cache-buster is the whole mechanism for reading origin state: the edge
   * cannot answer a key it has never seen, so the request reaches R2.
   */
  it('appends a cache-busting parameter only when bypassing the cache', async () => {
    const mock = vi.fn().mockResolvedValue(rangeResponse(1));
    vi.stubGlobal('fetch', mock);

    await readLength(URL_UNDER_TEST, true);
    expect(mock.mock.calls[0][0]).toMatch(/\?__origin=\d+$/);

    await readLength(URL_UNDER_TEST, false);
    expect(mock.mock.calls[1][0]).toBe(URL_UNDER_TEST);
  });

  it('requests only the first bytes, never the whole object', async () => {
    const mock = vi.fn().mockResolvedValue(rangeResponse(1));
    vi.stubGlobal('fetch', mock);

    await readLength(URL_UNDER_TEST, false);

    expect(mock.mock.calls[0][1]).toEqual({ headers: { Range: 'bytes=0-1023' } });
  });

  it('reports a missing object as absent, not as an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    await expect(readLength(URL_UNDER_TEST, true)).resolves.toEqual({ status: 'absent' });
  });

  /** `absent` and `unavailable` must stay distinct: one is a new key, the other is a broken read. */
  it('distinguishes an unreachable origin from a missing object', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')));

    await expect(readLength(URL_UNDER_TEST, true)).resolves.toEqual({
      status: 'unavailable',
      reason: 'ECONNRESET',
    });
  });

  it('treats a 5xx as unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 502, statusText: 'Bad Gateway' })),
    );

    await expect(readLength(URL_UNDER_TEST, true)).resolves.toEqual({
      status: 'unavailable',
      reason: 'HTTP 502 Bad Gateway',
    });
  });

  it('treats a range response with no parsable total as unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array(8), {
          status: 206,
          headers: { 'content-range': 'bytes 0-7/*' },
        }),
      ),
    );

    await expect(readLength(URL_UNDER_TEST, false)).resolves.toMatchObject({
      status: 'unavailable',
    });
  });

  it('keeps an existing query string intact', async () => {
    const mock = vi.fn().mockResolvedValue(rangeResponse(1));
    vi.stubGlobal('fetch', mock);

    await readLength(`${URL_UNDER_TEST}?v=2`, true);

    expect(mock.mock.calls[0][0]).toMatch(/\?v=2&__origin=\d+$/);
  });
});

describe('downloadFromOrigin', () => {
  it('always bypasses the cache', async () => {
    const mock = vi.fn().mockResolvedValue(new Response(new Uint8Array(3), { status: 200 }));
    vi.stubGlobal('fetch', mock);

    const result = await downloadFromOrigin(URL_UNDER_TEST);

    expect(mock.mock.calls[0][0]).toMatch(/\?__origin=\d+$/);
    expect(result).toMatchObject({ ok: true });
  });

  it('surfaces a non-OK status rather than writing a body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 403, statusText: 'Forbidden' })),
    );

    await expect(downloadFromOrigin(URL_UNDER_TEST)).resolves.toEqual({
      ok: false,
      reason: 'HTTP 403 Forbidden',
    });
  });

  it('surfaces a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('socket hang up')));

    await expect(downloadFromOrigin(URL_UNDER_TEST)).resolves.toEqual({
      ok: false,
      reason: 'socket hang up',
    });
  });
});

describe('readLength content hash', () => {
  it('exposes the MD5 an R2 ETag carries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(rangeResponse(103766, `"${MD5}"`)));

    await expect(readLength(URL_UNDER_TEST, true)).resolves.toEqual({
      status: 'found',
      length: 103766,
      md5: MD5,
    });
  });

  it('ignores a multipart ETag, which is not a content hash', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(rangeResponse(10, `"${MD5}-3"`)));

    const result = await readLength(URL_UNDER_TEST, true);
    expect(result.status === 'found' ? result.md5 : 'n/a').toBeUndefined();
  });
});

describe('sameContent', () => {
  const local = { size: 103766, md5: MD5 };

  /** The incident: a replaced image of identical byte length read as "up to date". */
  it('detects a replaced file that kept the same size', () => {
    expect(sameContent({ length: 103766, md5: '0'.repeat(32) }, local)).toBe(false);
  });

  it('matches identical bytes', () => {
    expect(sameContent({ length: 103766, md5: MD5 }, local)).toBe(true);
  });

  it('falls back to size only when the remote has no content hash', () => {
    expect(sameContent({ length: 103766 }, local)).toBe(true);
    expect(sameContent({ length: 1 }, local)).toBe(false);
  });
});
