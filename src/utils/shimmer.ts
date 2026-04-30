/**
 * Emerald-tinted SVG shimmer for next/image placeholder="blur".
 * Uses a data URI with percent-encoded SVG — no Buffer, no btoa needed.
 */

const shimmerSvg = (w: number, h: number) =>
  `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#052e16" stop-opacity="1"/><stop offset="45%" stop-color="#064e3b" stop-opacity="1"/><stop offset="100%" stop-color="#052e16" stop-opacity="1"/><animateTransform attributeName="gradientTransform" type="translate" values="-1 0; 2 0; -1 0" dur="1.6s" repeatCount="indefinite"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#g)"/></svg>`;

/** Emerald shimmer blur placeholder for next/image — 400×300 base */
export const EMERALD_SHIMMER_BLUR_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shimmerSvg(400, 300))}`;

/** Tall variant for hero/banner images */
export const EMERALD_SHIMMER_BLUR_DATA_URL_TALL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(shimmerSvg(400, 500))}`;
