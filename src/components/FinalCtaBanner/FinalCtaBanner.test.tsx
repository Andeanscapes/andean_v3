import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { LandingContent } from '@/lib/schemas/landing.schema';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';
import FinalCtaBanner from './FinalCtaBanner';

const LANDING_DATA = {
  flagship: {
    badge: 'Featured',
    whatsappLink: 'https://wa.me/573001234567',
  },
  finalCta: {
    sectionTitle: 'Plan your journey',
    subtitle: 'Travel with local experts',
    backgroundImage: 'https://cdn.example.com/images/brand/final-cta.webp',
    bookAria: 'Book your experience',
    primaryCtaLabel: 'Reserve',
    primaryCtaHref: '/booking',
    secondaryCtaLabel: 'Ask a question',
    trustBadges: [{ id: 'secure', iconName: 'ShieldCheck', label: 'Secure booking' }],
  },
} satisfies {
  finalCta: LandingContent['finalCta'];
  flagship: Pick<LandingContent['flagship'], 'badge' | 'whatsappLink'>;
};

describe('FinalCtaBanner', () => {
  afterEach(() => cleanup());

  it('serves the mobile background below the desktop breakpoint', () => {
    const { container } = render(<FinalCtaBanner landingData={LANDING_DATA} />);
    const source = container.querySelector('picture > source');

    expect(source).toHaveAttribute('media', '(max-width: 767px)');
    expect(source).toHaveAttribute(
      'srcset',
      getResponsiveImageSrc(LANDING_DATA.finalCta.backgroundImage).mobile,
    );
    expect(container.querySelector('picture > img')).toHaveAttribute(
      'src',
      LANDING_DATA.finalCta.backgroundImage,
    );
  });

  it('lazy-loads a decorative background', () => {
    const { container } = render(<FinalCtaBanner landingData={LANDING_DATA} />);
    const image = container.querySelector('picture > img');

    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });

  it('renders the translated CTA content and links', () => {
    render(<FinalCtaBanner landingData={LANDING_DATA} />);

    expect(screen.getByRole('heading', { name: LANDING_DATA.finalCta.sectionTitle })).toBeVisible();
    expect(screen.getByRole('link', { name: /reserve/i })).toHaveAttribute(
      'href',
      LANDING_DATA.finalCta.primaryCtaHref,
    );
    expect(screen.getByRole('link', { name: /ask a question/i })).toHaveAttribute(
      'href',
      LANDING_DATA.flagship.whatsappLink,
    );
  });
});
