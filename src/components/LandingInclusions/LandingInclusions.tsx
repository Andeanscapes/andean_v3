'use client';

import { memo } from 'react';
import { CheckCircle2, XCircle, MapPin } from 'lucide-react';
import type { LandingContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { EXPERIENCE_ICON_MAP } from '@/utils/experienceIconMap';

interface LandingInclusionsProps {
  landingData: LandingContent;
  className?: string;
}

function LandingInclusionsComponent({ landingData, className = '' }: LandingInclusionsProps) {
  const { inclusions } = landingData;

  const { location } = inclusions;
  const mapSrc = location
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=${location.zoom ?? 13}&output=embed`
    : null;

  return (
    <SectionContainer
      sectionClassName={`relative overflow-hidden px-5 py-10 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}
    >
      {/* Dark base overlay */}
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/98" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-transparent to-rose-950/95"
      />

      <div className="relative">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-emerald-400/90">2.</p>
        <h2 className="mb-8 text-2xl font-bold leading-tight text-white md:text-3xl">
          {inclusions.sectionTitle}
        </h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch lg:gap-6">

          {/* Col 1: Logistics */}
          <div className="flex flex-col lg:h-full lg:min-h-[420px]">
            <GlassCard className="h-full rounded-2xl border-white/15 bg-black/25 p-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {inclusions.logistics.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 text-emerald-400" aria-hidden="true">
                      {EXPERIENCE_ICON_MAP[item.icon] ?? <MapPin className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white/70">{item.label}</p>
                      {item.value ? (
                        <p className="mt-0.5 text-base font-bold text-emerald-400">{item.value}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Col 2: Included & Not Included */}
          <div className="flex flex-col space-y-4 lg:h-full lg:min-h-[420px]">
            <GlassCard variant="emeraldTint" className="rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  {inclusions.includedLabel}
                </h3>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {inclusions.included.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-emerald-100/90">{item.title}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard variant="roseTint" className="rounded-2xl p-6">
              <div className="mb-4 mt-2 flex items-center gap-2.5">
                <XCircle className="h-5 w-5 text-rose-400" aria-hidden="true" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400">
                  {inclusions.notIncludedLabel}
                </h3>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {inclusions.notIncluded.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" aria-hidden="true" />
                    <span className="text-sm text-rose-100/90">{item.title}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Col 3: Map */}
          {mapSrc ? (
            <div className="flex flex-col lg:h-full lg:min-h-[420px]">
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                <div className="aspect-video lg:aspect-auto lg:h-full">
                  <iframe
                    src={mapSrc}
                    title={location?.label ?? 'Meeting point'}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full"
                    style={{ border: 0 }}
                  />
                </div>
              </div>
              {location?.label ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                  {location.label}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </SectionContainer>
  );
}

LandingInclusionsComponent.displayName = 'LandingInclusions';

export default memo(LandingInclusionsComponent);
