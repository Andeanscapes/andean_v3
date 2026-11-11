import { describe, expect, it } from 'vitest';
import { citedSourceIds, splitCitations, stripCitations } from './citations';

describe('citations', () => {
  const text = 'Found in 1967.[[smithsonian-gachala]] Ran Chivor[[gia-rainier-2016]][[rainier-green-fire-1942]].';

  it('splits text and markers in order', () => {
    expect(splitCitations(text)).toEqual([
      { type: 'text', value: 'Found in 1967.' },
      { type: 'cite', id: 'smithsonian-gachala' },
      { type: 'text', value: ' Ran Chivor' },
      { type: 'cite', id: 'gia-rainier-2016' },
      { type: 'cite', id: 'rainier-green-fire-1942' },
      { type: 'text', value: '.' },
    ]);
  });

  it('lists cited ids and strips markers for plain-text uses', () => {
    expect(citedSourceIds(text)).toEqual(['smithsonian-gachala', 'gia-rainier-2016', 'rainier-green-fire-1942']);
    expect(stripCitations(text)).toBe('Found in 1967. Ran Chivor.');
    expect(splitCitations('No markers.')).toEqual([{ type: 'text', value: 'No markers.' }]);
  });

  it('ignores malformed markers', () => {
    expect(citedSourceIds('[[Bad Id]] [single]')).toEqual([]);
  });
});
