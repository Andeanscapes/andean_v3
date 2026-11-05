'use client';

import { memo } from 'react';
import type { ExperienceData } from '@/lib/schemas';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import BackgroundImageWithFallback from '@/components/media/BackgroundImageWithFallback';

interface ValuePropositionsProps {
  className?: string;
  experienceData: ExperienceData;
}

function ValuePropositionsComponent({ className = '', experienceData }: ValuePropositionsProps) {
  const valuePropositions = experienceData.valuePropositionsContent;

  return (
    <SectionContainer sectionClassName={`px-4 py-6 sm:py-10 md:px-6 md:py-20 lg:px-10 ${className}`.trim()}>
        <div className="mb-4 md:mb-12 lg:mb-14">
          <h2 className="text-balance text-md font-bold leading-tight text-base-content sm:text-2md md:text-4xl">
            {valuePropositions?.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:grid-cols-3">
          {valuePropositions?.items.map((item) => (
            <GlassCard
              key={item.id}
              className="relative aspect-[16/10] overflow-hidden rounded-2xl border-white/10 sm:aspect-[4/3]"
            >
              {item.imageUrl ? (
                <BackgroundImageWithFallback
                  src={item.imageUrl}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  fallbackClassName="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-900/80 via-slate-800/65 to-slate-900/70"
                />
              ) : null}
              <div
                aria-hidden="true"
                className={
                  item.id === 'tile-3'
                    ? 'pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-black/45'
                    : 'pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/65 to-slate-900/35'
                }
              />

              {item.id === 'tile-3' ? (
                <div className="pointer-events-none absolute inset-0 bg-black/40" />
              ) : null}

              <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-8">
                <div className="flex justify-end">
                  {item.badge ? (
                    <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-md font-bold leading-tight text-white drop-shadow-md md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-sm font-medium leading-snug text-white/90 md:mt-3 md:line-clamp-none md:text-lg md:leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
    </SectionContainer>
  );
}

ValuePropositionsComponent.displayName = 'ValuePropositions';

export default memo(ValuePropositionsComponent);
