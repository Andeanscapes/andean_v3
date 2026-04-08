import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ExperienceReservationPage from '../ExperienceReservationPage';
import {
  getExperienceByNameSSR,
  getExperienceDataSSR,
  getExperiencePathListSSR,
} from '@/lib/services/experiences-catalog.service';

export async function generateStaticParams() {
  const experienceNames = await getExperiencePathListSSR();
  return experienceNames.map((experienceName) => ({ experienceName }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; experienceName: string }>;
}): Promise<Metadata> {
  const { locale, experienceName } = await params;
  const experience = await getExperienceByNameSSR(experienceName);

  if (!experience) {
    return {
      title: 'Andean Scapes',
      description: 'Reserva experiencias eco-turisticas en los Andes colombianos',
    };
  }

  const t = await getTranslations({ locale, namespace: experience.metadataNamespace });

  return {
    title: t('metaTitle') || 'Andean Scapes',
    description: t('metaDescription') || 'Reserva tu experiencia en Andean Scapes',
    openGraph: {
      title: t('metaTitle') || 'Andean Scapes',
      description: t('metaDescription') || 'Reserva tu experiencia en Andean Scapes',
      url: `https://andeanscapes.com/experiences/${experienceName}/booking`,
    },
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string; experienceName: string }>;
}) {
  const { locale, experienceName } = await params;
  const experience = await getExperienceByNameSSR(experienceName);

  if (!experience) {
    notFound();
  }

  const experienceData = await getExperienceDataSSR(experienceName, locale);

  return <ExperienceReservationPage experienceData={experienceData} />;
}