import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/routing';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';
import { BUSINESS_INFO, REVIEW_PLATFORM_LINKS } from '@/constant/SiteConfig';
import { OperatorTrust } from './OperatorTrust';

const messages = { en, es, fr };

describe('OperatorTrust', () => {
  it.each(locales)('names the operator, the technology provider and the booking platforms in %s', (locale) => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        <OperatorTrust />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: messages[locale].Trust.title })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(BUSINESS_INFO.legalName))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(BUSINESS_INFO.taxId))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(BUSINESS_INFO.technologyProvider.name))).toBeInTheDocument();
    // The jurisdiction is localized copy, never the English source string.
    if (locale !== 'en') expect(screen.queryByText(/Georgia, USA/)).not.toBeInTheDocument();

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toContain(REVIEW_PLATFORM_LINKS.airbnb);
    expect(hrefs).toContain(REVIEW_PLATFORM_LINKS.getyourguide);
  });
});
