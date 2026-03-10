import type { Metadata } from 'next';
import { lazy, Suspense } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { ExperienceHero } from '@/components/ExperienceReservation/ExperienceHero';
import { getExperiencesListSSR } from '@/lib/services/experiences.service';

const ExperienceCardImage = lazy(() => import('@/components/ExperienceList/ExperienceCardImage'));

function ExperienceCardImageFallback() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl bg-base-200">
      <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-gradient-to-br from-base-200 via-base-300 to-base-200" />
    </div>
  );
}

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

      <section id="experiences-cards" className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-2xl md:text-3xl font-bold">{listData.sectionTitle}</h2>
          <p className="text-sm text-base-content/70">{listData.sectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {listData.cards.map((card) => (
            <Card key={card.id} padding="sm" className="overflow-hidden">
              <div className="relative">
                <Suspense fallback={<ExperienceCardImageFallback />}>
                  <ExperienceCardImage
                    src={card.image}
                    alt={card.title}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </Suspense>
                <div className="absolute left-3 top-3">
                  <Badge variant="secondary" size="sm" className="bg-base-100/90">
                    {card.tag}
                  </Badge>
                </div>
              </div>

              <div className="mt-5 flex h-[280px] flex-col">
                <h3 className="text-lg font-semibold leading-relaxed text-primary">{card.title}</h3>
                <p className="mt-3 line-clamp-4 text-sm text-primary/90">{card.description}</p>

                <div className="mt-auto pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-base-content/60">{listData.fromLabel}</span>
                    <span className="text-base font-bold">{currencyFormatter.format(card.price)}</span>
                  </div>

                  <div className="mb-3 text-xs text-base-content/60">{card.trust}</div>

                  <Link
                    href={card.href}
                    className="btn btn-primary btn-sm w-full"
                  >
                    {listData.viewDetails}
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
