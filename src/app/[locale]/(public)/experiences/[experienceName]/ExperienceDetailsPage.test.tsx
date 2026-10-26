import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MOCK_EXPERIENCE_DATA } from '@/test/test-utils';
import ExperienceDetailsPage from './ExperienceDetailsPage';

// Sections are covered by their own tests; this suite only checks page composition.
vi.mock('@/contexts/ExperienceDetailContext', () => ({
  ExperienceDetailProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/ExperienceHero/ExperienceHero', () => ({ default: () => null }));
vi.mock('@/components/ExpericeWidget/ExpericeWidget', () => ({ default: () => null }));
vi.mock('@/components/ValuePropositions/ValuePropositions', () => ({ default: () => null }));
vi.mock('@/components/Inclusions/Inclusions', () => ({ default: () => null }));
vi.mock('@/components/AccommodationTiers/AccommodationTiers', () => ({ default: () => null }));
vi.mock('@/components/OptionalExtras/OptionalExtras', () => ({ default: () => null }));
vi.mock('@/components/Itinerary/Itinerary', () => ({ default: () => null }));
vi.mock('@/components/Host/Host', () => ({ default: () => null }));
vi.mock('@/components/Faqs/Faqs', () => ({ default: () => null }));
vi.mock('./MobileStickyBookingBar', () => ({ default: () => null }));

function renderWithNights(numberOfNights: number) {
  const experienceData = {
    ...MOCK_EXPERIENCE_DATA,
    config: { ...MOCK_EXPERIENCE_DATA.config, numberOfNights },
  };
  return render(<ExperienceDetailsPage experienceData={experienceData} />);
}

describe('ExperienceDetailsPage', () => {
  it('renders the accommodation section for overnight experiences', () => {
    const { container } = renderWithNights(1);
    expect(container.querySelector('#accommodation')).not.toBeNull();
  });

  it('omits the accommodation section for day trips', () => {
    const { container } = renderWithNights(0);
    expect(container.querySelector('#accommodation')).toBeNull();
    expect(container.querySelector('#inclusions')).not.toBeNull();
  });
});
