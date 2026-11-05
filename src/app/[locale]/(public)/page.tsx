import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import {
  BUSINESS_INFO,
  CONTACT_INFO,
  FOOTER_PHONE,
  REVIEW_LINKS,
  SITE_INFO,
  SOCIAL_LINKS,
} from '@/constant/SiteConfig';
import { getLandingDataSSR } from '@/lib/services/landing.service';
import { safeJsonLd } from '@/utils/jsonLd';
import { HeroPreload } from '@/components/ui/HeroPicture/HeroPreload';
import {
  buildAbsoluteLocalizedUrl,
  buildExperiencePath,
  buildLocalizedAlternates,
  buildOgLocale,
  SEO_ORGANIZATION_ID,
  toAbsoluteUrl,
} from '@/utils/seoUrls';
import {
  buildFaqLd,
  buildItemListLd,
  buildTravelAgencyLd,
  buildWebsiteLd,
} from '@/utils/structuredData';
import LandingPage from './LandingPage';

// The hero rotates per render (`pickHeroVariant` in landing.service), so this
// route must render on every request. In production the edge HTML cache
// (`src/lib/edge-cache.ts`) serves a render for its TTL, so visitors see the
// hero rotate once per TTL per data center. `[locale]` has no `generateStaticParams`
// today, so the route is already dynamic and this changes nothing yet — it is
// here to state the requirement, and to keep it true if locale prerendering is
// added later, which would otherwise freeze the rotation at build time.
export const dynamic = 'force-dynamic';

const SITE_URL = SITE_INFO.url;

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

  const canonical = buildAbsoluteLocalizedUrl(locale, '/');
  const languages = buildLocalizedAlternates('/');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical, languages },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: canonical,
      siteName: 'Andean Scapes',
      type: 'website',
      ...buildOgLocale(locale),
      images: [{ url: heroBrand.backgroundImage, alt: t('metaTitle') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: [heroBrand.backgroundImage],
    },
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

  const travelAgencyLd = buildTravelAgencyLd({
    id: SEO_ORGANIZATION_ID,
    name: SITE_INFO.name,
    legalName: BUSINESS_INFO.legalName,
    taxId: BUSINESS_INFO.taxId,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_INFO.logo}`,
    // Stable profile URLs only; a share/short link is not an entity identifier.
    sameAs: [SOCIAL_LINKS.instagram, REVIEW_LINKS.airbnb],
    email: CONTACT_INFO.email,
    telephone: `+${FOOTER_PHONE.phone}`,
    address: BUSINESS_INFO.legalAddress,
    operatingBase: BUSINESS_INFO.operatingBase,
    areaServed: BUSINESS_INFO.areaServed,
  });

  const websiteLd = buildWebsiteLd({ name: SITE_INFO.name, url: SITE_URL });

  // ItemList of the featured tours rendered on this page (each has its own URL).
  const itemListLd = buildItemListLd(
    landingData.featuredExperiences.items.map((item) => ({
      name: item.title,
      url: toAbsoluteUrl(buildExperiencePath(locale, item.experienceSlug)),
    })),
  );

  // Same FAQ items the <LandingFaqs> section renders, so markup matches visible content.
  const faqLd = buildFaqLd(
    landingData.faqs.items.map((item) => ({ question: item.question, answer: item.answer })),
  );

  return (
    <>
      <HeroPreload src={heroImageUrl} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(travelAgencyLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
      />
      <LandingPage landingData={landingData} />
    </>
  );
}
