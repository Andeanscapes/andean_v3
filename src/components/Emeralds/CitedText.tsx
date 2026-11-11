import { Fragment } from 'react';
import { splitCitations } from '@/utils/citations';

interface CitedTextProps {
  text: string;
  /** Source id → 1-based position in the page's source list. */
  sourceNumbers: ReadonlyMap<string, number>;
  /** Accessible name of a footnote link, e.g. `n => "Source 3"`. */
  sourceLabel: (number: number) => string;
  anchorPrefix: string;
}

/**
 * Copy with `[[sourceId]]` markers rendered as numbered footnote links. An
 * unknown id throws, so a broken citation fails the build instead of shipping.
 */
export function CitedText({ text, sourceNumbers, sourceLabel, anchorPrefix }: CitedTextProps) {
  return (
    <>
      {splitCitations(text).map((part, index) => {
        if (part.type === 'text') return <Fragment key={index}>{part.value}</Fragment>;
        const number = sourceNumbers.get(part.id);
        if (number === undefined) throw new Error(`[Emeralds] Citation "${part.id}" is not in the page's sources`);
        return (
          <sup key={index} className="ml-0.5">
            <a
              href={`#${anchorPrefix}-${number}`}
              aria-label={sourceLabel(number)}
              className="rounded-sm font-semibold text-primary no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              [{number}]
            </a>
          </sup>
        );
      })}
    </>
  );
}
