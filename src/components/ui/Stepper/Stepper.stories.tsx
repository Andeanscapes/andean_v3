import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Stepper } from './Stepper';

const meta = {
  title: 'UI/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1,
    onChange: () => {},
  },
  render: () => {
    const [value, setValue] = useState(1);
    return <Stepper value={value} onChange={setValue} />;
  },
};

export const WithLimits: Story = {
  args: {
    value: 2,
    onChange: () => {},
    min: 1,
    max: 4,
    label: '¿Cuántas personas?',
  },
  render: () => {
    const [value, setValue] = useState(2);
    return (
      <Stepper
        value={value}
        onChange={setValue}
        min={1}
        max={4}
        label="¿Cuántas personas?"
      />
    );
  },
};

export const Large: Story = {
  args: {
    value: 1,
    onChange: () => {},
    size: 'lg',
  },
  render: () => {
    const [value, setValue] = useState(1);
    return (
      <Stepper value={value} onChange={setValue} size="lg" />
    );
  },
};
