/**
 * Public-repository hygiene guards.
 *
 * This repo is published, and two categories of file must never be tracked:
 *
 *  1. **Real business data.** The feed payloads in `fixtures/` are downloaded,
 *     not committed. A broken ignore rule would silently publish pricing,
 *     availability and review data on the next `git add -A`.
 *  2. **Local state and build output.** Wrangler/Miniflare SQLite state, OS
 *     cruft and bundled artifacts have leaked into this repo before; they add
 *     weight and can carry whatever was in memory when they were written.
 *
 * These assertions read the git index directly, so they fail on the *fact* of a
 * file being tracked rather than on a reviewer noticing it in a diff.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(__dirname, '../..');

function trackedFiles(): string[] {
  return execFileSync('git', ['ls-files'], { cwd: REPO_ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

/** `git check-ignore` exits 1 when the path is NOT ignored. */
function isIgnored(relativePath: string): boolean {
  try {
    execFileSync('git', ['check-ignore', '-q', relativePath], { cwd: REPO_ROOT });
    return true;
  } catch {
    return false;
  }
}

describe('repository hygiene', () => {
  const tracked = trackedFiles();

  it('never tracks a downloaded feed payload', () => {
    const feedPayloads = tracked.filter((file) => /^fixtures\/.*\.json$/.test(file));
    expect(feedPayloads).toEqual([]);
  });

  it('keeps every feed payload path ignored', () => {
    for (const file of [
      'fixtures/landing.json',
      'fixtures/experiences-list.json',
      'fixtures/experience-emerald-mining.json',
    ]) {
      expect(isIgnored(file), `${file} must be gitignored`).toBe(true);
    }
  });

  it('documents the fixtures directory without publishing its contents', () => {
    expect(tracked).toContain('fixtures/README.md');
  });

  it('never tracks local state, OS cruft, or build output', () => {
    const forbidden = tracked.filter((file) =>
      /(^|\/)\.DS_Store$|\.sqlite(-shm|-wal)?$|^\.wrangler\/|^storybook-static\/|^\.next\/|^\.open-next\//.test(
        file,
      ),
    );
    expect(forbidden).toEqual([]);
  });

  it('tracks only the safe env example', () => {
    const envFiles = tracked.filter((file) => /(^|\/)\.env/.test(file));
    expect(envFiles).toEqual(['.env.example']);
  });

  it('allows only non-secret keys in the tracked env example', () => {
    const keys = readFileSync(path.join(REPO_ROOT, '.env.example'), 'utf8')
      .split('\n')
      .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1])
      .filter((key): key is string => Boolean(key));

    expect(keys.sort()).toEqual([
      'NEXT_PUBLIC_CDN_BASE_URL',
      'NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER',
      'REMOTE_DATA_BASE_URL',
    ]);
  });

  /**
   * `.env.example` is a template, not a config source. Keeping it valueless is
   * what stops it from drifting against the real sources and from becoming the
   * habitual place to paste "just one" real value — which is how a secret
   * eventually lands in a tracked file.
   */
  it('keeps the tracked env example free of values', () => {
    const assignments = readFileSync(path.join(REPO_ROOT, '.env.example'), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    const withValues = assignments.filter((line) => !/=$/.test(line));
    expect(withValues, '.env.example must declare names only, no values').toEqual([]);
  });

  /**
   * The feed base URL is duplicated between the CLI default and the deployed
   * Worker runtime. Nothing reconciles them at runtime, and a mismatch is
   * invisible until a deploy reads the wrong CDN — so pin them here. The CI
   * variables `REMOTE_DATA_BASE_URL_PROD` / `_DEV` are the copy this cannot
   * see; they live in repository settings.
   */
  it('keeps the feed base URL identical across wrangler and the CLI scripts', () => {
    const read = (relativePath: string) =>
      readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');

    const fromScripts = read('scripts/lib/feed.ts').match(
      /DEFAULT_FEED_BASE_URL\s*=\s*'([^']+)'/,
    )?.[1];
    // `exec` loop rather than `matchAll`: tsconfig targets es5, so spreading an
    // iterator needs `downlevelIteration`, and that is not worth a global change.
    const wranglerPattern = /REMOTE_DATA_BASE_URL\s*=\s*"([^"]+)"/g;
    const wranglerSource = read('wrangler.toml');
    const fromWrangler: string[] = [];
    let wranglerMatch = wranglerPattern.exec(wranglerSource);
    while (wranglerMatch) {
      fromWrangler.push(wranglerMatch[1]);
      wranglerMatch = wranglerPattern.exec(wranglerSource);
    }

    expect(
      fromScripts,
      'scripts/lib/feed.ts must declare DEFAULT_FEED_BASE_URL',
    ).toBeTruthy();
    expect(
      fromWrangler.length,
      'wrangler.toml must set REMOTE_DATA_BASE_URL for the default and dev environments',
    ).toBe(2);
    expect(new Set(fromWrangler)).toEqual(new Set([fromScripts]));
  });

  it('never tracks a private key or certificate', () => {
    const keyMaterial = tracked.filter((file) =>
      /\.(pem|key|p12|pfx|jks|keystore)$|(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/.test(file),
    );
    expect(keyMaterial).toEqual([]);
  });
});
