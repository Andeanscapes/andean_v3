import { describe, expect, it } from 'vitest';

import { safeJsonLd } from './jsonLd';

describe('safeJsonLd', () => {
  it('escapes angle brackets so a closing script tag cannot break out', () => {
    const result = safeJsonLd({ name: '</script><script>alert(1)</script>' });

    expect(result).not.toContain('</script>');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('escapes ampersands', () => {
    expect(safeJsonLd({ name: 'Cacao & Coffee' })).toBe(
      '{"name":"Cacao \\u0026 Coffee"}'
    );
  });

  it('escapes U+2028 and U+2029 line separators', () => {
    const result = safeJsonLd({ name: 'a\u2028b\u2029c' });

    expect(result).toContain('\\u2028');
    expect(result).toContain('\\u2029');
    expect(result).not.toContain('\u2028');
    expect(result).not.toContain('\u2029');
  });

  it('produces JSON that parses back to the original value', () => {
    const input = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Emerald <Mining> & "Tour"',
      nested: { items: ['a\u2028b', '</script>'] },
      price: 1200000,
    };

    expect(JSON.parse(safeJsonLd(input))).toEqual(input);
  });

  it('leaves payloads without unsafe characters untouched', () => {
    expect(safeJsonLd({ '@type': 'Organization', name: 'Andean Scapes' })).toBe(
      '{"@type":"Organization","name":"Andean Scapes"}'
    );
  });
});
