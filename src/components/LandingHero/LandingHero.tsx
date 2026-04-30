'use client';

import { memo } from 'react';
import type { LandingFlagshipContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import LandingHeroContent from './LandingHeroContent';
import LandingHeroFilters from './LandingHeroFilters';

interface LandingHeroProps {
  flagship: LandingFlagshipContent;
  className?: string;
}

function LandingHeroComponent({ flagship, className = '' }: LandingHeroProps) {
  return (
    <section
      aria-labelledby="landing-hero-title"
      className={`relative w-full overflow-hidden ${className}`.trim()}
    >
      {/* Background image — eager / high priority (LCP candidate) */}
      <img
        src={flagship.backgroundImage}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlays — depth layers matching ExperienceHero pattern */}
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
        {/* Left — content */}
        <div className="lg:col-span-7 pt-0 md:pt-12 lg:pt-16">
          {/* Forward the id so aria-labelledby resolves on h1 inside */}
          <div id="landing-hero-title">
            <LandingHeroContent flagship={flagship} />
          </div>
        </div>

        {/* Right — booking widget */}
        <div className="pt-4 lg:col-span-5 lg:pl-4 md:pt-12 lg:pt-16">
          <LandingHeroFilters flagship={flagship} />
        </div>
      </SectionContainer>
    </section>
  );
}

LandingHeroComponent.displayName = 'LandingHero';

export default memo(LandingHeroComponent);
