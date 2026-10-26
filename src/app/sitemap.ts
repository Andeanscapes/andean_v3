import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { getExperiencePathListSSR } from '@/lib/services/experiences-catalog.service';
import { experiencePath } from '@/utils/experienceRoutes';
import { buildAbsoluteLocalizedUrl, buildLocalizedAlternates } from '@/utils/seoUrls';

/** Same URL set in every locale, so each entry lists all alternates (hreflang). */
function buildEntry(path: string, priority: number): MetadataRoute.Sitemap {
  const languages = buildLocalizedAlternates(path);

  return locales.map((locale) => ({
    url: buildAbsoluteLocalizedUrl(locale, path),
    changeFrequency: 'weekly',
    priority,
    alternates: { languages },
  }));
}

// Booking pages are noindex (see their metadata) and are intentionally absent here.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const experienceNames = await getExperiencePathListSSR();

  return [
    ...buildEntry('/', 1),
    ...buildEntry('/experiences', 0.9),
    ...experienceNames.flatMap((experienceName) =>
      buildEntry(experiencePath(experienceName), 0.9)
    ),
  ];
}
