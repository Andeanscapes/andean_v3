'use client';

import { ExperienceReservationProvider } from '@/contexts/ExperienceReservationContext';
import { ExperienceHero } from '@/components/ExperienceReservation/ExperienceHero';
import { DateSelector } from '@/components/ExperienceReservation/DateSelector';
import { PeopleSelector } from '@/components/ExperienceReservation/PeopleSelector';
import { TransportOptions } from '@/components/ExperienceReservation/TransportOptions';
import { ContactFields } from '@/components/ExperienceReservation/ContactFields';
import { IncludesAccordion } from '@/components/ExperienceReservation/IncludesAccordion';
import { PriceSummary } from '@/components/ExperienceReservation/PriceSummary';
import { ConfirmationAction } from '@/components/ExperienceReservation/ConfirmationAction';
import type { ExperienceData } from '@/lib/experiences/types';

interface MiningAdventureReservationProps {
  experienceData: ExperienceData;
}

export default function MiningAdventureReservation({
  experienceData,
}: MiningAdventureReservationProps) {
  const { config, transportOptions, roomModes, availableDates, whatsappLink } = experienceData;

  return (
    <ExperienceReservationProvider config={config} roomModes={roomModes}>
      {/* Full-width Hero */}
      <ExperienceHero config={config} />
      
      {/* Form content in centered container */}
      <div className="container mx-auto max-w-2xl px-4 py-6 pb-96">
        <DateSelector availableDates={availableDates} />
        <PeopleSelector maxPeople={config.maxPeople} minPeople={config.minPeople} />
        <TransportOptions transportOptions={transportOptions} />
        <ContactFields />
        <IncludesAccordion config={config} />
        <PriceSummary depositPercent={config.depositPercent} />
      </div>
      <ConfirmationAction config={config} whatsappLink={whatsappLink} />
    </ExperienceReservationProvider>
  );
}

