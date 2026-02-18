import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      onClick,
      selected = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'badge-primary',
      secondary: 'badge-secondary',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      info: 'badge-info',
    };

    const sizeClasses = {
      sm: 'badge-sm',
      md: 'badge-md',
      lg: 'badge-lg',
    };

    const baseClasses =
      'badge cursor-pointer border border-base-300/60 text-base-content/90 transition focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100';
    const activeClass = selected ? 'ring-2 ring-primary/60 ring-offset-2 border-primary/60' : '';
    const disabledClass = disabled ? 'opacity-60 cursor-not-allowed' : '';

    const handleClick = () => {
      if (!disabled && onClick) {
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${activeClass} ${disabledClass} ${className}`}
        onClick={handleClick}
        role={onClick && !disabled ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : -1}
        onKeyPress={(e) => {
          if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
            onClick();
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
