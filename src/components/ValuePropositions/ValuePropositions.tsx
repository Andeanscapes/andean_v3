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
    <SectionContainer sectionClassName={`px-4 pb-12 pt-12 md:px-6 md:pb-20 md:pt-20 lg:px-10 ${className}`.trim()}>
        <div className="mb-10 md:mb-12 lg:mb-14">
          <h2 className="text-3xl font-bold leading-tight text-base-content md:text-4xl">
            {valuePropositions?.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
          {valuePropositions?.items.map((item) => (
            <GlassCard
              key={item.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border-white/10 backdrop-blur-md transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:border-[#00F08F]/50 hover:bg-slate-900/60"
            >
              <BackgroundImageWithFallback
                src={item.imageUrl}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                fallbackClassName="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-900/80 via-slate-800/65 to-slate-900/70"
              />
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

              <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                <div className="flex justify-end">
                  {item.badge ? (
                    <span className="animate-[pulse_2.8s_ease-in-out_infinite] rounded-full bg-emerald-500/85 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-lg">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base font-medium leading-relaxed text-white/85 md:text-lg">
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
