/** Upload staged media, prune its confirmed sources, then publish local feed edits. */

import { execFileSync } from 'node:child_process';

const dryRun = process.argv.includes('--dry-run');
const extraArgs = process.argv.slice(2).filter((arg) => arg !== '--dry-run');

function run(command: string, args: readonly string[]): void {
  execFileSync(command, [...args], { stdio: 'inherit' });
}

run('npm', [
  'run',
  'media:push',
  '--',
  '--upscale',
  '--prune-sources',
  ...(dryRun ? ['--dry-run'] : []),
  ...extraArgs,
]);

if (dryRun) {
  console.log('[media:sync] dry run complete; feed was not uploaded.');
} else {
  run('npm', ['run', 'feed:sync']);
}
