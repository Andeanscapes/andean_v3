/**
 * Review cards link to the public Airbnb listing as proof.
 *
 * Content is built by the real service from the live-feed snapshot
 * (src/test/fixtures), with `fetch` stubbed, so the suite stays offline and
 * exercises feed → adapter → translator → component end to end.
 */

import { cleanup, render, screen } from '@testing-library/react';
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
import { REVIEW_LINKS } from '@/constant/SiteConfig';
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

  it.each(['es', 'fr'] as const)('localizes the new-tab hint for %s', async (locale) => {
    await renderReviews(locale);
    const [link] = screen.getAllByRole('link', {
      name: new RegExp(MESSAGES[locale].Landing.reviews.verifiedGuest),
    });

    expect(link.textContent).toContain(MESSAGES[locale].Landing.reviews.opensInNewTab);
  });
});
