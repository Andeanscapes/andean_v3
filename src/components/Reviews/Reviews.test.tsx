/**
 * Review cards link to the public Airbnb listing as proof.
 *
 * Content is built by the real service from the live-feed snapshot
 * (src/test/fixtures), with `fetch` stubbed, so the suite stays offline and
 * exercises feed → adapter → translator → component end to end.
 */

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider, createTranslator } from 'next-intl';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';

const MESSAGES = { en, es, fr } as const;
type Locale = keyof typeof MESSAGES;

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async ({ locale }: { locale: Locale }) =>
    createTranslator({ locale, messages: MESSAGES[locale] }),
  ),
}));

import Reviews from './Reviews';
import { getLandingDataSSR } from '@/lib/services/landing.service';
import { REVIEW_LINKS, REVIEW_PLATFORM_LINKS } from '@/constant/SiteConfig';
import { LANDING_FIXTURE, cloneFixture } from '@/test/fixtures';

async function renderReviews(locale: Locale = 'en') {
  const landingData = await getLandingDataSSR(locale);

  render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
      <Reviews landingData={landingData} />
    </NextIntlClientProvider>,
  );

  return landingData;
}

describe('Reviews source links', () => {
  beforeEach(() => {
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/services';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => cloneFixture(LANDING_FIXTURE) }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete process.env.REMOTE_DATA_BASE_URL;
  });

  it('links every verified review to the public Airbnb listing in a new tab', async () => {
    const { reviews } = await renderReviews();
    const verified = reviews.items.filter((item) => item.isVerified && item.verifiedExperience);
    const links = screen.getAllByRole('link', { name: /Verified Guest/ });

    expect(verified.length).toBeGreaterThan(0);
    expect(links).toHaveLength(verified.length);
    for (const link of links) {
      expect(link.getAttribute('href')).toBe(REVIEW_LINKS.airbnb);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  /** WCAG 2.5.3: the accessible name must contain the visible label. */
  it('keeps the visible text in the accessible name and announces the new tab', async () => {
    await renderReviews();
    const [link] = screen.getAllByRole('link', { name: /Verified Guest/ });

    expect(link.textContent).toContain(en.Landing.reviews.verifiedStay);
    expect(link.textContent).toContain(en.Landing.reviews.opensInNewTab);
  });

  it('labels the section and shows the rating source without a review count', async () => {
    const { reviews } = await renderReviews();
    const heading = screen.getByRole('heading', { level: 2, name: reviews.sectionTitle });

    expect(screen.getByRole('region', { name: reviews.sectionTitle })).toContainElement(heading);
    // No review count next to the rating: it read as a contradiction with "500+ travelers".
    expect(screen.getByText(reviews.ratingSource)).toBeInTheDocument();
    expect(reviews.ratingSource).not.toMatch(/\d/);
  });

  it.each(['en', 'es', 'fr'] as const)('uses headlines quoted verbatim from each review (%s)', async (locale) => {
    const { reviews } = await renderReviews(locale);
    const withHeadline = reviews.items.filter((item) => item.headline);

    expect(withHeadline.length).toBeGreaterThan(0);
    for (const item of withHeadline) {
      expect(item.comment).toContain(item.headline);
      expect(screen.getByRole('heading', { level: 3, name: `“${item.headline}”` })).toBeInTheDocument();
    }
  });

  it('renders a review without a mapped headline and without throwing', async () => {
    const landingData = await getLandingDataSSR('en');
    const [first, ...rest] = landingData.reviews.items;
    const data = {
      ...landingData,
      reviews: { ...landingData.reviews, items: [{ ...first, headline: undefined }, ...rest] },
    };

    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Reviews landingData={data} />
      </NextIntlClientProvider>,
    );

    expect(screen.getAllByRole('article')).toHaveLength(data.reviews.items.length);
    const cardHeadings = screen
      .getAllByRole('article')
      .flatMap((article) => within(article).queryAllByRole('heading', { level: 3 }));
    expect(cardHeadings).toHaveLength(data.reviews.items.filter((item) => item.headline).length);
  });

  it('clamps each review body and keeps the full text in the DOM', async () => {
    const { reviews } = await renderReviews();
    for (const review of reviews.items) {
      const body = screen.getByText(review.comment);
      expect(body.className).toContain('line-clamp-4');
    }
  });

  it('shows a neutral traveler mark with the platform badge, never initials', async () => {
    const { reviews } = await renderReviews();
    for (const article of screen.getAllByRole('article')) {
      const avatar = article.querySelector('footer > div');
      if (!avatar) throw new Error('avatar missing');
      expect(avatar.textContent).toBe('');
      expect(avatar.querySelector('svg')).not.toBeNull();
    }
    expect(reviews.items.every((item) => item.sourceLogo?.endsWith('/images/brand/platforms/airbnb.webp'))).toBe(true);
  });

  it('links each configured platform in a new tab, with its logo, and hides unconfigured ones', async () => {
    const { reviews } = await renderReviews();
    const list = screen.getByRole('list', { name: reviews.platformsTitle });
    const configured = Object.entries(REVIEW_PLATFORM_LINKS).filter(([, href]) => href);

    expect(within(list).getAllByRole('link')).toHaveLength(configured.length);
    for (const [id, href] of configured) {
      const platform = reviews.platforms.find((item) => item.id === id);
      if (!platform) throw new Error(`platform ${id} missing`);
      const link = within(list).getByRole('link', { name: new RegExp(platform.label) });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('data-event', `reviews_platform_${id}_click`);
      expect(link.textContent).toContain(en.Landing.reviews.opensInNewTab);
      expect(link.querySelector('img')?.getAttribute('src')).toMatch(new RegExp(`/images/brand/platforms/${id}\\.webp$`));
    }
  });

  it('renders one article per review and the trust metrics strip', async () => {
    const { reviews, trustStats } = await renderReviews();

    expect(screen.getAllByRole('article')).toHaveLength(reviews.items.length);
    const dl = screen.getByText(trustStats.items[0].label).closest('dl');
    if (!dl) throw new Error('trust stats must render inside a <dl>');
    const strip = within(dl);
    for (const stat of trustStats.items) {
      expect(strip.getByText(stat.value).tagName).toBe('DD');
      expect(strip.getByText(stat.label).tagName).toBe('DT');
    }
  });

  it.each(['es', 'fr'] as const)('localizes the new-tab hint for %s', async (locale) => {
    await renderReviews(locale);
    const [link] = screen.getAllByRole('link', {
      name: new RegExp(MESSAGES[locale].Landing.reviews.verifiedGuest),
    });

    expect(link.textContent).toContain(MESSAGES[locale].Landing.reviews.opensInNewTab);
  });
});
