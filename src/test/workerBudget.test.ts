import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

/**
 * Cloudflare's free plan caps a Worker at 3 MB compressed. Stay below 2.7 MB so
 * new languages and pages have headroom before a paid plan is needed.
 */
const WORKER_BUDGET_BYTES = 2.7 * 1024 * 1024;
const HANDLER = path.resolve(__dirname, '../../.open-next/server-functions/default/handler.mjs');

describe('Worker bundle budget', () => {
  // Measures the last `npm run build:worker` output; skipped on a fresh checkout.
  it.runIf(existsSync(HANDLER))('stays under the compressed budget', () => {
    expect(gzipSync(readFileSync(HANDLER)).length).toBeLessThan(WORKER_BUDGET_BYTES);
  });
});
