'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import type { LandingContent } from '@/lib/schemas/landing.schema';
import LandingHeroBrand from '@/components/LandingHeroBrand';
import LandingCategories from '@/components/LandingCategories';
import LandingFeaturedExperiences from '@/components/LandingFeaturedExperiences';
import LandingWhyUs from '@/components/LandingWhyUs';
import LandingHowItWorks from '@/components/LandingHowItWorks';

// Below-fold + interactive sections — lazy-loaded.
// Kept SSR-on so HTML still ships server-rendered (good for SEO + initial paint).
const LandingTravelerSegments = dynamic(
  () => import('@/components/LandingTravelerSegments'),
  { ssr: true },
);
const LandingTrustStats = dynamic(() => import('@/components/LandingTrustStats'), {
  ssr: true,
});
const LandingLocation = dynamic(() => import('@/components/LandingLocation'), {
  ssr: true,
});
const LandingSafety = dynamic(() => import('@/components/LandingSafety'), { ssr: true });
const Reviews = dynamic(() => import('@/components/Reviews'), { ssr: true });
const LandingFaqs = dynamic(() => import('@/components/LandingFaqs'), { ssr: true });
const FinalCtaBanner = dynamic(() => import('@/components/FinalCtaBanner'), { ssr: true });
const LandingMobileSticky = dynamic(
  () => import('@/components/LandingMobileSticky'),
  { ssr: false },
);
const FloatingWhatsApp = dynamic(() => import('@/components/ui/FloatingWhatsApp'), {
  ssr: false,
});

const BOOKING_ANCHOR = '#booking';

interface LandingPageProps {
  landingData: LandingContent;
}

function LandingPageComponent({ landingData }: LandingPageProps) {
  const flagship = landingData.flagship;

  const featuredStrings = {
    duration: landingData.featuredExperiences.items[0]?.duration ?? '',
    location: landingData.featuredExperiences.items[0]?.location ?? '',
    ...landingData.heroBrand.bookingCard,
  };
  const featuredBookingUrl = `${landingData.featuredExperiences.items[0]?.href ?? '/experiences/emerald-mining-adventure'}${BOOKING_ANCHOR}`;

  return (
    <div className="min-h-screen">
      <LandingHeroBrand
        hero={landingData.heroBrand}
        featuredExperience={flagship}
        featuredBookingUrl={featuredBookingUrl}
        featuredStrings={featuredStrings}
      />
      <LandingFeaturedExperiences featured={landingData.featuredExperiences} />
      <LandingCategories categories={landingData.categories} />
      <LandingWhyUs whyUs={landingData.whyUs} />
      <LandingSafety safety={landingData.safety} />
      <Reviews landingData={landingData} />
      <LandingHowItWorks howItWorks={landingData.howItWorks} />
      <LandingFaqs landingData={landingData} />
      <LandingTravelerSegments travelerSegments={landingData.travelerSegments} />
      <LandingTrustStats trustStats={landingData.trustStats} />
      <LandingLocation locationBrand={landingData.locationBrand} />
      <FinalCtaBanner landingData={landingData} />
      <LandingMobileSticky
        landingData={landingData}
        bookingHref={featuredBookingUrl}
        brandCtas={landingData.globalCtas}
      />
      <FloatingWhatsApp
        href={landingData.globalCtas.whatsappHref}
        ariaLabel={landingData.globalCtas.whatsappLabel}
      />
    </div>
  );
}

LandingPageComponent.displayName = 'LandingPage';

export default memo(LandingPageComponent);
