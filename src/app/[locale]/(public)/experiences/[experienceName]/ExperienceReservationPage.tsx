'use client';

import { ExperienceReservationProvider } from '@/contexts/ExperienceReservationContext';
import { ExperienceHero } from '@/components/ExperienceReservation/ExperienceHero';
import { TierPicker } from '@/components/ExperienceReservation/TierPicker';
import { DateSelector } from '@/components/ExperienceReservation/DateSelector';
import { PeopleSelector } from '@/components/ExperienceReservation/PeopleSelector';
import { TransportOptions } from '@/components/ExperienceReservation/TransportOptions';
import { ContactFields } from '@/components/ExperienceReservation/ContactFields';
import { IncludesAccordion } from '@/components/ExperienceReservation/IncludesAccordion';
import { PriceSummary } from '@/components/ExperienceReservation/PriceSummary';
import { ConfirmationAction } from '@/components/ExperienceReservation/ConfirmationAction';
import type { ExperienceData } from '@/lib/schemas';
import type { BookingSelections } from '@/utils/helpers';

interface ExperienceReservationPageProps {
  experienceData: ExperienceData;
  initialSelections?: BookingSelections;
}

export default function ExperienceReservationPage({
  experienceData,
  initialSelections,
}: ExperienceReservationPageProps) {
  const { config, transportOptions, roomModes, availableDates, whatsappLink, heroContent, accommodationTiersContent } = experienceData;

  return (
    <ExperienceReservationProvider
      config={config}
      roomModes={roomModes}
      accommodationTiersContent={accommodationTiersContent}
      availableDates={availableDates}
      initialSelections={initialSelections}
    >
      {/* Full-width Hero */}
      <ExperienceHero config={config} heroContent={heroContent} />

      {/* Form content in centered container */}
      <div className="container mx-auto max-w-4xl px-4 py-6 pb-6">
        <DateSelector availableDates={availableDates} />
        <TierPicker />
        <PeopleSelector maxPeople={config.maxPeople} minPeople={config.minPeople} />
        <TransportOptions transportOptions={transportOptions} />
        <ContactFields />
        <IncludesAccordion config={config} />
        <PriceSummary depositPercent={config.depositPercent} />
        <ConfirmationAction config={config} whatsappLink={whatsappLink} />
      </div>
    </ExperienceReservationProvider>
  );
}