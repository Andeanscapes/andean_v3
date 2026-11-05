import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingWhyUs from './LandingWhyUs';
import { WHYUS_FIXTURE } from './__fixtures__/whyUsFixture';

describe('LandingWhyUs', () => {
  afterEach(() => cleanup());

  it('renders section heading and lead', () => {
    render(<LandingWhyUs whyUs={WHYUS_FIXTURE} />);
    const heading = screen.getByRole('heading', { level: 2, name: WHYUS_FIXTURE.sectionTitle });
    expect(heading.id).toBe('landing-whyus-title');
    expect(screen.getByText(WHYUS_FIXTURE.lead)).toBeInTheDocument();
  });

  it('renders one card per item with title and description', () => {
    render(<LandingWhyUs whyUs={WHYUS_FIXTURE} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(WHYUS_FIXTURE.items.length);
    for (const item of WHYUS_FIXTURE.items) {
      expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
    }
  });

  it('renders the host portrait with alt text and caption when provided', () => {
    const portrait = { image: '/images/brand/host.webp', alt: 'Local host', caption: 'Local hosts · Chivor' };
    render(<LandingWhyUs whyUs={{ ...WHYUS_FIXTURE, portrait }} />);
    const img = screen.getByRole('img', { name: portrait.alt });
    expect(img).toHaveAttribute('src', portrait.image);
    expect(img.parentElement?.querySelector('source')).toHaveAttribute(
      'srcset',
      '/images/brand/host-mobile.webp',
    );
    expect(screen.getByText(portrait.caption)).toBeInTheDocument();
  });

  it('omits the portrait when not provided', () => {
    render(<LandingWhyUs whyUs={WHYUS_FIXTURE} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(
      <LandingWhyUs whyUs={{ ...WHYUS_FIXTURE, items: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
