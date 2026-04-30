import type { Meta, StoryObj } from '@storybook/react';
import LandingHowItWorks from './LandingHowItWorks';
import { HOWITWORKS_FIXTURE } from './__fixtures__/howItWorksFixture';

const meta: Meta<typeof LandingHowItWorks> = {
  title: 'Landing/LandingHowItWorks',
  component: LandingHowItWorks,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingHowItWorks>;

export const Default: Story = {
  args: { howItWorks: HOWITWORKS_FIXTURE },
};

export const ThreeSteps: Story = {
  args: {
    howItWorks: { ...HOWITWORKS_FIXTURE, steps: HOWITWORKS_FIXTURE.steps.slice(0, 3) },
  },
};

export const Empty: Story = {
  args: { howItWorks: { ...HOWITWORKS_FIXTURE, steps: [] } },
};
