import Link from 'next/link';
import Image from 'next/image';
import type { LandingCategoryContent } from '@/lib/schemas/landing.schema';
import { getLandingIcon } from '@/utils/landingIconMap';
import { ArrowRight } from 'lucide-react';

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
      <div className="relative h-40 w-full overflow-hidden md:h-44">
        <Image
          src={category.imageUrl}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
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
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
          {category.ctaLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
