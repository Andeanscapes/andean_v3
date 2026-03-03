import React from 'react';

export interface SegmentedControlProps {
  options: { label: string | React.ReactNode; value: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(
  (
    {
      options,
      value,
      onChange,
      disabled = false,
      size = 'md',
      fullWidth = false,
      className = '',
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    };

    return (
      <div
        ref={ref}
        className={`btn-group ${fullWidth ? 'w-full' : ''} ${className}`}
        role="group"
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`btn ${sizeClasses[size]} focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
              value === option.value
                ? 'btn-primary text-primary-content shadow-sm'
                : 'btn-ghost text-base-content/80'
            }`}
            disabled={disabled}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }
);

SegmentedControl.displayName = 'SegmentedControl';
