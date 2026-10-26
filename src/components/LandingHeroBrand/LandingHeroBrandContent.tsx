'use client';

import type { LandingHeroBrandContent as HeroBrandContent } from '@/lib/schemas/landing.schema';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';
import { ArrowRight, MessageCircle } from 'lucide-react';
import LandingHeroBrandTrustChips from './LandingHeroBrandTrustChips';

interface Props {
  hero: HeroBrandContent;
}

/**
 * Brand-hero textual content + CTAs + trust chips.
 * Stays client to allow potential future interactivity (e.g. tracking),
 * but renders zero state — safe to swap to RSC later if needed.
 */
export default function LandingHeroBrandContent({ hero }: Props) {
  return (
    <div className="flex flex-col gap-3 md:gap-6">
      {hero.eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85 md:text-sm">
          {hero.eyebrow}
        </p>
      ) : null}

      <h1
        id="landing-hero-brand-title"
        className="text-balance text-[clamp(2rem,9vw,3rem)] font-extrabold leading-[1.04] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] md:text-5xl md:leading-tight lg:text-6xl"
      >
        {hero.title}
      </h1>

      {hero.subtitle ? (
        <p className="overflow-hidden text-pretty text-sm font-medium leading-snug text-white/95 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:block md:text-lg md:leading-normal lg:text-xl">
          {hero.subtitle}
        </p>
      ) : null}

      {hero.description ? (
        <p className="hidden max-w-xl text-pretty text-sm text-white/85 md:block md:text-base">
          {hero.description}
        </p>
      ) : null}

      <LandingHeroBrandTrustChips trustChips={hero.trustChips} className="mt-1" />

      <div className="mt-1 flex flex-col gap-3 sm:flex-row md:mt-2 md:gap-4">
        <PrimaryCtaButton href={hero.primaryCtaHref} fullWidth={false} size="lg" data-event="hero_reserve_click">
          <span>{hero.primaryCtaLabel}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </PrimaryCtaButton>

        <a
          href={hero.secondaryCtaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-lg btn-outline inline-flex min-h-11 items-center justify-center gap-2 border-white/40 px-4 text-white hover:bg-white/10"
          data-event="hero_whatsapp_click"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span>{hero.secondaryCtaLabel}</span>
        </a>
      </div>
    </div>
  );
}
