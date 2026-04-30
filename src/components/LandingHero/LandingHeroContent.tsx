'use client';

import { memo } from 'react';
import { Check } from 'lucide-react';
import type { LandingFlagshipContent } from '@/lib/schemas/landing.schema';
import { Link } from '@/i18n/navigation';

interface LandingHeroContentProps {
  flagship: LandingFlagshipContent;
}

function LandingHeroContentComponent({ flagship }: LandingHeroContentProps) {
  const { badge, title, subtitle, description, valueChips, pricing, whatsappLink, labels } = flagship;

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: pricing.currency,
    maximumFractionDigits: 0,
  }).format(pricing.fromAmount);

  return (
    <div className="max-w-3xl">
      {/* Flagship badge */}
      <span className="inline-block rounded-full border border-[#00F08F]/60 bg-[#00F08F]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#00F08F] backdrop-blur-sm">
        {badge}
      </span>

      {/* Title — only h1 on the page */}
      <h1 className="mt-3 text-4xl font-bold leading-[0.96] text-white drop-shadow-md md:mt-4 md:text-5xl lg:text-6xl xl:text-7xl">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-white/85 md:mt-5 md:text-base md:leading-relaxed lg:text-xl lg:leading-snug">
        {subtitle}
      </p>

      {/* Description */}
      <p className="mb-5 mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/75 md:mb-6 md:mt-4 md:text-base">
        {description}
      </p>

      {/* Value chips grid */}
      <div className="grid grid-cols-2 gap-2 md:gap-x-6 md:gap-y-3" role="list" aria-label="Experience highlights">
        {valueChips.map((chip) => (
          <div key={chip.id} role="listitem" className="flex items-center gap-1.5 md:gap-2">
            <Check
              size={14}
              color="#00C978"
              strokeWidth={2.25}
              className="flex-shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)] md:h-[18px] md:w-[18px]"
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-white/90 md:text-sm">{chip.label}</span>
          </div>
        ))}
      </div>

      {/* CTA row */}
      <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8 lg:mt-10">
        <Link
          href={`/experiences/${flagship.experienceSlug}`}
          className="btn btn-primary btn-lg min-h-12 gap-2 text-base font-semibold shadow-[0_0_20px_rgba(0,240,143,0.3)]"
          aria-label={labels.ctaLabel}
        >
          {labels.ctaLabel}
        </Link>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-lg btn-outline border-white/30 bg-white/8 text-white hover:bg-white/15 hover:brightness-110"
          aria-label={labels.whatsappCtaLabel}
        >
          {labels.whatsappCtaLabel}
        </a>
      </div>

      {/* Trust note */}
      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/65 md:mt-4">
        <Check size={12} color="#00C978" strokeWidth={2.5} aria-hidden="true" />
        Book today with only {formattedPrice} × {pricing.depositPercent}% deposit
      </p>
    </div>
  );
}

LandingHeroContentComponent.displayName = 'LandingHeroContent';

export default memo(LandingHeroContentComponent);
