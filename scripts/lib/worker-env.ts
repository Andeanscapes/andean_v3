/**
 * Filter the env snapshot OpenNext bakes into the Worker bundle.
 *
 * `opennextjs-cloudflare build` copies every value from `.env`, `.env.<mode>`,
 * `.env.local` and `.env.<mode>.local` into `.open-next/cloudflare/next-env.mjs`,
 * and the deployed Worker uses them as a fallback for any variable Cloudflare
 * does not set. A build on a developer machine would therefore upload local
 * secrets (payment and alert tokens) inside the Worker script, and silently use
 * dev values in prod when a prod secret is missing.
 *
 * Only public, non-secret configuration may stay. Secrets must come from
 * `wrangler secret put`; CI builds have no `.env.local`, so they are unaffected.
 */

const PUBLIC_KEYS = new Set(['REMOTE_DATA_BASE_URL', 'GOOGLE_SITE_VERIFICATION']);

export function isPublicWorkerEnvKey(key: string): boolean {
  return key.startsWith('NEXT_PUBLIC_') || PUBLIC_KEYS.has(key);
}

const EXPORT_LINE = /^export const (\w+) = (\{.*\});$/;

/**
 * Rewrite `next-env.mjs`, keeping only public keys. Returns the new source, the
 * dropped key names, and how many mode exports were recognised: zero means the
 * OpenNext format changed and nothing could be filtered.
 */
export function filterWorkerEnvSource(source: string): { source: string; dropped: string[]; matched: number } {
  const dropped = new Set<string>();
  let matched = 0;
  const lines = source.split('\n').map((line) => {
    const match = EXPORT_LINE.exec(line);
    if (!match) return line;
    matched += 1;

    const values = JSON.parse(match[2]) as Record<string, string>;
    const kept: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      if (isPublicWorkerEnvKey(key)) kept[key] = value;
      else dropped.add(key);
    }
    return `export const ${match[1]} = ${JSON.stringify(kept)};`;
  });

  return { source: lines.join('\n'), dropped: Array.from(dropped).sort(), matched };
}
