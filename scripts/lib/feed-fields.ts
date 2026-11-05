/**
 * Detect fields a local feed edit introduces that the live copy never had.
 *
 * Feed schemas are `.strict()`, so the deployed app rejects any key it does not
 * know: publishing a new field before the code that reads it is deployed fails
 * every page that reads the file. `feed:sync` uses this to refuse that order.
 *
 * Paths are structural: array indices collapse to `[]`, so adding another
 * element with an already-published shape is not reported.
 *
 * Pure: callers pass parsed JSON and decide how to report.
 */

function collectKeyPaths(value: unknown, prefix: string, out: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectKeyPaths(item, `${prefix}[]`, out);
    return;
  }
  if (value === null || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    out.add(keyPath);
    collectKeyPaths(child, keyPath, out);
  }
}

/** Key paths present in `local` but absent from `live`, sorted. */
export function findNewKeyPaths(live: unknown, local: unknown): string[] {
  const livePaths = new Set<string>();
  const localPaths = new Set<string>();
  collectKeyPaths(live, '', livePaths);
  collectKeyPaths(local, '', localPaths);

  return Array.from(localPaths)
    .filter((keyPath) => !livePaths.has(keyPath))
    .sort();
}
