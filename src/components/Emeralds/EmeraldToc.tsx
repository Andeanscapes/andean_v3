'use client';

import { useEffect, useState } from 'react';

interface EmeraldTocProps {
  label: string;
  /** `id` is the heading element id. */
  items: readonly { id: string; heading: string }[];
}

/**
 * In-page contents. Server-rendered links work without JavaScript; the
 * observer only marks the section currently being read.
 */
export function EmeraldToc({ label, items }: EmeraldTocProps) {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  const list = (
    <ol className="mt-3 space-y-1 border-l border-base-content/15">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active ? 'location' : undefined}
              className={`-ml-px block border-l-2 py-1 pl-3 leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent text-base-content/75 hover:text-base-content'
              }`}
            >
              {item.heading}
            </a>
          </li>
        );
      })}
    </ol>
  );

  // Collapsed on small screens so the article starts right after the hero;
  // always open in the desktop sidebar.
  return (
    <nav aria-label={label} className="text-sm">
      <details className="rounded-xl border border-base-content/10 p-4 lg:hidden">
        <summary className="min-h-11 cursor-pointer content-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {label}
        </summary>
        {list}
      </details>
      <div className="hidden lg:block">
        <p className="eyebrow text-base-content/70">{label}</p>
        {list}
      </div>
    </nav>
  );
}
