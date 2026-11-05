import type { ElementType, ReactNode } from 'react';

type SectionContainerProps<T extends ElementType> = {
  as?: T;
  sectionClassName?: string;
  containerClassName?: string;
  /** Id of the heading that names the section; makes `<section>` a labelled landmark. */
  labelledBy?: string;
  children: ReactNode;
};

export function SectionContainer<T extends ElementType = 'section'>({
  as,
  sectionClassName = '',
  containerClassName = '',
  labelledBy,
  children,
}: SectionContainerProps<T>) {
  const Component = (as ?? 'section') as ElementType;

  return (
    <Component className={sectionClassName} aria-labelledby={labelledBy}>
      <div className={`mx-auto max-w-screen-2xl ${containerClassName}`.trim()}>{children}</div>
    </Component>
  );
}
