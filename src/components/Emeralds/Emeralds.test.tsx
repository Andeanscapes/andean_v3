import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { EMERALD_MAP_POINTS } from '@/lib/content/emeraldMap';
import { GuideFigure } from '@/components/Guide/GuideFigure';
import { GuideSources } from '@/components/Guide/GuideSources';
import { BeltMap } from './BeltMap';
import { CitedText } from './CitedText';
import { ThreePhaseIllustration, TrapicheIllustration } from './CrystalIllustrations';
import { EmeraldPager, EmeraldSectionNav } from './EmeraldSectionNav';
import { EmeraldToc } from './EmeraldToc';

describe('CitedText', () => {
  const numbers = new Map([['gia', 2]]);

  it('renders markers as numbered links to the source list', () => {
    render(
      <p>
        <CitedText text="Ran Chivor.[[gia]]" sourceNumbers={numbers} sourceLabel={(n) => `Source ${n}`} anchorPrefix="source" />
      </p>,
    );
    expect(screen.getByRole('link', { name: 'Source 2' })).toHaveAttribute('href', '#source-2');
    expect(screen.getByText('Ran Chivor.')).toBeInTheDocument();
  });

  it('throws on a source that is not listed on the page', () => {
    expect(() =>
      render(<CitedText text="x[[missing]]" sourceNumbers={numbers} sourceLabel={(n) => `${n}`} anchorPrefix="source" />),
    ).toThrow(/missing/);
  });
});

describe('GuideSources with anchors and language notes', () => {
  it('anchors each entry and flags sources in another language', () => {
    const { container } = render(
      <GuideSources
        title="Sources"
        headingId="s"
        anchorPrefix="source"
        languageNotes={{ es: '(in Spanish)' }}
        sources={[
          { id: 'a', label: 'GIA', url: 'https://www.gia.edu/', language: 'en' },
          { id: 'b', label: 'Fura y Tena', url: 'https://es.wikipedia.org/wiki/Fura_y_Tena', language: 'es' },
        ]}
      />,
    );
    expect(container.querySelector('#source-2')?.textContent).toContain('(in Spanish)');
    expect(container.querySelector('#source-1')?.textContent).not.toContain('(in');
    expect(screen.getByRole('link', { name: 'Fura y Tena' })).toHaveAttribute('hreflang', 'es');
  });
});

describe('GuideFigure', () => {
  it('shows the caption with its credit and keeps the alt on the image', () => {
    render(<GuideFigure caption="Chivor." credit="Andean Scapes · CC BY 4.0" image={{ src: 'https://cdn.example.com/images/a.webp', alt: 'Mine entrance' }} />);
    expect(screen.getByRole('img', { name: 'Mine entrance' })).toHaveAttribute('loading', 'lazy');
    expect(screen.getByText(/Andean Scapes · CC BY 4.0/)).toBeInTheDocument();
  });
});

describe('illustrations', () => {
  it('draws every map point as an accessible image', () => {
    render(<BeltMap alt="Emerald belts" beltLabels={{ western: 'Western belt', eastern: 'Eastern belt' }} />);
    const map = screen.getByRole('img', { name: 'Emerald belts' });
    for (const point of EMERALD_MAP_POINTS) expect(map).toHaveTextContent(point.name);
    expect(map).toHaveTextContent('Western belt');
  });

  it('labels the trapiche and three-phase diagrams', () => {
    render(<TrapicheIllustration alt="Trapiche" labels={{ core: 'Core', arm: 'Arm', sector: 'Sector' }} />);
    render(<ThreePhaseIllustration alt="Inclusion" labels={{ liquid: 'Brine', gas: 'Gas', crystal: 'Salt' }} />);
    expect(screen.getByRole('img', { name: 'Trapiche' })).toHaveTextContent('Arm');
    expect(screen.getByRole('img', { name: 'Inclusion' })).toHaveTextContent('Salt');
  });
});

describe('navigation', () => {
  it('renders nothing until a topic section exists, then marks the current one', () => {
    const { container, rerender } = render(<EmeraldSectionNav label="Sections" items={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <EmeraldSectionNav
        label="Sections"
        items={[
          { href: '/emeralds/mythology', label: 'Mythology', current: true },
          { href: '/emeralds/history', label: 'History', current: false },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Mythology' })).toHaveAttribute('aria-current', 'page');
  });

  it('links previous and next pages', () => {
    render(
      <EmeraldPager label="More" previousLabel="Previous" nextLabel="Next" next={{ href: '/emeralds/a', title: 'Patricia' }} />,
    );
    expect(screen.getByRole('link', { name: /Patricia/ })).toHaveAttribute('rel', 'next');
  });

  it('lists in-page anchors in the table of contents', () => {
    const { container } = render(<EmeraldToc label="On this page" items={[{ id: 'emerald-belts', heading: 'Belts' }]} />);
    // Collapsible copy for small screens plus the desktop sidebar copy.
    for (const link of screen.getAllByRole('link', { name: 'Belts' })) expect(link).toHaveAttribute('href', '#emerald-belts');
    expect(container.querySelector('details summary')?.textContent).toBe('On this page');
  });
});
