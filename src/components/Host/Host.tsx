'use client';

import type { ExperienceData } from '@/lib/schemas';

interface HostProps {
  className?: string;
  experienceData: ExperienceData;
}

export default function Host({ className = '', experienceData }: HostProps) {
  const hostContent = experienceData.hostContent;

  if (!hostContent) return null;

  return (
    <div className={`w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl ${className}`.trim()}>
      {/* Header: host title from service */}
      <div className="px-6 pt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          {hostContent.sectionTitle}
        </p>
      </div>

      {/* Guide profile */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-emerald-400/60">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${hostContent.avatarUrl}')` }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950">
              ✓
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{hostContent.name}</h3>
            <span className="mt-0.5 inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              {hostContent.verifiedBadgeLabel}
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          {hostContent.bio}
        </p>
      </div>

      <div className="border-b border-white/5" />

      {/* Ideal For */}
      <div className="px-6 py-5">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
          {hostContent.idealForLabel}
        </h4>
        <ul className="space-y-2">
          {hostContent.idealForItems.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-white/5" />

      {/* Good to Know */}
      <div className="px-6 py-5">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
          {hostContent.goodToKnowLabel}
        </h4>
        <ul className="space-y-2">
          {hostContent.goodToKnowItems.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
