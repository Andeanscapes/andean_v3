import { getAvifSrc, getResponsiveImageSrc } from '@/utils/responsiveImage';

interface HeroPictureProps {
  /** Desktop `.webp`; the `-mobile` and `.avif` siblings are derived from it. */
  src: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Above-the-fold hero image (the page's LCP element): AVIF first, WebP fallback,
 * with a mobile crop below md. Source order matters: a browser takes the first
 * `<source>` whose media and type both match, so each breakpoint lists AVIF
 * before WebP. Decorative: the hero heading carries the meaning.
 */
export function HeroPicture({ src, className = 'absolute inset-0 h-full w-full object-cover', width, height }: HeroPictureProps) {
  const { mobile } = getResponsiveImageSrc(src);
  const avifDesktop = getAvifSrc(src);
  const avifMobile = getAvifSrc(mobile);

  return (
    <picture>
      {avifMobile ? <source type="image/avif" media="(max-width: 767px)" srcSet={avifMobile} /> : null}
      <source media="(max-width: 767px)" srcSet={mobile} />
      {avifDesktop ? <source type="image/avif" srcSet={avifDesktop} /> : null}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className={className}
      />
    </picture>
  );
}
