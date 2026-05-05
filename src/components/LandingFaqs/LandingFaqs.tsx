'use client';

import { memo } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import type { LandingContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { Accordion } from '@/components/ui/Accordion/Accordion';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';

interface LandingFaqsProps {
  landingData: LandingContent;
  className?: string;
}

function LandingFaqsComponent({ landingData, className = '' }: LandingFaqsProps) {
  const { faqs, flagship, finalCta } = landingData;

  const accordionItems = faqs.items.map((item) => ({
    id: item.id,
    title: item.question,
    content: item.answer,
  }));

  const shouldUseTwoColumns = accordionItems.length > 6;

  return (
    <SectionContainer
      sectionClassName={`relative overflow-hidden bg-[#0A0A0A] px-4 pb-0 pt-16 md:px-6 md:pb-0 md:pt-20 lg:px-10 lg:pb-0 lg:pt-20 ${className}`.trim()}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[#0A0A0A]/96" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32%),linear-gradient(90deg,rgba(10,10,10,0.92),rgba(10,10,10,0.78),rgba(10,10,10,0.96))]"
      />

      <div className="relative">
        <div className="mb-6 max-w-3xl md:mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">
            {faqs.sectionTitle}
          </p>
          <h2 id="landing-faqs" className="text-xl font-bold leading-tight text-white md:text-3xl">
            {flagship.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:items-start">
          <Accordion
            items={accordionItems}
            defaultOpen={[accordionItems[0]?.id ?? '']}
            useJoin={false}
            className={`${shouldUseTwoColumns ? 'lg:columns-2 lg:gap-4' : ''} [&_.collapse]:mb-2.5 [&_.collapse]:overflow-hidden [&_.collapse]:rounded-2xl md:[&_.collapse]:mb-3 md:[&_.collapse]:rounded-3xl [&_.collapse:last-child]:mb-0 [&_.collapse-content]:px-4 [&_.collapse-content]:pb-3 [&_.collapse-content]:text-sm [&_.collapse-content]:font-medium [&_.collapse-content]:leading-snug [&_.collapse-content]:text-white/70 md:[&_.collapse-content]:px-5 md:[&_.collapse-content]:pb-4 md:[&_.collapse-content]:text-base`}
            itemClassName={`${shouldUseTwoColumns ? 'lg:break-inside-avoid lg:mb-4' : ''} border border-white/10 bg-slate-900/45 backdrop-blur-xl transition-colors duration-200 hover:border-emerald-400/35 active:border-emerald-500/50`}
            titleClassName="flex min-h-0 items-center px-4 py-2.5 pr-12 text-base font-semibold leading-snug text-white transition-colors duration-200 md:px-5 md:py-3 md:pr-14 md:text-xl"
            contentInnerClassName="max-h-[260px] overflow-y-auto pt-1.5 pr-1 md:max-h-[300px] md:pt-2"
            activeItemClassName="border-emerald-500/50 border-l-4 border-l-emerald-500 bg-slate-900/60 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]"
            activeTitleClassName="text-emerald-400"
          />

          <div className="mb-8 h-fit lg:sticky lg:top-24">
            <GlassCard className="relative overflow-hidden rounded-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-8">
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-slate-950/25 to-slate-950/85" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-400">
                  {flagship.badge}
                </p>
                <h3 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">
                  {flagship.title}
                </h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-white/72">
                  {flagship.description}
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  <PrimaryCtaButton
                    href={finalCta.primaryCtaHref}
                    variant="gradient"
                    size="lg"
                    className="w-full shadow-[0_0_24px_rgba(0,240,143,0.25)] hover:shadow-[0_0_30px_rgba(0,240,143,0.38)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      {finalCta.primaryCtaLabel}
                      <ArrowRight size={18} className="flex-shrink-0" aria-hidden="true" />
                    </span>
                  </PrimaryCtaButton>
                  <a
                    href={flagship.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-lg btn-outline w-full border-white/25 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 hover:brightness-110"
                  >
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle size={18} className="flex-shrink-0" aria-hidden="true" />
                      {flagship.labels.whatsappCtaLabel}
                    </span>
                  </a>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

LandingFaqsComponent.displayName = 'LandingFaqs';

export default memo(LandingFaqsComponent);
