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
    return {
      title: 'Andean Scapes',
      description: 'Reserva experiencias eco-turisticas en los Andes colombianos',
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
  const title = t('metaTitle') || 'Andean Scapes';
  const description = t('metaDescription') || 'Reserva tu experiencia en Andean Scapes';

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

  return <ExperienceReservationPage experienceData={experienceData} />;
}