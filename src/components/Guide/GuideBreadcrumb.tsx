import { Link } from '@/i18n/navigation';

export interface GuideBreadcrumbItem {
  label: string;
  /** Locale-free path; omit for the current page. */
  href?: string;
}

/** Visible breadcrumb matching the page's BreadcrumbList JSON-LD. */
export function GuideBreadcrumb({ label, items }: { label: string; items: readonly GuideBreadcrumbItem[] }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/80 md:text-sm">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="rounded-sm underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-white">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
