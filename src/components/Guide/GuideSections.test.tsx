import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuideSections } from './GuideSections';
import { GuideSources } from './GuideSources';

describe('GuideSections', () => {
  it('renders plain guide sections as before: labelled h2 + paragraphs, no optional blocks', () => {
    const { container } = render(
      <GuideSections idPrefix="guide" sections={[{ id: 'rainier', heading: 'Peter Rainier', paragraphs: ['One.', 'Two.'] }]} />,
    );

    const section = screen.getByRole('region', { name: 'Peter Rainier' });
    expect(section.querySelector('h2')?.id).toBe('guide-rainier');
    expect(Array.from(section.querySelectorAll('p')).map((p) => p.textContent)).toEqual(['One.', 'Two.']);
    expect(container.querySelector('ul, figure, blockquote')).toBeNull();
  });

  it('renders the optional answer, list and attributed quote', () => {
    render(
      <GuideSections
        idPrefix="emerald"
        sections={[
          {
            id: 'belts',
            heading: 'Belts',
            answer: 'Two belts.',
            paragraphs: ['Body.'],
            list: ['Oriente', 'Occidente'],
            quote: { text: 'Fuego verde.', attribution: 'Fuego Verde, episode 1' },
          },
        ]}
      />,
    );

    expect(screen.getByText('Two belts.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Oriente', 'Occidente']);
    expect(screen.getByText('Fuego verde.').tagName).toBe('BLOCKQUOTE');
    expect(screen.getByText('Fuego Verde, episode 1').tagName).toBe('FIGCAPTION');
  });
});

describe('GuideSources', () => {
  it('links sources that have a URL and lists the rest as text', () => {
    render(
      <GuideSources
        title="Sources"
        headingId="guide-sources"
        sources={[
          { id: 'gia', label: 'GIA', url: 'https://www.gia.edu/', language: 'en' },
          { id: 'rainier', label: 'Rainier (1942)', language: 'en' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'GIA' })).toHaveAttribute('href', 'https://www.gia.edu/');
    expect(screen.queryByRole('link', { name: 'Rainier (1942)' })).toBeNull();
    expect(screen.getByRole('region', { name: 'Sources' })).toBeInTheDocument();
  });
});
