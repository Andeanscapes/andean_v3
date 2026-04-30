import type { Meta, StoryObj } from '@storybook/react';
import FloatingWhatsApp from './FloatingWhatsApp';

const meta: Meta<typeof FloatingWhatsApp> = {
  title: 'UI/FloatingWhatsApp',
  component: FloatingWhatsApp,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FloatingWhatsApp>;

export const Default: Story = {
  args: {
    href: 'https://wa.me/573001234567',
    ariaLabel: 'Chat with us on WhatsApp',
    // Force visibility in story by lowering threshold
    showAfter: 0,
  },
};
