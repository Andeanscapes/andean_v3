import type { Meta, StoryObj } from '@storybook/react';
import { SectionContainer } from './SectionContainer';

const meta = {
  title: 'UI/SectionContainer',
  component: SectionContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SectionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sectionClassName: 'px-4 py-10 bg-base-200',
    children: <div className="rounded-xl bg-base-100 p-6">Section content</div>,
  },
};
