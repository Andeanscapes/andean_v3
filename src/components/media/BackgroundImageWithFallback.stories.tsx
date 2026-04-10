import type { Meta, StoryObj } from '@storybook/react';
import BackgroundImageWithFallback from './BackgroundImageWithFallback';

const meta = {
  title: 'Components/Media/BackgroundImageWithFallback',
  component: BackgroundImageWithFallback,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="relative h-64 w-[420px] overflow-hidden rounded-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BackgroundImageWithFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: '/assets/images/hero/h10.webp',
  },
};
