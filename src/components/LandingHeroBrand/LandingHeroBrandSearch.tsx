'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import type { LandingHeroBrandContent } from '@/lib/schemas/landing.schema';
import { Select } from '@/components/ui/Select/Select';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';

interface Props {
  search: LandingHeroBrandContent['search'];
  className?: string;
}

/**
 * Brand-hero search widget. Three lightweight selects + submit.
 * Styled to mirror ExpericeWidget (dark glass card with green primary CTA),
 * so the brand landing matches the experience-detail visual language.
 *
 * Pure client interaction — pushes query params to /experiences.
 * No external state; intentionally local to keep landing decoupled.
 */
export default function LandingHeroBrandSearch({ search, className = '' }: Props) {
  const router = useRouter();

  const [destination, setDestination] = useState<string>(search.destinations[0]?.value ?? '');
  const [type, setType] = useState<string>(search.experienceTypes[0]?.value ?? '');
  const [duration, setDuration] = useState<string>(search.durations[0]?.value ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination && destination !== 'all') params.set('destination', destination);
    if (type && type !== 'all') params.set('type', type);
    if (duration && duration !== 'all') params.set('duration', duration);

    const qs = params.toString();
    const href = qs ? `${search.submitHref}?${qs}` : search.submitHref;
    router.push(href);
  }

  // Style tokens mirrored from ExpericeWidget (dark variant).
  // Note: same rounded card / overlay / select tokens / primary CTA so the
  // brand-hero search visually matches the experience-detail widget.
  const cardClass =
    'card relative rounded-2xl border border-white/15 bg-slate-900/45 p-4 shadow-none backdrop-blur-xl md:p-8';
  const overlayClass =
    'pointer-events-none absolute inset-0 rounded-[inherit] bg-slate-950/35';
  const labelClass = 'text-sm font-medium text-white/90';
  const selectTriggerClass =
    'flex w-full items-center justify-between gap-2 rounded-lg border border-white/20 bg-slate-900 px-3 py-2.5 text-sm text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F08F]/60';
  const selectPanelClass =
    'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/15 bg-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.55)]';
  const selectOptionClass =
    'flex cursor-pointer select-none items-center px-3 py-2.5 text-sm text-white/90 transition-colors border-t border-white/8 first:border-t-0';
  const selectOptionHoverClass = 'hover:bg-white/10 hover:text-white';

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={search.submitLabel}
      className={`${cardClass} ${className}`.trim()}
    >
      <div className={overlayClass} aria-hidden="true" />

      <div className="relative z-10 space-y-4 md:space-y-5">
        <div className="space-y-1">
          <label htmlFor="hero-search-destination" className={labelClass}>
            {search.destinationLabel}
          </label>
          <Select
            id="hero-search-destination"
            options={search.destinations.map((d) => ({ value: d.value, label: d.label }))}
            value={destination}
            onChange={(v) => setDestination(String(v))}
            aria-label={search.destinationLabel}
            triggerClassName={selectTriggerClass}
            panelClassName={selectPanelClass}
            optionClassName={selectOptionClass}
            optionHoverClassName={selectOptionHoverClass}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="hero-search-type" className={labelClass}>
            {search.experienceTypeLabel}
          </label>
          <Select
            id="hero-search-type"
            options={search.experienceTypes.map((t) => ({ value: t.value, label: t.label }))}
            value={type}
            onChange={(v) => setType(String(v))}
            aria-label={search.experienceTypeLabel}
            triggerClassName={selectTriggerClass}
            panelClassName={selectPanelClass}
            optionClassName={selectOptionClass}
            optionHoverClassName={selectOptionHoverClass}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="hero-search-duration" className={labelClass}>
            {search.durationLabel}
          </label>
          <Select
            id="hero-search-duration"
            options={search.durations.map((d) => ({ value: d.value, label: d.label }))}
            value={duration}
            onChange={(v) => setDuration(String(v))}
            aria-label={search.durationLabel}
            triggerClassName={selectTriggerClass}
            panelClassName={selectPanelClass}
            optionClassName={selectOptionClass}
            optionHoverClassName={selectOptionHoverClass}
          />
        </div>

        <PrimaryCtaButton type="submit" size="lg" className="w-full py-3 md:py-4">
          <span className="inline-flex items-center gap-2">
            <Search className="h-4 w-4" aria-hidden="true" />
            {search.submitLabel}
          </span>
        </PrimaryCtaButton>
      </div>
    </form>
  );
}
