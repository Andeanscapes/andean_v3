import type { ReactNode } from 'react';
import styles from './GuideMotion.module.css';

export interface GuideSectionView {
  id: string;
  heading: string;
  paragraphs: readonly string[];
  /** Short direct answer to the heading, shown before the body. */
  answer?: string;
  list?: readonly string[];
  quote?: { text: string; attribution: string };
  timeline?: readonly { date: string; text: string }[];
  /** Visible label for sections that are not cited fact (field notes, oral tradition). */
  noteLabel?: string;
  /** Figure or illustration, rendered after the heading. */
  media?: ReactNode;
}

interface GuideSectionsProps {
  sections: readonly GuideSectionView[];
  idPrefix: string;
  /** Renders copy text, e.g. turning `[[sourceId]]` markers into footnote links. Defaults to plain text. */
  renderText?: (text: string) => ReactNode;
}

const plainText = (text: string): ReactNode => text;

/** Article body for editorial pages. Optional blocks render only when present. */
export function GuideSections({ sections, idPrefix, renderText = plainText }: GuideSectionsProps) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`${idPrefix}-${section.id}`} className="mb-10 last:mb-0">
          <h2 id={`${idPrefix}-${section.id}`} className="scroll-mt-28 text-balance text-xl font-bold leading-tight md:text-3xl">
            {section.heading}
          </h2>
          {section.noteLabel ? (
            <p className="mt-3 inline-flex rounded-full bg-base-200 px-3 py-1 text-xs font-semibold text-base-content/80">
              {section.noteLabel}
            </p>
          ) : null}
          {section.answer ? (
            <p className="mt-4 border-l-4 border-primary pl-4 text-base font-medium leading-relaxed text-base-content md:text-lg">
              {renderText(section.answer)}
            </p>
          ) : null}
          {section.media}
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-base leading-relaxed text-base-content/85">
              {renderText(paragraph)}
            </p>
          ))}
          {section.list ? (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-base-content/85">
              {section.list.map((item) => (
                <li key={item}>{renderText(item)}</li>
              ))}
            </ul>
          ) : null}
          {section.timeline ? (
            <ol className="mt-6 space-y-5 border-l-2 border-primary/40 pl-5">
              {section.timeline.map((entry) => (
                <li key={`${entry.date}-${entry.text}`} className={`relative ${styles.reveal}`}>
                  <span aria-hidden="true" className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full bg-primary" />
                  <p className="text-sm font-bold text-primary">{entry.date}</p>
                  <p className="mt-1 text-base leading-relaxed text-base-content/85">{renderText(entry.text)}</p>
                </li>
              ))}
            </ol>
          ) : null}
          {section.quote ? (
            <figure className="mt-6 border-l-2 border-base-content/20 pl-4">
              <blockquote className="text-base italic leading-relaxed text-base-content/85">{renderText(section.quote.text)}</blockquote>
              <figcaption className="mt-2 text-sm text-base-content/70">{section.quote.attribution}</figcaption>
            </figure>
          ) : null}
        </section>
      ))}
    </>
  );
}
