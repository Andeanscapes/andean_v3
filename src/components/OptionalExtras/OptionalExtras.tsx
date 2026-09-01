'use client';

import { memo } from 'react';
import { useLocale } from 'next-intl';
import type { ExperienceData } from '@/lib/schemas';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { formatMoney } from '@/utils/formatCurrency';

interface OptionalExtrasProps {
  className?: string;
  /** Narrowed so the contract is explicit: add-on copy plus the feed currency. */
  experienceData: Pick<ExperienceData, 'addonsContent' | 'config'>;
}

/**
 * Informational list of optional paid extras.
 *
 * Display-only by design: these are quoted separately from the plan and need
 * team confirmation before sale, so they are deliberately not selectable and
 * never enter the booking total.
 */
function OptionalExtrasComponent({ className = '', experienceData }: OptionalExtrasProps) {
  const locale = useLocale();
  const addonsContent = experienceData.addonsContent;

  if (!addonsContent?.items.length) return null;

  return (
    <SectionContainer
      sectionClassName={`relative overflow-hidden px-4 py-12 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}
    >
      <h2 className="mb-8 text-3xl font-bold leading-tight text-base-content md:text-5xl lg:text-6xl">
        {addonsContent.sectionTitle}
      </h2>

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        {addonsContent.items.map((addon) => (
          <li key={addon.id}>
            <Card className="h-full" padding="md">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-base-content md:text-xl">
                  {addon.label}
                </h3>
                <p className="whitespace-nowrap text-right text-lg font-bold text-base-content md:text-xl">
                  {formatMoney(addon.pricePerPerson, locale, experienceData.config.currency)}
                  <span className="block text-xs font-normal text-base-content/60">
                    {addonsContent.perPersonLabel}
                  </span>
                </p>
              </div>

              {addon.description ? (
                <p className="mt-3 text-sm leading-relaxed text-base-content/70">
                  {addon.description}
                </p>
              ) : null}

              {addon.requiresTeamConfirmation ? (
                <Badge className="mt-4" variant="info" size="sm">
                  {addonsContent.teamConfirmationLabel}
                </Badge>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

const OptionalExtras = memo(OptionalExtrasComponent);
export default OptionalExtras;
