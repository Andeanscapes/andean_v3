import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { SITE_INFO } from '@/constant/SiteConfig';
import { GUIDES, guidePath } from '@/lib/content/guides.structure';
import { EMERALDS_ROOT } from '@/lib/content/emeralds.structure';
import { getGuideContentSSR, getGuidesUiSSR } from '@/lib/services/guides.service';
import { Card } from '@/components/ui/Card/Card';
import ExperienceCardImage from '@/components/ExperienceList/ExperienceCardImage';
import { GuideHero } from '@/components/Guide/GuideHero';
import { GuideBreadcrumb } from '@/components/Guide/GuideBreadcrumb';
import { safeJsonLd } from '@/utils/jsonLd';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { buildBreadcrumbLd, buildItemListLd } from '@/utils/structuredData';
import { buildAbsoluteLocalizedUrl, buildLocalizedAlternates, buildOgLocale, sanitizeLocale } from '@/utils/seoUrls';

type GuidesHubParams = { params: Promise<{ locale: string }> };

// Copy and registry are build-time data, so the hub is prerendered per locale.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: GuidesHubParams): Promise<Metadata> {
  const locale = sanitizeLocale((await params).locale);
  const ui = await getGuidesUiSSR(locale);
  const canonical = buildAbsoluteLocalizedUrl(locale, guidePath());
  const imageUrl = resolveMediaUrl(GUIDES[0].image);

  return {
    title: ui('hub.metaTitle'),
    description: ui('hub.metaDescription'),
    alternates: { canonical, languages: buildLocalizedAlternates(guidePath()) },
    openGraph: {
      siteName: SITE_INFO.name,
      title: ui('hub.metaTitle'),
      description: ui('hub.metaDescription'),
      url: canonical,
      type: 'website',
      ...buildOgLocale(locale),
      images: [{ url: imageUrl, alt: ui('hub.imageAlt') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ui('hub.metaTitle'),
      description: ui('hub.metaDescription'),
      images: [imageUrl],
    },
  };
}

export default async function GuidesHubPage({ params }: GuidesHubParams) {
  const locale = sanitizeLocale((await params).locale);
  setRequestLocale(locale);
  const [ui, tSeo] = await Promise.all([
    getGuidesUiSSR(locale),
    getTranslations({ locale, namespace: 'Seo' }),
  ]);
  const guides = await Promise.all(
    GUIDES.map(async (guide) => ({ guide, content: await getGuideContentSSR(locale, guide) })),
  );
  const hubUrl = buildAbsoluteLocalizedUrl(locale, guidePath());

  const itemListLd = buildItemListLd(
    guides.map(({ guide, content }) => ({
      name: content.title,
      url: buildAbsoluteLocalizedUrl(locale, guidePath(guide.slug)),
    })),
  );
  const breadcrumbLd = buildBreadcrumbLd([
    { name: tSeo('breadcrumbHome'), url: buildAbsoluteLocalizedUrl(locale, '/') },
    { name: ui('ui.breadcrumbGuides'), url: hubUrl },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      <GuideHero
        title={ui('hub.title')}
        lead={ui('hub.lead')}
        imageUrl={resolveMediaUrl(GUIDES[0].image)}
      >
        <GuideBreadcrumb
          label={ui('ui.breadcrumbLabel')}
          items={[{ label: tSeo('breadcrumbHome'), href: '/' }, { label: ui('ui.breadcrumbGuides') }]}
        />
      </GuideHero>

      <section aria-label={ui('hub.title')} className="container mx-auto max-w-5xl px-4 py-10 md:py-16 lg:px-6">
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {guides.map(({ guide, content }) => (
            <li key={guide.slug}>
              <Card padding="sm" className="h-full">
                <ExperienceCardImage
                  src={resolveMediaUrl(guide.cardImage)}
                  alt=""
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <article className="flex flex-1 flex-col px-2 pb-2 pt-4">
                  <h2 className="text-balance text-lg font-bold leading-snug">{content.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-base-content/75">{content.metaDescription}</p>
                  <Link
                    href={guidePath(guide.slug)}
                    className="mt-4 self-start rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {ui('hub.readGuide')}
                    <span className="sr-only">: {content.title}</span>
                  </Link>
                </article>
              </Card>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm leading-relaxed text-base-content/75 md:text-base">
          {ui('ui.emeraldWorldBody')}{' '}
          <Link
            href={EMERALDS_ROOT}
            className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {ui('ui.emeraldWorldCta')}
          </Link>
        </p>
      </section>
    </>
  );
}
