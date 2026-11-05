/**
 * Editorial guides: route slugs, media and sources. Copy lives in
 * `src/i18n/messages/guides/{locale}.json` (server-only, see `guides.service.ts`).
 *
 * Slugs are identical in every locale, like experience slugs. `updatedAt` must
 * only change when the facts in the copy change.
 */

export interface GuideSource {
  /** Bibliographic reference; a proper name, not translated. */
  label: string;
  url?: string;
}

export interface GuideDefinition {
  slug: string;
  /** Key under `articles` in the guides messages. */
  id: GuideId;
  sectionIds: readonly string[];
  /** CDN-relative hero `.webp`; `HeroPicture` derives its mobile and AVIF variants. */
  image: string;
  /** CDN-relative card `.webp`; it must have a `-mobile` sibling (rendered via `<picture>`). */
  cardImage: string;
  publishedAt: string;
  updatedAt: string;
  sources: readonly GuideSource[];
}

export type GuideId =
  | 'emeraldMineToursColombia'
  | 'travelSafety'
  | 'chivorHistory'
  | 'gachalaGuavio'
  | 'westernBoyaca';

const GIA_RAINIER_2016: GuideSource = {
  label:
    'Weldon, R., Ortiz, J. G. & Ottaway, T. (2016). In Rainier’s Footsteps: Journey to the Chivor Emerald Mine. Gems & Gemology, 52(2). GIA.',
  url: 'https://www.gia.edu/gems-gemology/summer-2016-rainier-footsteps-journey-chivor-emerald-mine',
};

const GIA_CHIVOR_HISTORY_2020: GuideSource = {
  label:
    'Schmetzer, K. & Martayan, G. (2020). History of the Chivor Emerald Mine, Part I (1880–1925). Gems & Gemology, 56(1). GIA.',
};

const RAINIER_GREEN_FIRE: GuideSource = {
  label: 'Rainier, P. W. (1942). Green Fire. New York: Random House.',
};

const FCDO_COLOMBIA: GuideSource = {
  label: 'UK Foreign, Commonwealth & Development Office. Colombia travel advice (updated 30 October 2026).',
  url: 'https://www.gov.uk/foreign-travel-advice/colombia',
};

const CHIVOR_PLANT: GuideSource = {
  label: 'Central hidroeléctrica de Chivor. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Central_hidroel%C3%A9ctrica_de_Chivor',
};

const GUAVIO_PLANT: GuideSource = {
  label: 'Central hidroeléctrica del Guavio. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Central_hidroel%C3%A9ctrica_del_Guavio',
};

const GREEN_WARS: GuideSource = {
  label: 'Guerras verdes. Wikipedia en español (citing El Tiempo, Semana, El Espectador and Verdad Abierta).',
  url: 'https://es.wikipedia.org/wiki/Guerras_verdes',
};

const FURA_TENA_HILLS: GuideSource = {
  label: 'Fura y Tena. Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Fura_y_Tena',
};

const MUZO_MUNICIPALITY: GuideSource = {
  label: 'Muzo (Boyacá). Wikipedia en español.',
  url: 'https://es.wikipedia.org/wiki/Muzo',
};

const TRAPICHE_GIA_2015: GuideSource = {
  label:
    'Pignatelli, I., Giuliani, G., Ohnenstetter, D. et al. (2015). Colombian Trapiche Emeralds: Recent Advances in Understanding Their Formation. Gems & Gemology, 51(3), 222–259.',
  url: 'https://doi.org/10.5741/GEMS.51.3.222',
};

const GACHALA_EMERALD: GuideSource = {
  label: 'Gachalá Emerald. Wikipedia (citing the Smithsonian National Museum of Natural History).',
  url: 'https://en.wikipedia.org/wiki/Gachal%C3%A1_Emerald',
};

export const GUIDES: readonly GuideDefinition[] = [
  {
    slug: 'emerald-mine-tours-colombia',
    id: 'emeraldMineToursColombia',
    sectionIds: ['whatIs', 'regions', 'chivor', 'logistics', 'gettingThere', 'inside', 'choose', 'safety'],
    image: '/images/experiences/chivor-emerald-core/hero.webp',
    cardImage: '/images/experiences/chivor-emerald-core/card.webp',
    publishedAt: '2026-11-02',
    updatedAt: '2026-11-02',
    sources: [GIA_RAINIER_2016, GACHALA_EMERALD, CHIVOR_PLANT],
  },
  {
    slug: 'chivor-travel-safety',
    id: 'travelSafety',
    sectionIds: ['advice', 'twoBelts', 'infrastructure', 'roads', 'money', 'photos', 'health', 'emergency'],
    image: '/images/experiences/list-hero.webp',
    cardImage: '/images/experiences/list-hero.webp',
    publishedAt: '2026-11-02',
    updatedAt: '2026-11-02',
    sources: [FCDO_COLOMBIA, CHIVOR_PLANT, GUAVIO_PLANT, GREEN_WARS],
  },
  {
    slug: 'chivor-emerald-mine-history',
    id: 'chivorHistory',
    sectionIds: ['somondoco', 'conquest', 'rediscovery', 'rainier', 'pulpito', 'today'],
    image: '/images/experiences/chivor-emerald-prime/hero.webp',
    cardImage: '/images/experiences/chivor-emerald-prime/card.webp',
    publishedAt: '2026-11-02',
    updatedAt: '2026-11-02',
    sources: [GIA_RAINIER_2016, GIA_CHIVOR_HISTORY_2020, RAINIER_GREEN_FIRE],
  },
  {
    slug: 'gachala-emerald-guavio-valley',
    id: 'gachalaGuavio',
    sectionIds: ['stone', 'belt', 'valley', 'hacienda', 'visit'],
    image: '/images/experiences/chivor-emerald-basic/hero.webp',
    cardImage: '/images/experiences/chivor-emerald-basic/card.webp',
    publishedAt: '2026-11-02',
    updatedAt: '2026-11-02',
    sources: [GACHALA_EMERALD, GIA_RAINIER_2016, GUAVIO_PLANT],
  },
  {
    slug: 'western-boyaca-fura-tena-muzo',
    id: 'westernBoyaca',
    sectionIds: ['muzos', 'legend', 'hills', 'trapiche', 'furaStone', 'peace', 'visit'],
    // Brand image, not a Coscuez photo: Coscuez has no dates and its media stays unpublished.
    image: '/images/brand/landing-hero-02.webp',
    cardImage: '/images/brand/landing-hero-02.webp',
    publishedAt: '2026-11-02',
    updatedAt: '2026-11-02',
    sources: [FURA_TENA_HILLS, MUZO_MUNICIPALITY, TRAPICHE_GIA_2015, GREEN_WARS],
  },
];

export function getGuideBySlug(slug: string): GuideDefinition | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

/** Locale-free path, like `experiencePath`. */
export function guidePath(slug?: string): string {
  return slug ? `/guides/${slug}` : '/guides';
}
