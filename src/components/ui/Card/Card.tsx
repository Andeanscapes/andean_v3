import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantClasses = {
      default:
        'card card-bordered border-base-200/70 bg-base-100/80 shadow-sm hover:shadow-md',
      outlined: 'card card-bordered border-2 border-base-200/80 bg-base-100/80',
    };

    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
