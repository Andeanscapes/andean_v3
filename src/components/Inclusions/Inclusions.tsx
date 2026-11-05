'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import type { ExperienceData } from '@/lib/schemas';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import BackgroundImageWithFallback from '@/components/media/BackgroundImageWithFallback';
import { EXPERIENCE_ICON_MAP } from '@/utils/experienceIconMap';

interface InclusionsProps {
  className?: string;
  experienceData: ExperienceData;
}

function InclusionsComponent({ className = '', experienceData }: InclusionsProps) {
  const t = useTranslations();
  const inclusionsContent = experienceData.inclusionsContent;
  const bgImageUrl = experienceData.heroContent?.backgroundImageUrl;

  if (!inclusionsContent) return null;

  const { location } = inclusionsContent;
  // `t=h`: satellite imagery with labels. Google Earth itself refuses framing
  // (X-Frame-Options: SAMEORIGIN), so this is the closest keyless embed.
  const mapSrc = location
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=${location.zoom ?? 13}&t=h&output=embed`
    : null;

  return (
    <SectionContainer sectionClassName={`relative overflow-hidden px-4 py-6 sm:py-10 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}>
      {bgImageUrl ? (
        <BackgroundImageWithFallback src={bgImageUrl} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : null}
      {/* Dark base overlay */}
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/95" />

      <div className="relative">
        <h2 className="mb-4 text-balance text-md font-bold leading-tight text-white sm:text-2md md:mb-8 md:text-3xl">
          {inclusionsContent.sectionTitle}
        </h2>

        {/* 3-col on desktop: logistics | included+notIncluded | map */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3 lg:items-stretch lg:gap-6">

          {/* Col 1: Logistics */}
          <div className="flex flex-col lg:min-h-[420px] lg:h-full">
            <GlassCard className="h-full rounded-2xl border-white/15 bg-black/25 p-4 md:p-6">
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:gap-x-4 md:gap-y-5">
                {inclusionsContent.logistics.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 text-emerald-400">
                      {EXPERIENCE_ICON_MAP[item.icon] || <Clock className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white/75 md:text-sm">{item.label}</p>
                      {item.value ? (
                        <p className="mt-0.5 text-sm font-bold text-emerald-400 md:text-base">{item.value}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Col 2: Included & Not Included */}
          <div className="flex flex-col space-y-4 lg:min-h-[420px] lg:h-full">
            <GlassCard variant="emeraldTint" className="rounded-2xl p-4 md:p-6">
              <div className="mb-3 flex items-center gap-2.5 md:mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-emerald-400">{inclusionsContent.includedLabel}</h3>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {inclusionsContent.included.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span className="text-sm text-emerald-100/90">{item.title}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard variant="roseTint" className="rounded-2xl p-4 md:p-6">
              <div className="mb-3 flex items-center gap-2.5 md:mb-4">
                <XCircle className="h-5 w-5 text-rose-300" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-rose-300">{inclusionsContent.notIncludedLabel}</h3>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {inclusionsContent.notIncluded.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                    <span className="text-sm text-rose-100/90">{item.title}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Col 3: Map */}
          {mapSrc ? (
            <div className="flex flex-col lg:min-h-[420px] lg:h-full">
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-black/25 ">
                <div className="aspect-video lg:aspect-auto lg:h-full">
                <iframe
                  src={mapSrc}
                  title={location?.label ?? t('experiences.ui.meetingPoint')}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                  style={{ border: 0 }}
                />
                </div>
              </div>
              {location?.label ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/75">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
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

InclusionsComponent.displayName = 'Inclusions';

export default memo(InclusionsComponent);
