import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
  /** `responsive`: compact on phones, roomy from md (p-4 → p-6). */
  padding?: 'sm' | 'md' | 'lg' | 'responsive';
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
      responsive: 'p-4 md:p-6',
      lg: 'p-8',
    };

    const variantClasses = {
      default:
        'card card-bordered border-zinc-200/80 bg-white shadow-card dark:border-base-200/70 dark:bg-base-100/80 dark:shadow-sm',
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
