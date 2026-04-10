import type { ElementType, ReactNode } from 'react';

type SectionContainerProps<T extends ElementType> = {
  as?: T;
  sectionClassName?: string;
  containerClassName?: string;
  children: ReactNode;
};

export function SectionContainer<T extends ElementType = 'section'>({
  as,
  sectionClassName = '',
  containerClassName = '',
  children,
}: SectionContainerProps<T>) {
  const Component = (as ?? 'section') as ElementType;

  return (
    <Component className={sectionClassName}>
      <div className={`mx-auto max-w-screen-2xl ${containerClassName}`.trim()}>{children}</div>
    </Component>
  );
}
