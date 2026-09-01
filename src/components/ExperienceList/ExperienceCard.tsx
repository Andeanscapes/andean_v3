'use client';

import { memo } from 'react';
import {Link} from '@/i18n/navigation';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import ExperienceCardImage from './ExperienceCardImage';
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
          alt={card.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {card.tag ? (
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" size="sm" className="bg-base-100/90 px-2 py-0.5 text-[11px] md:px-2.5 md:py-1 md:text-xs">
              {card.tag}
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-1 flex-col md:mt-3">
        <h3 className="text-base font-semibold leading-tight text-primary md:text-lg md:leading-relaxed lg:text-xl">
          {card.title}
        </h3>
        <p className="mt-1 line-clamp-2 max-w-[36ch] text-[13px] leading-[1.38] text-primary/80 md:mt-2 md:max-w-none md:line-clamp-3 md:text-sm md:leading-relaxed md:text-primary/90">
          {card.description}
        </p>

        <div className="mt-2 space-y-1.5 md:mt-auto md:space-y-2.5 md:pt-3">
          {card.metadata.length > 0 ? (
            <div className="flex flex-wrap gap-1 md:gap-1.5">
              {card.metadata.slice(0, 3).map((item) => (
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

          <div className="space-y-0.5 rounded-lg bg-base-200/40 px-2.5 py-2 md:space-y-0 md:rounded-none md:bg-transparent md:px-0 md:py-0 lg:py-0.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-base-content/60 md:text-sm md:normal-case md:tracking-normal">
              {fromLabel}
            </p>
            <p className="text-lg font-bold leading-tight text-base-content [font-variant-numeric:tabular-nums] md:text-base lg:text-[1.35rem]">
              {formattedPrice}
            </p>
            {card.priceQualifier ? (
              <p className="mt-0.5 text-[11px] text-base-content/55 md:text-xs">{card.priceQualifier}</p>
            ) : null}
          </div>

          <Link
            href={card.href}
            className="btn btn-primary btn-sm mt-0.5 h-11 min-h-[44px] w-full text-sm font-semibold md:mt-0 md:h-auto md:min-h-0 lg:h-12 lg:min-h-[48px] lg:px-5 lg:text-base"
          >
            {viewDetailsLabel}
          </Link>
        </div>
      </div>
    </Card>
  );
}

export const ExperienceCard = memo(ExperienceCardComponent);
