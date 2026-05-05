'use client';

import { useEffect } from 'react';
import type { ExperienceData } from '@/lib/schemas';
import { ExperienceDetailProvider } from '@/contexts/ExperienceDetailContext';
import ExperienceHero from '@/components/ExperienceHero/ExperienceHero';
import ExpericeWidget from '@/components/ExpericeWidget/ExpericeWidget';
import ValuePropositions from '@/components/ValuePropositions/ValuePropositions';
import Inclusions from '@/components/Inclusions/Inclusions';
import AccommodationTiers from '@/components/AccommodationTiers/AccommodationTiers';
import Itinerary from '@/components/Itinerary/Itinerary';
import Host from '@/components/Host/Host';
import Faqs from '@/components/Faqs/Faqs';
import MobileStickyBookingBar from './MobileStickyBookingBar';

interface ExperienceDetailsPageProps {
  experienceData: ExperienceData;
}

export default function ExperienceDetailsPage({
  experienceData,
}: ExperienceDetailsPageProps) {
  const { config, heroContent } = experienceData;

  useEffect(() => {
    if (window.location.hash !== '#booking') return;

    const timeoutId = window.setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <ExperienceDetailProvider experienceData={experienceData}>
      <ExperienceHero
        title={heroContent?.title ?? config.title}
        subtitle={heroContent?.subtitle ?? config.subtitle}
        widget={(
          <div
            id="booking"
            className="scroll-mt-24 rounded-2xl border border-transparent transition-[box-shadow,border-color] duration-700 target:border-emerald-400/60 target:shadow-[0_0_45px_rgba(0,240,143,0.35)] target:[animation:booking-anchor-glow_1s_ease-out]"
          >
            <ExpericeWidget experienceData={experienceData} />
          </div>
        )}
        backgroundImageUrl={heroContent?.backgroundImageUrl}
      />
      <ValuePropositions experienceData={experienceData} />
      <Inclusions experienceData={experienceData} />
      <AccommodationTiers experienceData={experienceData} />
      <Itinerary experienceData={experienceData} sidebar={<Host experienceData={experienceData} />} />
      <Faqs experienceData={experienceData} />
      <MobileStickyBookingBar experienceData={experienceData} />
    </ExperienceDetailProvider>
  );
}
