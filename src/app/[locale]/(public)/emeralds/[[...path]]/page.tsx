import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { SITE_INFO } from '@/constant/SiteConfig';
import {
  EMERALD_PAGES,
  emeraldAuthorPath,
  emeraldPath,
  getEmeraldAuthorById,
  getEmeraldPageById,
  getEmeraldPageBySegments,
  getEmeraldPillars,
  getEmeraldSiblings,
  getEmeraldTrail,
  type EmeraldPage,
  type EmeraldRelatedLink,
} from '@/lib/content/emeralds.structure';
import { getGuideBySlug, guidePath } from '@/lib/content/guides.structure';
import type { SourceLanguage } from '@/lib/content/sources';
import {
  getEmeraldContentSSR,
  getEmeraldsUiSSR,
  type EmeraldSection,
} from '@/lib/services/emeralds.service';
import { getGuideContentSSR } from '@/lib/services/guides.service';
import { GuideHero } from '@/components/Guide/GuideHero';
import { GuideBreadcrumb } from '@/components/Guide/GuideBreadcrumb';
import { GuideFigure } from '@/components/Guide/GuideFigure';
import { GuideSections } from '@/components/Guide/GuideSections';
import { GuideSources } from '@/components/Guide/GuideSources';
import { BeltMap } from '@/components/Emeralds/BeltMap';
import { CitedText } from '@/components/Emeralds/CitedText';
import { ThreePhaseIllustration, TrapicheIllustration } from '@/components/Emeralds/CrystalIllustrations';
import { EmeraldPager, EmeraldSectionNav } from '@/components/Emeralds/EmeraldSectionNav';
import { EmeraldToc } from '@/components/Emeralds/EmeraldToc';
import { safeJsonLd } from '@/utils/jsonLd';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { buildArticleLd, buildBreadcrumbLd, buildCollectionPageLd, buildFaqLd } from '@/utils/structuredData';
import { toAboutLd } from '@/lib/content/emeraldEntities';
import { stripCitations } from '@/utils/citations';
import {
  buildAbsoluteLocalizedUrl,
  buildLocalizedAlternates,
  buildOgLocale,
  sanitizeLocale,
  SEO_ORGANIZATION_ID,
} from '@/utils/seoUrls';

const TOUR_GUIDE_SLUG = 'emerald-mine-tours-colombia';
const HEADING_PREFIX = 'emerald';
const SOURCE_ANCHOR = 'source';
const FAQ_HEADING_ID = 'emerald-faq';
const SOURCE_LANGUAGES: readonly SourceLanguage[] = locales;

// Every locale × page is prerendered from the registry and bundled copy.
export function generateStaticParams() {
  return locales.flatMap((locale) => EMERALD_PAGES.map((page) => ({ locale, path: [...page.segments] })));
}

type EmeraldPageParams = { params: Promise<{ locale: string; path?: string[] }> };
type Ui = Awaited<ReturnType<typeof getEmeraldsUiSSR>>;

async function resolvePage(params: EmeraldPageParams['params']) {
  const { locale: localeParam, path } = await params;
  return { locale: sanitizeLocale(localeParam), page: getEmeraldPageBySegments(path ?? []) };
}

/** Title, description and locale-free href of a related page, from its own copy. */
async function resolveRelated(locale: Locale, link: EmeraldRelatedLink) {
  if (link.type === 'guide') {
    const guide = getGuideBySlug(link.slug);
    if (!guide) throw new Error(`[Emeralds] Unknown related guide "${link.slug}"`);
    const content = await getGuideContentSSR(locale, guide);
    return { href: guidePath(guide.slug), title: content.title, description: content.metaDescription };
  }
  const page = getEmeraldPageById(link.id);
  if (!page) throw new Error(`[Emeralds] Unknown related page "${link.id}"`);
  const content = await getEmeraldContentSSR(locale, page);
  return { href: emeraldPath(page), title: content.title, description: content.metaDescription };
}

async function toPagerLink(locale: Locale, page: EmeraldPage | undefined) {
  if (!page) return undefined;
  return { href: emeraldPath(page), title: (await getEmeraldContentSSR(locale, page)).title };
}

/** Figure or illustration registered for a section; its alt text and caption come from the section copy. */
function renderMedia(page: EmeraldPage, section: EmeraldSection, ui: Ui) {
  const media = page.media?.[section.id];
  if (!media) return undefined;
  if (!section.figure) throw new Error(`[Emeralds] Section "${section.id}" of "${page.id}" has media but no figure copy`);
  const { alt, caption } = section.figure;

  if (media.type === 'figure') {
    return (
      <GuideFigure
        caption={caption}
        credit={`${media.credit} · ${media.license}`}
        licenseUrl={media.licenseUrl}
        image={{ src: resolveMediaUrl(media.src), alt }}
      />
    );
  }

  const credit = ui(`illustrations.${media.name}.credit`);
  if (media.name === 'beltMap') {
    return (
      <GuideFigure caption={caption} credit={credit}>
        <BeltMap
          alt={alt}
          beltLabels={{ western: ui('illustrations.beltMap.western'), eastern: ui('illustrations.beltMap.eastern') }}
        />
      </GuideFigure>
    );
  }
  if (media.name === 'trapiche') {
    return (
      <GuideFigure caption={caption} credit={credit}>
        <TrapicheIllustration
          alt={alt}
          labels={{
            core: ui('illustrations.trapiche.core'),
            arm: ui('illustrations.trapiche.arm'),
            sector: ui('illustrations.trapiche.sector'),
          }}
        />
      </GuideFigure>
    );
  }
  return (
    <GuideFigure caption={caption} credit={credit}>
      <ThreePhaseIllustration
        alt={alt}
        labels={{
          liquid: ui('illustrations.threePhase.liquid'),
          gas: ui('illustrations.threePhase.gas'),
          crystal: ui('illustrations.threePhase.crystal'),
        }}
      />
    </GuideFigure>
  );
}

export async function generateMetadata({ params }: EmeraldPageParams): Promise<Metadata> {
  const { locale, page } = await resolvePage(params);
  if (!page) return {};

  const content = await getEmeraldContentSSR(locale, page);
  const path = emeraldPath(page);
  const canonical = buildAbsoluteLocalizedUrl(locale, path);
  const imageUrl = resolveMediaUrl(page.image);
  const isArticle = page.kind !== 'hub';

  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical, languages: buildLocalizedAlternates(path) },
    openGraph: {
      siteName: SITE_INFO.name,
      title: content.metaTitle,
      description: content.metaDescription,
      url: canonical,
      type: isArticle ? 'article' : 'website',
      ...buildOgLocale(locale),
      ...(isArticle ? { publishedTime: page.publishedAt, modifiedTime: page.updatedAt } : {}),
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

export default async function EmeraldWorldPage({ params }: EmeraldPageParams) {
  const { locale, page } = await resolvePage(params);
  if (!page) notFound();

  setRequestLocale(locale);
  const trail = getEmeraldTrail(page);
  const pillars = getEmeraldPillars();
  const siblings = getEmeraldSiblings(page);
  const author = page.authorId ? getEmeraldAuthorById(page.authorId) : undefined;
  const [content, ui, tSeo, trailContent, related, pillarContent, previous, next] = await Promise.all([
    getEmeraldContentSSR(locale, page),
    getEmeraldsUiSSR(locale),
    getTranslations({ locale, namespace: 'Seo' }),
    Promise.all(trail.map((item) => getEmeraldContentSSR(locale, item))),
    Promise.all(page.related.map((link) => resolveRelated(locale, link))),
    Promise.all(pillars.map((pillar) => getEmeraldContentSSR(locale, pillar))),
    toPagerLink(locale, siblings.previous),
    toPagerLink(locale, siblings.next),
  ]);

  const pageUrl = buildAbsoluteLocalizedUrl(locale, emeraldPath(page));
  const imageUrl = resolveMediaUrl(page.image);
  const tourGuide = page.commercial === 'contextual' ? getGuideBySlug(TOUR_GUIDE_SLUG) : undefined;
  const sourceNumbers = new Map(page.sources.map((source, index) => [source.id, index + 1]));
  const languageNotes = Object.fromEntries(
    SOURCE_LANGUAGES.filter((language) => language !== locale).map((language) => [language, ui(`ui.sourceLanguage.${language}`)]),
  );
  const renderText = (text: string) => (
    <CitedText
      text={text}
      sourceNumbers={sourceNumbers}
      sourceLabel={(number) => ui('ui.sourceRef', { number })}
      anchorPrefix={SOURCE_ANCHOR}
    />
  );
  const sections = content.sections.map((section) => ({
    ...section,
    noteLabel: section.note && section.note !== 'editorial' ? ui(`notes.${section.note}`) : undefined,
    media: renderMedia(page, section, ui),
  }));
  const currentPillarId = trail.find((item) => item.kind === 'pillar')?.id;
  const navItems = pillars.map((pillar, index) => ({
    href: emeraldPath(pillar),
    label: pillarContent[index].navLabel ?? pillarContent[index].title,
    current: pillar.id === currentPillarId,
  }));

  // The hub's crumb reads "Emerald World"; deeper pages use their own titles.
  const crumbLabels = trail.map((item, index) => (item.kind === 'hub' ? ui('ui.breadcrumbEmeralds') : trailContent[index].title));
  const breadcrumbItems = [
    { label: tSeo('breadcrumbHome'), href: '/' },
    ...trail.map((item, index) => ({
      label: crumbLabels[index],
      href: item.id === page.id ? undefined : emeraldPath(item),
    })),
  ];
  const breadcrumbLd = buildBreadcrumbLd([
    { name: tSeo('breadcrumbHome'), url: buildAbsoluteLocalizedUrl(locale, '/') },
    ...trail.map((item, index) => ({
      name: crumbLabels[index],
      url: buildAbsoluteLocalizedUrl(locale, emeraldPath(item)),
    })),
  ]);

  const authorLink = author
    ? { name: author.name, url: buildAbsoluteLocalizedUrl(locale, emeraldAuthorPath(author)) }
    : undefined;
  const pageLd =
    page.kind === 'hub'
      ? buildCollectionPageLd({
          name: content.title,
          description: content.metaDescription,
          url: pageUrl,
          inLanguage: locale,
          organizationId: SEO_ORGANIZATION_ID,
          items: related.map((item) => ({ name: item.title, url: buildAbsoluteLocalizedUrl(locale, item.href) })),
          citations: page.sources,
          about: toAboutLd(page.about),
        })
      : buildArticleLd({
          headline: content.title,
          description: content.metaDescription,
          url: pageUrl,
          imageUrl,
          inLanguage: locale,
          datePublished: page.publishedAt,
          dateModified: page.updatedAt,
          organizationId: SEO_ORGANIZATION_ID,
          organizationName: SITE_INFO.name,
          author: authorLink,
          citations: page.sources,
          about: toAboutLd(page.about),
        });
  // Same questions the FAQ section renders, so markup matches visible content.
  const faqLd = content.faq
    ? buildFaqLd(content.faq.map((item) => ({ question: item.question, answer: stripCitations(item.answer) })))
    : undefined;
  const tocItems = [
    ...content.sections.map((section) => ({ id: `${HEADING_PREFIX}-${section.id}`, heading: section.heading })),
    ...(content.faq ? [{ id: FAQ_HEADING_ID, heading: ui('ui.faqTitle') }] : []),
  ];

  const updatedLabel = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(page.updatedAt),
  );
  const linkClassName =
    'rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(pageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} /> : null}

      <article>
        <GuideHero title={content.title} lead={content.lead} imageUrl={imageUrl}>
          <GuideBreadcrumb label={ui('ui.breadcrumbLabel')} items={breadcrumbItems} />
          <p className="mt-3 text-xs text-white/80 md:text-sm">
            {author ? (
              <Link href={emeraldAuthorPath(author)} className="rounded-sm underline underline-offset-4 hover:text-white">
                {author.name}
              </Link>
            ) : (
              ui('ui.author')
            )}{' '}
            · {ui('ui.updated')} <time dateTime={page.updatedAt}>{updatedLabel}</time>
          </p>
        </GuideHero>

        <EmeraldSectionNav label={ui('ui.sectionNavLabel')} items={navItems} />

        <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14 lg:grid lg:grid-cols-[13rem_minmax(0,48rem)] lg:gap-12 lg:px-6">
          <aside className="mb-10 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
            <EmeraldToc label={ui('ui.tocLabel')} items={tocItems} />
          </aside>

          <div>
            <GuideSections sections={sections} idPrefix={HEADING_PREFIX} renderText={renderText} />

            {content.faq ? (
              <section aria-labelledby={FAQ_HEADING_ID} className="mt-12 border-t border-base-content/10 pt-8">
                <h2 id={FAQ_HEADING_ID} className="scroll-mt-28 text-balance text-xl font-bold leading-tight md:text-3xl">
                  {ui('ui.faqTitle')}
                </h2>
                <dl className="mt-6 space-y-6">
                  {content.faq.map((item) => (
                    <div key={item.question}>
                      <dt className="text-lg font-semibold leading-snug">{item.question}</dt>
                      <dd className="mt-2 text-base leading-relaxed text-base-content/85">{renderText(item.answer)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {related.length > 0 ? (
              <nav aria-labelledby="emerald-related" className="mt-12 border-t border-base-content/10 pt-8">
                <h2 id="emerald-related" className="text-balance text-xl font-bold leading-tight md:text-2xl">
                  {ui('ui.relatedTitle')}
                </h2>
                <ul className="mt-6 space-y-6">
                  {related.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} prefetch={false} className={`${linkClassName} text-lg`}>
                        {item.title}
                      </Link>
                      <p className="mt-1 text-sm leading-relaxed text-base-content/75">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <EmeraldPager
              label={ui('ui.pagerLabel')}
              previousLabel={ui('ui.previous')}
              nextLabel={ui('ui.next')}
              previous={previous}
              next={next}
            />

            <GuideSources
              title={ui('ui.sourcesTitle')}
              sources={page.sources}
              headingId="emerald-sources"
              anchorPrefix={SOURCE_ANCHOR}
              languageNotes={languageNotes}
            />

            {tourGuide ? (
              <aside aria-labelledby="emerald-visit" className="mt-12 rounded-2xl bg-base-200/60 p-6">
                <h2 id="emerald-visit" className="text-lg font-bold">
                  {ui('ui.visitTitle')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-base-content/80">{ui('ui.visitBody')}</p>
                <Link href={guidePath(tourGuide.slug)} className={`${linkClassName} mt-4 inline-block`}>
                  {ui('ui.visitCta')}
                </Link>
              </aside>
            ) : null}
          </div>
        </div>
      </article>
    </>
  );
}
