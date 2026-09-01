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
    decreaseLabel: 'Disminuir',
    increaseLabel: 'Aumentar',
  },
  render: () => {
    const [value, setValue] = useState(1);
    return <Stepper value={value} onChange={setValue} decreaseLabel="Disminuir" increaseLabel="Aumentar" />;
  },
};

export const WithLimits: Story = {
  args: {
    value: 2,
    onChange: () => {},
    min: 1,
    max: 4,
    label: '¿Cuántas personas?',
    decreaseLabel: 'Disminuir',
    increaseLabel: 'Aumentar',
  },
  render: () => {
    const [value, setValue] = useState(2);
    return (
      <Stepper
        value={value}
        onChange={setValue}
        decreaseLabel="Disminuir"
        increaseLabel="Aumentar"
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
    decreaseLabel: 'Disminuir',
    increaseLabel: 'Aumentar',
    size: 'lg',
  },
  render: () => {
    const [value, setValue] = useState(1);
    return (
      <Stepper value={value} onChange={setValue} size="lg" decreaseLabel="Decrease" increaseLabel="Increase" />
    );
  },
};
