import { Link } from '@/i18n/navigation';

export interface EmeraldNavItem {
  href: string;
  label: string;
  current: boolean;
}

/**
 * Editorial link lists (section bar, pager, related pages) use `prefetch={false}`:
 * an Emerald World page can hold 15+ in-viewport links, and prefetching all of
 * them competed with the hero and JS for bandwidth on mobile.
 */

/** Topic sections of Emerald World (mythology, history…). Renders nothing until a section exists. */
export function EmeraldSectionNav({ label, items }: { label: string; items: readonly EmeraldNavItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className="border-b border-base-content/10 bg-base-100">
      <ul className="no-scrollbar container mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 lg:px-6">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              prefetch={false}
              aria-current={item.current ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                item.current ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/80 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface PagerLink {
  href: string;
  title: string;
}

/** Previous / next page within the same section. */
export function EmeraldPager({
  label,
  previousLabel,
  nextLabel,
  previous,
  next,
}: {
  label: string;
  previousLabel: string;
  nextLabel: string;
  previous?: PagerLink;
  next?: PagerLink;
}) {
  if (!previous && !next) return null;
  const linkClassName =
    'flex min-h-11 flex-col rounded-xl border border-base-content/10 p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <nav aria-label={label} className="mt-12 grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link href={previous.href} prefetch={false} rel="prev" className={linkClassName}>
          <span className="text-xs text-base-content/70">{previousLabel}</span>
          <span className="mt-1 font-semibold text-primary">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} prefetch={false} rel="next" className={`${linkClassName} sm:text-right`}>
          <span className="text-xs text-base-content/70">{nextLabel}</span>
          <span className="mt-1 font-semibold text-primary">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
