import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SITE_INFO } from '@/constant/SiteConfig';
import { safeJsonLd } from '@/utils/jsonLd';
import { buildBreadcrumbLd, buildItemListLd } from '@/utils/structuredData';
import { ExperienceHero } from '@/components/ExperienceReservation/ExperienceHero';
import { ExperienceCard } from '@/components/ExperienceList/ExperienceCard';
import { getExperiencesListSSR } from '@/lib/services/experiences-list.service';
import { formatMoney } from '@/utils/formatCurrency';
import { buildAbsoluteLocalizedUrl, buildLocalizedAlternates, buildOgLocale, toAbsoluteUrl } from '@/utils/seoUrls';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const listData = await getExperiencesListSSR(locale);
  const canonical = buildAbsoluteLocalizedUrl(locale, '/experiences');
  const languages = buildLocalizedAlternates('/experiences');
  const heroImage = listData.hero.backgroundImageUrl;
  const imageUrl = heroImage ? toAbsoluteUrl(heroImage) : undefined;

  return {
    title: listData.metaTitle,
    description: listData.metaDescription,
    alternates: { canonical, languages },
    openGraph: {
      siteName: SITE_INFO.name,
      title: listData.metaTitle,
      description: listData.metaDescription,
      url: canonical,
      type: 'website',
      ...buildOgLocale(locale),
      images: imageUrl
        ? [{ url: imageUrl, alt: listData.metaTitle }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: listData.metaTitle,
      description: listData.metaDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ExperiencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const listData = await getExperiencesListSSR(locale);
  const t = await getTranslations({ locale, namespace: 'Seo' });
  const pageUrl = buildAbsoluteLocalizedUrl(locale, '/experiences');

  // Same cards and order the grid renders, so markup matches visible content.
  const itemListLd = buildItemListLd(
    listData.cards.map((card) => ({
      name: card.title,
      url: buildAbsoluteLocalizedUrl(locale, card.href),
    })),
  );
  const breadcrumbLd = buildBreadcrumbLd([
    { name: t('breadcrumbHome'), url: buildAbsoluteLocalizedUrl(locale, '/') },
    { name: t('breadcrumbExperiences'), url: pageUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <ExperienceHero content={listData.hero} />

      <section id="experiences-cards" className="bg-base-200/40 py-6 sm:py-10 md:py-20"><div className="container mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto w-full lg:max-w-6xl xl:max-w-7xl">
          <div className="mb-3 flex flex-col items-start gap-1 md:mb-6 md:flex-row md:items-center md:justify-between md:gap-3 lg:mb-7 lg:max-w-4xl lg:flex-col lg:items-start lg:justify-start lg:gap-2">
            <h2 className="text-balance text-md font-bold leading-tight sm:text-2md md:text-3xl">{listData.sectionTitle}</h2>
            <p className="max-w-[38ch] text-xs leading-snug text-base-content/70 md:max-w-none md:text-sm md:leading-normal lg:max-w-3xl">
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
              formattedPrice={formatMoney(card.price, locale, card.currency)}
            />
          ))}
          </div>
        </div>
      </div></section>
    </>
  );
}
