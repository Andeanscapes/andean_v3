import type { ExperienceData } from '@/lib/schemas';
import ExperienceHero from '@/components/ExperienceHero/ExperienceHero';
import ExpericeWidget from '@/components/ExpericeWidget/ExpericeWidget';
import ValuePropositions from '@/components/ValuePropositions/ValuePropositions';
import Inclusions from '@/components/Inclusions/Inclusions';
import Itinerary from '@/components/Itinerary/Itinerary';
import Host from '@/components/Host/Host';
import Faqs from '@/components/Faqs/Faqs';

interface ExperienceDetailsPageProps {
  experienceData: ExperienceData;
}

export default function ExperienceDetailsPage({
  experienceData,
}: ExperienceDetailsPageProps) {
  const { config } = experienceData;

  return (
    <>
      <ExperienceHero
        title={config.title}
        subtitle={config.subtitle}
        widget={<ExpericeWidget experienceData={experienceData} />}
      />
      <ValuePropositions />
      <Inclusions />
      <Itinerary />
      <Host />
      <Faqs />
    </>
  );
}
