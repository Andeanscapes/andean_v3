/**
 * Things an Emerald World page is about, linked to Wikidata so search engines
 * and AI assistants can tell which Muzo, Chivor or "Green Wars" a page means.
 * Ids were resolved from the matching Wikipedia articles (checked 2026-11-10).
 * Names are proper names and are not translated.
 */
export const EMERALD_ENTITIES = {
  emerald: { name: 'Emerald', wikidata: 'Q43513' },
  colombianEmeralds: { name: 'Colombian emeralds', wikidata: 'Q17007270' },
  beryl: { name: 'Beryl', wikidata: 'Q103480' },
  muzo: { name: 'Muzo', wikidata: 'Q1431785' },
  muzoPeople: { name: 'Muzo people', wikidata: 'Q6034912' },
  chivor: { name: 'Chivor', wikidata: 'Q1656250' },
  gachala: { name: 'Gachalá', wikidata: 'Q1577621' },
  gachalaEmerald: { name: 'Gachalá Emerald', wikidata: 'Q772466' },
  boyaca: { name: 'Boyacá Department', wikidata: 'Q121233' },
  borbur: { name: 'San Pablo de Borbur', wikidata: 'Q1575910' },
  furaTena: { name: 'Fura y Tena', wikidata: 'Q20022250' },
  furaEmerald: { name: 'Fura emerald', wikidata: 'Q5839672' },
  tenaEmerald: { name: 'Tena emerald', wikidata: 'Q5839687' },
  greenWars: { name: 'Guerras verdes', wikidata: 'Q100324070' },
  laViolencia: { name: 'La Violencia', wikidata: 'Q185407' },
  territorioVasquez: { name: 'Territorio Vásquez', wikidata: 'Q6143328' },
  greenFireFilm: { name: 'Green Fire (1954 film)', wikidata: 'Q1552174' },
  zambia: { name: 'Zambia', wikidata: 'Q953' },
} as const;

export type EmeraldEntityId = keyof typeof EMERALD_ENTITIES;

export function toAboutLd(ids: readonly EmeraldEntityId[]) {
  return ids.map((id) => ({
    '@type': 'Thing',
    name: EMERALD_ENTITIES[id].name,
    sameAs: `https://www.wikidata.org/wiki/${EMERALD_ENTITIES[id].wikidata}`,
  }));
}
