/**
 * `imageUrl` is optional: the feed owns the highlight media, and during the CDN
 * rollout a slot can be absent. Rendering the background unconditionally used to
 * emit `<img src="">`, which browsers resolve to the current document URL — a
 * wasted request, a placeholder that never settles, and a Lighthouse finding.
 */

import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import ValuePropositions from './ValuePropositions';
import { MOCK_EXPERIENCE_DATA } from '@/test/test-utils';
import type { ExperienceData } from '@/lib/schemas';

function dataWithTiles(imageUrl: string | undefined): ExperienceData {
  return {
    ...MOCK_EXPERIENCE_DATA,
    valuePropositionsContent: {
      title: 'Why this experience',
      items: [
        { id: 'tile-1', title: 'Tile one', description: 'Description one', imageUrl },
      ],
    },
  };
}

describe('ValuePropositions', () => {
  it('renders the tile background when the feed provides media', () => {
    const { container } = render(
      <ValuePropositions
        experienceData={dataWithTiles('https://cdn.andeanscapes.com/images/tile-1.webp')}
      />,
    );

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.andeanscapes.com/images/tile-1.webp',
    );
  });

  it('renders no image element when the tile has no media', () => {
    const { container } = render(<ValuePropositions experienceData={dataWithTiles(undefined)} />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    // Copy still renders — only the background is suppressed.
    expect(screen.getByText('Tile one')).toBeInTheDocument();
  });
});
