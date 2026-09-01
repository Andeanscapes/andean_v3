import { render, screen } from '@/test/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExperienceHero } from './ExperienceHero';
import { MOCK_TRANSLATED_CONFIG } from '@/test/test-utils';
import type { ExperienceHeroContent } from '@/lib/schemas';

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean };
};

const originalMatchMedia = window.matchMedia;
const originalConnection = (navigator as NavigatorWithConnection).connection;

function mockMatchMedia(prefersReducedMotion: boolean) {
  const matchMedia = vi.fn((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? prefersReducedMotion : true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }));
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });
  return matchMedia;
}

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: originalMatchMedia });
  Object.defineProperty(navigator, 'connection', {
    configurable: true,
    value: originalConnection,
  });
});

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

  it('renders feed-provided desktop and mobile video sources', () => {
    const { container } = render(
      <ExperienceHero
        heroContent={{
          ...mockHeroContent,
          video: {
            desktop: 'https://cdn.example.com/videos/hero.webm',
            mobile: 'https://cdn.example.com/videos/hero-mobile.webm',
          },
        }}
      />,
    );

    const sources = container.querySelectorAll('video source');
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('src', 'https://cdn.example.com/videos/hero-mobile.webm');
    expect(sources[1]).toHaveAttribute('src', 'https://cdn.example.com/videos/hero.webm');
  });

  /**
   * Regression: a source-controlled fallback used to substitute emerald-mining
   * footage whenever the feed published no video. That is wrong data on any other
   * experience, and on `/experiences` — which renders this component with only
   * `content` and is not an experience at all.
   */
  it('renders no video when no source provides one', () => {
    const { container } = render(<ExperienceHero heroContent={mockHeroContent} />);

    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('renders no video for a catalog hero that carries only content', () => {
    const { container } = render(
      <ExperienceHero content={{ title: 'Catalog', subtitle: 'All experiences' }} />,
    );

    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('does not emit an empty background image', () => {
    const { container } = render(<ExperienceHero heroContent={mockHeroContent} />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('does not render video when reduced motion is preferred', () => {
    const matchMedia = mockMatchMedia(true);
    const { container } = render(
      <ExperienceHero
        heroContent={{
          ...mockHeroContent,
          video: { desktop: 'https://cdn.example.com/videos/hero.webm' },
        }}
      />,
    );

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('does not render video when data saver is enabled', () => {
    mockMatchMedia(false);
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    });

    const { container } = render(
      <ExperienceHero
        heroContent={{
          ...mockHeroContent,
          video: { desktop: 'https://cdn.example.com/videos/hero.webm' },
        }}
      />,
    );

    expect(container.querySelector('video')).not.toBeInTheDocument();
  });
});
