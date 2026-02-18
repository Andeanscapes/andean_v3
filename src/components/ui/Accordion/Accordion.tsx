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
  className?: string;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      defaultOpen = [],
      allowMultiple = false,
      className = '',
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

    return (
      <div ref={ref} className={`join join-vertical w-full ${className}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`collapse collapse-arrow join-item border border-base-300`}
          >
            <input
              type="checkbox"
              checked={openItems.has(item.id)}
              onChange={() => toggleItem(item.id)}
              className="cursor-pointer"
            />
            <div className="collapse-title font-semibold text-lg">
              {item.title}
            </div>
            <div className="collapse-content">
              <div className="pt-4">{item.content}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';
