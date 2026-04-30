import type { Meta, StoryObj } from '@storybook/react';
import LandingHeroBrandTrustChips from './LandingHeroBrandTrustChips';
import { HERO_BRAND_FIXTURE } from './__fixtures__/heroBrandFixture';

const meta: Meta<typeof LandingHeroBrandTrustChips> = {
  title: 'Landing/LandingHeroBrand/TrustChips',
  component: LandingHeroBrandTrustChips,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0A0A0A' }] },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingHeroBrandTrustChips>;

export const Default: Story = {
  args: { trustChips: HERO_BRAND_FIXTURE.trustChips },
};

export const Few: Story = {
  args: { trustChips: HERO_BRAND_FIXTURE.trustChips.slice(0, 2) },
};

export const Empty: Story = {
  args: { trustChips: [] },
};
