import type { MetadataRoute } from 'next';
import { getExperiencePathListSSR } from '@/lib/services/experiences-catalog.service';

const SITE_URL = 'https://andeanscapes.com';
const LOCALES = ['en', 'es', 'fr'] as const;

function withLocale(locale: (typeof LOCALES)[number], path: string) {
  return locale === 'en' ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const experienceNames = await getExperiencePathListSSR();

  const staticPaths = ['/', '/experiences'];

  const staticEntries = LOCALES.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: withLocale(locale, path),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.9,
    }))
  );

  const experienceEntries = LOCALES.flatMap((locale) =>
    experienceNames.flatMap((experienceName) => {
      const detailPath = `/experiences/${experienceName}`;
      const bookingPath = `${detailPath}/booking`;

      return [
        {
          url: withLocale(locale, detailPath),
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        },
        {
          url: withLocale(locale, bookingPath),
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
      ];
    })
  );

  return [...staticEntries, ...experienceEntries];
}
