import type { Meta, StoryObj } from '@storybook/react';
import LandingLocation from './LandingLocation';
import { LOCATION_FIXTURE } from './__fixtures__/locationFixture';

const meta: Meta<typeof LandingLocation> = {
  title: 'Landing/LandingLocation',
  component: LandingLocation,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingLocation>;

export const Default: Story = {
  args: { locationBrand: LOCATION_FIXTURE },
};

export const NoBullets: Story = {
  args: { locationBrand: { ...LOCATION_FIXTURE, bullets: [] } },
};
