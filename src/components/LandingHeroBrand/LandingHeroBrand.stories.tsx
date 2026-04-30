import type { Meta, StoryObj } from '@storybook/react';
import LandingHeroBrand from './LandingHeroBrand';
import { HERO_BRAND_FIXTURE } from './__fixtures__/heroBrandFixture';

const meta: Meta<typeof LandingHeroBrand> = {
  title: 'Landing/LandingHeroBrand',
  component: LandingHeroBrand,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingHeroBrand>;

export const Default: Story = {
  args: {
    hero: HERO_BRAND_FIXTURE,
  },
};

export const NoEyebrow: Story = {
  args: {
    hero: { ...HERO_BRAND_FIXTURE, eyebrow: '' },
  },
};

export const ShortContent: Story = {
  args: {
    hero: {
      ...HERO_BRAND_FIXTURE,
      subtitle: '',
      description: '',
      trustChips: HERO_BRAND_FIXTURE.trustChips.slice(0, 2),
    },
  },
};
