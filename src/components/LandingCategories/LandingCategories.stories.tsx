import type { Meta, StoryObj } from '@storybook/react';
import LandingCategories from './LandingCategories';
import { CATEGORIES_FIXTURE } from './__fixtures__/categoriesFixture';

const meta: Meta<typeof LandingCategories> = {
  title: 'Landing/LandingCategories',
  component: LandingCategories,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingCategories>;

export const Default: Story = {
  args: { categories: CATEGORIES_FIXTURE },
};

export const TwoItems: Story = {
  args: {
    categories: { ...CATEGORIES_FIXTURE, items: CATEGORIES_FIXTURE.items.slice(0, 2) },
  },
};

export const Empty: Story = {
  args: { categories: { ...CATEGORIES_FIXTURE, items: [] } },
};
