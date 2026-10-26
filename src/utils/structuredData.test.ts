import { describe, expect, it } from 'vitest';

import { safeJsonLd } from './jsonLd';
import { buildBreadcrumbLd, buildFaqLd, buildTouristTripLd, type TouristTripInput } from './structuredData';

const PROVIDER = { name: 'Andean Scapes', url: 'https://andeanscapes.com' };
const PAGE_URL = 'https://andeanscapes.com/es/experiences/chivor-emerald-mine-tour';

function tripInput(overrides: Partial<TouristTripInput> = {}): TouristTripInput {
  return {
    name: 'Chivor',
    description: 'Tour',
    url: PAGE_URL,
    price: 650000,
    currency: 'COP',
    provider: PROVIDER,
    availableStartDates: ['2026-11-07T09:30:00.000Z', '2026-10-24T09:30:00.000Z'],
    ...overrides,
  };
}

describe('buildTouristTripLd', () => {
  it('identifies the provider by the site, not the tour page', () => {
    const ld = buildTouristTripLd(tripInput());

    expect(ld.provider).toEqual({ '@type': 'TravelAgency', ...PROVIDER });
    expect(ld.offers.url).toBe(PAGE_URL);
  });

  it('marks bookable departures in stock without inventing a price expiry', () => {
    const ld = buildTouristTripLd(tripInput());

    expect(ld.offers.availability).toBe('https://schema.org/InStock');
    expect(ld.offers).not.toHaveProperty('priceValidUntil');
  });

  it('is out of stock without departures, with no price validity date', () => {
    const ld = buildTouristTripLd(tripInput({ availableStartDates: [] }));

    expect(ld.offers.availability).toBe('https://schema.org/OutOfStock');
    expect(ld.offers).not.toHaveProperty('priceValidUntil');
  });

  it('omits ratings that are not displayed on the page', () => {
    expect(buildTouristTripLd(tripInput())).not.toHaveProperty('aggregateRating');
  });

  it('stays script-safe when copy contains a closing tag', () => {
    const json = safeJsonLd(buildTouristTripLd(tripInput({ name: '</script><b>x' })));

    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).name).toBe('</script><b>x');
  });
});

describe('buildBreadcrumbLd / buildFaqLd', () => {
  it('numbers breadcrumb positions from 1', () => {
    const ld = buildBreadcrumbLd([
      { name: 'Inicio', url: 'https://andeanscapes.com/es' },
      { name: 'Experiencias', url: 'https://andeanscapes.com/es/experiences' },
    ]);

    expect(ld.itemListElement.map((item) => item.position)).toEqual([1, 2]);
  });

  it('maps each FAQ to a Question with an accepted Answer', () => {
    const ld = buildFaqLd([{ question: 'Q?', answer: 'A.' }]);

    expect(ld.mainEntity).toEqual([
      { '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } },
    ]);
  });
});
