import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { PrimaryCtaButton } from './PrimaryCtaButton';

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{}}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('PrimaryCtaButton', () => {
  it('renders as button by default', () => {
    renderWithIntl(<PrimaryCtaButton>Book now</PrimaryCtaButton>);
    expect(screen.getByRole('button', { name: 'Book now' })).toBeInTheDocument();
  });

  it('renders as link when href is provided', () => {
    renderWithIntl(<PrimaryCtaButton href="/booking">Check Dates</PrimaryCtaButton>);
    const link = screen.getByRole('link', { name: 'Check Dates' });
    expect(link).toHaveAttribute('href', '/booking');
  });
});
