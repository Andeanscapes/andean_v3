import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { ExperienceHero } from './ExperienceHero';
import { MOCK_TRANSLATED_CONFIG } from '@/test/test-utils';

describe('ExperienceHero', () => {
  it('renders title from config', () => {
    render(<ExperienceHero config={MOCK_TRANSLATED_CONFIG} />);
    expect(screen.getByText(MOCK_TRANSLATED_CONFIG.title)).toBeInTheDocument();
  });

  it('renders subtitle from config', () => {
    render(<ExperienceHero config={MOCK_TRANSLATED_CONFIG} />);
    expect(screen.getByText(MOCK_TRANSLATED_CONFIG.subtitle)).toBeInTheDocument();
  });

  it('renders all badges', () => {
    render(<ExperienceHero config={MOCK_TRANSLATED_CONFIG} />);
    expect(screen.getByText('Cupos limitados')).toBeInTheDocument();
    expect(screen.getByText('Fechas oficiales')).toBeInTheDocument();
    expect(screen.getByText(`Depósito ${MOCK_TRANSLATED_CONFIG.depositPercent}%`)).toBeInTheDocument();
  });
});
