'use client';

import { CheckCircle2, XCircle, Clock, Car, Flame, Mountain, Sunset, MapPin } from 'lucide-react';
import type { ExperienceData } from '@/lib/schemas';

interface InclusionsProps {
  className?: string;
  experienceData: ExperienceData;
}

// Map icon names to lucide components
const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="h-5 w-5" />,
  hourglass: <Flame className="h-5 w-5" />,
  car: <Car className="h-5 w-5" />,
  activity: <Mountain className="h-5 w-5" />,
  sunset: <Sunset className="h-5 w-5" />,
};

export default function Inclusions({ className = '', experienceData }: InclusionsProps) {
  const inclusionsContent = experienceData.inclusionsContent;
  const bgImageUrl = experienceData.heroContent?.backgroundImageUrl;

  if (!inclusionsContent) return null;

  const { location } = inclusionsContent;
  const mapSrc = location
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=${location.zoom ?? 13}&output=embed`
    : null;

  return (
    <section
      className={`relative overflow-hidden px-4 py-10 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}
      style={bgImageUrl ? {
        backgroundImage: `url('${bgImageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {/* Dark base overlay */}
      <div aria-hidden="true" className="absolute inset-0 bg-slate-950/95" />
      {/* Emerald-to-rose tinted gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-transparent to-rose-950/95"
      />

      <div className="relative mx-auto max-w-screen-2xl">
        <h2 className="mb-8 text-2xl font-bold leading-tight text-white md:text-3xl">
          Trip Logistics &amp; Detailed Inclusions
        </h2>

        {/* 3-col on desktop: logistics | included+notIncluded | map */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">

          {/* Col 1: Logistics */}
          <div>
            <div className="h-full rounded-2xl border border-white/15 bg-black/25 p-6">
              <div className="space-y-5">
                {inclusionsContent.logistics.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="mt-0.5 flex-shrink-0 text-emerald-400">
                      {iconMap[item.icon] || <Clock className="h-5 w-5" />}
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
            </div>
          </div>

          {/* Col 2: Included & Not Included */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Included</h3>
              </div>
              <ul className="space-y-3">
                {inclusionsContent.included.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span className="text-sm text-emerald-100/90">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-400/30 bg-rose-950/30 p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <XCircle className="h-5 w-5 text-rose-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400">Not Included</h3>
              </div>
              <ul className="space-y-3">
                {inclusionsContent.notIncluded.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                    <span className="text-sm text-rose-100/90">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Col 3: Map */}
          {mapSrc ? (
            <div className="flex flex-col">
              <div className="h-full overflow-hidden rounded-2xl border border-white/15">
                <iframe
                  src={mapSrc}
                  title={location?.label ?? 'Meeting point'}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[280px] w-full lg:min-h-0"
                  style={{ border: 0 }}
                />
              </div>
              {location?.label ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  {location.label}
                </p>
              ) : null}
            </div>
          ) : null}

        </div>
      </div>
    </section>
  );
}
