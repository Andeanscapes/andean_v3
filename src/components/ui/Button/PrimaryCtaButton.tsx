import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type CtaSize = 'md' | 'lg';
type CtaVariant = 'solid' | 'gradient';

type CommonProps = {
  children: ReactNode;
  className?: string;
  size?: CtaSize;
  fullWidth?: boolean;
  /** @default 'solid' */
  variant?: CtaVariant;
};

type AnchorProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'className' | 'href'> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className'> & {
    href?: undefined;
  };

type PrimaryCtaButtonProps = AnchorProps | NativeButtonProps;

/**
 * Light theme: solid primary (emerald-700) with white text and a quiet shadow — the
 * mint gradient and neon glow read as low-contrast on white. Dark theme keeps the
 * original gradient/glow unchanged via `dark:`.
 */
function getBaseClass(variant: CtaVariant): string {
  const base =
    'btn border-0 bg-primary text-primary-content font-extrabold shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-95 active:brightness-95';
  if (variant === 'gradient') {
    return `${base} dark:bg-gradient-to-r dark:from-emerald-400 dark:to-emerald-500 dark:text-slate-900 dark:shadow-[0_0_20px_rgba(0,240,143,0.30)] dark:hover:from-emerald-300 dark:hover:to-emerald-400 dark:hover:brightness-105`;
  }
  return `${base} dark:shadow-[0_0_20px_rgba(0,240,143,0.24)] dark:hover:brightness-105`;
}

export function PrimaryCtaButton(props: PrimaryCtaButtonProps) {
  if (typeof props.href === 'string') {
    const { children, className = '', size = 'lg', fullWidth = true, variant = 'solid', href, ...anchorRest } = props;
    const sizeClass = size === 'lg' ? 'btn-lg min-h-11 px-4 md:px-5' : 'btn-md min-h-11 px-4';
    const widthClass = fullWidth ? 'w-full' : '';
    const composedClass = `${getBaseClass(variant)} ${sizeClass} ${widthClass} ${className}`.trim();

    return (
      <Link href={href} className={composedClass} {...anchorRest}>
        {children}
      </Link>
    );
  }

  const { children, className = '', size = 'lg', fullWidth = true, variant = 'solid', ...buttonRest } = props;
  const sizeClass = size === 'lg' ? 'btn-lg min-h-11 px-4 md:px-5' : 'btn-md min-h-11 px-4';
  const widthClass = fullWidth ? 'w-full' : '';
  const composedClass = `${getBaseClass(variant)} ${sizeClass} ${widthClass} ${className}`.trim();

  return (
    <button className={composedClass} {...buttonRest}>
      {children}
    </button>
  );
}
