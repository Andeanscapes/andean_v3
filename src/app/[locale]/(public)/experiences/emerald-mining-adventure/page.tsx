import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import MiningAdventureReservation from './MiningAdventureReservation';
import { getExperienceDataSSR } from '@/lib/services/experiences.service';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'EmeraldMiningAdventure' });

  return {
    title: t('metaTitle') || 'Aventura Esmeralera - Andean Scapes',
    description:
      t('metaDescription') ||
      'Reserva tu aventura minera 2D/1N en Hacienda El Recuerdo, Chivor, Boyacá',
    openGraph: {
      title: t('metaTitle') || 'Aventura Esmeralera',
      description:
        t('metaDescription') ||
        'Explora las minas de esmeralda del Chivor en una experiencia única',
      url: 'https://andeanscapes.com/experiences/emerald-mining-adventure',
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Fetch experience data server-side with translations
  const experienceData = await getExperienceDataSSR('emeraldMining', locale);

  return <MiningAdventureReservation experienceData={experienceData} />;
}
