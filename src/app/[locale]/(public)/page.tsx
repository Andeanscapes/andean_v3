import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';

import LandingSection from "@/components/LandingSection"

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: Locale}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Home'});

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
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
      'digital nomads'
    ]
  };
}

export default function Page() {
  return <LandingSection />
}