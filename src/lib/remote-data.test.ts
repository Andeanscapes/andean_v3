/**
 * Tests for remote-data.ts — fetch + fallback + validation behavior
 */

/* eslint-disable no-undef */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import { fetchRemoteJson } from './remote-data';

const TestSchema = z.object({
  id: z.string(),
  value: z.number(),
});

describe('fetchRemoteJson', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns local fallback when REMOTE_DATA_BASE_URL is unset', async () => {
    delete process.env.REMOTE_DATA_BASE_URL;
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchRemoteJson('/test.json', TestSchema);

    expect(result).toEqual({
      data: null,
      source: 'local',
      reason: 'REMOTE_DATA_BASE_URL unset',
    });

    // Verify no fetch was attempted
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches and returns remote data on success', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    const mockData = { id: 'test-1', value: 42 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    }));

    const result = await fetchRemoteJson('/test.json', TestSchema);

    expect(result).toEqual({
      data: mockData,
      source: 'remote',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/data/test.json',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('passes revalidate and tags to fetch', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    const mockData = { id: 'test-1', value: 42 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    }));

    await fetchRemoteJson('/test.json', TestSchema, {
      revalidate: 3600,
      tags: ['test-tag'],
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        next: {
          revalidate: 3600,
          tags: ['test-tag'],
        },
      })
    );
  });

  it('returns local on 404', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    }));

    const result = await fetchRemoteJson('/test.json', TestSchema);

    expect(result.source).toBe('local');
    if (result.source === 'local') {
      expect(result.reason).toContain('HTTP 404');
    }
  });

  it('returns local on 500', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    }));

    const result = await fetchRemoteJson('/test.json', TestSchema);

    expect(result.source).toBe('local');
    if (result.source === 'local') {
      expect(result.reason).toContain('HTTP 500');
    }
  });

  it('returns local on malformed JSON', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    }));

    const result = await fetchRemoteJson('/test.json', TestSchema);

    expect(result.source).toBe('local');
    if (result.source === 'local') {
      expect(result.reason).toContain('Malformed JSON');
    }
  });

  it('returns local on schema validation failure', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    const invalidData = { id: 'test-1', value: 'not-a-number' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => invalidData,
    }));

    const result = await fetchRemoteJson('/test.json', TestSchema);

    expect(result.source).toBe('local');
    if (result.source === 'local') {
      expect(result.reason).toContain('Schema validation failed');
    }
  });

  it('returns local on network error', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(
      new Error('Network timeout')
    ));

    const result = await fetchRemoteJson('/test.json', TestSchema);

    expect(result.source).toBe('local');
    if (result.source === 'local') {
      expect(result.reason).toContain('Fetch error');
      expect(result.reason).toContain('Network timeout');
    }
  });

  it('never throws an error', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(
      new Error('Catastrophic failure')
    ));

    // Should not throw
    const result = await fetchRemoteJson('/test.json', TestSchema);
    expect(result.source).toBe('local');
  });

  it('constructs the correct URL with base and path', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/v1';

    const mockData = { id: 'test-1', value: 42 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    }));

    await fetchRemoteJson('/experiences/emerald.json', TestSchema);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://cdn.example.com/v1/experiences/emerald.json',
      expect.anything()
    );
  });

  it('normalizes a trailing slash on the base URL', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/v1/';

    const mockData = { id: 'test-1', value: 42 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    }));

    await fetchRemoteJson('/landing.json', TestSchema);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://cdn.example.com/v1/landing.json',
      expect.anything()
    );
  });

  it('rejects a base URL without an http(s) scheme without fetching', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'cdn.example.com/v1';
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchRemoteJson('/landing.json', TestSchema);

    expect(result.source).toBe('local');
    if (result.source === 'local') {
      expect(result.reason).toContain('absolute http(s) URL');
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('forwards tags even when revalidate is omitted', async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://example.com/data';

    const mockData = { id: 'test-1', value: 42 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    }));

    await fetchRemoteJson('/test.json', TestSchema, { tags: ['only-tags'] });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        next: { revalidate: undefined, tags: ['only-tags'] },
      })
    );
  });

  describe('timeout', () => {
    it('passes an abort signal to fetch', async () => {
      process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/v1';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-1', value: 42 }),
      }));

      await fetchRemoteJson('/test.json', TestSchema);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('falls back when the request outlives the timeout', async () => {
      process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/v1';

      // Resolve only once the caller aborts, mirroring a hung CDN read.
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: { signal: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              init.signal.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError'))
              );
            })
        )
      );

      const result = await fetchRemoteJson('/test.json', TestSchema, { timeoutMs: 10 });

      expect(result.source).toBe('local');
      if (result.source === 'local') {
        expect(result.reason).toContain('Timed out after 10ms');
      }
    });

    it('does not report a timeout for an unrelated network failure', async () => {
      process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/v1';
      vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('ECONNREFUSED')));

      const result = await fetchRemoteJson('/test.json', TestSchema);

      expect(result.source).toBe('local');
      if (result.source === 'local') {
        expect(result.reason).toContain('ECONNREFUSED');
        expect(result.reason).not.toContain('Timed out');
      }
    });
  });

  describe('observability', () => {
    // Silent fallback is the whole risk: without a log line there is no way to
    // tell a working upload from a wrong URL.
    let log: ReturnType<typeof vi.spyOn>;
    let warn: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      log = vi.spyOn(console, 'log').mockImplementation(() => {});
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      log.mockRestore();
      warn.mockRestore();
    });

    it('logs a remote hit at log level with the path', async () => {
      process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/v1';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-1', value: 42 }),
      }));

      await fetchRemoteJson('/landing.json', TestSchema);

      const line = String(log.mock.calls[0]?.[0]);
      expect(line).toContain('[RemoteData]');
      expect(line).toContain('remote');
      expect(line).toContain('/landing.json');
      expect(line).toMatch(/\d+ms/);
    });

    it('logs a fallback at warn level with the reason', async () => {
      process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/v1';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 404 }));

      await fetchRemoteJson('/landing.json', TestSchema);

      const line = warn.mock.calls.map((c) => String(c[0])).find((l) => l.includes('local'));
      expect(line).toContain('[RemoteData]');
      expect(line).toContain('/landing.json');
      expect(line).toContain('reason="HTTP 404');
    });

    it('reports local when the base URL is unset', async () => {
      delete process.env.REMOTE_DATA_BASE_URL;

      await fetchRemoteJson('/landing.json', TestSchema);

      const line = warn.mock.calls.map((c) => String(c[0])).find((l) => l.includes('local'));
      expect(line).toContain('reason="REMOTE_DATA_BASE_URL unset"');
    });

    it('emits exactly one outcome line per read', async () => {
      process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/v1';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test-1', value: 42 }),
      }));

      await fetchRemoteJson('/landing.json', TestSchema);

      const outcomes = [...log.mock.calls, ...warn.mock.calls].filter((c) =>
        /\[RemoteData\] (remote|local)/.test(String(c[0])),
      );
      expect(outcomes).toHaveLength(1);
    });
  });
});
