interface ResponsiveImageSrc {
  desktop: string;
  mobile: string;
}

/**
 * Derives responsive image paths from a single source.
 * Convention: mobile variant is {name}-mobile.{ext}
 *
 * @example
 * getResponsiveImageSrc('/hero/h10.webp')
 * // => { desktop: '/hero/h10.webp', mobile: '/hero/h10-mobile.webp' }
 */
export function getResponsiveImageSrc(src: string): ResponsiveImageSrc {
  const [path, query] = src.split('?', 2);
  const lastDot = path.lastIndexOf('.');

  if (lastDot === -1) {
    return { desktop: src, mobile: src };
  }

  const base = path.slice(0, lastDot);
  const ext = path.slice(lastDot);
  const querySuffix = query ? `?${query}` : '';

  return {
    desktop: src,
    mobile: `${base}-mobile${ext}${querySuffix}`,
  };
}

/**
 * Check if string ends with a recognized image extension.
 */
export function hasImageExtension(src: string): boolean {
  return /\.(webp|jpg|jpeg|png|avif|gif|svg)(\?|$)/i.test(src);
}

/**
 * The single rule for which images ship an `.avif` sibling: hero WebPs, by
 * filename (`landing-hero[-n]`, `list-hero`, `hero`, each optionally `-mobile`).
 * The media pipeline generates AVIF for exactly these keys and `verify:feed`
 * requires it, so the app must never request AVIF for anything else: a browser
 * does not fall back from a `<source>` that 404s.
 */
export function isAvifHeroKey(src: string): boolean {
  const [path] = src.split('?', 1);
  const name = path.slice(path.lastIndexOf('/') + 1).toLowerCase();
  return /^(landing-hero(-\d+)?|list-hero|hero)(-mobile)?\.webp$/.test(name);
}

/** `/x/hero.webp` -> `/x/hero.avif` (query kept). Pure path mapping, no rule check. */
export function toAvifKey(src: string): string {
  const [path, query] = src.split('?', 2);
  return `${path.replace(/\.webp$/i, '.avif')}${query ? `?${query}` : ''}`;
}

/** AVIF sibling of a hero image, or `null` when `isAvifHeroKey` says it has none. */
export function getAvifSrc(src: string): string | null {
  return isAvifHeroKey(src) ? toAvifKey(src) : null;
}
