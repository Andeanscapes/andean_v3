import { cleanup, render, screen } from '@testing-library/react';
import { createTranslator, NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { locales, type Locale } from '@/i18n/routing';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';
import { LANDING_FIXTURE, cloneFixture } from '@/test/fixtures';

vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale }: { locale: Locale }) => createTranslator({
    locale,
    messages: { en, es, fr }[locale],
  }),
}));

vi.mock('next/navigation', async (importOriginal) => ({
  ...await importOriginal<typeof import('next/navigation')>(),
  usePathname: () => '/',
}));

import { getLandingDataSSR } from '@/lib/services/landing.service';
import LandingFaqs from './LandingFaqs';

const messages = { en, es, fr };

describe('LandingFaqs', () => {
  beforeEach(() => {
    vi.stubEnv('REMOTE_DATA_BASE_URL', 'https://cdn.andeanscapes.com/services');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => cloneFixture(LANDING_FIXTURE),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each(locales)('renders brand FAQs and distinct enquiry content in %s', async (locale) => {
    const data = await getLandingDataSSR(locale);
    const flagshipEnquiry = new URL(data.flagship.whatsappLink);
    flagshipEnquiry.searchParams.set('text', data.flagship.title);
    data.flagship.whatsappLink = flagshipEnquiry.toString();
    const copy = messages[locale].Landing.faqs;
    render(
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
        <LandingFaqs landingData={data} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: copy.title })).toHaveAttribute('id', 'landing-faqs');
    expect(screen.getByRole('heading', { level: 3, name: copy.enquiryTitle })).toBeInTheDocument();
    expect(screen.getAllByText(copy.description)).toHaveLength(1);
    expect(screen.getByText(copy.enquiryDescription)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: data.flagship.title })).not.toBeInTheDocument();
    expect(screen.getByText(copy.items.emeraldRegions.question)).toBeInTheDocument();
    expect(screen.getByText(copy.items.minerForADay.question)).toBeInTheDocument();

    const enquiry = screen.getByRole('link', { name: data.globalCtas.whatsappLabel });
    expect(enquiry).toHaveAttribute('href', data.globalCtas.whatsappHref);
    expect(enquiry).not.toHaveAttribute('href', data.flagship.whatsappLink);
    const browse = screen.getByRole('link', { name: data.finalCta.primaryCtaLabel });
    expect(browse).toHaveAttribute('href', locale === 'en' ? '/experiences' : `/${locale}/experiences`);
  });
});
