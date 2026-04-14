import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type GlassCardVariant = 'dark' | 'light' | 'emeraldTint' | 'roseTint';

interface GlassCardProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  variant?: GlassCardVariant;
}

const variantClasses: Record<GlassCardVariant, string> = {
  dark: 'border border-white/10 bg-slate-900/40 backdrop-blur-xl',
  light: 'border border-black/8 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]',
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
  const hoverClass = hoverEffect
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-md'
    : '';

  return <div className={`${variantClasses[variant]} ${hoverClass} ${className}`.trim()} {...rest}>{children}</div>;
}
