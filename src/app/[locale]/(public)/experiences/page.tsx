import type { Metadata } from 'next';
import { ExperienceHero } from '@/components/ExperienceReservation/ExperienceHero';
import { ExperienceCard } from '@/components/ExperienceList/ExperienceCard';
import { getExperiencesListSSR } from '@/lib/services/experiences.service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const listData = await getExperiencesListSSR(locale);

  return {
    title: listData.metaTitle,
    description: listData.metaDescription,
  };
}

export default async function ExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const listData = await getExperiencesListSSR(locale);

  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  return (
    <>
      <ExperienceHero content={listData.hero} />

      <section id="experiences-cards" className="container mx-auto max-w-7xl px-4 pb-8 pt-4 md:py-12 lg:px-6">
        <div className="mx-auto w-full lg:max-w-6xl xl:max-w-7xl">
          <div className="mb-3 flex flex-col items-start gap-1 md:mb-6 md:flex-row md:items-center md:justify-between md:gap-3 lg:mb-7 lg:max-w-4xl lg:flex-col lg:items-start lg:justify-start lg:gap-2">
            <h2 className="text-xl font-bold leading-tight md:text-3xl">{listData.sectionTitle}</h2>
            <p className="max-w-[38ch] text-xs leading-snug text-base-content/60 md:max-w-none md:text-sm md:leading-normal md:text-base-content/70 lg:max-w-3xl">
              {listData.sectionSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {listData.cards.map((card) => (
            <ExperienceCard
              key={card.id}
              card={card}
              fromLabel={listData.fromLabel}
              viewDetailsLabel={listData.viewDetails}
              formattedPrice={currencyFormatter.format(card.price)}
            />
          ))}
          </div>
        </div>
      </section>
    </>
  );
}
