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

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens items by default', () => {
    render(<Accordion items={items} defaultOpen={['item1']} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the title button a direct child of the collapse so the arrow renders', () => {
    render(<Accordion items={items} />);
    const button = screen.getAllByRole('button')[0];
    expect(button).toHaveClass('collapse-title');
    expect(button.parentElement).toHaveClass('collapse-arrow');
  });

  it('links each button to its region', () => {
    render(<Accordion items={items} />);
    const button = screen.getAllByRole('button')[0];
    const panel = screen.getByRole('region', { name: 'Title 1' });
    expect(button).toHaveAttribute('aria-controls', panel.id);
  });

  it('closes other items when allowMultiple is false', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} allowMultiple={false} />);

    const buttons = screen.getAllByRole('button');

    await user.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');

    await user.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });

  it('allows multiple open items when allowMultiple is true', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} allowMultiple />);

    const buttons = screen.getAllByRole('button');

    await user.click(buttons[0]);
    await user.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });
});
