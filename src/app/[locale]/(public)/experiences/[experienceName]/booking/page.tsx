import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { SITE_INFO } from '@/constant/SiteConfig';
import ExperienceReservationPage from '../ExperienceReservationPage';
import {
  getExperienceByNameSSR,
  getExperienceDataSSR,
  getExperiencePathListSSR,
} from '@/lib/services/experiences-catalog.service';
import {
  buildExperiencePath,
  buildOgLocale,
  sanitizeLocale,
  SEO_SITE_URL,
  toAbsoluteUrl,
} from '@/utils/seoUrls';
import { parseBookingSearchParams, resolveSharedSelections } from '@/utils/helpers';
import { HeroPreload } from '@/components/ui/HeroPicture/HeroPreload';
import { MercadoPagoPaymentIdSchema, PaymentReferenceSchema } from '@/lib/schemas/payment.schema';

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

  // Booking is a transactional step, not a landing page: keep it out of the index.
  const robots = { index: false, follow: true };

  if (!experience) {
    const t = await getTranslations({ locale, namespace: 'Home' });
    return {
      title: t('metaTitle'),
      description: t('metaDescription'),
      robots,
    };
  }

  const t = await getTranslations({ locale });
  const experienceData = await getExperienceDataSSR(experienceName, locale);
  // Canonical points at the indexable detail page; noindex pages get no hreflang.
  const canonicalUrl = `${SEO_SITE_URL}${buildExperiencePath(locale, experienceName)}`;
  const heroImageUrl = experienceData.heroContent?.backgroundImageUrl;
  const imageUrl = heroImageUrl ? toAbsoluteUrl(heroImageUrl) : undefined;
  // Shared booking links must read as a booking, not as a copy of the tour page.
  const title = t('BookingShare.title', { title: experienceData.config.title });
  const description = t('BookingShare.description');

  return {
    title,
    description,
    robots,
    alternates: {
      canonical: canonicalUrl,
    },
    // No `og:url`: platforms then use the exact shared URL, so a clicked card
    // opens the booking page with its tier/people/transport preselection.
    openGraph: {
      siteName: SITE_INFO.name,
      title,
      description,
      type: 'website',
      ...buildOgLocale(locale),
      images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
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
  const { selections: initialSelections, dateUnavailable } = resolveSharedSelections(
    parseBookingSearchParams(rawSearchParams),
    experienceData.availableDates,
    { minPeople: experienceData.config.minPeople, maxPeople: experienceData.config.maxPeople },
  );
  const heroImageUrl = experienceData.heroContent?.backgroundImageUrl;
  const paymentRef = PaymentReferenceSchema.safeParse(rawSearchParams.ref);
  const paymentId = MercadoPagoPaymentIdSchema.safeParse(rawSearchParams.payment_id);

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
      {heroImageUrl ? <HeroPreload src={heroImageUrl} /> : null}
      {tierThumbnailUrl && (
        <link rel="preload" as="image" href={tierThumbnailUrl} fetchPriority="high" />
      )}
      <ExperienceReservationPage
        experienceData={experienceData}
        initialSelections={initialSelections}
        sharedDateUnavailable={dateUnavailable}
        payment={paymentRef.success ? { reference: paymentRef.data, paymentId: paymentId.success ? paymentId.data : null } : null}
      />
    </>
  );
}
