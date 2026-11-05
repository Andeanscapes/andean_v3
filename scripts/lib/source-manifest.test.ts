/**
 * Unit coverage for the source manifest. Uses a temp dir, no network.
 */

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  hashFile,
  manifestPath,
  producedBy,
  readSourceManifest,
  writeSourceManifest,
} from './source-manifest';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'source-manifest-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('source manifest', () => {
  it('round-trips entries', () => {
    writeSourceManifest(dir, { '/images/a.webp': 'abc' });
    expect(readSourceManifest(dir)).toEqual({ '/images/a.webp': 'abc' });
  });

  it('treats a missing or corrupt manifest as empty, so nothing is pruned', () => {
    expect(readSourceManifest(dir)).toEqual({});
    writeFileSync(manifestPath(dir), '{not json');
    expect(readSourceManifest(dir)).toEqual({});
  });

  it('detects a replaced source even when it keeps the same name', () => {
    const source = path.join(dir, 'photo.jpg');
    writeFileSync(source, 'original');
    const manifest = { '/images/photo.webp': hashFile(source) };

    writeFileSync(source, 'replacement');
    expect(producedBy(manifest, '/images/photo.webp', hashFile(source))).toBe(false);
  });

  it('confirms the source that produced the output', () => {
    const source = path.join(dir, 'photo.jpg');
    writeFileSync(source, 'original');
    const hash = hashFile(source);
    expect(producedBy({ '/images/photo.webp': hash }, '/images/photo.webp', hash)).toBe(true);
  });
});
