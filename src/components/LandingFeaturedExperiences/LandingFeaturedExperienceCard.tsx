'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import type { LandingFeaturedExperienceContent } from '@/lib/schemas/landing.schema';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

interface Props {
  experience: LandingFeaturedExperienceContent;
}

/**
 * Card for a single featured experience on the brand landing.
 * Pure presentational. Self-contained: no external context, no client hooks.
 *
 * Format mirrors common travel-card layout: image (with optional badge),
 * title, short description, meta row (duration / location), price + CTA.
 */
export default function LandingFeaturedExperienceCard({ experience }: Props) {
  const locale = useLocale();
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: experience.currency,
    maximumFractionDigits: 0,
  }).format(experience.fromAmount);

  return (
    <Link
      href={experience.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative h-48 w-full overflow-hidden md:h-52">
        <Image
          src={experience.image}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden="true" />
        {experience.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-content shadow-sm">
            {experience.badge}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <h3 className="text-base font-semibold text-base-content md:text-lg">
          {experience.title}
        </h3>
        <p className="text-pretty text-sm text-base-content/75">
          {experience.description}
        </p>

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

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-base-content/60">{experience.fromLabel}</span>
            <span className="text-base font-bold text-base-content md:text-lg">
              {formattedAmount}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
            {experience.viewDetailsLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
