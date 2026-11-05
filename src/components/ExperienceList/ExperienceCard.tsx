'use client';

import { memo } from 'react';
import {Link} from '@/i18n/navigation';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import ExperienceCardImage from './ExperienceCardImage';
import { MineBadge, PlanBadge, PrivateBadge } from '@/components/ui/CardBadges/CardBadges';
import { PackageTagBadges } from '@/components/ui/PackageTagBadges/PackageTagBadges';
import type { ExperienceListCard } from '@/lib/schemas';

export interface ExperienceCardProps {
  card: ExperienceListCard;
  fromLabel: string;
  viewDetailsLabel: string;
  formattedPrice: string;
}

function ExperienceCardComponent({ card, fromLabel, viewDetailsLabel, formattedPrice }: ExperienceCardProps) {
  return (
    <Card padding="sm" className="h-full">
      <div className="relative">
        <ExperienceCardImage
          src={card.image}
          images={card.images}
          carouselTitle={card.title}
          // Decorative: the title is rendered as the <h3> immediately below, so
          // a descriptive alt would make screen readers announce it twice.
          // Matches LandingFeaturedExperienceCard.
          alt=""
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {card.mineBadge || card.planBadge || card.privateBadge ? (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-start gap-1.5">
              {card.mineBadge ? <MineBadge label={card.mineBadge.label} /> : null}
              {card.privateBadge ? <PrivateBadge label={card.privateBadge.label} /> : null}
            </div>
            {card.planBadge ? <PlanBadge code={card.planBadge.code} label={card.planBadge.label} /> : null}
          </div>
        ) : null}
        {card.tag ? (
          <div className="absolute bottom-3 left-3 z-10">
            <Badge variant="secondary" size="sm" className="bg-base-100/90 px-2 py-0.5 text-[11px] md:px-2.5 md:py-1 md:text-xs">
              {card.tag}
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-1 flex-col md:mt-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-base-content md:line-clamp-none md:text-lg">
          {card.title}
        </h3>
        {/* Visibility lives on the wrapper: `hidden`/`sm:block` and `line-clamp-*` all set
            `display`, so on one element the winner would depend on CSS order. */}
        <div className="hidden sm:block">
          <p className="mt-1 line-clamp-2 max-w-[36ch] text-[13px] leading-[1.38] text-base-content/75 md:mt-2 md:max-w-none md:line-clamp-3 md:text-sm md:leading-normal">
            {card.description}
          </p>
        </div>

        <PackageTagBadges tags={card.packageTags} className="mt-2" />

        <div className="mt-2 space-y-1.5 md:mt-auto md:space-y-2.5 md:pt-3">
          {card.metadata.length > 0 ? (
            <div className="flex flex-wrap gap-1 md:gap-1.5">
              {card.metadata.map((item) => (
                <Badge
                  key={`${card.id}-${item}`}
                  variant="secondary"
                  size="sm"
                  className="whitespace-nowrap bg-base-100/90 px-1.5 py-0.5 text-[10px] sm:px-2 sm:text-[11px] md:text-xs lg:px-2.5"
                >
                  {item}
                </Badge>
              ))}
            </div>
          ) : null}

          {/* Mobile: price and CTA share one row. From md the CTA stacks full-width below. */}
          <div className="flex items-center justify-between gap-3 md:block md:space-y-2.5">
          <div className="min-w-0 space-y-0.5 md:space-y-0 lg:py-0.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-base-content/70 md:text-sm md:normal-case md:tracking-normal">
              {fromLabel}
            </p>
            <p className="text-base font-bold leading-tight text-base-content [font-variant-numeric:tabular-nums] lg:text-[1.35rem]">
              {formattedPrice}
            </p>
            {card.priceQualifier ? (
              <p className="mt-0.5 text-[11px] text-base-content/70 md:text-xs">{card.priceQualifier}</p>
            ) : null}
          </div>

          <Link
            href={card.href}
            className="btn btn-primary btn-sm h-11 min-h-[44px] shrink-0 px-4 text-xs font-semibold md:h-auto md:min-h-0 md:w-full md:text-sm lg:h-12 lg:min-h-[48px] lg:px-5 lg:text-base"
          >
            {viewDetailsLabel}
          </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export const ExperienceCard = memo(ExperienceCardComponent);
