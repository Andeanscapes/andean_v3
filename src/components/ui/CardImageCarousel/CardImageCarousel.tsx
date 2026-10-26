'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

/** Horizontal travel, in px, that counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD_PX = 40;

export interface CardImageCarouselProps {
  /** Two or more slides enable controls; a single slide renders as a static image. */
  images: readonly string[];
  /** Card title, used to give each carousel a unique accessible name. */
  title: string;
  /**
   * Enables touch swipe. Off by default: inside a horizontally scrolling row
   * (the landing on mobile) a swipe must keep scrolling the row, not the photos.
   */
  swipe?: boolean;
  /**
   * Hover state owned by the parent card. Pass it when something stacks above
   * the photo (a stretched link), so the carousel never receives the pointer
   * itself. The card then also needs the `group/card` class to reveal the arrows.
   */
  hovered?: boolean;
}

/**
 * Card photo carousel. Fills its positioned parent.
 *
 * - Slides change only through explicit controls or an enabled touch swipe.
 * - Slides mount on demand, so only the visible photo is downloaded. Hover or
 *   focus warms the next slide so it is loaded before it fades in.
 * - Controls are real buttons with labels. They sit above any stretched link, so
 *   the parent card can keep one link for the whole surface.
 */
export function CardImageCarousel({
  images,
  title,
  swipe = false,
  hovered: hoveredByCard,
}: CardImageCarouselProps) {
  const t = useTranslations('ExperiencesList.carousel');
  const [index, setIndex] = useState(0);
  const [hoveredSelf, setHoveredSelf] = useState(false);
  const [warm, setWarm] = useState(false);
  const [mountedSlides, setMountedSlides] = useState<ReadonlySet<number>>(() => new Set([0]));
  const swipeStartX = useRef<number | null>(null);

  const hovered = hoveredByCard ?? hoveredSelf;
  const count = images.length;
  const hasControls = count > 1;

  const go = useCallback(
    (step: number) => setIndex((current) => (current + step + count) % count),
    [count],
  );

  useEffect(() => {
    const wanted = (warm || hovered) && hasControls ? [index, (index + 1) % count] : [index];
    setMountedSlides((previous) => {
      if (wanted.every((slide) => previous.has(slide))) return previous;
      const next = new Set(previous);
      wanted.forEach((slide) => next.add(slide));
      return next;
    });
  }, [count, hasControls, hovered, index, warm]);

  const swipeHandlers =
    swipe && hasControls
      ? {
          onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
            // A drag that starts on a control is a tap on it; its click already moves the photo.
            if ((event.target as HTMLElement).closest('button')) return;
            if (event.pointerType !== 'mouse') swipeStartX.current = event.clientX;
          },
          onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
            const start = swipeStartX.current;
            swipeStartX.current = null;
            if (start === null) return;
            const delta = event.clientX - start;
            if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) go(delta < 0 ? 1 : -1);
          },
          onPointerCancel: () => {
            swipeStartX.current = null;
          },
        }
      : {};

  if (!hasControls) {
    return (
      <picture className="absolute inset-0">
        <source media="(max-width: 767px)" srcSet={getResponsiveImageSrc(images[0] ?? '').mobile} />
        <img
          src={images[0] ?? ''}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
    );
  }

  return (
    <div
      role="group"
      aria-roledescription={t('roleDescription')}
      aria-label={t('gallery', { title })}
      className={`group/carousel relative h-full w-full overflow-hidden ${swipe && hasControls ? 'touch-pan-y' : ''}`}
      onPointerEnter={(event) => {
        setWarm(true);
        if (event.pointerType === 'mouse') setHoveredSelf(true);
      }}
      onPointerLeave={() => setHoveredSelf(false)}
      onFocus={() => setWarm(true)}
      {...swipeHandlers}
    >
      {images.map((src, slide) => {
        const isActive = slide === index;
        return (
          <picture
            // Index-qualified: the schema does not forbid a repeated path.
            key={`${slide}-${src}`}
            aria-hidden={isActive ? undefined : 'true'}
            className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {mountedSlides.has(slide) ? (
              <>
                <source media="(max-width: 767px)" srcSet={getResponsiveImageSrc(src).mobile} />
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </>
            ) : null}
          </picture>
        );
      })}

      {hasControls ? (
        <>
          <button
            type="button"
            aria-label={t('previous')}
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-100 transition-opacity hover:bg-black/60 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:opacity-0 md:group-hover/carousel:opacity-100 md:group-hover/card:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={t('next')}
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-100 transition-opacity hover:bg-black/60 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:opacity-0 md:group-hover/carousel:opacity-100 md:group-hover/card:opacity-100"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 items-center">
            {images.map((_, slide) => (
              <button
                key={slide}
                type="button"
                aria-label={t('slideLabel', { current: slide + 1, total: count })}
                aria-current={slide === index ? 'true' : undefined}
                onClick={() => setIndex(slide)}
                className="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 rounded-full bg-white shadow transition-all motion-reduce:transition-none ${
                    slide === index ? 'w-4 opacity-100' : 'w-1.5 opacity-60'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {t('slideLabel', { current: index + 1, total: count })}
          </span>
        </>
      ) : null}
    </div>
  );
}

export default CardImageCarousel;
