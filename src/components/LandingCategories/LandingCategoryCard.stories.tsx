import type { Meta, StoryObj } from '@storybook/react';
import LandingCategoryCard from './LandingCategoryCard';
import { CATEGORIES_FIXTURE } from './__fixtures__/categoriesFixture';

const meta: Meta<typeof LandingCategoryCard> = {
  title: 'Landing/LandingCategories/Card',
  component: LandingCategoryCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LandingCategoryCard>;

export const Default: Story = {
  args: { category: CATEGORIES_FIXTURE.items[0] },
};

export const NatureVariant: Story = {
  args: { category: CATEGORIES_FIXTURE.items[1] },
};
