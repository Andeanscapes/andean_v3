import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ExperienceDetailsPage from './ExperienceDetailsPage';
import {
  getExperienceByNameSSR,
  getExperienceDataSSR,
  getExperiencePathListSSR,
} from '@/lib/services/experiences-catalog.service';
import { getExperienceFaqKeys, SITE_INFO } from '@/constant/SiteConfig';
import { safeJsonLd } from '@/utils/jsonLd';
import {
  buildTouristTripLd,
  buildBreadcrumbLd,
  buildFaqLd,
} from '@/utils/structuredData';
import {
  buildAbsoluteLocalizedUrl,
  buildExperienceAlternates,
  buildExperiencePath,
  sanitizeLocale,
  SEO_SITE_URL,
  toAbsoluteUrl,
} from '@/utils/seoUrls';

export async function generateStaticParams() {
  const experienceNames = await getExperiencePathListSSR();
  return experienceNames.map((experienceName) => ({ experienceName }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; experienceName: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, experienceName } = await params;
  const locale = sanitizeLocale(localeParam);
  const experience = await getExperienceByNameSSR(experienceName);

  if (!experience) {
    const t = await getTranslations({ locale, namespace: 'Home' });
    return {
      title: t('metaTitle'),
      description: t('metaDescription'),
    };
  }

  const t = await getTranslations({ locale, namespace: experience.metadataNamespace });
  const experienceData = await getExperienceDataSSR(experienceName, locale);

  const localizedPath = buildExperiencePath(locale, experienceName);
  const canonicalUrl = `${SEO_SITE_URL}${localizedPath}`;
  const alternates = buildExperienceAlternates(experienceName);
  const heroImageUrl = experienceData.heroContent?.backgroundImageUrl;
  const imageUrl = heroImageUrl ? toAbsoluteUrl(heroImageUrl) : undefined;
  const title = t('metaTitle');
  const description = t('metaDescription');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternates,
    },
    openGraph: {
      siteName: SITE_INFO.name,
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string; experienceName: string }>;
}) {
  const { locale: localeParam, experienceName } = await params;
  const locale = sanitizeLocale(localeParam);
  const experience = await getExperienceByNameSSR(experienceName);

  if (!experience) {
    notFound();
  }

  const experienceData = await getExperienceDataSSR(experienceName, locale);
  const pageUrl = `${SEO_SITE_URL}${buildExperiencePath(locale, experienceName)}`;
  const heroImageUrl = experienceData.heroContent?.backgroundImageUrl;
  const imageUrl = heroImageUrl ? toAbsoluteUrl(heroImageUrl) : undefined;

  const t = await getTranslations({ locale });

  const { config } = experienceData;
  const tripStructuredData = buildTouristTripLd({
    name: config.title,
    description: config.description,
    url: pageUrl,
    imageUrl,
    price: config.experiencePricePerPerson,
    currency: config.currency,
    provider: { name: SITE_INFO.name, url: SITE_INFO.url },
    // The service already drops past/full departures (`filterCurrentAvailableDates`).
    availableStartDates: experienceData.availableDates.map((date) => date.startDate),
  });

  const breadcrumbStructuredData = buildBreadcrumbLd([
    { name: t('Seo.breadcrumbHome'), url: buildAbsoluteLocalizedUrl(locale, '/') },
    {
      name: t('Seo.breadcrumbExperiences'),
      url: buildAbsoluteLocalizedUrl(locale, '/experiences'),
    },
    { name: experienceData.config.title, url: pageUrl },
  ]);

  // Same keys the rendered <Faqs> section uses, so markup matches visible content.
  const faqStructuredData = buildFaqLd(
    getExperienceFaqKeys(experienceData.config.id).map((faq) => ({ question: t(faq.question), answer: t(faq.answer) })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(tripStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqStructuredData) }}
      />
      <ExperienceDetailsPage experienceData={experienceData} />
    </>
  );
}
