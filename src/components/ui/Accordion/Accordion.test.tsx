import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion } from './Accordion';

describe('Accordion', () => {
  const items = [
    { id: 'item1', title: 'Title 1', content: 'Content 1' },
    { id: 'item2', title: 'Title 2', content: 'Content 2' },
  ];

  it('renders all titles', () => {
    render(<Accordion items={items} />);
    expect(screen.getByText('Title 1')).toBeInTheDocument();
    expect(screen.getByText('Title 2')).toBeInTheDocument();
  });

  it('opens item when clicked', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });

  it('opens items by default', () => {
    render(<Accordion items={items} defaultOpen={['item1']} />);
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(false);
  });

  it('closes other items when allowMultiple is false', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} allowMultiple={false} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    
    // Open first
    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();

    // Open second (should close first)
    await user.click(checkboxes[1]);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('allows multiple open items when allowMultiple is true', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} allowMultiple />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });
});
