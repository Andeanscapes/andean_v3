import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Footer from './Footer';
import { CONTACT_INFO, FOOTER_PHONE } from '@/constant/SiteConfig';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';

const FLAGSHIP_PATH = '/experiences/chivor-emerald-mine-tour';

function renderFooter(locale: 'en' | 'es' | 'fr' = 'en') {
  const messages = { en, es, fr }[locale];

  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Footer flagshipExperiencePath={FLAGSHIP_PATH} />
    </NextIntlClientProvider>,
  );
}

/** Blocks jsdom navigation and reports whether the footer prevented the click. */
function clickWasBlocked(link: HTMLElement) {
  let blocked = false;
  const probe = (event: MouseEvent) => {
    blocked = event.defaultPrevented;
    event.preventDefault();
  };

  document.addEventListener('click', probe);
  fireEvent.click(link);
  document.removeEventListener('click', probe);

  return blocked;
}

describe('Footer', () => {
  afterEach(() => cleanup());

  it('renders no gallery images or back-to-top control', () => {
    renderFooter();
    expect(screen.queryAllByRole('img').filter((img) => img.getAttribute('src')?.includes('/images/brand/footer/'))).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Back to top' })).toBeNull();
  });

  it('renders the partner badge on the hacienda link, localized', () => {
    renderFooter('es');
    expect(screen.getByText('Socio')).toBeInTheDocument();
  });

  it('deep-links experience sections into the flagship path it is given', () => {
    renderFooter();

    expect(screen.getByRole('link', { name: 'Logistics' }).getAttribute('href')).toBe(
      `${FLAGSHIP_PATH}#inclusions`,
    );
    expect(screen.getByRole('link', { name: 'Transportation' }).getAttribute('href')).toBe(
      `${FLAGSHIP_PATH}#booking`,
    );
    expect(screen.getByRole('link', { name: 'Stay Options' }).getAttribute('href')).toBe(
      `${FLAGSHIP_PATH}#accommodation`,
    );
    for (const label of ['Logistics', 'Transportation', 'Stay Options']) {
      expect(clickWasBlocked(screen.getByRole('link', { name: label }))).toBe(false);
    }
  });

  it('allows the phone link', () => {
    renderFooter();
    const phone = screen.getByRole('link', { name: FOOTER_PHONE.phoneDisplay });

    expect(phone.getAttribute('href')).toBe('tel:+573124815443');
    expect(clickWasBlocked(phone)).toBe(false);
  });

  it('allows the experiences link and Instagram link to navigate', () => {
    renderFooter();
    expect(clickWasBlocked(screen.getByRole('link', { name: 'All Experiences' }))).toBe(false);
    expect(clickWasBlocked(screen.getByRole('link', { name: 'Instagram' }))).toBe(false);
  });

  it('keeps the WhatsApp and email contact links live', () => {
    renderFooter();
    const whatsapp = screen.getByRole('link', { name: 'Start WhatsApp Chat' });
    const email = screen.getByRole('link', { name: 'Send Email' });

    expect(whatsapp.getAttribute('href')).toContain('wa.me');
    expect(whatsapp.getAttribute('target')).toBe('_blank');
    expect(clickWasBlocked(whatsapp)).toBe(false);

    expect(email.getAttribute('href')).toBe(`mailto:${CONTACT_INFO.email}`);
    expect(clickWasBlocked(email)).toBe(false);
  });
});
