'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import type { ExperienceData } from '@/lib/schemas';
import { useDetailSelectedTier } from '@/hooks/experiences/useExperienceDetailContext';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { StayCard } from './StayCard';

interface AccommodationTiersProps {
  className?: string;
  experienceData: ExperienceData;
}

function AccommodationTiersComponent({ className = '', experienceData }: AccommodationTiersProps) {
  const t = useTranslations();
  const { selectedTierId, setTier } = useDetailSelectedTier();
  const tiersContent = experienceData.accommodationTiersContent;

  if (!tiersContent?.tiers || tiersContent.tiers.length === 0) return null;

  const sectionTitle = tiersContent.tiers.length === 1
    ? t('experiences.ui.experienceDetails.accommodationTitle')
    : t('experiences.ui.experienceDetails.selectYourStayTitle');
  const locationLabel = experienceData.inclusionsContent?.location?.label ?? experienceData.config.location?.label;

  return (
    <SectionContainer sectionClassName={`relative overflow-hidden px-4 py-12 md:px-6 md:py-14 lg:px-10 lg:py-16 ${className}`.trim()}>
      <h2 className="mb-8 text-3xl font-bold leading-tight text-base-content md:text-5xl lg:text-6xl">
        {sectionTitle}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        {tiersContent.tiers.map((tier) => (
          <StayCard
            key={tier.id}
            tier={tier}
            locationLabel={locationLabel}
            isSelected={tier.id === selectedTierId}
            onSelect={setTier}
          />
        ))}
      </div>
    </SectionContainer>
  );
}

AccommodationTiersComponent.displayName = 'AccommodationTiers';

export default memo(AccommodationTiersComponent);
