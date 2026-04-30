import type { Meta, StoryObj } from '@storybook/react';
import LandingHeroBrandSearch from './LandingHeroBrandSearch';
import { HERO_BRAND_FIXTURE } from './__fixtures__/heroBrandFixture';

const meta: Meta<typeof LandingHeroBrandSearch> = {
  title: 'Landing/LandingHeroBrand/Search',
  component: LandingHeroBrandSearch,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#0A0A0A' }] },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingHeroBrandSearch>;

export const Default: Story = {
  args: { search: HERO_BRAND_FIXTURE.search },
};
