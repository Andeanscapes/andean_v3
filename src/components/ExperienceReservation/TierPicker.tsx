'use client';

import { memo, useMemo } from 'react';
import { Hotel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { useThemeContext } from '@/contexts/ThemeContext';
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
  const { theme } = useThemeContext();
  const { selectedTierId, setTier } = useReservationTier();
  const tiersContent = useReservationAccommodationTiers();

  const tiers = tiersContent?.tiers ?? [];

  const isDark = theme === 'dark';

  const cardClass = isDark
    ? 'mb-6 border border-white/15 bg-slate-900/45 backdrop-blur-xl'
    : 'mb-6 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

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
    <Card className={cardClass}>
      <h2 className="text-xl font-semibold mb-4 text-base-content">
        {t('selectTierTitle')}
      </h2>

      <div
        className="grid gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label={t('selectTierTitle')}
      >
        {tierCards.map((tier) => {
          const isSelected = selectedTierId === tier.id;

          const itemClass = isDark
            ? `relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200 ${
                isSelected
                  ? 'border-[#00F08F] bg-[#00F08F]/8 shadow-[0_0_16px_rgba(0,240,143,0.12)]'
                  : 'border-white/15 bg-slate-900/30 hover:border-white/25'
              }`
            : `relative flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-neutral-200 bg-base-100 hover:border-neutral-300'
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
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-base-content/50' : 'text-neutral-500'
                  }`}
                >
                  {tier.tierTag}
                </p>
                <p className="text-sm font-bold leading-tight text-base-content">
                  {tier.tierLabel}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      isDark ? 'text-[#00F08F]' : 'text-emerald-600'
                    }`}
                    aria-label={`${t('tierPriceRange')}: ${tier.costIndicator}`}
                  >
                    {tier.costIndicator}
                  </span>
                  {tier.isHostChoice && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#00F08F] px-1.5 py-0.5 text-[8px] font-bold tracking-widest text-black">
                      <Hotel className="h-2.5 w-2.5" />
                      HOST
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-[#00F08F] px-2 py-0.5 text-[8px] font-bold tracking-widest text-black">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-2.5 w-2.5"
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
