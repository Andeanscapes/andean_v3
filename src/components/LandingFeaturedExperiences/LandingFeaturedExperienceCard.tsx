'use client';

import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatDayMonth } from '@/utils/dateFormatters';
import { Clock3 } from 'lucide-react';
import type { LandingFeaturedExperienceContent } from '@/lib/schemas/landing.schema';
import { Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge/Badge';
import { CardImageCarousel } from '@/components/ui/CardImageCarousel/CardImageCarousel';
import { MineBadge, PrivateBadge } from '@/components/ui/CardBadges/CardBadges';
import { LOW_SPOTS_THRESHOLD } from '@/utils/availability';

interface Props {
  experience: LandingFeaturedExperienceContent;
}

/**
 * Card for a single featured experience on the brand landing.
 * Presentational. Self-contained: no external context; local hover state only.
 *
 * The title is the only link, stretched over the whole card, so the photo
 * carousel can hold its own buttons without nesting interactive elements.
 * Format mirrors common travel-card layout: image with badges, title, short
 * description, meta row (duration / location), price + CTA.
 */
export default function LandingFeaturedExperienceCard({ experience }: Props) {
  const locale = useLocale();
  const t = useTranslations();
  // The stretched title link covers the photo, so hover is read at card level.
  const [hovered, setHovered] = useState(false);
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: experience.currency,
    maximumFractionDigits: 0,
  }).format(experience.fromAmount);

  const nextAvailability = experience.nextAvailability;
  const availabilityLabel = nextAvailability
    ? (() => {
        const date = formatDayMonth(nextAvailability.dateISO, locale);
        return nextAvailability.spotsLeft <= LOW_SPOTS_THRESHOLD
          ? t('Landing.brand.featured.nextAvailability', { date, count: nextAvailability.spotsLeft })
          : t('Landing.brand.featured.nextAvailabilityDate', { date });
      })()
    : null;

  return (
    <article
      className="group group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-card dark:border-base-200 dark:bg-base-100 dark:shadow-sm transition-[transform,box-shadow] duration-200 active:scale-[0.98] hover:scale-[1.02] hover:shadow-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-emerald-950/10 via-emerald-500/10 to-emerald-950/10 md:h-52">
        {/* Low: on mobile these cards are above the fold and would otherwise share bandwidth with the hero (LCP). */}
        <CardImageCarousel images={experience.images} title={experience.title} hovered={hovered} fetchPriority="low" />
        <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden="true" />
        {experience.mineBadge || experience.privateBadge ? (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start gap-1.5">
            {experience.mineBadge ? <MineBadge label={experience.mineBadge.label} /> : null}
            {experience.privateBadge ? <PrivateBadge label={experience.privateBadge.label} /> : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 md:gap-2 md:p-5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-base-content md:text-lg">
          <Link
            href={experience.href}
            data-event="experience_view_details"
            className="after:absolute after:inset-0 focus-visible:outline-none hover:underline"
          >
            {experience.title}
          </Link>
        </h3>
        <p className="hidden text-pretty text-sm text-base-content/75 sm:block">
          {experience.description}
        </p>

        <div className="flex min-w-0 flex-nowrap items-center gap-x-3 whitespace-nowrap text-[11px] text-base-content/70 sm:mt-1 sm:flex-wrap sm:gap-x-4 sm:gap-y-1 md:text-sm">
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" aria-hidden="true" />
            <span>{experience.duration}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" aria-hidden="true" />
            <span className="truncate">{experience.location}</span>
          </span>
        </div>

        {experience.highlights.length > 0 ? (
          <ul className="hidden flex-wrap gap-1.5 sm:flex">
            {experience.highlights.slice(0, 2).map((highlight) => (
              <li key={highlight}>
                <Badge variant="secondary" size="sm" className="whitespace-nowrap bg-base-200/70 text-[11px] md:text-xs">
                  {highlight}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}

        {availabilityLabel ? (
          <div
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-1 text-[11px] md:mt-1 md:px-2.5 md:py-1.5 font-semibold leading-tight text-emerald-800 dark:border-transparent dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            <Clock3 className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {availabilityLabel}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2 md:items-end md:pt-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-base-content/70 md:text-xs">{experience.fromLabel}</span>
            <span className="text-base font-bold text-base-content md:text-lg">
              {formattedAmount}
              <span className="ml-1 text-xs font-normal text-base-content/70">
                {experience.perPersonLabel}
              </span>
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline md:text-sm md:font-medium">
            {experience.viewDetailsLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
