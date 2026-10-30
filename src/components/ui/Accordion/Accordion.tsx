import React, { useId, useState } from 'react';

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

interface AccordionItemViewProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: (id: string) => void;
  itemClassName: string;
  titleClassName: string;
  contentClassName: string;
  contentInnerClassName: string;
  activeItemClassName: string;
  activeTitleClassName: string;
  useJoin: boolean;
}

function AccordionItemView({
  item,
  isOpen,
  onToggle,
  itemClassName,
  titleClassName,
  contentClassName,
  contentInnerClassName,
  activeItemClassName,
  activeTitleClassName,
  useJoin,
}: AccordionItemViewProps) {
  const baseId = useId();
  const buttonId = `${baseId}-button`;
  const panelId = `${baseId}-panel`;

  return (
    <div
      className={`collapse collapse-arrow ${useJoin ? 'join-item' : ''} border border-base-300 ${itemClassName} ${isOpen ? `collapse-open ${activeItemClassName}` : 'collapse-close'}`.trim()}
    >
      {/* Must stay a direct child: daisyUI draws the arrow via `.collapse-arrow > .collapse-title`. */}
      <button
        type="button"
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(item.id)}
        className={`collapse-title w-full cursor-pointer text-left font-semibold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${titleClassName} ${isOpen ? activeTitleClassName : ''}`.trim()}
      >
        {item.title}
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`collapse-content ${contentClassName}`.trim()}
      >
        <div className={`pt-4 ${contentInnerClassName}`.trim()}>{item.content}</div>
      </div>
    </div>
  );
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
        {items.map((item) => (
          <AccordionItemView
            key={item.id}
            item={item}
            isOpen={openItems.has(item.id)}
            onToggle={toggleItem}
            itemClassName={itemClassName}
            titleClassName={titleClassName}
            contentClassName={contentClassName}
            contentInnerClassName={contentInnerClassName}
            activeItemClassName={activeItemClassName}
            activeTitleClassName={activeTitleClassName}
            useJoin={useJoin}
          />
        ))}
      </div>
    );
  }
);

Accordion.displayName = 'Accordion';
