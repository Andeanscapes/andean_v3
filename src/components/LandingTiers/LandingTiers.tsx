'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Star, ArrowRight } from 'lucide-react';
import type { LandingContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { Link } from '@/i18n/navigation';

interface LandingTiersProps {
  landingData: LandingContent;
  className?: string;
}

function LandingTiersComponent({ landingData, className = '' }: LandingTiersProps) {
  const t = useTranslations();
  const { tiers } = landingData;

  return (
    <SectionContainer
      sectionClassName={`relative overflow-hidden px-4 py-12 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">3.</p>
      <h2 className="mb-8 text-3xl font-bold leading-tight text-base-content md:text-4xl">
        {tiers.sectionTitle}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        {tiers.items.map((tier) => (
          <GlassCard
            key={tier.id}
            hoverEffect
            className="group relative flex flex-col overflow-hidden rounded-2xl"
          >
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={tier.images.main}
                alt={tier.label}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {tier.isBestSeller ? (
                <span className="absolute left-3 top-3 rounded-sm bg-[#00F08F] px-2.5 py-1 text-[9px] font-bold tracking-widest text-black shadow-[0_0_10px_rgba(0,240,143,0.4)]">
                  {t('Landing.tiers.bestSellerLabel')}
                </span>
              ) : null}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">{tier.tag}</p>
              <h3 className="text-xl font-bold leading-tight text-base-content md:text-2xl">{tier.label}</h3>
              <p className="text-sm leading-relaxed text-base-content/70">{tier.description}</p>

              {/* Star row */}
              <div className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} fill="currentColor" stroke="currentColor" className="text-[#00F08F]" />
                ))}
              </div>

              {/* Price */}
              <p className="text-lg font-extrabold text-base-content">
                <span className="mr-1 text-xs font-normal text-base-content/60">{t('Landing.filters.fromLabel')}</span>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(tier.fromAmount)}
                <span className="ml-1 text-xs font-normal text-base-content/60">{t('Landing.filters.perPersonLabel')}</span>
              </p>

              {/* CTA */}
              <Link
                href={tier.href as Parameters<typeof Link>[0]['href']}
                className="btn btn-primary mt-auto w-full gap-2"
              >
                {tier.ctaLabel}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </SectionContainer>
  );
}

LandingTiersComponent.displayName = 'LandingTiers';

export default memo(LandingTiersComponent);
