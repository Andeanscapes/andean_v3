import type { EditorialSource, SourceLanguage } from '@/lib/content/sources';

interface GuideSourcesProps {
  title: string;
  sources: readonly EditorialSource[];
  headingId: string;
  /** Gives each item an `id` (`<prefix>-<n>`) so inline citations can link to it. */
  anchorPrefix?: string;
  /**
   * Visible note for sources in another language than the page, e.g.
   * `{ es: '(in Spanish)' }`. Omitted entries show nothing.
   */
  languageNotes?: Partial<Record<SourceLanguage, string>>;
}

/** Visible source list; the page's JSON-LD `citation` mirrors it. */
export function GuideSources({ title, sources, headingId, anchorPrefix, languageNotes }: GuideSourcesProps) {
  return (
    <section aria-labelledby={headingId} className="mt-12 border-t border-base-content/10 pt-8">
      <h2 id={headingId} className="text-lg font-bold">
        {title}
      </h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-base-content/75">
        {sources.map((source, index) => {
          const languageNote = languageNotes?.[source.language];
          return (
            <li
              key={source.label}
              id={anchorPrefix ? `${anchorPrefix}-${index + 1}` : undefined}
              className={anchorPrefix ? 'scroll-mt-28 target:text-base-content' : undefined}
            >
              {source.url ? (
                <a
                  href={source.url}
                  hrefLang={languageNotes ? source.language : undefined}
                  rel="noopener noreferrer"
                  className="rounded-sm underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {source.label}
                </a>
              ) : (
                source.label
              )}
              {languageNote ? <span className="ml-1 text-base-content/60">{languageNote}</span> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
