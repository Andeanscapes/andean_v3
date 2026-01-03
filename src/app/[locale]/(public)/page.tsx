import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import type {Locale} from '@/i18n/routing';

import HeroTwo from "@/components/HomeDark/HeroTwo"
import VideoBanner from "@/components/HomeOne/VideoBannerOne"
import InstagramFeed from "@/components/layout/InstagramFeed"

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

const HomeOne = () => {
    return (
        <main className="bg-[#121316]">
            <>
            <HeroTwo/>
            <VideoBanner/>
            <InstagramFeed/>
            </>
        </main>
      )
}

export default HomeOne;