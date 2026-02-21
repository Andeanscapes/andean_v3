'use client';

import { useTranslations } from 'next-intl';
import type { ExperienceConfig } from '@/lib/experiences/types';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';

interface ExperienceHeroProps {
  config: ExperienceConfig;
}

export function ExperienceHero({ config }: ExperienceHeroProps) {
  const t = useTranslations('experiences.ui');
  const tCommon = useTranslations('experiences.common');

  // Video URL served via API route
  const VIDEO_URL = '/api/videos/emerald-mining.mp4';

  const handleCtaClick = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const datesSection = document.getElementById('available-dates');
    if (datesSection) {
      datesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const headerEl = document.querySelector('header');
      const headerHeight = headerEl?.getBoundingClientRect().height ?? 0;
      const offset = headerHeight - 400;
      window.requestAnimationFrame(() => {
        window.scrollBy({ top: -offset, behavior: 'smooth' });
      });
      return;
    }

    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <div
      className="relative w-full h-[55vh] md:h-[60vh] overflow-hidden"
    >
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover bg-base-950"
      >
        <source src={VIDEO_URL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay stack for contrast */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-emerald-400/25 blur-3xl md:h-72 md:w-72" />

      {/* Content */}
      <div className="relative backdrop-blur-md z-10 h-full flex items-center justify-center pt-16">
        <div className="w-full max-w-5xl rounded-2xl bg-base-950/70 px-5 py-6 md:px-8 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 text-white drop-shadow-lg">
              {config.title}
            </h1>
            <p className="text-base md:text-xl text-slate-100/95 font-medium mb-2 drop-shadow-md">
              {config.subtitle}
            </p>
            <p className="text-xs md:text-sm text-white/80 mb-3">
              {t('heroSummary')}
            </p>
            <p className="text-sm md:text-base text-white/85 mb-5">
              {t('limitedSpots')} · {t('depositLabel')} {config.depositPercent}%
            </p>

            <div className="flex flex-col items-center justify-center gap-2">
              <Button
                variant="primary"
                size="lg"
                className="min-h-[48px] h-12 px-6 text-sm md:text-base font-semibold shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                onClick={handleCtaClick}
              >
                {t('heroCta')}
              </Button>
              <p className="text-xs md:text-sm text-white/75">
                {tCommon('security')}
              </p>
            </div>
            
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Badge
                variant="secondary"
                size="sm"
                className="border-white/20 bg-base-900/80 text-white shadow-sm backdrop-blur-md"
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                  <span>{t('limitedSpotsShort')}</span>
                </span>
              </Badge>
              <Badge
                variant="secondary"
                size="sm"
                className="border-white/20 bg-base-900/80 text-white shadow-sm backdrop-blur-md"
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12h8" />
                  </svg>
                  <span>
                    {t('depositLabel')} {config.depositPercent}%
                  </span>
                </span>
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
