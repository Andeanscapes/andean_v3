'use client';

import { memo } from 'react';
import type { LandingHeroBrandContent as HeroBrand } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import LandingHeroBrandContent from './LandingHeroBrandContent';
import LandingHeroBrandSearch from './LandingHeroBrandSearch';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

interface Props {
  hero: HeroBrand;
  className?: string;
}

/**
 * Brand-level landing hero. Parallel to LandingHero (single-experience hero)
 * but wired to the brand-wide content slice.
 *
 * Layout pattern matches LandingHero for visual continuity:
 *  - Eager LCP image as <img>
 *  - Dual gradient overlays for legibility on light & dark photos
 *  - 2-col split on lg+: content left, search widget right
 */
function LandingHeroBrandComponent({ hero, className = '' }: Props) {
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
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/15"
        aria-hidden="true"
      />

      <SectionContainer
        as="div"
        sectionClassName="relative"
        containerClassName="grid min-h-[560px] grid-cols-1 gap-6 px-4 pb-8 pt-24 md:min-h-[600px] md:gap-8 md:px-6 md:pb-16 md:pt-32 lg:grid-cols-12 lg:px-10 lg:py-10"
      >
        <div className="lg:col-span-7 pt-0 md:pt-12 lg:pt-16">
          <LandingHeroBrandContent hero={hero} />
        </div>

        <div className="pt-4 lg:col-span-5 lg:pl-4 md:pt-12 lg:pt-16">
          <LandingHeroBrandSearch search={hero.search} />
        </div>
      </SectionContainer>
    </section>
  );
}

LandingHeroBrandComponent.displayName = 'LandingHeroBrand';

export default memo(LandingHeroBrandComponent);
