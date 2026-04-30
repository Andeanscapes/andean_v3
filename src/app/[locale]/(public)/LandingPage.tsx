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

interface LandingPageProps {
  landingData: LandingContent;
}

function LandingPageComponent({ landingData }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <LandingHeroBrand hero={landingData.heroBrand} />
      <LandingCategories categories={landingData.categories} />
      <LandingFeaturedExperiences featured={landingData.featuredExperiences} />
      <LandingWhyUs whyUs={landingData.whyUs} />
      <LandingHowItWorks howItWorks={landingData.howItWorks} />
      <LandingTravelerSegments travelerSegments={landingData.travelerSegments} />
      <LandingTrustStats trustStats={landingData.trustStats} />
      <LandingLocation locationBrand={landingData.locationBrand} />
      <LandingSafety safety={landingData.safety} />
      <Reviews landingData={landingData} />
      <LandingFaqs landingData={landingData} />
      <FinalCtaBanner landingData={landingData} />
      <LandingMobileSticky landingData={landingData} brandCtas={landingData.globalCtas} />
      <FloatingWhatsApp
        href={landingData.globalCtas.whatsappHref}
        ariaLabel={landingData.globalCtas.whatsappLabel}
      />
    </main>
  );
}

LandingPageComponent.displayName = 'LandingPage';

export default memo(LandingPageComponent);
