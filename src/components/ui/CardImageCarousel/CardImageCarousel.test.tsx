import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CardImageCarousel } from './CardImageCarousel';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) =>
    key === 'gallery' && values
      ? `gallery:${values.title}`
      : key === 'slideLabel' && values
        ? `slide:${values.current}/${values.total}`
        : key === 'roleDescription'
          ? 'localized-carousel'
          : key,
}));

/** jsdom ships no PointerEvent, so `pointerType` would be dropped from test events. */
class PointerEventStub extends MouseEvent {
  readonly pointerType: string;

  constructor(type: string, init: { pointerType?: string } & ConstructorParameters<typeof MouseEvent>[1] = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? '';
  }
}

const IMAGES = [
  '/images/experiences/chivor-emerald-prime/card.webp',
  '/images/experiences/chivor-emerald-prime/highlights/highlight-1.webp',
  '/images/experiences/chivor-emerald-prime/highlights/highlight-2.webp',
];

function activeSlideIndex(): number {
  const slides = Array.from(document.querySelectorAll('picture'));
  return slides.findIndex((slide) => slide.getAttribute('aria-hidden') === null);
}

describe('CardImageCarousel', () => {
  beforeEach(() => {
    vi.stubGlobal('PointerEvent', PointerEventStub);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders no controls for a single image', () => {
    render(<CardImageCarousel images={[IMAGES[0]!]} title="Chivor tour" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('mounts only the first photo until it is shown', () => {
    const { container } = render(<CardImageCarousel images={IMAGES} title="Chivor tour" />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy');
  });

  it('moves forward and back with the arrow buttons, wrapping at the ends', () => {
    render(<CardImageCarousel images={IMAGES} title="Chivor tour" />);
    fireEvent.click(screen.getByRole('button', { name: 'previous' }));
    expect(activeSlideIndex()).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'next' }));
    expect(activeSlideIndex()).toBe(0);
  });

  it('jumps to a slide from its dot', () => {
    render(<CardImageCarousel images={IMAGES} title="Chivor tour" />);
    const dots = screen.getAllByRole('button', { name: /^slide:/ });
    fireEvent.click(dots[1]);
    expect(activeSlideIndex()).toBe(1);
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('slide:2/3')).toHaveAttribute('aria-live', 'polite');
  });

  it('names each carousel after its card, so landmarks stay unique', () => {
    render(<CardImageCarousel images={IMAGES} title="Chivor tour" />);
    expect(screen.getByRole('group', { name: 'gallery:Chivor tour' })).toHaveAttribute(
      'aria-roledescription',
      'localized-carousel',
    );
  });

  it('preloads the next photo on hover, before it is shown', () => {
    const { container } = render(<CardImageCarousel images={IMAGES} title="Chivor tour" />);
    fireEvent.pointerOver(screen.getByRole('group'), { pointerType: 'touch' });
    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(activeSlideIndex()).toBe(0);
  });

  it('changes photo on a horizontal touch swipe when swipe is enabled', () => {
    render(<CardImageCarousel images={IMAGES} title="Chivor tour" swipe />);
    const group = screen.getByRole('group');
    fireEvent.pointerDown(group, { pointerType: 'touch', clientX: 200 });
    fireEvent.pointerUp(group, { pointerType: 'touch', clientX: 120 });
    expect(activeSlideIndex()).toBe(1);
    fireEvent.pointerDown(group, { pointerType: 'touch', clientX: 120 });
    fireEvent.pointerUp(group, { pointerType: 'touch', clientX: 200 });
    expect(activeSlideIndex()).toBe(0);
  });

  it('ignores short drags and swipes when swipe is disabled', () => {
    const { rerender } = render(<CardImageCarousel images={IMAGES} title="Chivor tour" swipe />);
    const group = screen.getByRole('group');
    fireEvent.pointerDown(group, { pointerType: 'touch', clientX: 200 });
    fireEvent.pointerUp(group, { pointerType: 'touch', clientX: 180 });
    expect(activeSlideIndex()).toBe(0);

    rerender(<CardImageCarousel images={IMAGES} title="Chivor tour" />);
    fireEvent.pointerDown(group, { pointerType: 'touch', clientX: 200 });
    fireEvent.pointerUp(group, { pointerType: 'touch', clientX: 100 });
    expect(activeSlideIndex()).toBe(0);
  });

  it('preloads from the hover state owned by the card without changing slides', () => {
    const { rerender, container } = render(
      <CardImageCarousel images={IMAGES} title="Chivor tour" hovered={false} />,
    );
    expect(activeSlideIndex()).toBe(0);

    rerender(<CardImageCarousel images={IMAGES} title="Chivor tour" hovered />);
    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(activeSlideIndex()).toBe(0);
  });

  it('renders repeated image paths without colliding keys', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<CardImageCarousel images={[IMAGES[0], IMAGES[0]]} title="Chivor tour" />);
    expect(consoleError).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: /^slide:/ })[1]!);
    expect(activeSlideIndex()).toBe(1);
    consoleError.mockRestore();
  });

  it('advances exactly once when a swipe starts on an arrow', () => {
    render(<CardImageCarousel images={IMAGES} title="Chivor tour" swipe />);
    const next = screen.getByRole('button', { name: 'next' });
    fireEvent.pointerDown(next, { pointerType: 'touch', clientX: 200 });
    fireEvent.pointerUp(next, { pointerType: 'touch', clientX: 100 });
    fireEvent.click(next);
    expect(activeSlideIndex()).toBe(1);
  });
});
