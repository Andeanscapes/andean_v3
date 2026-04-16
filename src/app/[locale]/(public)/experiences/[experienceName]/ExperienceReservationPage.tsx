'use client';

import dynamic from 'next/dynamic';
import { ExperienceReservationProvider } from '@/contexts/ExperienceReservationContext';
import { ExperienceHero } from '@/components/ExperienceReservation/ExperienceHero';
import { DateSelector } from '@/components/ExperienceReservation/DateSelector';
import { PeopleSelector } from '@/components/ExperienceReservation/PeopleSelector';
import { PriceSummary } from '@/components/ExperienceReservation/PriceSummary';
import { ConfirmationAction } from '@/components/ExperienceReservation/ConfirmationAction';
import type { ExperienceData } from '@/lib/schemas';
import type { BookingSelections } from '@/utils/helpers';

/*
 * Heavy / below-the-fold form components are code-split into separate JS chunks.
 * SSR stays enabled (default) so HTML is server-rendered without CLS.
 *
 * Light above-the-fold components (DateSelector, PeopleSelector, PriceSummary,
 * ConfirmationAction) stay as static imports — dynamic-importing them adds
 * LoadableComponent overhead and extra chunk waterfall that increases TBT.
 */
const TierPicker = dynamic(() =>
  import('@/components/ExperienceReservation/TierPicker').then((m) => ({ default: m.TierPicker }))
);
const TransportOptions = dynamic(() =>
  import('@/components/ExperienceReservation/TransportOptions').then((m) => ({ default: m.TransportOptions }))
);
const AccommodationSelector = dynamic(() =>
  import('@/components/ExperienceReservation/AccommodationSelector').then((m) => ({ default: m.AccommodationSelector }))
);
const ContactFields = dynamic(() =>
  import('@/components/ExperienceReservation/ContactFields').then((m) => ({ default: m.ContactFields }))
);
const IncludesAccordion = dynamic(() =>
  import('@/components/ExperienceReservation/IncludesAccordion').then((m) => ({ default: m.IncludesAccordion }))
);
/*
 * MobileStickyDock: fixed overlay activated after scroll — no SSR value,
 * no layout-shift risk, so skip SSR entirely to save more initial JS.
 */
const MobileStickyDock = dynamic(
  () => import('@/components/ExperienceReservation/MobileStickyDock').then((m) => ({ default: m.MobileStickyDock })),
  { ssr: false }
);

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

      {/* Page body: dark charcoal bg with subtle emerald corner gradients */}
      <div className="booking-bg min-h-screen">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          {/*
           * Desktop: two-column grid — main form (left) + sticky sidebar (right).
           * Mobile: single column, ConfirmationAction sticks to the bottom of the viewport.
           */}
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">

            {/* ── Left column: reservation form steps ── */}
            <main>
              <DateSelector availableDates={availableDates} />
              <PeopleSelector maxPeople={config.maxPeople} minPeople={config.minPeople} />
              <TransportOptions transportOptions={transportOptions} />
              <TierPicker />
              <AccommodationSelector maxPeople={config.maxPeople} minPeople={config.minPeople} />
              <ContactFields />
              <IncludesAccordion experienceData={experienceData} />
              {/* Mobile-only: price summary + in-flow actions (above fixed dock) */}
              <div className="lg:hidden pb-28">
                <PriceSummary depositPercent={config.depositPercent} />
                <ConfirmationAction config={config} whatsappLink={whatsappLink} />
              </div>
            </main>

            {/* ── Right column: sticky sidebar (desktop only) ── */}
            <aside className="hidden lg:block lg:sticky lg:top-20 space-y-0 pb-6">
              <PriceSummary depositPercent={config.depositPercent} />
              <ConfirmationAction config={config} whatsappLink={whatsappLink} />
            </aside>
          </div>
        </div>

        {/* Mobile: fixed floating dock — scroll-activated, handles payment CTA */}
        <MobileStickyDock config={config} />
      </div>
    </ExperienceReservationProvider>
  );
}