'use client';

import { useTranslations } from 'next-intl';
import type { ExperienceConfig } from '@/lib/experiences/types';

interface ExperienceHeroProps {
  config: ExperienceConfig;
}

export function ExperienceHero({ config }: ExperienceHeroProps) {
  const t = useTranslations('experiences.ui');
  
  // Video URL for emerald mining experience
  const VIDEO_URL = '/videos/emerald-mining.mp4';

  return (
    <div 
      className="relative w-screen h-[30vh] overflow-hidden -mx-[calc((100vw-100%)/2)]"
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

      {/* Overlay - Semi-transparent dark background */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4">
        <div className="bg-base-950/85 backdrop-blur-md rounded-lg p-8 md:p-10 max-w-2xl mx-auto border border-base-700/50 shadow-2xl">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white drop-shadow-lg">
              {config.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-100 mb-6 drop-shadow-md">
              {config.subtitle}
            </p>
            
            <div className="flex gap-3 justify-center flex-wrap">
              <div className="badge badge-outline border-base-400/70 text-white bg-base-700/60">
                {t('limitedSpots')}
              </div>
              <div className="badge badge-outline border-base-400/70 text-white bg-base-700/60">
                {t('officialDates')}
              </div>
              <div className="badge badge-outline border-base-400/70 text-white bg-base-700/60">
                {t('depositLabel')} {config.depositPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
