'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ExperienceReservationProvider } from '@/contexts/ExperienceReservationContext';
import { ExperienceDetailProvider } from '@/contexts/ExperienceDetailContext';
import { ExperienceHero } from '@/components/ExperienceReservation/ExperienceHero';
import { DateSelector } from '@/components/ExperienceReservation/DateSelector';
import { PeopleSelector } from '@/components/ExperienceReservation/PeopleSelector';
import { PriceSummary } from '@/components/ExperienceReservation/PriceSummary';
import { ConfirmationAction } from '@/components/ExperienceReservation/ConfirmationAction';
import { PaymentStatusBanner } from '@/components/ExperienceReservation/PaymentStatusBanner';
import type { ExperienceData } from '@/lib/schemas';
import type { CheckoutResponse, PaymentStatusResponse } from '@/lib/schemas/payment.schema';
import { resolveDayTripSelections, type BookingSelections } from '@/utils/helpers';

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
  /** A shared link named a date that is no longer bookable. */
  sharedDateUnavailable?: boolean;
  /** Return from Mercado Pago (`?ref=`, `?payment_id=`), validated server-side. */
  payment?: { reference: string; paymentId: string | null } | null;
}

export default function ExperienceReservationPage({
  experienceData,
  initialSelections,
  sharedDateUnavailable = false,
  payment = null,
}: ExperienceReservationPageProps) {
  const { config, transportOptions, roomModes, availableDates, whatsappLink, heroContent, accommodationTiersContent } = experienceData;
  // Day trips have no overnight stay: their single tier only buckets guests for
  // pricing, so it is preselected and the stay/room pickers are not shown.
  const isDayTrip = config.numberOfNights === 0;
  // Memoized: the provider re-hydrates whenever this reference changes.
  const reservationSelections = useMemo(
    () => (isDayTrip ? resolveDayTripSelections(initialSelections, accommodationTiersContent?.tiers ?? []) : initialSelections),
    [isDayTrip, initialSelections, accommodationTiersContent],
  );
  // Checkout opened in another tab from this page: the banner follows it here.
  const [openCheckout, setOpenCheckout] = useState<CheckoutResponse | null>(null);
  const trackCheckout = useCallback((checkout: CheckoutResponse) => setOpenCheckout(checkout), []);
  const [paymentResult, setPaymentResult] = useState<PaymentStatusResponse['status'] | null>(null);
  const handlePaymentResult = useCallback((status: PaymentStatusResponse['status']) => setPaymentResult(status), []);
  // No second deposit while one is paid, still processing (PSE/cash), or open in
  // another tab; the banner's "Open Mercado Pago again" link covers retries there.
  const paymentLocked = paymentResult === 'approved' || paymentResult === 'pending' || openCheckout !== null;

  return (
    <ExperienceDetailProvider experienceData={experienceData}>
      <ExperienceReservationProvider
        config={config}
        roomModes={roomModes}
        accommodationTiersContent={accommodationTiersContent}
        availableDates={availableDates}
        initialSelections={reservationSelections}
      >
      {/* Full-width Hero */}
      <ExperienceHero config={config} heroContent={heroContent} />

      {/* Page body */}
      <div className="min-h-screen bg-base-200 dark:bg-booking-bg">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          {openCheckout ? (
            <PaymentStatusBanner
              key={openCheckout.reference}
              reference={openCheckout.reference}
              paymentId={null}
              checkoutUrl={openCheckout.url}
              experienceTitle={config.title}
              onResult={handlePaymentResult}
            />
          ) : payment ? (
            <PaymentStatusBanner
              reference={payment.reference}
              paymentId={payment.paymentId}
              checkoutUrl={null}
              experienceTitle={config.title}
              onResult={handlePaymentResult}
            />
          ) : null}
          {/*
           * Desktop: two-column grid — main form (left) + sticky sidebar (right).
           * Mobile: single column, ConfirmationAction sticks to the bottom of the viewport.
           */}
          <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">

            {/* ── Left column: reservation form steps ── */}
            <div>
              <DateSelector availableDates={availableDates} sharedDateUnavailable={sharedDateUnavailable} />
              <PeopleSelector maxPeople={config.maxPeople} minPeople={config.minPeople} />
              <TransportOptions transportOptions={transportOptions} />
              {!isDayTrip && <TierPicker />}
              {!isDayTrip && <AccommodationSelector maxPeople={config.maxPeople} minPeople={config.minPeople} />}
              <ContactFields />
              <IncludesAccordion experienceData={experienceData} />
              {/* Mobile-only: price summary + in-flow actions (above fixed dock) */}
              <div className="lg:hidden pb-28">
                <PriceSummary depositPercent={config.depositPercent} transportOptions={transportOptions} experienceTitle={config.title} isDayTrip={isDayTrip} />
                <ConfirmationAction config={config} whatsappLink={whatsappLink} paymentLocked={paymentLocked} onCheckoutStarted={trackCheckout} />
              </div>
            </div>

            {/* ── Right column: sticky sidebar (desktop only) ── */}
            <aside className="hidden lg:block lg:sticky lg:top-20 space-y-0 pb-6">
              <PriceSummary depositPercent={config.depositPercent} transportOptions={transportOptions} experienceTitle={config.title} isDayTrip={isDayTrip} />
              <ConfirmationAction config={config} whatsappLink={whatsappLink} paymentLocked={paymentLocked} onCheckoutStarted={trackCheckout} />
            </aside>
          </div>
        </div>

        {/* Mobile: fixed floating dock — scroll-activated, handles payment CTA */}
        <MobileStickyDock
          config={config}
          transportOptions={transportOptions}
          paymentLocked={paymentLocked}
          onCheckoutStarted={trackCheckout}
        />
      </div>
      </ExperienceReservationProvider>
    </ExperienceDetailProvider>
  );
}
