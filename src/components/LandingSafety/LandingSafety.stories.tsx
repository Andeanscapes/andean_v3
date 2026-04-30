import type { Meta, StoryObj } from '@storybook/react';
import LandingSafety from './LandingSafety';
import { SAFETY_FIXTURE } from './__fixtures__/safetyFixture';

const meta: Meta<typeof LandingSafety> = {
  title: 'Landing/LandingSafety',
  component: LandingSafety,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingSafety>;

export const Default: Story = {
  args: { safety: SAFETY_FIXTURE },
};

export const ThreeItems: Story = {
  args: { safety: { ...SAFETY_FIXTURE, items: SAFETY_FIXTURE.items.slice(0, 3) } },
};

export const Empty: Story = {
  args: { safety: { ...SAFETY_FIXTURE, items: [] } },
};
