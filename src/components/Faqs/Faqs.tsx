'use client';

import { memo } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Accordion } from '@/components/ui/Accordion/Accordion';
import type { ExperienceData } from '@/lib/schemas';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';
import BackgroundImageWithFallback from '@/components/media/BackgroundImageWithFallback';
import { getExperienceFaqKeys } from '@/constant/SiteConfig';

interface FaqsProps {
  className?: string;
  experienceData: ExperienceData;
}

function FaqsComponent({ className = '', experienceData }: FaqsProps) {
  const t = useTranslations();
  const { config, whatsappLink, heroContent } = experienceData;
  // Locale-free; the i18n Link adds the prefix. A relative './booking' resolved to /experiences/booking (404).
  const bookingHref = `${usePathname()}/booking`;
  const bgImageUrl = heroContent?.backgroundImageUrl;

  const faqItems = getExperienceFaqKeys(config.id).map((faq) => ({
    id: faq.id,
    title: t(faq.question),
    content: t(faq.answer),
  }));

  const shouldUseTwoColumns = faqItems.length > 6;

  return (
    <SectionContainer
      sectionClassName={`relative overflow-hidden bg-[#0A0A0A] px-4 pt-6 pb-0 backdrop-blur-none sm:pt-10 md:px-6 md:pt-14 md:pb-0 lg:px-10 lg:pt-16 lg:pb-0 ${className}`.trim()}
    >
      {bgImageUrl ? (
        <BackgroundImageWithFallback src={bgImageUrl} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : null}
      <div aria-hidden="true" className="absolute inset-0 bg-[#0A0A0A]/96" />

      <div className="relative">
        <div className="mb-4 max-w-3xl md:mb-8">
          <p className="mb-1.5 text-sm font-semibold text-emerald-400 md:mb-3">
            {t('experiences.ui.experienceDetails.faqsTitle')}
          </p>
          <h2 className="text-balance text-md font-bold leading-tight text-white sm:text-2md md:text-3xl">
            {t('experiences.ui.experienceDetails.faqsHeading')}
          </h2>
          <p className="mt-2 max-w-2xl text-xs font-medium leading-relaxed text-white/80 md:mt-3 md:text-base">
            {config.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.35fr)_360px] lg:items-start">
          <Accordion
            items={faqItems}
            defaultOpen={['faq-1']}
            useJoin={false}
            className={`${shouldUseTwoColumns ? 'lg:columns-2 lg:gap-4' : ''} [&_.collapse]:mb-2 [&_.collapse]:overflow-hidden [&_.collapse]:rounded-xl md:[&_.collapse]:mb-3 md:[&_.collapse]:rounded-3xl [&_.collapse:last-child]:mb-0 [&_.collapse-content]:px-4 [&_.collapse-content]:pb-3 [&_.collapse-content]:text-sm [&_.collapse-content]:font-medium [&_.collapse-content]:leading-snug [&_.collapse-content]:text-white/80 md:[&_.collapse-content]:px-5 md:[&_.collapse-content]:pb-4 md:[&_.collapse-content]:text-base`}
            itemClassName={`${shouldUseTwoColumns ? 'lg:break-inside-avoid lg:mb-4' : ''} border border-white/10 bg-white/[0.03] transition-colors duration-200 hover:border-emerald-400/30`}
            titleClassName="flex min-h-11 items-center px-4 py-3 pr-10 text-sm font-medium leading-snug text-white transition-colors duration-200 md:min-h-0 md:px-5 md:py-3 md:pr-14 md:text-lg"
            contentInnerClassName="max-h-[260px] overflow-y-auto pt-1.5 pr-1 md:max-h-[300px] md:pt-2"
            activeItemClassName="border-emerald-400/40 bg-white/[0.05]"
            activeTitleClassName="text-emerald-400"
          />

          <div className="mb-8 h-fit lg:sticky lg:top-24">
            <GlassCard className="relative overflow-hidden rounded-2xl p-5 md:rounded-3xl md:p-8">
              {bgImageUrl ? (
                <BackgroundImageWithFallback src={bgImageUrl} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              ) : null}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
              <div className="relative">
                <h3 className="text-lg font-bold leading-tight text-white md:text-4xl">
                  {config.title}
                </h3>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/85 md:mt-4 md:line-clamp-none">
                  {config.description}
                </p>

                <div className="mt-5 flex flex-col gap-3 md:mt-8">
                  <PrimaryCtaButton
                    href={bookingHref}
                    size="lg"
                    className="w-full"
                  >
                    <span className="inline-flex items-center gap-2">
                      {t('experiences.ui.experienceDetails.checkDatesBtn')}
                      <ArrowRight size={18} className="flex-shrink-0" />
                    </span>
                  </PrimaryCtaButton>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-lg btn-outline w-full border-white/30 bg-black/30 text-white transition-colors duration-200 hover:bg-white/10"
                  >
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle size={18} className="flex-shrink-0" />
                      {t('experiences.ui.experienceDetails.talkToHostBtn')}
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

FaqsComponent.displayName = 'Faqs';

export default memo(FaqsComponent);
