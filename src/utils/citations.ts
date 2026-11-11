/**
 * Inline citations in editorial copy: `"…found in 1967.[[smithsonian-gachala]]"`.
 * The marker holds a source id from `src/lib/content/sources.ts`; the page
 * renders it as a numbered link to its entry in the visible source list.
 */
const CITATION_PATTERN = /\[\[([a-z0-9-]+)\]\]/g;

function findCitations(text: string): RegExpExecArray[] {
  const pattern = new RegExp(CITATION_PATTERN.source, 'g');
  const matches: RegExpExecArray[] = [];
  for (let match = pattern.exec(text); match !== null; match = pattern.exec(text)) matches.push(match);
  return matches;
}

export type CitationPart = { type: 'text'; value: string } | { type: 'cite'; id: string };

export function splitCitations(text: string): CitationPart[] {
  const parts: CitationPart[] = [];
  let lastIndex = 0;
  for (const match of findCitations(text)) {
    if (match.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    parts.push({ type: 'cite', id: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) });
  return parts;
}

export function citedSourceIds(text: string): string[] {
  return findCitations(text).map((match) => match[1]);
}

/** Plain text for metadata, JSON-LD and llms.txt. */
export function stripCitations(text: string): string {
  return text.replace(CITATION_PATTERN, '');
}
