import { getAvifSrc, getResponsiveImageSrc } from '@/utils/responsiveImage';

/**
 * Preloads for `HeroPicture`: the same files the `<picture>` will pick, so the
 * browser never downloads a WebP it then discards. `type="image/avif"` makes a
 * browser without AVIF skip the hint (it then loads the WebP fallback normally).
 */
export function HeroPreload({ src }: { src: string }) {
  const { mobile } = getResponsiveImageSrc(src);
  const avifMobile = getAvifSrc(mobile);
  const avifDesktop = getAvifSrc(src);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={avifMobile ?? mobile}
        type={avifMobile ? 'image/avif' : undefined}
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={avifDesktop ?? src}
        type={avifDesktop ? 'image/avif' : undefined}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
    </>
  );
}
