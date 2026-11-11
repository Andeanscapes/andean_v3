/**
 * Emerald World: the editorial reference on emeralds and Colombian emerald
 * culture, nested under `/emeralds`. Copy lives in
 * `src/i18n/messages/emeralds/{locale}/*.json` (server-only, see `emeralds.service.ts`).
 *
 * The existing `/guides/*` pages keep their URLs and own their topics; Emerald
 * World links to them instead of duplicating them.
 *
 * Source policy: never cite or link tour operators, review platforms, jewelers,
 * auction houses or emerald sellers (`editorialSources.test.ts` enforces it).
 */
import {
  AFI_GREEN_FIRE_1954,
  EL_TIEMPO_EMILIA_1996,
  GIA_ORIGIN_2019,
  GIA_RAINIER_2016,
  RAINIER_GREEN_FIRE,
  SEMANA_MOLANO_2017,
  SEMANA_REINSERCION_1992,
  SMITHSONIAN_GACHALA,
  TRAPICHE_GIA_2015,
  VERDAD_ABIERTA_MUJERES_2016,
  WIKI_EN_COLOMBIAN_EMERALDS,
  WIKI_ES_BORBUR,
  WIKI_ES_CHIVOR,
  WIKI_ES_ESMERALDA_FURA,
  WIKI_ES_ESMERALDA_TENA,
  WIKI_ES_GACHALA,
  WIKI_ES_MARIPI,
  WIKI_ES_TERRITORIO_VASQUEZ,
  FURA_TENA_HILLS,
  GREEN_WARS,
  GIA_EMERALD_DESCRIPTION,
  GIA_EMERALD_FACTS,
  GIA_EMERALD_QUALITY,
  GIA_GEM_TREATMENT,
  MUZO_MUNICIPALITY,
  type EditorialSource,
} from '@/lib/content/sources';
import type { EmeraldEntityId } from '@/lib/content/emeraldEntities';

export type EmeraldPageId =
  | 'hub'
  | 'fuegoVerde'
  | 'episodeOriente'
  | 'episodeOccidente'
  | 'episodeCoscuez'
  | 'episodeExtraordinary'
  | 'mythology'
  | 'furaTenaLegend'
  | 'greenWars'
  | 'beforeTheWars'
  | 'firstGreenWar'
  | 'secondGreenWar'
  | 'thirdGreenWar'
  | 'peace1990'
  | 'famousEmeralds'
  | 'patricia'
  | 'emiliaAndLaTito'
  | 'culture'
  | 'guaqueros'
  | 'gemology'
  | 'colombianVsZambian'
  | 'emeraldValue'
  | 'mines'
  | 'muzo';

/** Message file under `messages/emeralds/{locale}/`; one per topic section keeps each page's payload small. */
export type EmeraldMessageFile =
  | 'hub'
  | 'fuego-verde'
  | 'mythology'
  | 'green-wars'
  | 'famous-emeralds'
  | 'culture'
  | 'gemology'
  | 'mines';

export type EmeraldPageKind = 'hub' | 'pillar' | 'article' | 'episode';

/**
 * How a page may point to the tours. Documentary, scientific and memory pages
 * are `none`; `contextual` allows one closing link to the tour guide.
 */
export type EmeraldCommercialMode = 'none' | 'contextual';

export type EmeraldRelatedLink =
  | { type: 'emerald'; id: EmeraldPageId }
  | { type: 'guide'; slug: string };

export type EmeraldIllustration = 'beltMap' | 'trapiche' | 'threePhase';

/**
 * Visual attached to a section. Figures need a credit and a license: only
 * images already published on the site, museum open-access (CC0 / public
 * domain) or our own photos. Alt text and caption live in the section copy.
 */
export type EmeraldSectionMedia =
  | { type: 'figure'; src: string; credit: string; license: string; licenseUrl?: string }
  | { type: 'illustration'; name: EmeraldIllustration };

/** Named person who writes or reviews Emerald World pages. Bio and job title live in `common.json` under `authors.<id>`. */
export interface EmeraldAuthor {
  id: string;
  /** Path segment under `/emeralds/authors/`. */
  slug: string;
  name: string;
  /** CDN-relative portrait `.webp`. */
  image?: string;
  /** Public profiles that identify the person (not shops or tour listings). */
  sameAs: readonly string[];
}

/** Articles and episodes link to at least this many related pages. */
export const MIN_RELATED_LINKS = 3;

export interface EmeraldPage {
  id: EmeraldPageId;
  /** Path segments after `/emeralds`; the hub is `[]`. Identical in every locale. */
  segments: readonly string[];
  parentId?: EmeraldPageId;
  kind: EmeraldPageKind;
  commercial: EmeraldCommercialMode;
  messageFile: EmeraldMessageFile;
  sectionIds: readonly string[];
  /** Rendered as a visible link list, in this order. */
  related: readonly EmeraldRelatedLink[];
  /** CDN-relative hero `.webp`; `HeroPicture` derives its mobile and AVIF variants. */
  image: string;
  publishedAt: string;
  /** Change only when the facts in the copy change. */
  updatedAt: string;
  sources: readonly EditorialSource[];
  /** Keyed by section id. */
  media?: Readonly<Partial<Record<string, EmeraldSectionMedia>>>;
  /** Things the page is about (Wikidata-linked), for `about` in JSON-LD. */
  about: readonly EmeraldEntityId[];
  /** Named writer once registered in `EMERALD_AUTHORS`; until then the byline is the Andean Scapes team. */
  authorId?: string;
}

/** Filled when the first author's name, bio and portrait are confirmed. */
export const EMERALD_AUTHORS: readonly EmeraldAuthor[] = [];

const PUBLISHED = '2026-11-10';

/** Topic sections, in navigation order. */
const PILLARS: readonly EmeraldPageId[] = [
  'fuegoVerde',
  'gemology',
  'mines',
  'famousEmeralds',
  'mythology',
  'greenWars',
  'culture',
];

const pillarLinks = (except: EmeraldPageId): EmeraldRelatedLink[] =>
  PILLARS.filter((id) => id !== except).map((id) => ({ type: 'emerald', id }));

const GREEN_WARS_SOURCES = [GREEN_WARS, SEMANA_MOLANO_2017, SEMANA_REINSERCION_1992];

export const EMERALD_PAGES: readonly EmeraldPage[] = [
  {
    id: 'hub',
    segments: [],
    kind: 'hub',
    commercial: 'contextual',
    messageFile: 'hub',
    sectionIds: ['what', 'emerald', 'belts', 'culture', 'method'],
    related: [
      ...PILLARS.map((id): EmeraldRelatedLink => ({ type: 'emerald', id })),
      { type: 'guide', slug: 'chivor-emerald-mine-history' },
      { type: 'guide', slug: 'western-boyaca-fura-tena-muzo' },
      { type: 'guide', slug: 'gachala-emerald-guavio-valley' },
    ],
    // Not shared with any guide, so the hub's social preview stays distinct.
    image: '/images/brand/landing-hero-03.webp',
    about: ['colombianEmeralds', 'emerald', 'muzo', 'chivor', 'gachalaEmerald'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [
      GIA_EMERALD_DESCRIPTION,
      GIA_EMERALD_QUALITY,
      WIKI_EN_COLOMBIAN_EMERALDS,
      GIA_ORIGIN_2019,
      GIA_RAINIER_2016,
      RAINIER_GREEN_FIRE,
      AFI_GREEN_FIRE_1954,
      TRAPICHE_GIA_2015,
      SMITHSONIAN_GACHALA,
    ],
    media: { belts: { type: 'illustration', name: 'beltMap' } },
  },

  // Fuego Verde: the documentary journeys, one page per episode.
  {
    id: 'fuegoVerde',
    segments: ['fuego-verde'],
    parentId: 'hub',
    kind: 'pillar',
    commercial: 'none',
    messageFile: 'fuego-verde',
    sectionIds: ['what', 'twoRegions', 'howToRead'],
    related: [
      { type: 'emerald', id: 'episodeOriente' },
      { type: 'emerald', id: 'episodeOccidente' },
      { type: 'emerald', id: 'episodeCoscuez' },
      { type: 'emerald', id: 'episodeExtraordinary' },
    ],
    image: '/images/experiences/emerald-mining/hero.webp',
    about: ['colombianEmeralds', 'boyaca'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [TRAPICHE_GIA_2015],
    media: { twoRegions: { type: 'illustration', name: 'beltMap' } },
  },
  {
    id: 'episodeOriente',
    segments: ['fuego-verde', 'oriente-chivor-green-fire'],
    parentId: 'fuegoVerde',
    kind: 'episode',
    commercial: 'none',
    messageFile: 'fuego-verde',
    sectionIds: ['hook', 'otherBoyaca', 'borders', 'table', 'ages', 'rainier', 'film', 'cascadas', 'next'],
    related: [
      { type: 'guide', slug: 'chivor-emerald-mine-history' },
      { type: 'guide', slug: 'gachala-emerald-guavio-valley' },
      { type: 'emerald', id: 'culture' },
      { type: 'emerald', id: 'patricia' },
    ],
    image: '/images/brand/landing-hero-01.webp',
    about: ['chivor', 'gachala', 'greenFireFilm'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [TRAPICHE_GIA_2015, GIA_RAINIER_2016, RAINIER_GREEN_FIRE, AFI_GREEN_FIRE_1954],
  },
  {
    id: 'episodeOccidente',
    segments: ['fuego-verde', 'occidente-fura-tena'],
    parentId: 'fuegoVerde',
    kind: 'episode',
    commercial: 'none',
    messageFile: 'fuego-verde',
    sectionIds: ['hook', 'descent', 'mistake', 'river', 'hills', 'legend', 'map', 'next'],
    related: [
      { type: 'emerald', id: 'furaTenaLegend' },
      { type: 'emerald', id: 'mythology' },
      { type: 'guide', slug: 'western-boyaca-fura-tena-muzo' },
      { type: 'emerald', id: 'episodeCoscuez' },
    ],
    image: '/images/brand/segments/adventure.webp',
    about: ['furaTena', 'muzo', 'borbur'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [FURA_TENA_HILLS, WIKI_ES_BORBUR, TRAPICHE_GIA_2015, WIKI_ES_MARIPI],
    media: { map: { type: 'illustration', name: 'trapiche' } },
  },
  {
    id: 'episodeCoscuez',
    segments: ['fuego-verde', 'coscuez'],
    parentId: 'fuegoVerde',
    kind: 'episode',
    commercial: 'none',
    messageFile: 'fuego-verde',
    sectionIds: ['hook', 'arrival', 'cieloAbierto', 'vasquez', 'mine', 'chacaro', 'life', 'identity'],
    related: [
      { type: 'emerald', id: 'culture' },
      { type: 'emerald', id: 'guaqueros' },
      { type: 'emerald', id: 'greenWars' },
      { type: 'emerald', id: 'episodeExtraordinary' },
    ],
    image: '/images/brand/segments/culture.webp',
    about: ['borbur', 'territorioVasquez'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [WIKI_ES_TERRITORIO_VASQUEZ, WIKI_ES_BORBUR, TRAPICHE_GIA_2015, VERDAD_ABIERTA_MUJERES_2016],
  },
  {
    id: 'episodeExtraordinary',
    segments: ['fuego-verde', 'extraordinary-emeralds'],
    parentId: 'fuegoVerde',
    kind: 'episode',
    commercial: 'none',
    messageFile: 'fuego-verde',
    sectionIds: ['hook', 'belts', 'inclusions', 'giants', 'patricia', 'gachala', 'indiecita', 'closing'],
    related: [
      { type: 'emerald', id: 'famousEmeralds' },
      { type: 'emerald', id: 'patricia' },
      { type: 'emerald', id: 'emiliaAndLaTito' },
      { type: 'guide', slug: 'gachala-emerald-guavio-valley' },
    ],
    image: '/images/brand/final-cta.webp',
    about: ['colombianEmeralds', 'gachalaEmerald', 'furaEmerald', 'tenaEmerald'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [
      TRAPICHE_GIA_2015,
      GIA_ORIGIN_2019,
      GIA_RAINIER_2016,
      SMITHSONIAN_GACHALA,
      EL_TIEMPO_EMILIA_1996,
      WIKI_ES_GACHALA,
      WIKI_ES_ESMERALDA_FURA,
      WIKI_ES_ESMERALDA_TENA,
      WIKI_ES_CHIVOR,
    ],
    media: { inclusions: { type: 'illustration', name: 'threePhase' } },
  },

  // Mythology.
  {
    id: 'mythology',
    segments: ['mythology'],
    parentId: 'hub',
    kind: 'pillar',
    commercial: 'none',
    messageFile: 'mythology',
    sectionIds: ['what', 'muzo', 'furaTena', 'meanings'],
    related: [{ type: 'emerald', id: 'furaTenaLegend' }, { type: 'emerald', id: 'episodeOccidente' }, ...pillarLinks('mythology')],
    image: '/images/experiences/chivor-emerald-prime/highlights/highlight-3.webp',
    about: ['furaTena', 'muzoPeople'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [FURA_TENA_HILLS, WIKI_EN_COLOMBIAN_EMERALDS, GIA_RAINIER_2016],
  },
  {
    id: 'furaTenaLegend',
    segments: ['mythology', 'fura-tena-legend'],
    parentId: 'mythology',
    kind: 'article',
    commercial: 'none',
    messageFile: 'mythology',
    sectionIds: ['short', 'garavito', 'enemies', 'englishVersion', 'differences', 'hills', 'stones', 'seeing'],
    related: [
      { type: 'emerald', id: 'episodeOccidente' },
      { type: 'guide', slug: 'western-boyaca-fura-tena-muzo' },
      { type: 'emerald', id: 'famousEmeralds' },
    ],
    image: '/images/brand/landing-hero-02.webp',
    about: ['furaTena', 'muzoPeople', 'furaEmerald', 'tenaEmerald'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [FURA_TENA_HILLS, WIKI_ES_ESMERALDA_FURA, WIKI_ES_ESMERALDA_TENA, WIKI_EN_COLOMBIAN_EMERALDS, WIKI_ES_BORBUR],
  },

  // Green Wars: events and their consequences, never individuals.
  {
    id: 'greenWars',
    segments: ['green-wars'],
    parentId: 'hub',
    kind: 'pillar',
    commercial: 'none',
    messageFile: 'green-wars',
    sectionIds: ['what', 'approach', 'timeline', 'counting', 'why', 'today'],
    related: [
      { type: 'emerald', id: 'beforeTheWars' },
      { type: 'emerald', id: 'firstGreenWar' },
      { type: 'emerald', id: 'secondGreenWar' },
      { type: 'emerald', id: 'thirdGreenWar' },
      { type: 'emerald', id: 'peace1990' },
    ],
    image: '/images/experiences/chivor-emerald-core/highlights/highlight-2.webp',
    about: ['greenWars', 'boyaca'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [...GREEN_WARS_SOURCES, WIKI_ES_MARIPI],
  },
  {
    id: 'beforeTheWars',
    segments: ['green-wars', 'before-the-wars'],
    parentId: 'greenWars',
    kind: 'article',
    commercial: 'none',
    messageFile: 'green-wars',
    sectionIds: ['concessions', 'bank', 'violencia', 'fever'],
    related: [{ type: 'emerald', id: 'firstGreenWar' }, { type: 'emerald', id: 'greenWars' }, { type: 'emerald', id: 'guaqueros' }],
    image: '/images/brand/segments/private.webp',
    about: ['greenWars', 'laViolencia', 'muzo'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: GREEN_WARS_SOURCES,
  },
  {
    id: 'firstGreenWar',
    segments: ['green-wars', 'first-green-war'],
    parentId: 'greenWars',
    kind: 'article',
    commercial: 'none',
    messageFile: 'green-wars',
    sectionIds: ['dates', 'trigger', 'army', 'cost', 'closure'],
    related: [{ type: 'emerald', id: 'beforeTheWars' }, { type: 'emerald', id: 'secondGreenWar' }, { type: 'emerald', id: 'greenWars' }],
    image: '/images/experiences/chivor-emerald-core/highlights/highlight-2.webp',
    about: ['greenWars', 'muzo'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: GREEN_WARS_SOURCES,
  },
  {
    id: 'secondGreenWar',
    segments: ['green-wars', 'second-green-war'],
    parentId: 'greenWars',
    kind: 'article',
    commercial: 'none',
    messageFile: 'green-wars',
    sectionIds: ['dates', 'street', 'fortunes', 'pact', 'blocs'],
    related: [{ type: 'emerald', id: 'firstGreenWar' }, { type: 'emerald', id: 'thirdGreenWar' }, { type: 'emerald', id: 'greenWars' }],
    image: '/images/experiences/chivor-emerald-core/highlights/highlight-2.webp',
    about: ['greenWars', 'muzo'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: GREEN_WARS_SOURCES,
  },
  {
    id: 'thirdGreenWar',
    segments: ['green-wars', 'third-green-war'],
    parentId: 'greenWars',
    kind: 'article',
    commercial: 'none',
    messageFile: 'green-wars',
    sectionIds: ['dates', 'causes', 'terror', 'communities', 'toll'],
    related: [{ type: 'emerald', id: 'secondGreenWar' }, { type: 'emerald', id: 'peace1990' }, { type: 'emerald', id: 'guaqueros' }],
    image: '/images/experiences/chivor-emerald-core/highlights/highlight-2.webp',
    about: ['greenWars', 'muzo'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [GREEN_WARS, SEMANA_REINSERCION_1992, WIKI_ES_MARIPI],
  },
  {
    id: 'peace1990',
    segments: ['green-wars', 'peace-1990'],
    parentId: 'greenWars',
    kind: 'article',
    commercial: 'none',
    messageFile: 'green-wars',
    sectionIds: ['what', 'gallera', 'signing', 'held', 'economy', 'after'],
    related: [{ type: 'emerald', id: 'thirdGreenWar' }, { type: 'emerald', id: 'greenWars' }, { type: 'emerald', id: 'episodeCoscuez' }],
    image: '/images/brand/landing-hero-03.webp',
    about: ['greenWars', 'boyaca'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [GREEN_WARS, SEMANA_REINSERCION_1992, VERDAD_ABIERTA_MUJERES_2016],
  },

  // Famous emeralds.
  {
    id: 'famousEmeralds',
    segments: ['famous-emeralds'],
    parentId: 'hub',
    kind: 'pillar',
    commercial: 'none',
    messageFile: 'famous-emeralds',
    sectionIds: ['what', 'weights', 'patricia', 'gachala', 'emilia', 'furaTena', 'monstro'],
    related: [{ type: 'emerald', id: 'patricia' }, { type: 'emerald', id: 'emiliaAndLaTito' }, { type: 'emerald', id: 'episodeExtraordinary' }, ...pillarLinks('famousEmeralds')],
    image: '/images/brand/segments/couples.webp',
    about: ['colombianEmeralds', 'gachalaEmerald', 'furaEmerald', 'tenaEmerald'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [GIA_RAINIER_2016, SMITHSONIAN_GACHALA, EL_TIEMPO_EMILIA_1996, WIKI_ES_GACHALA, WIKI_ES_ESMERALDA_FURA, WIKI_ES_ESMERALDA_TENA, WIKI_ES_CHIVOR],
  },
  {
    id: 'patricia',
    segments: ['famous-emeralds', 'patricia'],
    parentId: 'famousEmeralds',
    kind: 'article',
    commercial: 'none',
    messageFile: 'famous-emeralds',
    sectionIds: ['stone', 'find', 'date', 'ten', 'today'],
    related: [
      { type: 'guide', slug: 'chivor-emerald-mine-history' },
      { type: 'emerald', id: 'episodeOriente' },
      { type: 'emerald', id: 'emiliaAndLaTito' },
    ],
    image: '/images/experiences/chivor-emerald-prime/hero.webp',
    about: ['chivor', 'colombianEmeralds'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [GIA_RAINIER_2016, WIKI_ES_CHIVOR, SEMANA_REINSERCION_1992],
  },
  {
    id: 'emiliaAndLaTito',
    segments: ['famous-emeralds', 'emilia-and-la-tito'],
    parentId: 'famousEmeralds',
    kind: 'article',
    commercial: 'none',
    messageFile: 'famous-emeralds',
    sectionIds: ['short', 'emilia', 'sister', 'sale', 'versions', 'curse'],
    related: [
      { type: 'emerald', id: 'episodeExtraordinary' },
      { type: 'guide', slug: 'gachala-emerald-guavio-valley' },
      { type: 'emerald', id: 'patricia' },
    ],
    image: '/images/experiences/chivor-emerald-basic/hero.webp',
    about: ['gachala', 'colombianEmeralds'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [EL_TIEMPO_EMILIA_1996, WIKI_ES_GACHALA],
  },

  // Culture.
  {
    id: 'culture',
    segments: ['culture'],
    parentId: 'hub',
    kind: 'pillar',
    commercial: 'none',
    messageFile: 'culture',
    sectionIds: ['what', 'tropical', 'table', 'music', 'markets', 'devotion'],
    related: [{ type: 'emerald', id: 'guaqueros' }, { type: 'emerald', id: 'episodeCoscuez' }, ...pillarLinks('culture')],
    image: '/images/brand/segments/private.webp',
    about: ['boyaca', 'colombianEmeralds'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [WIKI_ES_GACHALA, VERDAD_ABIERTA_MUJERES_2016, SEMANA_REINSERCION_1992],
  },
  {
    id: 'guaqueros',
    segments: ['culture', 'guaqueros'],
    parentId: 'culture',
    kind: 'article',
    commercial: 'none',
    messageFile: 'culture',
    sectionIds: ['who', 'dawn', 'voladoras', 'tambreo', 'women', 'everyone'],
    related: [{ type: 'emerald', id: 'episodeCoscuez' }, { type: 'emerald', id: 'thirdGreenWar' }, { type: 'emerald', id: 'culture' }],
    image: '/images/experiences/chivor-emerald-core/highlights/highlight-1.webp',
    about: ['muzo', 'colombianEmeralds'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [VERDAD_ABIERTA_MUJERES_2016, SEMANA_MOLANO_2017, SEMANA_REINSERCION_1992],
  },

  // Gemology: what an emerald is, origin, value.
  {
    id: 'gemology',
    segments: ['gemology'],
    parentId: 'hub',
    kind: 'pillar',
    commercial: 'none',
    messageFile: 'gemology',
    sectionIds: ['what', 'color', 'jardin', 'inclusions', 'treatments', 'facts'],
    related: [
      { type: 'emerald', id: 'colombianVsZambian' },
      { type: 'emerald', id: 'emeraldValue' },
      { type: 'emerald', id: 'episodeExtraordinary' },
      { type: 'emerald', id: 'mines' },
    ],
    image: '/images/experiences/chivor-emerald-core/highlights/highlight-1.webp',
    about: ['emerald', 'beryl', 'colombianEmeralds'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [GIA_EMERALD_DESCRIPTION, GIA_EMERALD_QUALITY, GIA_ORIGIN_2019, GIA_GEM_TREATMENT, GIA_EMERALD_FACTS],
    media: { inclusions: { type: 'illustration', name: 'threePhase' } },
  },
  {
    id: 'colombianVsZambian',
    segments: ['gemology', 'colombian-vs-zambian-emeralds'],
    parentId: 'gemology',
    kind: 'article',
    commercial: 'none',
    messageFile: 'gemology',
    sectionIds: ['short', 'geology', 'color', 'inclusions', 'lab', 'better'],
    related: [
      { type: 'emerald', id: 'emeraldValue' },
      { type: 'emerald', id: 'gemology' },
      { type: 'emerald', id: 'muzo' },
    ],
    image: '/images/experiences/chivor-emerald-prime/highlights/highlight-3.webp',
    about: ['colombianEmeralds', 'zambia', 'emerald'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [GIA_ORIGIN_2019, GIA_EMERALD_QUALITY, TRAPICHE_GIA_2015],
    media: { inclusions: { type: 'illustration', name: 'threePhase' } },
  },
  {
    id: 'emeraldValue',
    segments: ['gemology', 'colombian-emerald-value'],
    parentId: 'gemology',
    kind: 'article',
    commercial: 'none',
    messageFile: 'gemology',
    sectionIds: ['short', 'color', 'clarity', 'cut', 'size', 'treatment', 'reports', 'origin', 'checklist'],
    related: [
      { type: 'emerald', id: 'colombianVsZambian' },
      { type: 'emerald', id: 'gemology' },
      { type: 'emerald', id: 'famousEmeralds' },
    ],
    image: '/images/brand/final-cta.webp',
    about: ['colombianEmeralds', 'emerald'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [GIA_EMERALD_QUALITY, GIA_GEM_TREATMENT, GIA_ORIGIN_2019, GIA_RAINIER_2016],
  },

  // Mines.
  {
    id: 'mines',
    segments: ['mines'],
    parentId: 'hub',
    kind: 'pillar',
    commercial: 'none',
    messageFile: 'mines',
    sectionIds: ['what', 'western', 'eastern', 'names', 'visiting'],
    related: [
      { type: 'emerald', id: 'muzo' },
      { type: 'guide', slug: 'chivor-emerald-mine-history' },
      { type: 'guide', slug: 'gachala-emerald-guavio-valley' },
      { type: 'emerald', id: 'episodeCoscuez' },
    ],
    image: '/images/brand/segments/families.webp',
    about: ['colombianEmeralds', 'muzo', 'chivor', 'gachala', 'borbur'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [
      TRAPICHE_GIA_2015,
      WIKI_EN_COLOMBIAN_EMERALDS,
      GIA_RAINIER_2016,
      SMITHSONIAN_GACHALA,
      WIKI_ES_BORBUR,
      GIA_ORIGIN_2019,
    ],
    media: { western: { type: 'illustration', name: 'beltMap' } },
  },
  {
    id: 'muzo',
    segments: ['mines', 'muzo'],
    parentId: 'mines',
    kind: 'article',
    commercial: 'none',
    messageFile: 'mines',
    sectionIds: ['short', 'name', 'conquest', 'geology', 'trapiche', 'color', 'stones', 'conflict', 'today'],
    related: [
      { type: 'emerald', id: 'episodeOccidente' },
      { type: 'emerald', id: 'furaTenaLegend' },
      { type: 'emerald', id: 'greenWars' },
      { type: 'emerald', id: 'colombianVsZambian' },
    ],
    image: '/images/brand/landing-hero-02.webp',
    about: ['muzo', 'muzoPeople', 'colombianEmeralds', 'boyaca'],
    publishedAt: PUBLISHED,
    updatedAt: PUBLISHED,
    sources: [
      MUZO_MUNICIPALITY,
      WIKI_EN_COLOMBIAN_EMERALDS,
      TRAPICHE_GIA_2015,
      SEMANA_REINSERCION_1992,
      WIKI_ES_ESMERALDA_FURA,
      SEMANA_MOLANO_2017,
      VERDAD_ABIERTA_MUJERES_2016,
    ],
    media: { trapiche: { type: 'illustration', name: 'trapiche' } },
  },
];

export const EMERALDS_ROOT = '/emeralds';

/** Locale-free path, like `guidePath`. */
export function emeraldPath(page: Pick<EmeraldPage, 'segments'>): string {
  return page.segments.length ? `${EMERALDS_ROOT}/${page.segments.join('/')}` : EMERALDS_ROOT;
}

export function getEmeraldPageById(id: EmeraldPageId): EmeraldPage | undefined {
  return EMERALD_PAGES.find((page) => page.id === id);
}

export function getEmeraldPageBySegments(segments: readonly string[]): EmeraldPage | undefined {
  return EMERALD_PAGES.find(
    (page) => page.segments.length === segments.length && page.segments.every((s, i) => s === segments[i]),
  );
}

/** Root-first chain of ancestors, ending with the page itself. */
export function getEmeraldTrail(page: EmeraldPage): EmeraldPage[] {
  const trail: EmeraldPage[] = [page];
  let current = page;
  while (current.parentId) {
    const parent = getEmeraldPageById(current.parentId);
    if (!parent || trail.includes(parent)) break;
    trail.unshift(parent);
    current = parent;
  }
  return trail;
}

/** Top-level topic sections (mythology, history…) for the section navigation. */
export function getEmeraldPillars(): EmeraldPage[] {
  return PILLARS.map((id) => getEmeraldPageById(id)).filter((page): page is EmeraldPage => page !== undefined);
}

/**
 * Previous and next page under the same parent and of the same kind, in
 * registry order: articles page through articles, episodes through episodes.
 */
export function getEmeraldSiblings(page: EmeraldPage): { previous?: EmeraldPage; next?: EmeraldPage } {
  if (!page.parentId) return {};
  const siblings = EMERALD_PAGES.filter((item) => item.parentId === page.parentId && item.kind === page.kind);
  const index = siblings.indexOf(page);
  return { previous: siblings[index - 1], next: siblings[index + 1] };
}

export function getEmeraldAuthorById(id: string): EmeraldAuthor | undefined {
  return EMERALD_AUTHORS.find((author) => author.id === id);
}

export function getEmeraldAuthorBySlug(slug: string): EmeraldAuthor | undefined {
  return EMERALD_AUTHORS.find((author) => author.slug === slug);
}

export function emeraldAuthorPath(author: Pick<EmeraldAuthor, 'slug'>): string {
  return `${EMERALDS_ROOT}/authors/${author.slug}`;
}
