'use client';

import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatDayMonth } from '@/utils/dateFormatters';
import { Clock3 } from 'lucide-react';
import type { LandingFeaturedExperienceContent } from '@/lib/schemas/landing.schema';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge/Badge';
import { PackageTagBadges } from '@/components/ui/PackageTagBadges/PackageTagBadges';
import { CardImageCarousel } from '@/components/ui/CardImageCarousel/CardImageCarousel';
import { MineBadge, PlanBadge, PrivateBadge } from '@/components/ui/CardBadges/CardBadges';

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

  const availabilityLabel = experience.nextAvailability
    ? t('Landing.brand.featured.nextAvailability', {
        date: formatDayMonth(experience.nextAvailability.dateISO, locale),
        count: experience.nextAvailability.spotsLeft,
      })
    : null;

  return (
    <article
      className="group group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all duration-200 active:scale-[0.98] hover:scale-[1.02] hover:shadow-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-emerald-950/10 via-emerald-500/10 to-emerald-950/10 md:h-52">
        <CardImageCarousel images={experience.images} title={experience.title} hovered={hovered} />
        <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden="true" />
        {experience.mineBadge || experience.planBadge || experience.privateBadge ? (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-start gap-1.5">
              {experience.mineBadge ? <MineBadge label={experience.mineBadge.label} /> : null}
              {experience.privateBadge ? <PrivateBadge label={experience.privateBadge.label} /> : null}
            </div>
            {experience.planBadge ? (
              <PlanBadge code={experience.planBadge.code} label={experience.planBadge.label} />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <h3 className="text-base font-semibold text-base-content md:text-lg">
          <Link
            href={experience.href}
            data-event="experience_view_details"
            className="after:absolute after:inset-0 focus-visible:outline-none hover:underline"
          >
            {experience.title}
          </Link>
        </h3>
        <p className="text-pretty text-sm text-base-content/75">
          {experience.description}
        </p>

        <PackageTagBadges tags={experience.packageTags} />

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/70 md:text-sm">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{experience.duration}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{experience.location}</span>
          </span>
        </div>

        {experience.highlights.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {experience.highlights.map((highlight) => (
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
            className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-emerald-600 dark:text-emerald-400"
          >
            <Clock3 className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {availabilityLabel}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-base-content/60">{experience.fromLabel}</span>
            <span className="text-base font-bold text-base-content md:text-lg">
              {formattedAmount}
              <span className="ml-1 text-xs font-normal text-base-content/60">
                {experience.perPersonLabel}
              </span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
            {experience.viewDetailsLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  );
}
