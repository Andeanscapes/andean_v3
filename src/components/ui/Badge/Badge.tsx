"use client";

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'plan-prime' | 'plan-core' | 'plan-basic' | 'place';
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
      // Plan tiers sit on photos, so fill and text are fixed per tier, not per theme.
      'plan-prime': 'border-transparent bg-plan-prime text-plan-prime-content',
      'plan-core': 'border-transparent bg-plan-core text-plan-core-content',
      'plan-basic': 'border-transparent bg-plan-basic text-plan-basic-content',
      place: 'border-transparent bg-place text-place-content',
    };

    const sizeClasses = {
      sm: 'badge-sm',
      md: 'badge-md',
      lg: 'badge-lg',
    };

    // A badge is only interactive when it has a handler and is not disabled.
    // Static badges must not advertise a click affordance they do not have.
    const isInteractive = Boolean(onClick) && !disabled;

    // Photo-overlay variants own their border and text colour; the neutral defaults would fight them.
    const ownsColours = variant.startsWith('plan-') || variant === 'place';
    const baseClasses = ownsColours
      ? 'badge border transition'
      : 'badge border border-base-300/60 text-base-content/90 transition';
    const interactiveClasses = isInteractive
      ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100'
      : '';
    const activeClass = selected ? 'ring-2 ring-primary/60 ring-offset-2 border-primary/60' : '';
    const disabledClass = disabled ? 'opacity-60 cursor-not-allowed' : '';

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${interactiveClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${activeClass} ${disabledClass} ${className}`}
        onClick={isInteractive ? onClick : undefined}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
