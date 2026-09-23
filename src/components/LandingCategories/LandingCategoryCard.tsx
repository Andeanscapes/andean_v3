import Link from 'next/link';
import type { LandingCategoryContent } from '@/lib/schemas/landing.schema';
import { getLandingIcon } from '@/utils/landingIconMap';
import { ArrowRight } from 'lucide-react';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

interface Props {
  category: LandingCategoryContent;
}

/**
 * Single category card. Pure presentational.
 * Image fills the top half (object-cover), icon + title overlap softly,
 * description and CTA below.
 */
export default function LandingCategoryCard({ category }: Props) {
  const Icon = getLandingIcon(category.iconName);

  return (
    <Link
      href={category.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative h-40 w-full overflow-hidden bg-base-200 md:h-44">
        {/*
          Deliberately not `next/image` — see `ExperienceList/ExperienceCardImage.tsx`:
          `/_next/image` is a pass-through on the deployed Worker, so `sizes`
          resized nothing and phones downloaded the full tile. The `-mobile`
          sibling is never named by the feed; it must be published before this
          renders, because a matched `<source>` that 404s does not fall back.
        */}
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet={getResponsiveImageSrc(category.imageUrl).mobile}
          />
          <img
            src={category.imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </picture>
        <div className="pointer-events-none absolute inset-0 bg-black/20" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        {Icon ? (
          <span className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-base-100/95 text-primary shadow-sm">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <h3 className="text-base font-semibold text-base-content md:text-lg">
          {category.title}
        </h3>
        <p className="text-pretty text-sm text-base-content/75">
          {category.description}
        </p>
        {category.exclusiveAccess ? (
          <p className="text-[11px] italic text-emerald-600 dark:text-emerald-400">
            {category.exclusiveAccess}
          </p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
          {category.ctaLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
