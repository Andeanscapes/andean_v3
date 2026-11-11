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
import { GuideSections } from '@/components/Guide/GuideSections';
import { GuideSources } from '@/components/Guide/GuideSources';
import { EMERALDS_ROOT, emeraldPath, getEmeraldPageById } from '@/lib/content/emeralds.structure';
import { getEmeraldContentSSR } from '@/lib/services/emeralds.service';
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

  // Titles and descriptions come from Emerald World's own copy, so a renamed page updates here too.
  const emeraldLinks = await Promise.all(
    (guide.emeraldLinks ?? []).map(async (id) => {
      const page = getEmeraldPageById(id);
      if (!page) throw new Error(`[Guides] Unknown Emerald World page "${id}"`);
      const emeraldContent = await getEmeraldContentSSR(locale, page);
      return { href: emeraldPath(page), title: emeraldContent.title, description: emeraldContent.metaDescription };
    }),
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
          <GuideSections sections={content.sections} idPrefix="guide" />
          {emeraldLinks.length > 0 ? (
            <nav aria-labelledby="guide-emerald-world" className="mt-12 rounded-2xl bg-base-200/60 p-6">
              <h2 id="guide-emerald-world" className="text-lg font-bold">
                {ui('ui.emeraldWorldDeeper')}
              </h2>
              <ul className="mt-4 space-y-4">
                {emeraldLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {link.title}
                    </Link>
                    <p className="mt-1 text-sm leading-relaxed text-base-content/75">{link.description}</p>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <GuideSources title={ui('ui.sourcesTitle')} sources={guide.sources} headingId="guide-sources" />
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
        <p className="mt-8 text-sm leading-relaxed text-base-content/75">
          {ui('ui.emeraldWorldBody')}{' '}
          <Link
            href={EMERALDS_ROOT}
            className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {ui('ui.emeraldWorldCta')}
          </Link>
        </p>
      </nav>
    </>
  );
}
