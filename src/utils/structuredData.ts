/**
 * schema.org JSON-LD builders. Serialize the result with `safeJsonLd`.
 * All user-facing strings are passed in already translated.
 */

export interface JsonLdBreadcrumb {
  name: string;
  url: string;
}

export interface JsonLdFaq {
  question: string;
  answer: string;
}

export interface JsonLdProvider {
  name: string;
  url: string;
}

export interface TouristTripInput {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  price: number;
  currency: string;
  provider: JsonLdProvider;
  /** Already filtered to current, bookable departures (ISO `startDate`). */
  availableStartDates: readonly string[];
}

export function buildTravelAgencyLd(input: {
  name: string;
  url: string;
  logo: string;
  sameAs: readonly string[];
  email: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: input.name,
    url: input.url,
    logo: input.logo,
    email: input.email,
    sameAs: [...input.sameAs],
    areaServed: { '@type': 'Country', name: 'Colombia' },
  };
}

export function buildWebsiteLd(input: { name: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
  };
}

export function buildTouristTripLd(input: TouristTripInput) {
  const hasDepartures = input.availableStartDates.length > 0;

  return {
    '@context': 'https://schema.org',
    // TouristTrip describes the tour; Product keeps it eligible for Google's
    // review/price snippets, which TouristTrip alone is not.
    '@type': ['TouristTrip', 'Product'],
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.imageUrl ? { image: [input.imageUrl] } : {}),
    provider: {
      '@type': 'TravelAgency',
      name: input.provider.name,
      url: input.provider.url,
    },
    offers: {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: input.currency,
      availability: hasDepartures
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: input.url,
    },
  };
}

export function buildBreadcrumbLd(items: readonly JsonLdBreadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqLd(items: readonly JsonLdFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
