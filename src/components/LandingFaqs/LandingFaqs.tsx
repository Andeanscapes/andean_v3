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
      sectionClassName={`bg-[#0A0A0A] px-4 pb-6 pt-6 sm:pb-10 sm:pt-10 md:px-6 md:pb-20 md:pt-20 lg:px-10 lg:pb-20 lg:pt-20 ${className}`.trim()}
    >
      <div className="max-w-3xl">
        <h2 id="landing-faqs" className="text-balance text-md font-bold sm:text-2md leading-tight text-white md:text-3xl">
          {faqs.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
          {faqs.description}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:gap-8 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:items-start">
        <div>
          {/* All items stay server-rendered for crawlers; extras are only visually collapsed. */}
          {/* This section is dark in both themes: use fixed emerald-400, never `primary` (emerald-700 in light, ~3.5:1 on black). */}
          <Accordion
            ref={accordionRef}
            items={accordionItems}
            defaultOpen={[accordionItems[0]?.id ?? '']}
            useJoin={false}
            className={`${showAll ? '' : '[&>.collapse:nth-child(n+9)]:hidden'} [&_.collapse]:overflow-hidden md:[&_.collapse]:mb-3 md:[&_.collapse]:rounded-xl md:[&_.collapse:last-child]:mb-0 [&_.collapse-content]:px-0 [&_.collapse-content]:pb-3 [&_.collapse-content]:text-sm [&_.collapse-content]:font-medium [&_.collapse-content]:leading-snug [&_.collapse-content]:text-white/70 md:[&_.collapse-content]:px-5 md:[&_.collapse-content]:pb-4 md:[&_.collapse-content]:text-base`}
            itemClassName="rounded-none border-x-0 border-t-0 border-zinc-800/80 bg-transparent transition-colors duration-200 md:rounded-xl md:border-x md:border-t md:border-white/5 md:bg-white/[0.03] md:hover:border-emerald-400/25"
            titleClassName="flex min-h-11 items-center px-0 py-3.5 pr-8 text-sm font-medium leading-snug text-white transition-colors duration-200 md:min-h-0 md:px-5 md:py-3 md:pr-14 md:text-lg"
            contentInnerClassName="max-h-[260px] overflow-y-auto pt-1.5 pr-1 md:max-h-[300px] md:pt-2"
            activeItemClassName="md:border-emerald-400/40 md:bg-white/[0.05]"
            activeTitleClassName="text-emerald-400"
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

        {/* Photo card: the gradient runs to black/95 under the copy, so white text holds AA on any photo. */}
        <div className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl border border-white/10 p-5 md:min-h-[480px] md:rounded-3xl md:p-8 lg:sticky lg:top-24">
          <img
            src={faqs.planImage}
            alt={faqs.planImageAlt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
          <h3 className="text-md font-bold leading-tight text-white md:text-4xl">
            {faqs.enquiryTitle}
          </h3>
          <p className="mt-4 text-sm font-medium leading-relaxed text-white/85">
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
              className="btn btn-lg btn-outline w-full border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
