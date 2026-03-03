import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Variants: Story = {
  args: { children: 'Badge' },
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
};

export const Selectable: Story = {
  args: { children: 'Badge' },
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);
    const options = ['Sáb 16 - Dom 17 Mar', 'Sáb 06 - Dom 07 Abr'];
    
    return (
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <Badge
            key={opt}
            selected={selected === opt}
            onClick={() => setSelected(opt)}
          >
            {opt}
          </Badge>
        ))}
      </div>
    );
  },
};
