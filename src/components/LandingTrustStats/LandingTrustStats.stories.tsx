import type { Meta, StoryObj } from '@storybook/react';
import LandingTrustStats from './LandingTrustStats';
import { TRUST_STATS_FIXTURE } from './__fixtures__/trustStatsFixture';

const meta: Meta<typeof LandingTrustStats> = {
  title: 'Landing/LandingTrustStats',
  component: LandingTrustStats,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingTrustStats>;

export const Default: Story = {
  args: { trustStats: TRUST_STATS_FIXTURE },
};

export const TwoStats: Story = {
  args: {
    trustStats: { ...TRUST_STATS_FIXTURE, items: TRUST_STATS_FIXTURE.items.slice(0, 2) },
  },
};

export const Empty: Story = {
  args: { trustStats: { ...TRUST_STATS_FIXTURE, items: [] } },
};
