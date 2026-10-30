'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LandingContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { Accordion } from '@/components/ui/Accordion/Accordion';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';

interface LandingFaqsProps {
  landingData: LandingContent;
  className?: string;
}

// Keep in sync with the `nth-child(n+9)` selector below (Tailwind needs a static class).
const INITIAL_FAQ_COUNT = 8;

function LandingFaqsComponent({ landingData, className = '' }: LandingFaqsProps) {
  const { faqs, finalCta, globalCtas } = landingData;
  const t = useTranslations('Landing.faqs');
  const [showAll, setShowAll] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);

  const accordionItems = faqs.items.map((item) => ({
    id: item.id,
    title: item.question,
    content: item.answer,
  }));

  const hasHiddenItems = accordionItems.length > INITIAL_FAQ_COUNT;

  // The trigger unmounts on reveal, so hand focus to the first newly shown question.
  useEffect(() => {
    if (!showAll) return;
    const firstRevealed = accordionRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-controls]')[INITIAL_FAQ_COUNT];
    firstRevealed?.focus();
  }, [showAll]);

  return (
    <SectionContainer
      sectionClassName={`bg-[#0A0A0A] px-4 pb-16 pt-16 md:px-6 md:pb-20 md:pt-20 lg:px-10 lg:pb-20 lg:pt-20 ${className}`.trim()}
    >
      <div className="max-w-3xl">
        <h2 id="landing-faqs" className="text-xl font-bold leading-tight text-white md:text-3xl">
          {faqs.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
          {faqs.description}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:gap-8 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:items-start">
        <div>
          {/* All items stay server-rendered for crawlers; extras are only visually collapsed. */}
          <Accordion
            ref={accordionRef}
            items={accordionItems}
            defaultOpen={[accordionItems[0]?.id ?? '']}
            useJoin={false}
            className={`${showAll ? '' : '[&>.collapse:nth-child(n+9)]:hidden'} [&_.collapse]:mb-2.5 [&_.collapse]:overflow-hidden [&_.collapse]:rounded-2xl md:[&_.collapse]:mb-3 md:[&_.collapse]:rounded-3xl [&_.collapse:last-child]:mb-0 [&_.collapse-content]:px-4 [&_.collapse-content]:pb-3 [&_.collapse-content]:text-sm [&_.collapse-content]:font-medium [&_.collapse-content]:leading-snug [&_.collapse-content]:text-white/70 md:[&_.collapse-content]:px-5 md:[&_.collapse-content]:pb-4 md:[&_.collapse-content]:text-base`}
            itemClassName="border border-white/10 bg-slate-900/45 transition-colors duration-200 hover:border-white/25"
            titleClassName="flex min-h-0 items-center px-4 py-2.5 pr-12 text-base font-medium leading-snug text-white transition-colors duration-200 md:px-5 md:py-3 md:pr-14 md:text-lg"
            contentInnerClassName="max-h-[260px] overflow-y-auto pt-1.5 pr-1 md:max-h-[300px] md:pt-2"
            activeItemClassName="border-white/30 bg-slate-900/70"
            activeTitleClassName="text-primary"
          />

          {hasHiddenItems && !showAll ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-transparent px-4 text-sm font-medium text-white/80 transition-colors duration-200 hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:rounded-3xl md:text-base"
            >
              {t('showAll')}
            </button>
          ) : null}
        </div>

        <div className="h-fit rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8 lg:sticky lg:top-24">
          <h3 className="text-3xl font-bold leading-tight text-white md:text-4xl">
            {faqs.enquiryTitle}
          </h3>
          <p className="mt-4 text-sm font-medium leading-relaxed text-white/72">
            {faqs.enquiryDescription}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <PrimaryCtaButton
              href={finalCta.primaryCtaHref}
              variant="gradient"
              size="lg"
              className="w-full"
            >
              {finalCta.primaryCtaLabel}
            </PrimaryCtaButton>
            <a
              href={globalCtas.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg btn-outline w-full border-white/25 bg-white/5 text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle size={18} className="flex-shrink-0" aria-hidden="true" />
                {globalCtas.whatsappLabel}
              </span>
            </a>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

LandingFaqsComponent.displayName = 'LandingFaqs';

export default memo(LandingFaqsComponent);
