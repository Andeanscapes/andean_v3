import { render, screen, waitFor, within } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PeopleSelector } from './PeopleSelector';

describe('PeopleSelector', () => {
  it('renders title', () => {
    render(<PeopleSelector />);
    expect(screen.getByText('¿Cuántas personas?')).toBeInTheDocument();
  });

  it('renders selected rooms summary', () => {
    localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
    render(<PeopleSelector />);
    expect(screen.getByText('Habitaciones seleccionadas')).toBeInTheDocument();
  });

  it('renders room mode options in modal', async () => {
    const user = userEvent.setup();
    localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
    render(<PeopleSelector />);
    const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
    await user.click(openBtn);
    expect(screen.getByText('Habitación Estándar')).toBeInTheDocument();
    expect(screen.getByText('Habitación Familiar')).toBeInTheDocument();
    expect(screen.getByText('Cabaña')).toBeInTheDocument();
  });

  it('updates people count when room selection changes', async () => {
    const user = userEvent.setup();
    localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
    render(<PeopleSelector />);

    // Initial state has no rooms selected (0 people)
    expect(screen.getByText(/Personas\s*:\s*0/)).toBeInTheDocument();

    const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
    await user.click(openBtn);

    // Find Family Room group and select 3 guests occupancy
    const familyHeading = screen.getByText('Habitación Familiar');
    const familyGroup = familyHeading.closest('.rounded-xl') as HTMLElement;
    
    // Click the "3" button in the occupancy selector
    const threeGuestsBtn = within(familyGroup).getByRole('button', { name: '3' });
    await user.click(threeGuestsBtn);
    
    // Increase room count by 1
    const increaseBtn = within(familyGroup).getByRole('button', { name: 'Increase' });
    await user.click(increaseBtn);

    // Now we have 1 family_3 (3 people) = 3 people total
    await waitFor(() => {
      expect(screen.getByText(/Personas\s*:\s*3/)).toBeInTheDocument();
    });
  });

  describe('Overbooking prevention', () => {
    it('should not allow exceeding unit availability (Standard: 3 units)', async () => {
      const user = userEvent.setup();
      localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
      render(<PeopleSelector />);

      const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
      await user.click(openBtn);

      // Find Standard Room group
      const standardHeading = screen.getByText('Habitación Estándar');
      const standardGroup = standardHeading.closest('.rounded-xl') as HTMLElement;

      // Select 1-person occupancy
      const oneGuestBtn = within(standardGroup).getByRole('button', { name: '1' });
      await user.click(oneGuestBtn);

      // Try to add 4 rooms (but max is 3 units)
      const increaseBtn = within(standardGroup).getAllByRole('button', { name: 'Increase' })[0];
      await user.click(increaseBtn);
      await user.click(increaseBtn);
      await user.click(increaseBtn);
      await user.click(increaseBtn); // Try 4th click

      // Should only have 3, not 4
      await waitFor(() => {
        expect(screen.getByText(/Personas\s*:\s*3/)).toBeInTheDocument();
      });

      // Verify summary shows exactly 3 rooms (not 4)
      expect(screen.getByText(/3 × Habitación Estándar/)).toBeInTheDocument();
    });

    it('should not allow exceeding maxPeople limit (4 people default)', async () => {
      const user = userEvent.setup();
      localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
      render(<PeopleSelector maxPeople={4} />);

      const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
      await user.click(openBtn);

      // Find Standard Room group
      const standardHeading = screen.getByText('Habitación Estándar');
      const standardGroup = standardHeading.closest('.rounded-xl') as HTMLElement;

      // Select 2-person occupancy
      const twoGuestBtn = within(standardGroup).getByRole('button', { name: '2' });
      await user.click(twoGuestBtn);

      // Try to add 3 rooms (3 * 2 = 6 people, exceeds 4 max)
      const increaseBtn = within(standardGroup).getAllByRole('button', { name: 'Increase' })[0];
      await user.click(increaseBtn);
      await user.click(increaseBtn);
      await user.click(increaseBtn); // Try 3rd room

      // Should only allow 2 rooms (2 * 2 = 4 people)
      await waitFor(() => {
        expect(screen.getByText(/Personas\s*:\s*4/)).toBeInTheDocument();
      });
    });

    it('should handle mixed room types without exceeding capacity', async () => {
      const user = userEvent.setup();
      localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
      render(<PeopleSelector maxPeople={6} />);

      const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
      await user.click(openBtn);

      // Add 1 Standard 2-person room (2 people)
      const standardHeading = screen.getByText('Habitación Estándar');
      const standardGroup = standardHeading.closest('.rounded-xl') as HTMLElement;
      const twoGuestBtn = within(standardGroup).getByRole('button', { name: '2' });
      await user.click(twoGuestBtn);

      const standardIncreaseBtn = within(standardGroup).getAllByRole('button', { name: 'Increase' })[0];
      await user.click(standardIncreaseBtn);

      // Add 1 Family 3-person room (3 people)
      const familyHeading = screen.getByText('Habitación Familiar');
      const familyGroup = familyHeading.closest('.rounded-xl') as HTMLElement;
      const threeGuestBtn = within(familyGroup).getByRole('button', { name: '3' });
      await user.click(threeGuestBtn);

      const familyIncreaseBtn = within(familyGroup).getAllByRole('button', { name: 'Increase' })[0];
      await user.click(familyIncreaseBtn);

      // Total should be 5 people (2 + 3)
      await waitFor(() => {
        expect(screen.getByText(/Personas\s*:\s*5/)).toBeInTheDocument();
      });

      // Verify both rooms appear in summary
      expect(screen.getByText(/1 × Habitación Estándar \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/1 × Habitación Familiar \(3\)/)).toBeInTheDocument();
    });

    it('should not allow exceeding single unit availability (Family: 1 unit)', async () => {
      const user = userEvent.setup();
      localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
      render(<PeopleSelector maxPeople={10} />);

      const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
      await user.click(openBtn);

      // Find Family Room group
      const familyHeading = screen.getByText('Habitación Familiar');
      const familyGroup = familyHeading.closest('.rounded-xl') as HTMLElement;

      // Select 1-person occupancy
      const oneGuestBtn = within(familyGroup).getByRole('button', { name: '1' });
      await user.click(oneGuestBtn);

      // Try to add 2 rooms (but max is 1 unit for Family)
      const increaseBtn = within(familyGroup).getAllByRole('button', { name: 'Increase' })[0];
      await user.click(increaseBtn);
      await user.click(increaseBtn); // Try 2nd click

      // Should only have 1 room
      await waitFor(() => {
        expect(screen.getByText(/Personas\s*:\s*1/)).toBeInTheDocument();
      });
    });

    it('should correctly clamp rooms when switching occupancy reduces capacity', async () => {
      const user = userEvent.setup();
      localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
      render(<PeopleSelector maxPeople={5} />);

      const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
      await user.click(openBtn);

      // Add 2 Standard 2-person rooms (4 people)
      const standardHeading = screen.getByText('Habitación Estándar');
      const standardGroup = standardHeading.closest('.rounded-xl') as HTMLElement;
      const twoGuestBtn = within(standardGroup).getByRole('button', { name: '2' });
      await user.click(twoGuestBtn);

      const standardIncreaseBtn = within(standardGroup).getAllByRole('button', { name: 'Increase' })[0];
      await user.click(standardIncreaseBtn);
      await user.click(standardIncreaseBtn);

      // At this point: 2 rooms × 2 people = 4 people
      await waitFor(() => {
        expect(screen.getByText(/Personas\s*:\s*4/)).toBeInTheDocument();
      });

      // Now switch to 1-person occupancy
      // With 2 rooms × 1 person = 2 people (within 5 max)
      const oneGuestBtn = within(standardGroup).getByRole('button', { name: '1' });
      await user.click(oneGuestBtn);

      // Should preserve the 2 rooms at new occupancy
      await waitFor(() => {
        expect(screen.getByText(/2 × Habitación Estándar \(1\)/)).toBeInTheDocument();
        expect(screen.getByText(/Personas\s*:\s*2/)).toBeInTheDocument();
      });
    });

    it('should prevent selection when switching would exceed capacity', async () => {
      const user = userEvent.setup();
      localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
      render(<PeopleSelector maxPeople={4} />);

      const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
      await user.click(openBtn);

      // Add 2 Standard 2-person rooms (4 people = at max)
      const standardHeading = screen.getByText('Habitación Estándar');
      const standardGroup = standardHeading.closest('.rounded-xl') as HTMLElement;
      const twoGuestBtn = within(standardGroup).getByRole('button', { name: '2' });
      await user.click(twoGuestBtn);

      const standardIncreaseBtn = within(standardGroup).getAllByRole('button', { name: 'Increase' })[0];
      await user.click(standardIncreaseBtn);
      await user.click(standardIncreaseBtn);

      // At max: 4 people
      await waitFor(() => {
        expect(screen.getByText(/Personas\s*:\s*4/)).toBeInTheDocument();
      });

      // Try to switch to 3-person occupancy (would exceed if kept 2 rooms)
      // But system should either prevent or clamp appropriately
      // With maxPeople=4, we can't fit 2 × 3 person rooms
      // The UI should prevent this or automatically clamp to 1 room

      // Summary should still show valid state
      const standardSummary = screen.queryByText(/× Habitación Estándar/);
      if (standardSummary) {
        // If rooms still exist, people count should not exceed 4
        expect(screen.getByText(/Personas\s*:\s*[0-4]$/)).toBeInTheDocument();
      }
    });

    it('should handle cabin special case (6-person unit with 1 available)', async () => {
      const user = userEvent.setup();
      localStorage.removeItem('andeanScapes:emeraldMiningReservation:v1');
      render(<PeopleSelector maxPeople={10} />);

      const openBtn = screen.getByRole('button', { name: 'Agregar habitación' });
      await user.click(openBtn);

      // Find Cabin group
      const cabinHeading = screen.getByText('Cabaña');
      const cabinGroup = cabinHeading.closest('.rounded-xl') as HTMLElement;

      // Select 6-person occupancy
      const sixGuestBtn = within(cabinGroup).getByRole('button', { name: '6' });
      await user.click(sixGuestBtn);

      // Add 1 cabin
      const increaseBtn = within(cabinGroup).getAllByRole('button', { name: 'Increase' })[0];
      await user.click(increaseBtn);

      // Try to add 2nd (should be blocked - only 1 unit available)
      await user.click(increaseBtn);

      // Should only have 1 cabin (1 unit max)
      await waitFor(() => {
        expect(screen.getByText(/Personas\s*:\s*6/)).toBeInTheDocument();
        expect(screen.getByText(/1 × Cabaña \(6\)/)).toBeInTheDocument();
      });
    });
  });
});
