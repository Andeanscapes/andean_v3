import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import Footer from './Footer';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';
import { CONTACT_INFO, FOOTER_PHONE } from '@/constant/SiteConfig';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';

/**
 * The trust gallery is the only data the footer takes from its caller, so these
 * cover the contract that replaced the hardcoded array: N paths in, N tiles out,
 * with the alt text still coming from `next-intl` rather than the caller.
 */
const GALLERY = [
  'https://cdn.example.com/images/brand/footer/ugc-1.webp',
  'https://cdn.example.com/images/brand/footer/ugc-2.webp',
  'https://cdn.example.com/images/brand/footer/ugc-3.webp',
  'https://cdn.example.com/images/brand/footer/ugc-4.webp',
];

const FLAGSHIP_PATH = '/experiences/chivor-emerald-mine-tour';

function renderFooter(
  trustGallery: string[] = GALLERY,
  locale: 'en' | 'es' | 'fr' = 'en',
) {
  const messages = { en, es, fr }[locale];

  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Footer trustGallery={trustGallery} flagshipExperiencePath={FLAGSHIP_PATH} />
    </NextIntlClientProvider>,
  );
}

/** Every tile the gallery rendered, in DOM order. */
function galleryImages() {
  return screen
    .getAllByRole('img')
    .filter((img) => img.getAttribute('src')?.includes('/images/brand/footer/'));
}

describe('Footer trust gallery', () => {
  afterEach(() => cleanup());

  it('renders one tile per supplied path, in order', () => {
    renderFooter();
    expect(galleryImages().map((img) => img.getAttribute('src'))).toEqual(GALLERY);
  });

  /** The grid is responsive, so the count must follow the data, not a constant. */
  it('follows the supplied count rather than a fixed four', () => {
    renderFooter(GALLERY.slice(0, 2));
    expect(galleryImages()).toHaveLength(2);
  });

  it('renders nothing when no paths are supplied', () => {
    renderFooter([]);
    expect(galleryImages()).toHaveLength(0);
  });

  /**
   * Alt text stays localized: a caller passing URLs must not be able to
   * influence it, and it must not regress to a hardcoded English string.
   */
  it('localizes alt text via next-intl and indexes it from 1', () => {
    renderFooter();
    const alts = galleryImages().map((img) => img.getAttribute('alt'));
    expect(alts).toEqual([
      'Traveler moment 1',
      'Traveler moment 2',
      'Traveler moment 3',
      'Traveler moment 4',
    ]);
  });

  /** en/es/fr must all resolve the key and interpolate the index. */
  it.each([
    ['es', 'Momento de viajero 1'],
    ['fr', 'Moment voyageur 1'],
  ] as const)('translates alt text for %s', (locale, expected) => {
    renderFooter(GALLERY.slice(0, 1), locale);
    expect(galleryImages()[0].getAttribute('alt')).toBe(expected);
  });

  /** Below the fold on every route — eager loading here would cost LCP. */
  it('keeps gallery tiles lazy and non-blocking', () => {
    renderFooter();
    for (const img of galleryImages()) {
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('decoding')).toBe('async');
    }
  });

  /** Intrinsic size prevents layout shift in the square grid. */
  it('declares intrinsic dimensions on every tile', () => {
    renderFooter();
    for (const img of galleryImages()) {
      expect(img.getAttribute('width')).toBe('150');
      expect(img.getAttribute('height')).toBe('150');
    }
  });

  /**
   * The 200w sibling is derived at render time and never named by
   * `FOOTER_TRUST_GALLERY`, so nothing else in the repo references these paths —
   * this is the only check that the pairing survives.
   */
  it('offers the -mobile sibling below the desktop breakpoint', () => {
    const { container } = renderFooter();
    const sources = Array.from(container.querySelectorAll('picture > source'));

    expect(sources).toHaveLength(GALLERY.length);
    expect(sources.map((source) => source.getAttribute('srcset'))).toEqual(
      GALLERY.map((src) => getResponsiveImageSrc(src).mobile),
    );
    for (const source of sources) {
      expect(source.getAttribute('media')).toBe('(max-width: 767px)');
    }
  });

  /** The desktop file stays the `<img>` fallback for anything above the breakpoint. */
  it('keeps the full-size tile as the fallback source', () => {
    renderFooter();
    expect(galleryImages().map((img) => img.getAttribute('src'))).toEqual(GALLERY);
  });
});

/**
 * Pre-launch: only the WhatsApp and email support actions are live. Every other
 * footer link stays a real, focusable link but its click is swallowed.
 */
describe('Footer placeholder links', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const PLACEHOLDER_LABELS = [
    'Logistics',
    'Transportation',
    'Stay Options',
    'Hacienda El Recuerdo',
    'All Experiences',
    'Certifications',
    'Insurance',
    'Terms',
    'Privacy',
    'Instagram',
  ];

  it.each(PLACEHOLDER_LABELS)('blocks navigation for %s and announces it', (label) => {
    renderFooter();
    const link = screen.getByRole('link', { name: new RegExp(`^${label}`) });

    expect(fireEvent.click(link)).toBe(false);
    expect(screen.getByRole('status').textContent).toBe('Coming soon');
  });

  it('blocks the phone link', () => {
    renderFooter();
    const phone = screen.getByRole('link', { name: FOOTER_PHONE.phoneDisplay });

    expect(phone.getAttribute('href')).toBe('tel:+573124815443');
    expect(phone.textContent).toBe('+57 312-4815443');
    expect(fireEvent.click(phone)).toBe(false);
  });

  it('hides the notice after the timeout', () => {
    vi.useFakeTimers();
    renderFooter();
    fireEvent.click(screen.getByRole('link', { name: 'Terms' }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByRole('status').textContent).toBe('');
  });

  /**
   * Reads whether the footer swallowed the click, then cancels it at the
   * document so jsdom does not attempt the real navigation.
   */
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
  });

  it('keeps the WhatsApp action live', () => {
    renderFooter();
    const whatsapp = screen.getByRole('link', { name: 'Start WhatsApp Chat' });

    expect(whatsapp.getAttribute('href')).toContain('wa.me');
    expect(whatsapp.getAttribute('target')).toBe('_blank');
    expect(clickWasBlocked(whatsapp)).toBe(false);
  });

  it('keeps the email action live', () => {
    renderFooter();
    fireEvent.click(screen.getByRole('button', { name: 'Email Support' }));
    const email = screen.getByRole('link', { name: 'Send Email' });

    expect(email.getAttribute('href')).toBe(`mailto:${CONTACT_INFO.email}`);
    expect(clickWasBlocked(email)).toBe(false);
  });
});
