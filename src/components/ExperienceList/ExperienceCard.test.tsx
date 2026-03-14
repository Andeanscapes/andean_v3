import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { ExperienceCard } from './ExperienceCard';
import type { ExperienceListCard } from '@/lib/schemas';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const mockCard: ExperienceListCard = {
  id: 'emerald-mining',
  title: 'Emerald Mining Adventure',
  description: 'Discover the world of Colombian emeralds in an authentic mining experience.',
  image: '/assets/images/details/emerald-mining-card.webp',
  price: 750000,
  priceQualifier: 'per person',
  metadata: ['2D/1N', 'Small groups', 'Chivor'],
  href: '/experiences/emerald-mining-adventure',
  tag: 'Most Popular',
  trust: '⭐ 4.9',
};

const defaultProps = {
  card: mockCard,
  fromLabel: 'From',
  viewDetailsLabel: 'View Details',
  formattedPrice: '$750,000',
};

describe('ExperienceCard', () => {
  it('renders the card title', () => {
    render(<ExperienceCard {...defaultProps} />);
    expect(screen.getByText('Emerald Mining Adventure')).toBeInTheDocument();
  });

  it('renders the card description', () => {
    render(<ExperienceCard {...defaultProps} />);
    expect(screen.getByText(mockCard.description)).toBeInTheDocument();
  });

  it('renders the tag badge', () => {
    render(<ExperienceCard {...defaultProps} />);
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('renders the formatted price', () => {
    render(<ExperienceCard {...defaultProps} />);
    expect(screen.getByText('$750,000')).toBeInTheDocument();
  });

  it('renders the from label', () => {
    render(<ExperienceCard {...defaultProps} />);
    expect(screen.getByText('From')).toBeInTheDocument();
  });

  it('renders the price qualifier when provided', () => {
    render(<ExperienceCard {...defaultProps} />);
    expect(screen.getByText('per person')).toBeInTheDocument();
  });

  it('does not render price qualifier when not provided', () => {
    const cardWithoutQualifier = { ...mockCard, priceQualifier: undefined };
    render(<ExperienceCard {...defaultProps} card={cardWithoutQualifier} />);
    expect(screen.queryByText('per person')).not.toBeInTheDocument();
  });

  it('renders metadata badges (max 3)', () => {
    render(<ExperienceCard {...defaultProps} />);
    expect(screen.getByText('2D/1N')).toBeInTheDocument();
    expect(screen.getByText('Small groups')).toBeInTheDocument();
    expect(screen.getByText('Chivor')).toBeInTheDocument();
  });

  it('does not render metadata section when metadata is empty', () => {
    const cardNoMeta = { ...mockCard, metadata: [] };
    render(<ExperienceCard {...defaultProps} card={cardNoMeta} />);
    expect(screen.queryByText('2D/1N')).not.toBeInTheDocument();
  });

  it('renders at most 3 metadata badges', () => {
    const cardExtraMeta = { ...mockCard, metadata: ['A', 'B', 'C', 'D'] };
    render(<ExperienceCard {...defaultProps} card={cardExtraMeta} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('D')).not.toBeInTheDocument();
  });

  it('renders view details link with correct href', () => {
    render(<ExperienceCard {...defaultProps} />);
    const link = screen.getByRole('link', { name: 'View Details' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/experiences/emerald-mining-adventure');
  });

  it('renders image fallback skeleton while loading', () => {
    const { container } = render(<ExperienceCard {...defaultProps} />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
  });
});
