import type { Meta, StoryObj } from '@storybook/react';
import { ExperienceCard } from './ExperienceCard';
import type { ExperienceListCard } from '@/lib/schemas';

const sampleCard: ExperienceListCard = {
  id: 'emerald-mining',
  title: 'Emerald Mining Adventure',
  description: 'Discover the world of Colombian emeralds in an authentic mining experience deep in the mountains of Boyacá.',
  image: '/assets/images/details/emerald-mining-card.webp',
  price: 750000,
  currency: 'COP',
  priceQualifier: 'per person',
  metadata: ['2D/1N', 'Small groups', 'Chivor'],
  href: '/experiences/emerald-mining-adventure',
  tag: 'Most Popular',
};

const meta = {
  title: 'Components/ExperienceCard',
  component: ExperienceCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fromLabel: { control: 'text', description: 'Label above the price (e.g. "From")' },
    viewDetailsLabel: { control: 'text', description: 'CTA button text' },
    formattedPrice: { control: 'text', description: 'Pre-formatted price string' },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExperienceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    card: sampleCard,
    fromLabel: 'From',
    viewDetailsLabel: 'View Details',
    formattedPrice: '$750,000',
  },
};

export const WithoutPriceQualifier: Story = {
  args: {
    card: { ...sampleCard, priceQualifier: undefined },
    fromLabel: 'From',
    viewDetailsLabel: 'View Details',
    formattedPrice: '$750,000',
  },
};

export const NoMetadata: Story = {
  args: {
    card: { ...sampleCard, metadata: [] },
    fromLabel: 'From',
    viewDetailsLabel: 'View Details',
    formattedPrice: '$750,000',
  },
};

export const SpanishLocale: Story = {
  args: {
    card: {
      ...sampleCard,
      title: 'Aventura de Minería de Esmeraldas',
      description: 'Descubre el mundo de las esmeraldas colombianas en una experiencia auténtica de minería en las montañas de Boyacá.',
      tag: 'Más Popular',
      metadata: ['2D/1N', 'Grupos pequeños', 'Chivor'],
    },
    fromLabel: 'Desde',
    viewDetailsLabel: 'Ver Detalles',
    formattedPrice: '$750.000',
  },
};

export const GridPreview: Story = {
  args: {
    card: sampleCard,
    fromLabel: 'From',
    viewDetailsLabel: 'View Details',
    formattedPrice: '$750,000',
  },
  decorators: [
    (Story) => (
      <div className="grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Story />
        <Story />
        <Story />
      </div>
    ),
  ],
};
