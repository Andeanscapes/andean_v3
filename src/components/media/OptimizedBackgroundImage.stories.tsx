import type { Meta, StoryObj } from '@storybook/react';
import OptimizedBackgroundImage from './OptimizedBackgroundImage';

const meta = {
  title: 'Components/Media/OptimizedBackgroundImage',
  component: OptimizedBackgroundImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="relative h-64 w-[420px] overflow-hidden rounded-2xl bg-slate-900">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OptimizedBackgroundImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: '/assets/images/hero/h10.webp',
  },
};
