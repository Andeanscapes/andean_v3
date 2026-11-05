import React from 'react';

export interface SegmentedControlProps {
  options: { label: string | React.ReactNode; value: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  /** `pills`: wrapping chip row for content switchers; `segmented` (default): joined buttons. */
  variant?: 'segmented' | 'pills';
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
      variant = 'segmented',
      className = '',
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    };

    if (variant === 'pills') {
      return (
        <div ref={ref} className={`flex flex-wrap justify-center gap-2 ${className}`.trim()} role="group">
          {options.map((option) => {
            const active = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                disabled={disabled}
                aria-pressed={active}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
                  active
                    ? 'border-primary bg-primary font-semibold text-primary-content'
                    : 'border-base-content/10 bg-base-200/60 font-medium text-base-content/80 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }

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
