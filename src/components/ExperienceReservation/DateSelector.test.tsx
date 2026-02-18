import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DateSelector } from './DateSelector';
import type { AvailableDate } from '@/lib/experiences/types';

const MOCK_AVAILABLE_DATES: AvailableDate[] = [
  {
    id: 'mar-16-2026',
    startDate: '2026-03-16T00:00:00.000Z',
    endDate: '2026-03-17T23:59:59.999Z',
    spots: 2,
    isAvailable: true,
  },
  {
    id: 'apr-06-2026',
    startDate: '2026-04-06T00:00:00.000Z',
    endDate: '2026-04-07T23:59:59.999Z',
    spots: 4,
    isAvailable: true,
  },
  {
    id: 'may-04-2026',
    startDate: '2026-05-04T00:00:00.000Z',
    endDate: '2026-05-05T23:59:59.999Z',
    spots: 0,
    isAvailable: false,
  },
];

describe('DateSelector', () => {
  it('renders title', () => {
    render(<DateSelector availableDates={MOCK_AVAILABLE_DATES} />);
    expect(screen.getByText('Fechas disponibles')).toBeInTheDocument();
  });

  it('displays available dates only', () => {
    render(<DateSelector availableDates={MOCK_AVAILABLE_DATES} />);

    // Should show available dates
    expect(screen.getByText(/16.*17.*Mar/)).toBeInTheDocument();
    expect(screen.getByText(/6.*7.*Apr/)).toBeInTheDocument();
    
    // Should not show unavailable dates (may-04)
    expect(screen.queryByText(/4.*5.*May/)).not.toBeInTheDocument();
  });

  it('shows spot count', () => {
    render(<DateSelector availableDates={MOCK_AVAILABLE_DATES} />);
    
    // Verify spot counts are displayed (the pluralization is handled by next-intl)
    const dateButtons = screen.getAllByRole('button');
    expect(dateButtons).toHaveLength(2); // Only available dates
    
    // Check that the spot information is rendered (format may vary with i18n)
    expect(dateButtons[0].textContent).toContain('2');
    expect(dateButtons[1].textContent).toContain('4');
  });

  it('selects date when clicked', async () => {
    const user = userEvent.setup();
    render(<DateSelector availableDates={MOCK_AVAILABLE_DATES} />);

    const dateButtons = screen.getAllByRole('button');
    await user.click(dateButtons[0]);

    expect(dateButtons[0]).toHaveClass('bg-primary/10');
  });
});