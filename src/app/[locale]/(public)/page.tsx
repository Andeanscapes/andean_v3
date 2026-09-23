import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { locales } from '@/i18n/routing';
import { SITE_INFO } from '@/constant/SiteConfig';
import { getLandingDataSSR } from '@/lib/services/landing.service';
import { safeJsonLd } from '@/utils/jsonLd';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';
import LandingPage from './LandingPage';

// The hero rotates per visit (`pickHeroVariant` in landing.service), so this
// route must render on every request. `[locale]` has no `generateStaticParams`
// today, so the route is already dynamic and this changes nothing yet — it is
// here to state the requirement, and to keep it true if locale prerendering is
// added later, which would otherwise freeze the rotation at build time.
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.andean-scapes.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Home' });

  // Safe to read the landing data here only because `getLandingDataSSR` is
  // wrapped in React `cache`: the page body calls it too, and the hero variant
  // is picked with `Math.random`, so an uncached second call would advertise a
  // different image to crawlers than the one the page actually renders.
  const { heroBrand } = await getLandingDataSSR(locale);

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
      images: [{ url: heroBrand.backgroundImage, alt: t('metaTitle') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: [heroBrand.backgroundImage],
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

  // The hero is the LCP element and its URL is only known after the per-request
  // variant pick, so it cannot be preloaded from static markup. Emitting the
  // links here lets the browser start the fetch from the document head instead
  // of discovering it once the client component tree renders.
  const heroImageUrl = landingData.heroBrand.backgroundImage;
  const heroImageUrlMobile = getResponsiveImageSrc(heroImageUrl).mobile;

  // Organization schema (brand-level, helps Google Knowledge Graph).
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Andean Scapes',
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_INFO.logo}`,
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
      {/* Responsive hero preloads — browser picks the matching media query */}
      <link
        rel="preload"
        as="image"
        href={heroImageUrlMobile}
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={heroImageUrl}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
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
