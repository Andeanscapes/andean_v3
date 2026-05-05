import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ExperienceReservationPage from '../ExperienceReservationPage';
import {
  getExperienceByNameSSR,
  getExperienceDataSSR,
  getExperiencePathListSSR,
} from '@/lib/services/experiences-catalog.service';
import {
  buildExperienceAlternates,
  buildExperiencePath,
  sanitizeLocale,
  SEO_SITE_URL,
  toAbsoluteUrl,
} from '../seo';
import { parseBookingSearchParams } from '@/utils/helpers';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

// searchParams requires dynamic rendering — opt out of static prerendering
export const dynamic = 'force-dynamic';

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
  const localizedPath = buildExperiencePath(locale, experienceName, '/booking');
  const canonicalUrl = `${SEO_SITE_URL}${localizedPath}`;
  const alternates = buildExperienceAlternates(experienceName, '/booking');
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

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; experienceName: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam, experienceName } = await params;
  const locale = sanitizeLocale(localeParam);

  const experience = await getExperienceByNameSSR(experienceName);

  if (!experience) {
    notFound();
  }

  const experienceData = await getExperienceDataSSR(experienceName, locale);
  const rawSearchParams = await searchParams;
  const initialSelections = parseBookingSearchParams(rawSearchParams);
  const heroImageUrl =
    experienceData.heroContent?.backgroundImageUrl ?? '/assets/images/hero/h10.webp';
  const heroImageUrlMobile = getResponsiveImageSrc(heroImageUrl).mobile;

  // If a tier is pre-selected via URL params, preload its thumbnail so the
  // browser fetches it alongside the hero — avoids an LCP image discovered
  // only after React hydrates and the context HYDRATE action fires.
  const matchedTierImages = initialSelections?.tier
    ? experienceData.accommodationTiersContent?.tiers.find(
        (t) => t.id === initialSelections.tier
      )?.images
    : undefined;
  const tierThumbnailUrl = matchedTierImages?.thumbnail ?? matchedTierImages?.main;

  return (
    <>
      {/* Responsive hero preloads — browser picks the matching media query */}
      <link rel="preload" as="image" href={heroImageUrlMobile} media="(max-width: 767px)" fetchPriority="high" />
      <link rel="preload" as="image" href={heroImageUrl} media="(min-width: 768px)" fetchPriority="high" />
      {tierThumbnailUrl && (
        <link rel="preload" as="image" href={tierThumbnailUrl} fetchPriority="high" />
      )}
      <ExperienceReservationPage
        experienceData={experienceData}
        initialSelections={initialSelections}
      />
    </>
  );
}
