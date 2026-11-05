import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type GlassCardVariant = 'auto' | 'dark' | 'light' | 'emeraldTint' | 'roseTint';

interface GlassCardProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  variant?: GlassCardVariant;
}

/** `auto` follows the site theme in CSS; prefer it over choosing `light`/`dark` in JS. */
const variantClasses: Record<GlassCardVariant, string> = {
  auto: 'border border-zinc-200/80 bg-white shadow-card dark:border-white/10 dark:bg-slate-900/40 dark:shadow-none dark:backdrop-blur-xl',
  dark: 'border border-white/10 bg-slate-900/40 backdrop-blur-xl',
  light: 'border border-zinc-200/80 bg-white shadow-card',
  emeraldTint: 'border border-emerald-400/30 bg-emerald-950/30',
  roseTint: 'border border-rose-400/30 bg-rose-950/30',
};

export function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  variant = 'dark',
  ...rest
}: GlassCardProps) {
  // Border feedback only: interactive cards (e.g. a selectable stay) signal hover without lifting.
  const hoverClass = hoverEffect ? 'transition-colors duration-200 hover:border-primary/40' : '';

  return <div className={`${variantClasses[variant]} ${hoverClass} ${className}`.trim()} {...rest}>{children}</div>;
}
