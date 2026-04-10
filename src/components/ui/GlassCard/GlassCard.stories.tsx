import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from './GlassCard';

const meta = {
  title: 'UI/GlassCard',
  component: GlassCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  args: {
    variant: 'dark',
    className: 'rounded-2xl p-6',
    children: 'Dark glass surface',
  },
};

export const Light: Story = {
  args: {
    variant: 'light',
    className: 'rounded-2xl p-6',
    children: 'Light elevated surface',
  },
};
