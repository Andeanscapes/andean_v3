import type { ComponentPropsWithoutRef, ReactNode } from 'react';

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

function getBaseClass(variant: CtaVariant): string {
  if (variant === 'gradient') {
    return 'btn border-0 bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 font-extrabold shadow-[0_0_20px_rgba(0,240,143,0.30)] transition-all duration-200 hover:from-emerald-300 hover:to-emerald-400 hover:brightness-105 active:scale-[0.98] active:brightness-95';
  }
  return 'btn border-0 bg-primary text-primary-content font-extrabold shadow-[0_0_20px_rgba(0,240,143,0.24)] transition-all duration-200 hover:bg-primary/90 hover:brightness-105 active:scale-[0.98] active:brightness-95';
}

export function PrimaryCtaButton(props: PrimaryCtaButtonProps) {
  if (typeof props.href === 'string') {
    const { children, className = '', size = 'lg', fullWidth = true, variant = 'solid', href, ...anchorRest } = props;
    const sizeClass = size === 'lg' ? 'btn-lg min-h-11 px-4 md:px-5' : 'btn-md min-h-11 px-4';
    const widthClass = fullWidth ? 'w-full' : '';
    const composedClass = `${getBaseClass(variant)} ${sizeClass} ${widthClass} ${className}`.trim();

    return (
      <a href={href} className={composedClass} {...anchorRest}>
        {children}
      </a>
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
