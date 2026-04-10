import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type CtaSize = 'md' | 'lg';

type CommonProps = {
  children: ReactNode;
  className?: string;
  size?: CtaSize;
  fullWidth?: boolean;
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

export function PrimaryCtaButton(props: PrimaryCtaButtonProps) {
  if (typeof props.href === 'string') {
    const { children, className = '', size = 'lg', fullWidth = true, href, ...anchorRest } = props;
    const sizeClass = size === 'lg' ? 'btn-lg min-h-11 px-4 md:px-5' : 'btn-md min-h-11 px-4';
    const widthClass = fullWidth ? 'w-full' : '';
    const baseClass =
      'btn border-0 bg-primary text-primary-content font-extrabold shadow-[0_0_20px_rgba(0,240,143,0.24)] transition-all duration-200 hover:bg-primary/90 hover:brightness-105 active:scale-[0.98] active:brightness-95';
    const composedClass = `${baseClass} ${sizeClass} ${widthClass} ${className}`.trim();

    return (
      <a href={href} className={composedClass} {...anchorRest}>
        {children}
      </a>
    );
  }

  const { children, className = '', size = 'lg', fullWidth = true, ...buttonRest } = props;
  const sizeClass = size === 'lg' ? 'btn-lg min-h-11 px-4 md:px-5' : 'btn-md min-h-11 px-4';
  const widthClass = fullWidth ? 'w-full' : '';
  const baseClass =
    'btn border-0 bg-primary text-primary-content font-extrabold shadow-[0_0_20px_rgba(0,240,143,0.24)] transition-all duration-200 hover:bg-primary/90 hover:brightness-105 active:scale-[0.98] active:brightness-95';
  const composedClass = `${baseClass} ${sizeClass} ${widthClass} ${className}`.trim();

  return (
    <button className={composedClass} {...buttonRest}>
      {children}
    </button>
  );
}
