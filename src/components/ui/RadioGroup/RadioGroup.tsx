import React from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioProps {
  option: RadioOption;
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ option, name, checked, onChange }, ref) => {
    return (
      <div className="form-control">
        <label
          className={`label cursor-pointer w-full pr-4 items-start gap-3 ${
            option.disabled ? 'opacity-50' : ''
          }`}
        >
          <input
            ref={ref}
            type="radio"
            name={name}
            value={option.value}
            checked={checked}
            onChange={(e) => onChange(e.target.value)}
            className="radio radio-primary focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            disabled={option.disabled}
          />
          <div className="label-text min-w-0 pr-2 break-words flex-1">
            <div className="font-medium text-base-content/90 break-words whitespace-normal">
              {option.label}
            </div>
            {option.description && (
              <div className="text-sm text-base-content/75 break-words whitespace-normal">
                {option.description}
              </div>
            )}
          </div>
        </label>
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorMessage?: string;
  helperText?: string;
  orientation?: 'vertical' | 'horizontal';
  label?: string;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      errorMessage,
      helperText,
      orientation = 'vertical',
      label,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="form-control w-full">
        {label && (
          <label className="label mb-2">
            <span className={`label-text ${errorMessage ? 'text-error' : 'text-base-content/90'}`}>
              {label}
            </span>
          </label>
        )}
        <div
          className={`space-y-2 pr-4 ${
            orientation === 'horizontal' ? 'flex flex-row gap-6' : ''
          }`}
        >
          {options.map((option) => (
            <Radio
              key={option.value}
              option={option}
              name={name}
              checked={value === option.value}
              onChange={onChange}
            />
          ))}
        </div>
        {errorMessage && (
          <label className="label">
            <span className="label-text-alt text-error">{errorMessage}</span>
          </label>
        )}
        {helperText && !errorMessage && (
          <label className="label">
            <span className="label-text-alt text-base-content/75">{helperText}</span>
          </label>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
