/**
 * Experience route construction.
 *
 * The single place the `/experiences/<slug>` shape is spelled out. It was
 * previously hand-built in four files, so a route change could not be made in
 * one edit.
 *
 * These paths are **locale-free**: `@/i18n/navigation`'s `Link` adds the locale
 * prefix. Metadata and the sitemap need an explicit locale, so they compose
 * these with their own prefixing (see `seo.ts`).
 *
 * Kept dependency-free so build scripts can import it.
 */

/** `emerald-mining-adventure` -> `/experiences/emerald-mining-adventure` */
export function experiencePath(slug: string, suffix = ''): string {
  return `/experiences/${slug}${suffix}`;
}
