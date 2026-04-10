import type { ExperienceData } from '@/lib/schemas';
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

  return (
    <>
      <ExperienceHero
        title={heroContent?.title ?? config.title}
        subtitle={heroContent?.subtitle ?? config.subtitle}
        widget={<ExpericeWidget experienceData={experienceData} />}
      />
      <ValuePropositions experienceData={experienceData} />
      <Inclusions experienceData={experienceData} />
      <AccommodationTiers experienceData={experienceData} />
      <Itinerary experienceData={experienceData} sidebar={<Host experienceData={experienceData} />} />
      <Faqs experienceData={experienceData} />
      <MobileStickyBookingBar experienceData={experienceData} />
    </>
  );
}