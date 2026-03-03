import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: 'item1', title: 'Item 1', content: 'This is item 1 content' },
  { id: 'item2', title: 'Item 2', content: 'This is item 2 content' },
  { id: 'item3', title: 'Item 3', content: 'This is item 3 content' },
];

export const Default: Story = {
  args: {
    items,
  },
};

export const DefaultOpen: Story = {
  args: {
    items,
    defaultOpen: ['item1'],
  },
};

export const AllowMultiple: Story = {
  args: {
    items,
    allowMultiple: true,
  },
};
