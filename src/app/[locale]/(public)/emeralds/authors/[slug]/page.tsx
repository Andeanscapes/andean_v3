import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { SITE_INFO } from '@/constant/SiteConfig';
import {
  EMERALD_AUTHORS,
  EMERALD_PAGES,
  EMERALDS_ROOT,
  emeraldAuthorPath,
  emeraldPath,
  getEmeraldAuthorBySlug,
  getEmeraldPageById,
} from '@/lib/content/emeralds.structure';
import { getEmeraldAuthorCopySSR, getEmeraldContentSSR, getEmeraldsUiSSR } from '@/lib/services/emeralds.service';
import { GuideHero } from '@/components/Guide/GuideHero';
import { GuideBreadcrumb } from '@/components/Guide/GuideBreadcrumb';
import { safeJsonLd } from '@/utils/jsonLd';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { buildBreadcrumbLd, buildPersonLd } from '@/utils/structuredData';
import {
  buildAbsoluteLocalizedUrl,
  buildLocalizedAlternates,
  buildOgLocale,
  sanitizeLocale,
  SEO_ORGANIZATION_ID,
} from '@/utils/seoUrls';

// Only registered authors exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => EMERALD_AUTHORS.map((author) => ({ locale, slug: author.slug })));
}

type AuthorPageParams = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: AuthorPageParams): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const author = getEmeraldAuthorBySlug(slug);
  if (!author) return {};

  const locale = sanitizeLocale(localeParam);
  const copy = await getEmeraldAuthorCopySSR(locale, author.id);
  const path = emeraldAuthorPath(author);

  return {
    title: `${author.name} · ${SITE_INFO.name}`,
    description: copy.bio,
    alternates: { canonical: buildAbsoluteLocalizedUrl(locale, path), languages: buildLocalizedAlternates(path) },
    openGraph: {
      siteName: SITE_INFO.name,
      title: author.name,
      description: copy.bio,
      type: 'profile',
      ...buildOgLocale(locale),
      ...(author.image ? { images: [{ url: resolveMediaUrl(author.image), alt: author.name }] } : {}),
    },
  };
}

export default async function EmeraldAuthorPage({ params }: AuthorPageParams) {
  const { locale: localeParam, slug } = await params;
  const author = getEmeraldAuthorBySlug(slug);
  if (!author) notFound();

  const locale = sanitizeLocale(localeParam);
  setRequestLocale(locale);
  const hub = getEmeraldPageById('hub');
  if (!hub) notFound();

  const written = EMERALD_PAGES.filter((page) => page.authorId === author.id);
  const [copy, ui, tSeo, writtenContent] = await Promise.all([
    getEmeraldAuthorCopySSR(locale, author.id),
    getEmeraldsUiSSR(locale),
    getTranslations({ locale, namespace: 'Seo' }),
    Promise.all(written.map((page) => getEmeraldContentSSR(locale, page))),
  ]);
  const pageUrl = buildAbsoluteLocalizedUrl(locale, emeraldAuthorPath(author));

  const personLd = buildPersonLd({
    name: author.name,
    url: pageUrl,
    jobTitle: copy.jobTitle,
    description: copy.bio,
    imageUrl: author.image ? resolveMediaUrl(author.image) : undefined,
    sameAs: author.sameAs,
    organizationId: SEO_ORGANIZATION_ID,
  });
  const breadcrumbLd = buildBreadcrumbLd([
    { name: tSeo('breadcrumbHome'), url: buildAbsoluteLocalizedUrl(locale, '/') },
    { name: ui('ui.breadcrumbEmeralds'), url: buildAbsoluteLocalizedUrl(locale, EMERALDS_ROOT) },
    { name: author.name, url: pageUrl },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      <GuideHero title={author.name} lead={copy.jobTitle} imageUrl={resolveMediaUrl(hub.image)}>
        <GuideBreadcrumb
          label={ui('ui.breadcrumbLabel')}
          items={[
            { label: tSeo('breadcrumbHome'), href: '/' },
            { label: ui('ui.breadcrumbEmeralds'), href: EMERALDS_ROOT },
            { label: author.name },
          ]}
        />
      </GuideHero>

      <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14 lg:px-6">
        <p className="text-base leading-relaxed text-base-content/85">{copy.bio}</p>
        {written.length > 0 ? (
          <section aria-labelledby="author-pages" className="mt-10">
            <h2 id="author-pages" className="text-xl font-bold">
              {ui('ui.authorPagesTitle')}
            </h2>
            <ul className="mt-4 space-y-2">
              {written.map((page, index) => (
                <li key={page.id}>
                  <Link
                    href={emeraldPath(page)}
                    className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {writtenContent[index].title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
