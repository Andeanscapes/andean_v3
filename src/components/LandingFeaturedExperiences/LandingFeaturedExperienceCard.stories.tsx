import type { Meta, StoryObj } from '@storybook/react';
import LandingFeaturedExperienceCard from './LandingFeaturedExperienceCard';
import { FEATURED_FIXTURE } from './__fixtures__/featuredFixture';

const meta: Meta<typeof LandingFeaturedExperienceCard> = {
  title: 'Landing/LandingFeaturedExperiences/Card',
  component: LandingFeaturedExperienceCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingFeaturedExperienceCard>;

export const Featured: Story = {
  args: { experience: FEATURED_FIXTURE.items[0] },
};

export const NoBadge: Story = {
  args: { experience: { ...FEATURED_FIXTURE.items[0], badge: undefined } },
};

export const Pottery: Story = {
  args: { experience: FEATURED_FIXTURE.items[1] },
};
