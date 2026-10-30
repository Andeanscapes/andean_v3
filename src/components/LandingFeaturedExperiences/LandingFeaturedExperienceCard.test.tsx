import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import LandingFeaturedExperienceCard from './LandingFeaturedExperienceCard';
import { FEATURED_FIXTURE } from './__fixtures__/featuredFixture';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';
import enMessages from '@/i18n/messages/en.json';

const FIRST = FEATURED_FIXTURE.items[0];

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('LandingFeaturedExperienceCard', () => {
  afterEach(() => cleanup());

  it('renders title, description, duration and location', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.getByRole('heading', { level: 3, name: FIRST.title })).toBeInTheDocument();
    expect(screen.getByText(FIRST.description)).toBeInTheDocument();
    expect(screen.getByText(FIRST.duration)).toBeInTheDocument();
    expect(screen.getByText(FIRST.location)).toBeInTheDocument();
  });

  it('renders at most two highlights as list items', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    const list = screen.getByText(FIRST.highlights[0]).closest('ul');
    const items = Array.from(list?.querySelectorAll('li') ?? []);
    expect(items.map((item) => item.textContent)).toEqual(FIRST.highlights.slice(0, 2));
  });

  it('does not render the category pill (package tags)', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.queryByText('All-inclusive stay')).not.toBeInTheDocument();
  });

  it('shows the date only when spots are above the low-stock threshold', () => {
    renderWithIntl(
      <LandingFeaturedExperienceCard
        experience={{ ...FIRST, nextAvailability: { dateISO: '2026-10-31', spotsLeft: 7 } }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/^Next availability: /);
    expect(screen.getByRole('status')).not.toHaveTextContent('spots left');
  });

  it('shows the remaining-spots count when three or fewer spots are left', () => {
    renderWithIntl(
      <LandingFeaturedExperienceCard
        experience={{ ...FIRST, nextAvailability: { dateISO: '2026-10-31', spotsLeft: 3 } }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Only 3 spots left');
  });

  it('renders no highlight list when there are none', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={{ ...FIRST, highlights: [], packageTags: [] }} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders the mine badge over the image and no plan badge', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.getByText('Chivor')).toHaveClass('uppercase');
    expect(screen.queryByText('Prime')).not.toBeInTheDocument();
  });

  it('renders no plan or mine badge when the feed carries no codes', () => {
    renderWithIntl(
      <LandingFeaturedExperienceCard experience={{ ...FIRST, planBadge: undefined, mineBadge: undefined }} />,
    );
    expect(screen.queryByText('Prime')).not.toBeInTheDocument();
    expect(screen.queryByText('Chivor')).not.toBeInTheDocument();
  });

  // The stretched title link sits above the photo, so the carousel never gets
  // the pointer itself; hover must be read on the card.
  it('drives carousel hover from the whole card', () => {
    // jsdom ships no PointerEvent, so `pointerType` would be dropped.
    vi.stubGlobal(
      'PointerEvent',
      class extends MouseEvent {
        readonly pointerType: string;
        constructor(type: string, init: { pointerType?: string } & ConstructorParameters<typeof MouseEvent>[1] = {}) {
          super(type, init);
          this.pointerType = init.pointerType ?? '';
        }
      },
    );
    const { container } = renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    const card = container.querySelector('article');
    if (!card) throw new Error('card not rendered');
    expect(card).toHaveClass('group/card');
    expect(container.querySelectorAll('img')).toHaveLength(1);

    fireEvent.pointerOver(card, { pointerType: 'mouse' });
    // Card hover preloads the next photo, proving the carousel saw it.
    expect(container.querySelectorAll('img')).toHaveLength(2);
    vi.unstubAllGlobals();
  });

  // The carousel buttons must not sit inside the card link, or a click on an
  // arrow would navigate to the experience instead of changing the photo.
  it('keeps carousel controls outside the card link', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    const link = screen.getByRole('link', { name: FIRST.title });
    expect(link).toHaveAttribute('href', FIRST.href);
    for (const button of screen.getAllByRole('button')) {
      expect(link.contains(button)).toBe(false);
      expect(button.closest('a')).toBeNull();
    }
  });

  it('formats price as currency and shows fromLabel + per-person + viewDetailsLabel', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.getByText(FIRST.fromLabel)).toBeInTheDocument();
    expect(screen.getByText(FIRST.perPersonLabel)).toBeInTheDocument();
    expect(screen.getByText(FIRST.viewDetailsLabel)).toBeInTheDocument();
    // 470000 COP → ICU format, e.g. "$ 470.000" or "COP 470.000"
    const priceMatch = screen.getByText(
      (content) => content.includes('470') && /COP|\$/.test(content),
    );
    expect(priceMatch).toBeInTheDocument();
  });

  it('links to experience.href', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', FIRST.href);
  });

  /**
   * The card used `next/image`, which resizes nothing on the deployed Worker, so
   * phones received the full-size desktop file. The `-mobile` sibling is the only
   * thing that reduces those bytes, and it is derived here rather than published,
   * so nothing else would catch its removal.
   */
  it('serves the -mobile sibling below the desktop breakpoint', () => {
    const { container } = renderWithIntl(
      <LandingFeaturedExperienceCard experience={FIRST} />,
    );
    const source = container.querySelector('picture > source');

    expect(source).toHaveAttribute('media', '(max-width: 767px)');
    expect(source).toHaveAttribute(
      'srcset',
      getResponsiveImageSrc(FIRST.image).mobile,
    );
    expect(container.querySelector('picture > img')).toHaveAttribute('src', FIRST.image);
  });

  it('lazy-loads the card image, which sits below the fold', () => {
    const { container } = renderWithIntl(
      <LandingFeaturedExperienceCard experience={FIRST} />,
    );
    const img = container.querySelector('picture > img');

    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });
});
