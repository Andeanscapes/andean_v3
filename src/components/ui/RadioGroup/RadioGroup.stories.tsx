import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioGroup } from './RadioGroup';

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2', description: 'With description' },
  { value: 'option3', label: 'Option 3' },
];

export const Default: Story = {
  args: {
    name: 'example',
    options,
    value: null,
    onChange: () => {},
  },
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <RadioGroup
        name="example"
        options={options}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithLabel: Story = {
  args: {
    name: 'example',
    options,
    value: null,
    onChange: () => {},
    label: 'Select an option',
  },
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <RadioGroup
        name="example"
        options={options}
        value={value}
        onChange={setValue}
        label="Select an option"
      />
    );
  },
};

export const WithError: Story = {
  args: {
    name: 'example',
    options,
    value: null,
    onChange: () => {},
    label: 'Select an option',
    errorMessage: 'This field is required',
  },
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <RadioGroup
        name="example"
        options={options}
        value={value}
        onChange={setValue}
        label="Select an option"
        errorMessage="This field is required"
      />
    );
  },
};
