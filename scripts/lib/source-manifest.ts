/**
 * Which source bytes produced each converted output in `r2-cache/`.
 *
 * mtime cannot answer that: a replacement photo copied with its original date
 * (AirDrop, `cp -p`, camera exports) looks older than the `.webp` it should
 * replace, so the optimizer skipped it, the stale output matched R2, and pruning
 * deleted the new photo unconverted. With this record:
 *
 *   - the optimizer re-converts whenever the source hash differs
 *   - pruning removes a source only when its hash is the one that produced the
 *     published output
 *
 * Stored as `r2-cache/.sources.json` (gitignored with the rest of the cache).
 * A missing or unreadable manifest means "unknown", which is always the safe
 * answer: convert again, delete nothing.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/** outputKey -> sha256 of the source file it was converted from. */
export type SourceManifest = Record<string, string>;

export function manifestPath(cacheDir: string): string {
  return path.join(cacheDir, '.sources.json');
}

export function readSourceManifest(cacheDir: string): SourceManifest {
  const file = manifestPath(cacheDir);
  if (!existsSync(file)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    );
  } catch {
    return {};
  }
}

export function writeSourceManifest(cacheDir: string, manifest: SourceManifest): void {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(manifestPath(cacheDir), `${JSON.stringify(sorted, null, 2)}\n`);
}

export function hashFile(file: string): string {
  return createHash('sha256').update(new Uint8Array(readFileSync(file))).digest('hex');
}

/** True only when the manifest proves `sourceHash` produced `outputKey`. */
export function producedBy(manifest: SourceManifest, outputKey: string, sourceHash: string): boolean {
  return manifest[outputKey] === sourceHash;
}
