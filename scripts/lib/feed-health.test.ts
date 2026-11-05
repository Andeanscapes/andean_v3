/**
 * Unit coverage for the post-publish health check. No network: `fetch` and
 * `sleep` are injected.
 */

import { describe, expect, it, vi } from 'vitest';
import { checkSiteHealth } from './feed-health';

const URLS = ['https://site.example/', 'https://site.example/experiences'];
const OPTIONS = { attempts: 3, intervalMs: 1, timeoutMs: 1000, sleep: async () => {} };

function respond(status: number): Response {
  return new Response(null, { status });
}

describe('checkSiteHealth', () => {
  it('is healthy when every URL answers 2xx on every pass', async () => {
    const fetchImpl = vi.fn(async () => respond(200));
    await expect(checkSiteHealth(URLS, { ...OPTIONS, fetchImpl })).resolves.toEqual({ status: 'healthy' });
    expect(fetchImpl).toHaveBeenCalledTimes(URLS.length * OPTIONS.attempts);
  });

  it('reports broken on the first 5xx, without waiting for later passes', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(respond(200))
      .mockResolvedValueOnce(respond(200))
      .mockResolvedValueOnce(respond(500));

    await expect(checkSiteHealth(URLS, { ...OPTIONS, fetchImpl })).resolves.toEqual({
      status: 'broken',
      url: URLS[0],
      httpStatus: 500,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('is inconclusive, not broken, when only the network fails', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('ENOTFOUND');
    });
    await expect(checkSiteHealth(URLS, { ...OPTIONS, fetchImpl })).resolves.toEqual({
      status: 'inconclusive',
      reason: 'ENOTFOUND',
    });
  });

  it('cache-busts every request so the edge HTML cache cannot answer', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => respond(200));
    await checkSiteHealth(URLS, { ...OPTIONS, attempts: 1, fetchImpl });
    for (const [url] of fetchImpl.mock.calls) expect(String(url)).toMatch(/[?&]__health=/);
  });
});
