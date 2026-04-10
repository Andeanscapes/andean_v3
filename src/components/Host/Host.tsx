'use client';

import { memo } from 'react';
import type { ExperienceData } from '@/lib/schemas';
import { useThemeContext } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';

interface HostProps {
  className?: string;
  experienceData: ExperienceData;
}

function HostComponent({ className = '', experienceData }: HostProps) {
  const hostContent = experienceData.hostContent;
  const { theme } = useThemeContext();

  const containerClass =
    theme === 'light'
      ? 'shadow-[0_14px_36px_rgba(15,23,42,0.08)]'
      : '';
  const containerVariant = theme === 'light' ? 'light' : 'dark';
  const titleClass = theme === 'light' ? 'text-base-content' : 'text-white';
  const bodyClass = theme === 'light' ? 'text-base-content/70' : 'text-white/70';
  const listClass = theme === 'light' ? 'text-base-content/80' : 'text-white/80';
  const dividerClass = theme === 'light' ? 'border-b border-black/6' : 'border-b border-white/5';
  const sectionLabelClass = theme === 'light' ? 'text-emerald-600' : 'text-emerald-400';
  const verifiedBadgeClass =
    theme === 'light'
      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
      : 'bg-emerald-500/20 text-emerald-300';

  if (!hostContent) return null;

  return (
    <GlassCard variant={containerVariant} className={`w-full overflow-hidden rounded-3xl ${containerClass} ${className}`.trim()}>
      {/* Header: host title from service */}
      <div className="px-6 pt-6">
        <p className={`text-xs font-bold uppercase tracking-widest ${sectionLabelClass}`}>
          {hostContent.sectionTitle}
        </p>
      </div>

      {/* Guide profile */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-emerald-400/60">
              <img
                src={hostContent.avatarUrl}
                alt={hostContent.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-bold text-emerald-950">
              ✓
            </span>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${titleClass}`}>{hostContent.name}</h3>
            <span className={`mt-0.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${verifiedBadgeClass}`}>
              {hostContent.verifiedBadgeLabel}
            </span>
          </div>
        </div>
        <p className={`mt-4 text-sm font-medium leading-relaxed ${bodyClass}`}>
          {hostContent.bio}
        </p>
      </div>

      <div className={dividerClass} />

      {/* Ideal For */}
      <div className="px-6 py-5">
        <h4 className={`mb-3 text-xs font-bold uppercase tracking-widest ${sectionLabelClass}`}>
          {hostContent.idealForLabel}
        </h4>
        <ul className="space-y-2">
          {hostContent.idealForItems.map((item) => (
            <li key={item} className={`flex items-center gap-2.5 text-sm font-medium ${listClass}`}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={dividerClass} />

      {/* Good to Know */}
      <div className="px-6 py-5">
        <h4 className={`mb-3 text-xs font-bold uppercase tracking-widest ${sectionLabelClass}`}>
          {hostContent.goodToKnowLabel}
        </h4>
        <ul className="space-y-2">
          {hostContent.goodToKnowItems.map((item) => (
            <li key={item} className={`flex items-center gap-2.5 text-sm font-medium ${listClass}`}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}

HostComponent.displayName = 'Host';

export default memo(HostComponent);
