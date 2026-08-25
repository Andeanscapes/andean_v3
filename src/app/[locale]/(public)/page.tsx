import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { locales } from '@/i18n/routing';
import { getLandingDataSSR } from '@/lib/services/landing.service';
import { safeJsonLd } from '@/utils/jsonLd';
import LandingPage from './LandingPage';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.andean-scapes.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });

  const path = locale === 'en' ? '/' : `/${locale}`;
  const canonical = `${SITE_URL}${path}`;

  // Build hreflang alternates for every supported locale.
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}${l === 'en' ? '/' : `/${l}`}`]),
  );

  return {
    metadataBase: new URL(SITE_URL),
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical, languages },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: canonical,
      siteName: 'Andean Scapes',
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
    keywords: [
      'Andean Scapes',
      'tour',
      'travel',
      'booking',
      'rental',
      'trip',
      'adventure',
      'nature',
      'emerald mines',
      'co-living',
      'vacation',
      'Colombia',
      'Boyaca',
      'digital nomads',
    ],
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const landingData = await getLandingDataSSR(locale);

  // Organization schema (brand-level, helps Google Knowledge Graph).
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Andean Scapes',
    url: SITE_URL,
    logo: `${SITE_URL}/assets/images/logo.png`,
    sameAs: [
      'https://www.instagram.com/andeanscapes',
      'https://www.facebook.com/andeanscapes',
    ],
  };

  // ItemList schema for landing categories (helps rich results).
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: landingData.categories.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      url: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListLd) }}
      />
      <LandingPage landingData={landingData} />
    </>
  );
}
