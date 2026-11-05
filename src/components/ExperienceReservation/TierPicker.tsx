'use client';

import { memo, useMemo } from 'react';
import { Hotel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import {
  useReservationTier,
  useReservationAccommodationTiers,
} from '@/hooks/experiences/useReservationContext';
import type { AccommodationTierContent } from '@/lib/schemas';

function computeCostIndicator(
  tier: AccommodationTierContent,
  allTiers: AccommodationTierContent[]
): string {
  const cheapest = (t: AccommodationTierContent) =>
    Math.min(...t.rooms.map((r) => r.pricePerNight));

  const prices = allTiers.map(cheapest).sort((a, b) => a - b);
  const tierPrice = cheapest(tier);
  const rank = prices.indexOf(tierPrice);

  if (prices.length <= 1) return '$';
  if (rank === 0) return '$';
  if (rank === prices.length - 1) return '$$$';
  return '$$';
}

function TierPickerComponent() {
  const t = useTranslations('experiences.ui');
  const { selectedTierId, setTier } = useReservationTier();
  const tiersContent = useReservationAccommodationTiers();

  const tiers = tiersContent?.tiers ?? [];

  const tierCards = useMemo(
    () =>
      tiers.map((tier) => ({
        ...tier,
        costIndicator: computeCostIndicator(tier, tiers),
      })),
    [tiers]
  );

  if (tiers.length === 0) return null;

  return (
    <Card padding="responsive" className="mb-6">
      <h2 className="text-md sm:text-2md md:text-xl font-semibold mb-4 text-base-content">
        {t('selectTierTitle')}
      </h2>

      <div
        className="grid gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label={t('selectTierTitle')}
      >
        {tierCards.map((tier) => {
          const isSelected = selectedTierId === tier.id;

          const itemClass = `relative flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
            isSelected
              ? 'border-primary bg-primary/5 ring-1 ring-primary dark:bg-primary/10'
              : 'border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-white/25'
          }`;

          return (
            <div
              key={tier.id}
              className={itemClass}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => setTier(tier.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setTier(tier.id);
                }
              }}
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={tier.images.thumbnail ?? tier.images.main}
                  alt={tier.tierLabel}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-base-content/70">
                  {tier.tierTag}
                </p>
                <p className="text-sm font-bold leading-tight text-base-content">
                  {tier.tierLabel}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="text-xs font-bold text-primary"
                    aria-label={`${t('tierPriceRange')}: ${tier.costIndicator}`}
                  >
                    {tier.costIndicator}
                  </span>
                  {tier.isHostChoice && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-transparent dark:bg-emerald-500/10 dark:text-emerald-300">
                      <Hotel aria-hidden="true" className="h-3 w-3" />
                      {t('experienceDetails.hostChoiceLabel')}
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-content">
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3 w-3"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('selectedTierLabel')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export const TierPicker = memo(TierPickerComponent);
