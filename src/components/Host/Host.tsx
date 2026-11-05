'use client';

import { memo } from 'react';
import { Check, Hotel } from 'lucide-react';
import type { ExperienceData } from '@/lib/schemas';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { useDetailSelectedTierData } from '@/hooks/experiences/useExperienceDetailContext';

interface HostProps {
  className?: string;
  experienceData: ExperienceData;
}

function HostComponent({ className = '', experienceData }: HostProps) {
  const hostContent = experienceData.hostContent;
  const selectedTier = useDetailSelectedTierData();
  const sectionLabelClass = 'text-sm font-semibold text-primary';
  const subheadingClass = 'text-sm font-semibold text-base-content';
  const listClass = 'text-base-content/80';
  const dividerClass = 'border-b border-base-content/10';
  // emerald-800 on emerald-50 (7.3:1) in light; tinted emerald in dark.
  const pillClass = 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-0';

  if (!hostContent) return null;

  // Use tier-specific overrides when available, fall back to host-level content
  const idealForItems = selectedTier?.idealForItems?.length
    ? selectedTier.idealForItems
    : hostContent.idealForItems;

  const goodToKnowItems = selectedTier?.goodToKnowItems?.length
    ? selectedTier.goodToKnowItems
    : hostContent.goodToKnowItems;

  const hasTierOverride = !!(
    selectedTier && (selectedTier.idealForItems?.length || selectedTier.goodToKnowItems?.length)
  );

  return (
    <GlassCard variant="auto" className={`w-full overflow-hidden rounded-2xl md:rounded-3xl ${className}`.trim()}>
      {/* Header: host title from service */}
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <p className={sectionLabelClass}>
          {hostContent.sectionTitle}
        </p>
      </div>

      {/* Guide profile */}
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Stacked avatars: host + selected tier as siblings */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Host avatar */}
            <div className="relative">
              <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-primary/50 md:h-16 md:w-16">
                <img
                  src={hostContent.avatarUrl}
                  alt={hostContent.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-base-100 bg-primary text-primary-content">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              </span>
            </div>

            {/* Tier avatar — sibling, slight left overlap */}
            {selectedTier ? (
              <div className="relative">
                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/60">
                  <img
                    src={selectedTier.images.main}
                    alt={selectedTier.tierLabel}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-content">
                  <Hotel className="h-2.5 w-2.5" aria-hidden="true" />
                </span>
              </div>
            ) : null}
          </div>
          <div>
            <h3 className="text-md font-semibold text-base-content md:text-lg">{hostContent.name}</h3>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${pillClass}`}>
              {hostContent.verifiedBadgeLabel}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-base-content/80 md:mt-4">
          {hostContent.bio}
        </p>

        {/* Tier-specific note */}
        {selectedTier?.tierNote ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="mr-1.5 font-bold">{selectedTier.tierLabel}:</span>
            {selectedTier.tierNote}
          </div>
        ) : null}
      </div>

      <div className={dividerClass} />

      {/* Ideal For */}
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="mb-3 flex items-center gap-2">
          <h4 className={subheadingClass}>
            {hostContent.idealForLabel}
          </h4>
          {hasTierOverride && selectedTier?.idealForItems?.length ? (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${pillClass}`}>{selectedTier.tierLabel}</span>
          ) : null}
        </div>
        <ul className="space-y-2">
          {idealForItems.map((item) => (
            <li key={item} className={`flex items-center gap-2.5 text-sm ${listClass}`}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={dividerClass} />

      {/* Good to Know */}
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="mb-3 flex items-center gap-2">
          <h4 className={subheadingClass}>
            {hostContent.goodToKnowLabel}
          </h4>
          {hasTierOverride && selectedTier?.goodToKnowItems?.length ? (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${pillClass}`}>{selectedTier.tierLabel}</span>
          ) : null}
        </div>
        <ul className="space-y-2">
          {goodToKnowItems.map((item) => (
            <li key={item} className={`flex items-center gap-2.5 text-sm ${listClass}`}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
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
