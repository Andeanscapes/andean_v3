import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ExperienceDetailsPage from './ExperienceDetailsPage';
import {
  getExperienceByNameSSR,
  getExperienceDataSSR,
  getExperiencePathListSSR,
} from '@/lib/services/experiences-catalog.service';
import { safeJsonLd } from '@/utils/jsonLd';
import {
  buildExperienceAlternates,
  buildExperiencePath,
  sanitizeLocale,
  SEO_SITE_URL,
  toAbsoluteUrl,
} from './seo';

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
  const imageUrl = toAbsoluteUrl(
    experienceData.heroContent?.backgroundImageUrl ??
      '/assets/images/hero/h10.webp'
  );
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
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
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
  const imageUrl = toAbsoluteUrl(
    experienceData.heroContent?.backgroundImageUrl ??
      '/assets/images/hero/h10.webp'
  );

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: experienceData.config.title,
    description: experienceData.config.description,
    image: [imageUrl],
    brand: {
      '@type': 'Brand',
      name: 'Andean Scapes',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'COP',
      price: experienceData.config.experiencePricePerPerson,
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productStructuredData) }}
      />
      <ExperienceDetailsPage experienceData={experienceData} />
    </>
  );
}
