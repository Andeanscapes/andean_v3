/**
 * Report which sitemap URLs Google has indexed, using the Search Console
 * URL Inspection API (read-only; quota 2,000 inspections/day per property,
 * separate from the manual "Request indexing" limit).
 *
 * Usage:
 *   GSC_SERVICE_ACCOUNT_FILE=/path/to/key.json npm run seo:index-status
 *   GSC_SERVICE_ACCOUNT_FILE=... npm run seo:index-status -- --filter /emeralds
 *
 * Env:
 *   GSC_SERVICE_ACCOUNT_FILE  Service-account JSON key (never commit it). The
 *                             account's email must be added as a user of the property.
 *   GSC_PROPERTY              Defaults to `https://andeanscapes.com/`; use
 *                             `sc-domain:andeanscapes.com` for a domain property.
 *   SITEMAP_URL               Defaults to `https://andeanscapes.com/sitemap.xml`.
 *
 * Writes a CSV next to the console summary so the list can be sorted in a
 * spreadsheet: the "not indexed" rows are the ones worth a manual request.
 */
import { createSign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';

const PROPERTY = process.env.GSC_PROPERTY ?? 'https://andeanscapes.com/';
const SITEMAP_URL = process.env.SITEMAP_URL ?? 'https://andeanscapes.com/sitemap.xml';
const KEY_FILE = process.env.GSC_SERVICE_ACCOUNT_FILE;
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const INSPECT_ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
/** Stay well under the 600 requests/minute limit. */
const DELAY_MS = 150;

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

interface InspectionResult {
  url: string;
  verdict: string;
  coverageState: string;
  lastCrawlTime: string;
  googleCanonical: string;
}

const base64url = (input: string | Buffer) => Buffer.from(input).toString('base64url');

/** OAuth access token from a service account (JWT bearer grant, no extra dependencies). */
async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  const tokenUri = key.token_uri ?? 'https://oauth2.googleapis.com/token';
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 }));
  const signature = createSign('RSA-SHA256').update(`${header}.${claims}`).sign(key.private_key);
  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${base64url(signature)}`,
    }),
  });
  if (!response.ok) throw new Error(`[seo] Token request failed: ${response.status} ${await response.text()}`);
  return ((await response.json()) as { access_token: string }).access_token;
}

async function getSitemapUrls(): Promise<string[]> {
  const response = await fetch(SITEMAP_URL);
  if (!response.ok) throw new Error(`[seo] Sitemap fetch failed: ${response.status}`);
  return Array.from((await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
}

async function inspect(token: string, url: string): Promise<InspectionResult> {
  const response = await fetch(INSPECT_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY }),
  });
  if (!response.ok) throw new Error(`[seo] Inspection failed for ${url}: ${response.status} ${await response.text()}`);
  const body = (await response.json()) as {
    inspectionResult?: { indexStatusResult?: Record<string, string | undefined> };
  };
  const status = body.inspectionResult?.indexStatusResult ?? {};
  return {
    url,
    verdict: status.verdict ?? 'UNKNOWN',
    coverageState: status.coverageState ?? '',
    lastCrawlTime: status.lastCrawlTime ?? '',
    googleCanonical: status.googleCanonical ?? '',
  };
}

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

async function main() {
  if (!KEY_FILE) {
    console.error('[seo] Set GSC_SERVICE_ACCOUNT_FILE to a service-account JSON key. See the header of this script.');
    process.exit(1);
  }
  const filterIndex = process.argv.indexOf('--filter');
  const filter = filterIndex > -1 ? process.argv[filterIndex + 1] : undefined;

  const key = JSON.parse(readFileSync(KEY_FILE, 'utf8')) as ServiceAccountKey;
  const token = await getAccessToken(key);
  const urls = (await getSitemapUrls()).filter((url) => !filter || url.includes(filter));
  console.log(`[seo] Inspecting ${urls.length} URLs from ${SITEMAP_URL} in ${PROPERTY}`);

  const results: InspectionResult[] = [];
  for (const url of urls) {
    results.push(await inspect(token, url));
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }

  // verdict PASS = indexed. Everything else needs attention or time.
  const indexed = results.filter((result) => result.verdict === 'PASS');
  const notIndexed = results.filter((result) => result.verdict !== 'PASS');
  console.log(`\n[seo] Indexed: ${indexed.length}/${results.length}`);
  console.log(`[seo] Not indexed: ${notIndexed.length}`);
  for (const result of notIndexed) console.log(`  - ${result.url}  (${result.coverageState || result.verdict})`);

  const out = `seo-index-status-${new Date().toISOString().slice(0, 10)}.csv`;
  const header = ['url', 'verdict', 'coverageState', 'lastCrawlTime', 'googleCanonical'];
  const rows = results.map((result) => header.map((column) => csvCell(result[column as keyof InspectionResult])).join(','));
  writeFileSync(out, [header.join(','), ...rows].join('\n') + '\n');
  console.log(`\n[seo] Full report: ${out}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
