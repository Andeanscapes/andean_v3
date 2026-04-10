import type { Meta, StoryObj } from '@storybook/react';
import { PrimaryCtaButton } from './PrimaryCtaButton';

const meta = {
  title: 'UI/PrimaryCtaButton',
  component: PrimaryCtaButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PrimaryCtaButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AsButton: Story = {
  args: {
    children: 'Book Now',
  },
};

export const AsLink: Story = {
  args: {
    href: '/booking',
    children: 'Check Dates',
  },
};
