import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { label: 'Privado', value: 'private' },
  { label: 'Pareja', value: 'couple' },
];

export const Default: Story = {
  args: {
    options,
    value: 'private',
    onChange: () => {},
  },
  render: () => {
    const [value, setValue] = useState('private');
    return (
      <SegmentedControl
        options={options}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Fullwidth: Story = {
  args: {
    options,
    value: 'private',
    onChange: () => {},
    fullWidth: true,
  },
  render: () => {
    const [value, setValue] = useState('private');
    return (
      <SegmentedControl
        options={options}
        value={value}
        onChange={setValue}
        fullWidth
      />
    );
  },
};
