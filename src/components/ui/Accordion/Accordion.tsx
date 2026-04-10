import React, { useState } from 'react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
  useJoin?: boolean;
  className?: string;
  itemClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
  contentInnerClassName?: string;
  activeItemClassName?: string;
  activeTitleClassName?: string;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      defaultOpen = [],
      allowMultiple = false,
      useJoin = true,
      className = '',
      itemClassName = '',
      titleClassName = '',
      contentClassName = '',
      contentInnerClassName = '',
      activeItemClassName = '',
      activeTitleClassName = '',
    },
    ref
  ) => {
    const [openItems, setOpenItems] = useState<Set<string>>(
      new Set(defaultOpen)
    );

    const toggleItem = (id: string) => {
      const newOpen = new Set(openItems);
      if (newOpen.has(id)) {
        newOpen.delete(id);
      } else {
        if (!allowMultiple) {
          newOpen.clear();
        }
        newOpen.add(id);
      }
      setOpenItems(newOpen);
    };

    const rootClassName = `${useJoin ? 'join join-vertical' : ''} w-full ${className}`.trim();

    return (
      <div ref={ref} className={rootClassName}>
        {items.map((item, index) => {
          const isOpen = openItems.has(item.id);
          const toggleLabel = typeof item.title === 'string' ? item.title : `Toggle section ${index + 1}`;

          return (
          <div
            key={item.id}
            className={`collapse collapse-arrow join-item border border-base-300 ${itemClassName} ${isOpen ? activeItemClassName : ''}`.trim()}
          >
            <input
              type="checkbox"
              checked={isOpen}
              onChange={() => toggleItem(item.id)}
              aria-label={toggleLabel}
              className="cursor-pointer"
            />
            <div
              className={`collapse-title font-semibold text-lg ${titleClassName} ${isOpen ? activeTitleClassName : ''}`.trim()}
            >
              {item.title}
            </div>
            <div className={`collapse-content ${contentClassName}`.trim()}>
              <div className={`pt-4 ${contentInnerClassName}`.trim()}>{item.content}</div>
            </div>
          </div>
        );})}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';
