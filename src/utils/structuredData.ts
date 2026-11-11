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
  /** `@id` of the site-wide TravelAgency node, so search engines merge both. */
  id?: string;
  name: string;
  url: string;
}

export interface JsonLdPostalAddress {
  streetAddress?: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
}

export interface JsonLdPlace {
  name: string;
  region: string;
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
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  url: string;
  logo: string;
  sameAs: readonly string[];
  email: string;
  telephone: string;
  address: JsonLdPostalAddress;
  operatingBase: JsonLdPostalAddress & { name: string };
  areaServed: readonly JsonLdPlace[];
}) {
  const { name: baseName, ...baseAddress } = input.operatingBase;

  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': input.id,
    name: input.name,
    legalName: input.legalName,
    taxID: input.taxId,
    url: input.url,
    logo: input.logo,
    email: input.email,
    telephone: input.telephone,
    sameAs: [...input.sameAs],
    address: { '@type': 'PostalAddress', ...input.address },
    location: {
      '@type': 'Place',
      name: baseName,
      address: { '@type': 'PostalAddress', ...baseAddress },
    },
    areaServed: [
      ...input.areaServed.map((place) => ({
        '@type': 'Place',
        name: place.name,
        containedInPlace: { '@type': 'AdministrativeArea', name: place.region },
      })),
      { '@type': 'Country', name: 'Colombia' },
    ],
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
      ...(input.provider.id ? { '@id': input.provider.id } : {}),
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

/** Entity a page is about, e.g. `{ '@type': 'Thing', name, sameAs: wikidataUrl }`. */
export interface JsonLdThing {
  '@type': string;
  name: string;
  sameAs: string;
}

export interface JsonLdCitation {
  label: string;
  url?: string;
  /** Language of the cited work (`en`, `es`…). */
  language?: string;
}

export interface ArticleInput {
  headline: string;
  description: string;
  url: string;
  imageUrl: string;
  inLanguage: string;
  datePublished: string;
  dateModified: string;
  /** `@id` of the TravelAgency node: the team is author and publisher. */
  organizationId: string;
  organizationName: string;
  /** Named writer; without it the organization is the author. */
  author?: { name: string; url: string };
  about?: readonly JsonLdThing[];
  /** Sources listed visibly on the page. */
  citations: readonly JsonLdCitation[];
}

function toCitations(sources: readonly JsonLdCitation[]) {
  return sources.map((source) => ({
    '@type': 'CreativeWork',
    name: source.label,
    ...(source.url ? { url: source.url } : {}),
    ...(source.language ? { inLanguage: source.language } : {}),
  }));
}

export function buildArticleLd(input: ArticleInput) {
  const organization = { '@type': 'Organization', '@id': input.organizationId, name: input.organizationName };

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    image: [input.imageUrl],
    inLanguage: input.inLanguage,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: input.url,
    author: input.author ? { '@type': 'Person', name: input.author.name, url: input.author.url } : organization,
    publisher: organization,
    ...(input.about?.length ? { about: [...input.about] } : {}),
    citation: toCitations(input.citations),
  };
}

export interface PersonInput {
  name: string;
  url: string;
  jobTitle: string;
  description: string;
  imageUrl?: string;
  sameAs: readonly string[];
  /** `@id` of the TravelAgency node the person works for. */
  organizationId: string;
}

export function buildPersonLd(input: PersonInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    url: input.url,
    jobTitle: input.jobTitle,
    description: input.description,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    sameAs: [...input.sameAs],
    worksFor: { '@id': input.organizationId },
  };
}

export interface CollectionPageInput {
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  /** `@id` of the TravelAgency node, which publishes the collection. */
  organizationId: string;
  /** Linked pages rendered on the hub, in visible order. */
  items: readonly JsonLdBreadcrumb[];
  citations: readonly JsonLdCitation[];
  about?: readonly JsonLdThing[];
}

/** Hub page grouping editorial pages; `mainEntity` is the visible list of links. */
export function buildCollectionPageLd(input: CollectionPageInput) {
  const itemList = {
    '@type': 'ItemList',
    itemListElement: buildItemListLd(input.items).itemListElement,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: input.inLanguage,
    publisher: { '@id': input.organizationId },
    mainEntity: itemList,
    ...(input.about?.length ? { about: [...input.about] } : {}),
    citation: toCitations(input.citations),
  };
}

/** Ordered list of linked pages (e.g. tours). Items must be visible on the page. */
export function buildItemListLd(items: readonly JsonLdBreadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
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
