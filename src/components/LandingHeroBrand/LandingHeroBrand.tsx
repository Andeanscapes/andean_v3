'use client';

import { memo } from 'react';
import type { LandingHeroBrandContent as HeroBrand } from '@/lib/schemas/landing.schema';
import type { LandingFlagshipContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import LandingHeroBrandContent from './LandingHeroBrandContent';
import LandingHeroBrandSearch from './LandingHeroBrandSearch';
import LandingHeroBookingCard from '../LandingHeroBookingCard/LandingHeroBookingCard';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

type BookingCardStrings = HeroBrand['bookingCard'] & {
  duration: string;
  location: string;
};

interface Props {
  hero: HeroBrand;
  featuredExperience?: LandingFlagshipContent;
  featuredBookingUrl?: string;
  featuredStrings?: BookingCardStrings;
  className?: string;
}

/**
 * Brand-level landing hero. Parallel to LandingHero (single-experience hero)
 * but wired to the brand-wide content slice.
 *
 * Layout pattern matches LandingHero for visual continuity:
 *  - Eager LCP image as <img>
 *  - Dual gradient overlays for legibility on light & dark photos
 *  - 2-col split on lg+: content left, search widget or booking card right
 */
function LandingHeroBrandComponent({ hero, featuredExperience, featuredBookingUrl, featuredStrings, className = '' }: Props) {
  const showBookingCard = !!(featuredExperience && featuredBookingUrl && featuredStrings);
  const showSearch = !showBookingCard && !!hero.search;
  const hasRightCol = showBookingCard || showSearch;
  const contentColClass = hasRightCol ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3';

  return (
    <section
      id="landing-hero-brand"
      aria-labelledby="landing-hero-brand-title"
      className={`relative w-full overflow-hidden ${className}`.trim()}
    >
      <picture>
        <source media="(max-width: 767px)" srcSet={getResponsiveImageSrc(hero.backgroundImage).mobile} />
        <img
          src={hero.backgroundImage}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      <div className="pointer-events-none absolute inset-0 bg-black/30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 md:hidden"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/15"
        aria-hidden="true"
      />

      <SectionContainer
        as="div"
        sectionClassName="relative"
        containerClassName="grid min-h-[560px] grid-cols-1 gap-4 px-4 pb-5 pt-20 md:min-h-[620px] md:gap-8 md:px-6 md:pb-16 md:pt-32 lg:grid-cols-12 lg:px-10 lg:py-10"
      >
        <div className={`${contentColClass} pt-0 md:pt-12 lg:pt-16`}>
          <LandingHeroBrandContent hero={hero} />
        </div>

        {hasRightCol && (
          <div className="pt-4 lg:col-span-5 lg:pl-4 md:pt-12 lg:pt-16">
            {showBookingCard ? (
              <LandingHeroBookingCard
                flagship={featuredExperience}
                bookingUrl={featuredBookingUrl}
                strings={featuredStrings}
              />
            ) : (
              <LandingHeroBrandSearch search={hero.search!} />
            )}
          </div>
        )}
      </SectionContainer>
    </section>
  );
}

LandingHeroBrandComponent.displayName = 'LandingHeroBrand';

export default memo(LandingHeroBrandComponent);
