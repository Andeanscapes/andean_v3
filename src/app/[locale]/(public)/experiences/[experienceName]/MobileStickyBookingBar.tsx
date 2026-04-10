'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ExperienceData } from '@/lib/schemas';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';

interface MobileStickyBookingBarProps {
  experienceData: ExperienceData;
}

export default function MobileStickyBookingBar({
  experienceData,
}: MobileStickyBookingBarProps) {
  const locale = useLocale();
  const t = useTranslations();

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(experienceData.config.basePricePerPerson);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 block border-t border-emerald-500/20 bg-slate-900/90 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.3)] backdrop-blur-xl [backface-visibility:hidden] [contain:paint] [transform:translateZ(0)] [will-change:transform] lg:hidden"
    >
      <div
        className="mx-auto grid h-24 max-w-screen-2xl grid-cols-2 items-center justify-center gap-6 px-6 pt-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
      >
        <div className="min-w-0 justify-self-center text-center">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-white/65">{experienceData.config.title}</p>
          <p className="whitespace-nowrap text-xl font-bold leading-tight text-white">
            {formattedPrice}
          </p>
        </div>

        <PrimaryCtaButton
          href="./booking"
          size="md"
          className="w-full max-w-[220px] justify-self-center"
        >
          {t('experiences.ui.experienceDetails.checkDatesBtn')}
        </PrimaryCtaButton>
      </div>
    </div>
  );
}
