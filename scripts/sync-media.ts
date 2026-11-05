/**
 * `npm run feed:sync` (alias `media:sync`): upload staged media from `r2-cache/`,
 * prune its confirmed sources, then publish local feed edits via `feed:sync:only`.
 */

import { execFileSync } from 'node:child_process';

/** Flags that belong to the feed step; everything else goes to `media:push`. */
const FEED_FLAGS = new Set(['--allow-new-fields', '--skip-health-check']);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const feedArgs = args.filter((arg) => FEED_FLAGS.has(arg));
const mediaArgs = args.filter((arg) => arg !== '--dry-run' && !FEED_FLAGS.has(arg));

/** The child already printed why it failed; exit with its code instead of a stack trace. */
function run(command: string, commandArgs: readonly string[]): void {
  try {
    execFileSync(command, [...commandArgs], { stdio: 'inherit' });
  } catch (error) {
    const status = (error as { status?: unknown }).status;
    process.exit(typeof status === 'number' ? status : 1);
  }
}

run('npm', [
  'run',
  'media:push',
  '--',
  '--upscale',
  '--prune-sources',
  ...(dryRun ? ['--dry-run'] : []),
  ...mediaArgs,
]);

if (dryRun) {
  console.log('[feed:sync] dry run complete; feed was not uploaded.');
} else {
  run('npm', ['run', 'feed:sync:only', ...(feedArgs.length > 0 ? ['--', ...feedArgs] : [])]);
}
