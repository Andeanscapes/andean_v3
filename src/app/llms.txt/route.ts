import { getTranslations } from 'next-intl/server';
import { CONTACT_INFO, SITE_INFO, SOCIAL_LINKS } from '@/constant/SiteConfig';
import { getExperiencesCatalogSSR } from '@/lib/services/experiences-catalog.service';
import { buildAbsoluteLocalizedUrl, buildExperiencePath, SEO_SITE_URL } from '@/utils/seoUrls';

// Built from the catalog feed like `sitemap.ts`, so it shares its build-time
// freshness: a newly published experience appears after the next deploy.
export const dynamic = 'force-static';

// llms.txt (https://llmstxt.org) is a single English document by convention.
const LOCALE = 'en';

export async function GET(): Promise<Response> {
  const [t, catalog] = await Promise.all([
    getTranslations({ locale: LOCALE }),
    getExperiencesCatalogSSR(),
  ]);

  const experienceLines = await Promise.all(
    catalog.map(async ({ experienceName, metadataNamespace }) => {
      const tm = await getTranslations({ locale: LOCALE, namespace: metadataNamespace });
      const url = `${SEO_SITE_URL}${buildExperiencePath(LOCALE, experienceName)}`;
      return `- [${tm('metaTitle')}](${url}): ${tm('metaDescription')}`;
    }),
  );

  const body = [
    `# ${SITE_INFO.name}`,
    '',
    `> ${t('Home.metaDescription')}`,
    '',
    `## ${t('Seo.breadcrumbExperiences')}`,
    '',
    `- [${t('Seo.breadcrumbExperiences')}](${buildAbsoluteLocalizedUrl(LOCALE, '/experiences')})`,
    ...experienceLines,
    '',
    `## ${t('Seo.llmsContactHeading')}`,
    '',
    `- ${CONTACT_INFO.email}`,
    `- ${SOCIAL_LINKS.instagram}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
