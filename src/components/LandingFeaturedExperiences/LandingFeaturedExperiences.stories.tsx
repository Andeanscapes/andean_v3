import type { Meta, StoryObj } from '@storybook/react';
import LandingFeaturedExperiences from './LandingFeaturedExperiences';
import { FEATURED_FIXTURE } from './__fixtures__/featuredFixture';

const meta: Meta<typeof LandingFeaturedExperiences> = {
  title: 'Landing/LandingFeaturedExperiences',
  component: LandingFeaturedExperiences,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingFeaturedExperiences>;

export const Default: Story = {
  args: { featured: FEATURED_FIXTURE },
};

export const SingleItem: Story = {
  args: { featured: { ...FEATURED_FIXTURE, items: FEATURED_FIXTURE.items.slice(0, 1) } },
};

export const Empty: Story = {
  args: { featured: { ...FEATURED_FIXTURE, items: [] } },
};
