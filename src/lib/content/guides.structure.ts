/**
 * Editorial guides: route slugs, media and sources. Copy lives in
 * `src/i18n/messages/guides/{locale}.json` (server-only, see `guides.service.ts`).
 *
 * Slugs are identical in every locale, like experience slugs. `updatedAt` must
 * only change when the facts in the copy change.
 */

import {
  CHIVOR_PLANT,
  FCDO_COLOMBIA,
  FURA_TENA_HILLS,
  GACHALA_EMERALD,
  GIA_CHIVOR_HISTORY_2020,
  GIA_RAINIER_2016,
  GREEN_WARS,
  GUAVIO_PLANT,
  MUZO_MUNICIPALITY,
  RAINIER_GREEN_FIRE,
  TRAPICHE_GIA_2015,
  type EditorialSource,
} from '@/lib/content/sources';
import type { EmeraldPageId } from '@/lib/content/emeralds.structure';

/** Kept for existing importers; the shape is shared with Emerald World. */
export type GuideSource = EditorialSource;

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
  /** Emerald World pages that go deeper into this guide's topics, rendered as a link list. */
  emeraldLinks?: readonly EmeraldPageId[];
}

export type GuideId =
  | 'emeraldMineToursColombia'
  | 'travelSafety'
  | 'chivorHistory'
  | 'gachalaGuavio'
  | 'westernBoyaca';

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

    emeraldLinks: ['hub', 'mines', 'muzo', 'gemology', 'patricia', 'furaTenaLegend', 'greenWars'],
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

    emeraldLinks: ['greenWars', 'peace1990', 'culture'],
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

    emeraldLinks: ['patricia', 'episodeOriente', 'mines', 'famousEmeralds'],
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

    emeraldLinks: ['emiliaAndLaTito', 'famousEmeralds', 'episodeExtraordinary'],
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

    emeraldLinks: ['furaTenaLegend', 'muzo', 'greenWars', 'episodeOccidente'],
  },
];

export function getGuideBySlug(slug: string): GuideDefinition | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

/** Locale-free path, like `experiencePath`. */
export function guidePath(slug?: string): string {
  return slug ? `/guides/${slug}` : '/guides';
}
