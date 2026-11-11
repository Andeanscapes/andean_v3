import type { ReactNode } from 'react';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

interface GuideFigureProps {
  caption: string;
  /** Credit line, e.g. "Photo: Andean Scapes · CC BY 4.0". */
  credit: string;
  licenseUrl?: string;
  /** Photo: CDN `.webp` with a `-mobile` sibling. Omit when `children` is an illustration. */
  image?: { src: string; alt: string };
  children?: ReactNode;
}

/**
 * Captioned, credited figure for editorial pages. Photos are lazy-loaded and
 * sit in a fixed 3:2 frame, so they never shift the layout.
 */
export function GuideFigure({ caption, credit, licenseUrl, image, children }: GuideFigureProps) {
  return (
    <figure className="mt-6">
      {image ? (
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-base-200">
          <picture>
            <source media="(max-width: 767px)" srcSet={getResponsiveImageSrc(image.src).mobile} />
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        </div>
      ) : (
        children
      )}
      <figcaption className="mt-2 text-sm leading-relaxed text-base-content/75">
        {caption}{' '}
        <span className="text-base-content/60">
          {licenseUrl ? (
            <a
              href={licenseUrl}
              rel="noopener noreferrer license"
              className="rounded-sm underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {credit}
            </a>
          ) : (
            credit
          )}
        </span>
      </figcaption>
    </figure>
  );
}
