import { render, screen, waitFor } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ExperienceCardImage from './ExperienceCardImage';

describe('ExperienceCardImage', () => {
  const mockProps = {
    src: '/assets/images/details/emerald-mining-card.webp',
    alt: 'Emerald Mining Adventure',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  };

  it('renders with loading skeleton initially', () => {
    render(<ExperienceCardImage {...mockProps} />);
    const container = screen.getByRole('img', { hidden: true }).closest('picture')?.parentElement;
    expect(container).toHaveClass('bg-base-200');
  });

  it('renders loading icon in fallback state', () => {
    render(<ExperienceCardImage {...mockProps} />);
    // The ImageIcon should be present but with opacity-100 initially
    const iconContainer = document.querySelector('.animate-pulse');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders picture element with responsive sources', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const picture = container.querySelector('picture');
    expect(picture).toBeInTheDocument();
    
    const sources = picture?.querySelectorAll('source');
    expect(sources?.length).toBe(2);
  });

  it('uses correct media queries for mobile and desktop', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const sources = container.querySelectorAll('source');
    const sourceArray = Array.from(sources);
    
    const mobileSource = sourceArray.find((s) => s.getAttribute('media') === '(max-width: 767px)');
    const desktopSource = sourceArray.find((s) => s.getAttribute('media') === '(min-width: 768px)');
    
    expect(mobileSource).toBeInTheDocument();
    expect(desktopSource).toBeInTheDocument();
  });

  it('derives mobile image path correctly', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const sources = container.querySelectorAll('source');
    const mobileSource = Array.from(sources).find(
      (s) => s.getAttribute('media') === '(max-width: 767px)'
    );
    
    expect(mobileSource?.getAttribute('srcset')).toBe(
      '/assets/images/details/emerald-mining-card-mobile.webp'
    );
  });

  it('uses desktop image path for desktop viewport', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const sources = container.querySelectorAll('source');
    const desktopSource = Array.from(sources).find(
      (s) => s.getAttribute('media') === '(min-width: 768px)'
    );
    
    expect(desktopSource?.getAttribute('srcset')).toBe(mockProps.src);
  });

  it('sets correct image attributes for performance', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const img = container.querySelector('img');
    
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('decoding')).toBe('async');
  });

  it('applies fade transition when image loads', async () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const img = container.querySelector('img') as HTMLImageElement;
    
    expect(img?.className).toContain('opacity-0');
    
    // Simulate image load
    img?.dispatchEvent(new Event('load'));
    
    await waitFor(() => {
      expect(img?.className).toContain('opacity-100');
    });
  });

  it('hides loading skeleton when image is loaded', async () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const img = container.querySelector('img') as HTMLImageElement;
    const skeleton = container.querySelector('[aria-hidden="true"]');
    
    expect(skeleton?.className).toContain('opacity-100');
    
    img?.dispatchEvent(new Event('load'));
    
    await waitFor(() => {
      expect(skeleton?.className).toContain('opacity-0');
    });
  });

  it('renders with correct container dimensions', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const wrapper = container.firstChild as HTMLElement;
    
    expect(wrapper?.className).toContain('h-64');
    expect(wrapper?.className).toContain('w-full');
    expect(wrapper?.className).toContain('rounded-xl');
  });

  it('applies correct image optimization attributes', () => {
    const { container } = render(<ExperienceCardImage {...mockProps} />);
    const img = container.querySelector('img');
    
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('decoding')).toBe('async');
    expect(img?.getAttribute('alt')).toBe(mockProps.alt);
  });
});
