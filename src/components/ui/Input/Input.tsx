import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error = false,
      errorMessage,
      helperText,
      required,
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className="form-control w-full">
        {label && (
          <label className="label">
            <span className={`label-text ${error ? 'text-error' : 'text-base-content/90'}`}>
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </span>
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`input input-bordered w-full ${
            error ? 'input-error' : ''
          } ${className} focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 focus-visible:outline-none`}
          {...props}
        />
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

Input.displayName = 'Input';
