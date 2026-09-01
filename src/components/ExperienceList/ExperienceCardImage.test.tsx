/**
 * Regression tests for the card image on `/experiences`.
 *
 * Two bugs are guarded here, both of which shipped:
 *
 *  1. An `onLoad`-gated fade-in. Revealing the image from a React `load` handler
 *     loses the race when the browser finishes loading before hydration, and the
 *     image then stays at `opacity-0` for good — the card rendered an empty
 *     placeholder over an asset that was 200 OK.
 *  2. Routing through `next/image`. On the deployed Worker `/_next/image` is a
 *     pass-through (verified via `npm run preview`: same bytes and same
 *     716x955 dimensions for w=64 through w=3840), so mobile clients received
 *     the full-size original instead of the ~7x smaller `-mobile` variant.
 */

import { render } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import ExperienceCardImage from './ExperienceCardImage';

describe('ExperienceCardImage', () => {
  const mockProps = {
    src: '/images/experiences/emerald-mining/card.webp',
    alt: 'Emerald Mining Adventure',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  };

  it('renders the image with the given src and alt', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const img = container.querySelector('img');

    expect(img).toHaveAttribute('src', mockProps.src);
    expect(img).toHaveAttribute('alt', mockProps.alt);
    // A described image stays in the accessibility tree.
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('serves a smaller -mobile variant below 768px', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const source = container.querySelector('source');

    expect(source).toHaveAttribute('media', '(max-width: 767px)');
    expect(source).toHaveAttribute(
      'srcset',
      '/images/experiences/emerald-mining/card-mobile.webp',
    );
    expect(source).not.toHaveAttribute('type');
  });

  it('keeps a decorative fallback behind failed images without hydration state', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);

    expect(container.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();
  });

  // next/image would emit a /_next/image URL, which does nothing on the Worker.
  it('does not route through the Next image optimizer', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);

    expect(container.innerHTML).not.toContain('_next/image');
  });

  it('renders the image visible, without an opacity gate', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);

    expect(container.querySelector('img')?.className).not.toContain('opacity-0');
  });

  // ExperienceCard passes alt="" because it renders the title adjacently; an
  // unlabelled image left in the tree would be announced as "image".
  it('hides the image from assistive tech when used decoratively', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} alt="" />);
    const img = container.querySelector('img');

    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');
  });

  it('sets correct image attributes for performance', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const img = container.querySelector('img');

    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  it('renders with correct container dimensions', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper?.className).toContain('h-64');
    expect(wrapper?.className).toContain('w-full');
    expect(wrapper?.className).toContain('rounded-xl');
  });
});
