import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { SITE_INFO } from '@/constant/SiteConfig';
import { GUIDES, getGuideBySlug, guidePath } from '@/lib/content/guides.structure';
import { getGuideContentSSR, getGuidesUiSSR } from '@/lib/services/guides.service';
import { getExperiencesListSSR } from '@/lib/services/experiences-list.service';
import { ExperienceCard } from '@/components/ExperienceList/ExperienceCard';
import { GuideHero } from '@/components/Guide/GuideHero';
import { GuideBreadcrumb } from '@/components/Guide/GuideBreadcrumb';
import { OperatorTrust } from '@/components/OperatorTrust/OperatorTrust';
import { formatMoney } from '@/utils/formatCurrency';
import { safeJsonLd } from '@/utils/jsonLd';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { buildArticleLd, buildBreadcrumbLd } from '@/utils/structuredData';
import {
  buildAbsoluteLocalizedUrl,
  buildLocalizedAlternates,
  buildOgLocale,
  sanitizeLocale,
  SEO_ORGANIZATION_ID,
} from '@/utils/seoUrls';

// Every locale × guide is prerendered; the related-tours feed revalidates on its own fetch TTL.
export function generateStaticParams() {
  return locales.flatMap((locale) => GUIDES.map((guide) => ({ locale, slug: guide.slug })));
}

type GuidePageParams = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: GuidePageParams): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  const locale = sanitizeLocale(localeParam);
  const content = await getGuideContentSSR(locale, guide);
  const path = guidePath(guide.slug);
  const canonical = buildAbsoluteLocalizedUrl(locale, path);
  const imageUrl = resolveMediaUrl(guide.image);

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical, languages: buildLocalizedAlternates(path) },
    openGraph: {
      siteName: SITE_INFO.name,
      title: content.metaTitle,
      description: content.metaDescription,
      url: canonical,
      type: 'article',
      ...buildOgLocale(locale),
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      images: [{ url: imageUrl, alt: content.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
      images: [imageUrl],
    },
  };
}

export default async function GuidePage({ params }: GuidePageParams) {
  const { locale: localeParam, slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const locale = sanitizeLocale(localeParam);
  setRequestLocale(locale);
  const [content, ui, tSeo, listData] = await Promise.all([
    getGuideContentSSR(locale, guide),
    getGuidesUiSSR(locale),
    getTranslations({ locale, namespace: 'Seo' }),
    getExperiencesListSSR(locale),
  ]);

  const path = guidePath(guide.slug);
  const pageUrl = buildAbsoluteLocalizedUrl(locale, path);
  const imageUrl = resolveMediaUrl(guide.image);
  const otherGuides = await Promise.all(
    GUIDES.filter((other) => other.slug !== guide.slug).map(async (other) => ({
      slug: other.slug,
      title: (await getGuideContentSSR(locale, other)).title,
    })),
  );

  const articleLd = buildArticleLd({
    headline: content.title,
    description: content.metaDescription,
    url: pageUrl,
    imageUrl,
    inLanguage: locale,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    organizationId: SEO_ORGANIZATION_ID,
    organizationName: SITE_INFO.name,
    citations: guide.sources,
  });
  const breadcrumbLd = buildBreadcrumbLd([
    { name: tSeo('breadcrumbHome'), url: buildAbsoluteLocalizedUrl(locale, '/') },
    { name: ui('ui.breadcrumbGuides'), url: buildAbsoluteLocalizedUrl(locale, guidePath()) },
    { name: content.title, url: pageUrl },
  ]);

  const updatedLabel = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(guide.updatedAt),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      <article>
        <GuideHero title={content.title} lead={content.lead} imageUrl={imageUrl}>
          <GuideBreadcrumb
            label={ui('ui.breadcrumbLabel')}
            items={[
              { label: tSeo('breadcrumbHome'), href: '/' },
              { label: ui('ui.breadcrumbGuides'), href: guidePath() },
              { label: content.title },
            ]}
          />
          <p className="mt-3 text-xs text-white/80 md:text-sm">
            {ui('ui.author')} · {ui('ui.updated')}{' '}
            <time dateTime={guide.updatedAt}>{updatedLabel}</time>
          </p>
        </GuideHero>

        <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14 lg:px-6">
          {content.sections.map((section) => (
            <section key={section.id} aria-labelledby={`guide-${section.id}`} className="mb-10 last:mb-0">
              <h2 id={`guide-${section.id}`} className="text-balance text-xl font-bold leading-tight md:text-3xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-relaxed text-base-content/85">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section aria-labelledby="guide-sources" className="mt-12 border-t border-base-content/10 pt-8">
            <h2 id="guide-sources" className="text-lg font-bold">
              {ui('ui.sourcesTitle')}
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-base-content/75">
              {guide.sources.map((source) => (
                <li key={source.label}>
                  {source.url ? (
                    <a
                      href={source.url}
                      rel="noopener noreferrer"
                      className="rounded-sm underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </article>

      <OperatorTrust />

      {listData.cards.length > 0 ? (
        <section aria-labelledby="guide-related-tours" className="bg-base-200/40 py-10 md:py-16">
          <div className="container mx-auto max-w-7xl px-4 lg:px-6">
            <h2 id="guide-related-tours" className="mb-6 text-balance text-xl font-bold md:text-3xl">
              {ui('ui.relatedToursTitle')}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
              {listData.cards.map((card) => (
                <ExperienceCard
                  key={card.id}
                  card={card}
                  fromLabel={listData.fromLabel}
                  viewDetailsLabel={listData.viewDetails}
                  formattedPrice={formatMoney(card.price, locale, card.currency)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <nav aria-labelledby="guide-more" className="container mx-auto max-w-3xl px-4 py-10 md:py-14 lg:px-6">
        <h2 id="guide-more" className="text-lg font-bold">
          {ui('ui.moreGuidesTitle')}
        </h2>
        <ul className="mt-4 space-y-2">
          {otherGuides.map((other) => (
            <li key={other.slug}>
              <Link
                href={guidePath(other.slug)}
                className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {other.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
