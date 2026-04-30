import type { Meta, StoryObj } from '@storybook/react';
import LandingTravelerSegments from './LandingTravelerSegments';
import { TRAVELER_SEGMENTS_FIXTURE } from './__fixtures__/travelerSegmentsFixture';

const meta: Meta<typeof LandingTravelerSegments> = {
  title: 'Landing/LandingTravelerSegments',
  component: LandingTravelerSegments,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingTravelerSegments>;

export const Default: Story = {
  args: { travelerSegments: TRAVELER_SEGMENTS_FIXTURE },
};

export const TwoSegments: Story = {
  args: {
    travelerSegments: {
      ...TRAVELER_SEGMENTS_FIXTURE,
      segments: TRAVELER_SEGMENTS_FIXTURE.segments.slice(0, 2),
    },
  },
};

export const Empty: Story = {
  args: { travelerSegments: { ...TRAVELER_SEGMENTS_FIXTURE, segments: [] } },
};
