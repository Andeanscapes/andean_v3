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
