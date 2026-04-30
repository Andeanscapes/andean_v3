'use client';

import { memo } from 'react';
import Image from 'next/image';
import { ArrowRight, MessageCircle, BadgeCheck, ShieldCheck, Undo2, Lock } from 'lucide-react';
import type { LandingContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';

const BADGE_ICON_MAP: Record<string, React.ReactNode> = {
  BadgeCheck: <BadgeCheck size={16} aria-hidden="true" />,
  ShieldCheck: <ShieldCheck size={16} aria-hidden="true" />,
  Undo2: <Undo2 size={16} aria-hidden="true" />,
  Lock: <Lock size={16} aria-hidden="true" />,
};

interface FinalCtaBannerProps {
  landingData: LandingContent;
  className?: string;
}

function FinalCtaBannerComponent({ landingData, className = '' }: FinalCtaBannerProps) {
  const { finalCta, flagship } = landingData;

  return (
    <section
      aria-label={finalCta.bookAria}
      className={`relative overflow-hidden ${className}`.trim()}
    >
      {/* Background */}
      <Image
        src={finalCta.backgroundImage}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/50" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20"
      />

      <SectionContainer
        as="div"
        sectionClassName="relative"
        containerClassName="flex items-center justify-center px-4 py-20 md:px-6 md:py-28 lg:px-10 lg:py-36"
      >
        <GlassCard className="w-full max-w-2xl rounded-3xl border-white/15 bg-black/35 p-8 text-center backdrop-blur-xl md:p-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-emerald-400">
            {flagship.badge}
          </p>
          <h2 className="text-3xl font-bold tracking-tight leading-tight text-white md:text-4xl lg:text-5xl">
            {finalCta.sectionTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base font-medium text-white/75 md:text-lg">
            {finalCta.subtitle}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <PrimaryCtaButton
              href={finalCta.primaryCtaHref}
              variant="gradient"
              size="lg"
              className="w-full gap-2 shadow-[0_0_24px_rgba(0,240,143,0.35)] sm:w-auto"
            >
              {finalCta.primaryCtaLabel}
              <ArrowRight size={18} className="flex-shrink-0" aria-hidden="true" />
            </PrimaryCtaButton>
            <a
              href={flagship.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg btn-outline w-full border-white/30 bg-white/8 text-white hover:bg-white/15 sm:w-auto"
            >
              <MessageCircle size={18} className="flex-shrink-0" aria-hidden="true" />
              {finalCta.secondaryCtaLabel}
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {finalCta.trustBadges.map((badge) => (
              <span
                key={badge.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm"
              >
                {BADGE_ICON_MAP[badge.iconName] ?? <ShieldCheck size={16} aria-hidden="true" />}
                {badge.label}
              </span>
            ))}
          </div>
        </GlassCard>
      </SectionContainer>
    </section>
  );
}

FinalCtaBannerComponent.displayName = 'FinalCtaBanner';

export default memo(FinalCtaBannerComponent);
