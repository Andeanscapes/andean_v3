import type { Meta, StoryObj } from '@storybook/react';
import LandingWhyUs from './LandingWhyUs';
import { WHYUS_FIXTURE } from './__fixtures__/whyUsFixture';

const meta: Meta<typeof LandingWhyUs> = {
  title: 'Landing/LandingWhyUs',
  component: LandingWhyUs,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingWhyUs>;

export const Default: Story = {
  args: { whyUs: WHYUS_FIXTURE },
};

export const TwoItems: Story = {
  args: { whyUs: { ...WHYUS_FIXTURE, items: WHYUS_FIXTURE.items.slice(0, 2) } },
};

export const Empty: Story = {
  args: { whyUs: { ...WHYUS_FIXTURE, items: [] } },
};
