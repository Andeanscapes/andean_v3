import React from 'react';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      value,
      onChange,
      min = 1,
      max = Infinity,
      step = 1,
      disabled = false,
      label,
      size = 'md',
      className = '',
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    };

    const handleDecrement = () => {
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    };

    const handleIncrement = () => {
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    };

    const inputClasses = {
      sm: 'input-sm max-w-20',
      md: 'input-md max-w-24',
      lg: 'input-lg max-w-32',
    };

    return (
      <div ref={ref} className={`form-control ${className}`}>
        {label && (
          <label className="label">
            <span className="label-text text-base-content/90">{label}</span>
          </label>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            className={`btn ${sizeClasses[size]} focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100`}
            aria-label="Decrease"
          >
            −
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || min)}
            disabled={disabled}
            min={min}
            max={max}
            className={`input input-bordered text-center ${inputClasses[size]} focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 focus-visible:outline-none`}
            role="spinbutton"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
          />
          <button
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            className={`btn ${sizeClasses[size]} focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100`}
            aria-label="Increase"
          >
            +
          </button>
        </div>
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';
