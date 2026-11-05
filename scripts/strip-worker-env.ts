/**
 * Remove secrets from the env snapshot OpenNext bakes into the Worker bundle.
 * Runs inside `npm run build:worker`, before typecheck, preview, deploy and
 * upload. See `scripts/lib/worker-env.ts` for why.
 *
 * Never prints values: only the names of the dropped keys.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { filterWorkerEnvSource } from './lib/worker-env';

const ENV_FILE = path.join(process.cwd(), '.open-next', 'cloudflare', 'next-env.mjs');

if (!existsSync(ENV_FILE)) {
  console.error(`[strip-worker-env] ${ENV_FILE} not found; run the OpenNext build first.`);
  process.exit(1);
}

const { source, dropped, matched } = filterWorkerEnvSource(readFileSync(ENV_FILE, 'utf8'));
if (matched === 0) {
  // Fail closed: an unrecognised format could still carry local secrets.
  console.error('[strip-worker-env] unrecognised next-env.mjs format; refusing to ship an unfiltered bundle.');
  process.exit(1);
}
writeFileSync(ENV_FILE, source);

console.log(
  dropped.length > 0
    ? `[strip-worker-env] removed from the Worker bundle: ${dropped.join(', ')}`
    : '[strip-worker-env] no secrets in the Worker bundle',
);
