import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { ExperienceHero } from './ExperienceHero';
import { MOCK_TRANSLATED_CONFIG } from '@/test/test-utils';
import type { ExperienceHeroContent } from '@/lib/schemas';

describe('ExperienceHero', () => {
  const mockHeroContent: ExperienceHeroContent = {
    title: MOCK_TRANSLATED_CONFIG.title,
    subtitle: MOCK_TRANSLATED_CONFIG.subtitle,
    summary: 'Test summary',
    highlightText: 'Test highlight',
    ctaLabel: 'View dates',
    helperText: 'Test helper',
    hideCta: false,
    ctaTargetId: 'available-dates',
    badges: [
      { label: 'Cupos limitados', icon: 'limited' as const },
      { label: `Depósito ${MOCK_TRANSLATED_CONFIG.depositPercent}%`, icon: 'deposit' as const },
    ],
  };

  it('renders title from heroContent', () => {
    render(<ExperienceHero heroContent={mockHeroContent} />);
    expect(screen.getByText(MOCK_TRANSLATED_CONFIG.title)).toBeInTheDocument();
  });

  it('renders subtitle from heroContent', () => {
    render(<ExperienceHero heroContent={mockHeroContent} />);
    expect(screen.getByText(MOCK_TRANSLATED_CONFIG.subtitle)).toBeInTheDocument();
  });

  it('renders all badges from heroContent', () => {
    render(<ExperienceHero heroContent={mockHeroContent} />);
    expect(screen.getByText('Cupos limitados')).toBeInTheDocument();
    expect(screen.getByText(`Depósito ${MOCK_TRANSLATED_CONFIG.depositPercent}%`)).toBeInTheDocument();
  });
});
