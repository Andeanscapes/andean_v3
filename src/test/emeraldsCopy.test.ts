/**
 * Editorial rules for Emerald World copy (`src/i18n/messages/emeralds/`).
 *
 * - Stock phrases that read as generated text are banned in every locale.
 * - At most one em dash per string.
 * - No jewelry houses or brands anywhere: jewelry history is told through
 *   museum records, never makers.
 * - Green Wars copy covers events, not individuals, and no other page names
 *   the people of those wars either.
 * - The editorial copy bundled into the Worker stays under a size budget.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/routing';

const MESSAGES_DIR = path.resolve(__dirname, '../i18n/messages');
const EMERALDS_DIR = path.join(MESSAGES_DIR, 'emeralds');
const LOCALES = locales;

const BANNED_PHRASES: Record<(typeof LOCALES)[number], readonly string[]> = {
  en: [
    'delve',
    'tapestry',
    'nestled',
    'testament to',
    'rich history',
    'vibrant',
    'hidden gem',
    'embark',
    'unlock the',
    "in today's world",
    'whether you’re',
    "whether you're",
    'look no further',
    'a must-see',
    'breathtaking',
    'treasure trove',
    'journey through',
    'in the heart of',
    'unforgettable',
  ],
  es: [
    'sumérgete',
    'un viaje fascinante',
    'sin duda alguna',
    'en el corazón de',
    'joya escondida',
    'rico patrimonio',
    'te invitamos a descubrir',
    'inolvidable',
    'no te puedes perder',
    'un sinfín de',
  ],
  fr: [
    'plongez',
    'véritable joyau',
    'au cœur de',
    'joyau caché',
    'un voyage fascinant',
    'incontournable',
    'inoubliable',
    'à couper le souffle',
    'riche histoire',
  ],
  de: [
    'eintauchen',
    'tauchen sie ein',
    'verborgenes juwel',
    'unvergesslich',
    'atemberaubend',
    'im herzen von',
    'reiche geschichte',
    'ein muss',
    'lassen sie sich verzaubern',
    'entdecken sie die magie',
  ],
  it: [
    'immergiti',
    'immergetevi',
    'gioiello nascosto',
    'indimenticabile',
    'mozzafiato',
    'nel cuore di',
    'ricca storia',
    'da non perdere',
    'lasciati incantare',
    'un viaggio affascinante',
  ],
};

/** Jewelry houses and brands; matched case-insensitively as whole words. */
const MAKER_NAMES: readonly string[] = [
  'Cartier',
  'Bulgari',
  'Bvlgari',
  'Van Cleef',
  'Harry Winston',
  'Tiffany',
  'Boucheron',
  'Chaumet',
  'Graff',
  'Fabergé',
  'Chopard',
  'Mellerio',
  'Garrard',
  'Piaget',
  'De Beers',
];

/** Green Wars protagonists no Emerald World page names (events only). Accents are ignored. */
const GREEN_WARS_PEOPLE: readonly string[] = [
  'Carranza',
  'Efrain Gonzalez',
  'Rodriguez Gacha',
  'El Mexicano',
  'Pedro Rincon',
  'Pedro Orejas',
  'Gilberto Molina',
  'Yesid Nieto',
  'Pablo Escobar',
  'Siete Colores',
  'Manteco',
  'Isauro Murcia',
  'El Ganso',
  'Pequines',
  'Murcia Chaparro',
  'Jarro Tobos',
];

/** Compressed text of one language (main, guides, Emerald World). Free-plan headroom: see `workerBudget.test.ts`. */
const PER_LANGUAGE_TEXT_BUDGET_BYTES = 110 * 1024;

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}

/**
 * Arrays contribute their length, so a list must have the same number of
 * items in every locale (one paragraph per paragraph, one fact per list item).
 * That keeps translations aligned and their citations comparable.
 */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const files = (locale: string) => readdirSync(path.join(EMERALDS_DIR, locale)).filter((file) => file.endsWith('.json'));
const readJson = (locale: string, file: string): unknown =>
  JSON.parse(readFileSync(path.join(EMERALDS_DIR, locale, file), 'utf8'));

function findMakerNames(text: string): string[] {
  return MAKER_NAMES.filter((name) => new RegExp(`\\b${normalize(name)}\\b`).test(normalize(text)));
}

function findGreenWarsPeople(text: string): string[] {
  return GREEN_WARS_PEOPLE.filter((name) => normalize(text).includes(normalize(name)));
}

describe('Emerald World copy', () => {
  it('has the same files and key structure in every locale', () => {
    const reference = files('en');
    for (const locale of LOCALES) {
      expect(files(locale)).toEqual(reference);
      for (const file of reference) expect(keyPaths(readJson(locale, file)), `${locale}/${file}`).toEqual(keyPaths(readJson('en', file)));
    }
  });

  it.each(LOCALES)('avoids stock phrases and stacked em dashes (%s)', (locale) => {
    for (const file of files(locale)) {
      for (const text of collectStrings(readJson(locale, file))) {
        const lower = text.toLowerCase();
        expect(BANNED_PHRASES[locale].filter((phrase) => lower.includes(phrase)), `${locale}/${file}: "${text.slice(0, 60)}…"`).toEqual([]);
        expect((text.match(/—/g) ?? []).length, `${locale}/${file}: "${text.slice(0, 60)}…"`).toBeLessThanOrEqual(1);
      }
    }
  });

  it.each(LOCALES)('names no jewelry house or brand (%s)', (locale) => {
    for (const file of files(locale)) {
      for (const text of collectStrings(readJson(locale, file))) expect(findMakerNames(text), `${locale}/${file}`).toEqual([]);
    }
  });

  it.each(LOCALES)('names none of the Green Wars’ protagonists on any page (%s)', (locale) => {
    for (const file of files(locale)) {
      for (const text of collectStrings(readJson(locale, file))) expect(findGreenWarsPeople(text), `${locale}/${file}`).toEqual([]);
    }
  });

  // "Only found in X" claims are easy to overstate; each must name the scope it holds for.
  it.each(LOCALES)('scopes exclusivity claims to Colombia (%s)', (locale) => {
    const claim = { en: /only found/i, es: /solo aparecen|únicamente se encuentran/i, fr: /ne se trouvent que/i, de: /(kommen|vorkommen)[^.]*\bnur (in|aus)\b|\bnur (in|aus) [^.]*vor\b/i, it: /si trovano solo|provengono solo|soltanto nei/i }[locale];
    const scope = { en: /colombia/i, es: /colombia/i, fr: /colombie/i, de: /kolumbien/i, it: /colombia/i }[locale];
    for (const file of files(locale)) {
      for (const text of collectStrings(readJson(locale, file)).filter((t) => claim.test(t))) {
        expect(scope.test(text), `${locale}/${file}: "${text.slice(0, 80)}…"`).toBe(true);
      }
    }
  });

  it('detects listed names regardless of accents and case', () => {
    expect(findMakerNames('a piece by CARTIER, 1930')).toEqual(['Cartier']);
    expect(findMakerNames('graffiti in Muzo')).toEqual([]);
    expect(findGreenWarsPeople('Gonzalo Rodríguez Gacha')).toEqual(['Rodriguez Gacha']);
  });

  // All text for one language ships in the Worker, so each language has its own budget.
  it.each(LOCALES)('keeps the %s text shipped in the Worker under the per-language budget', (locale) => {
    const shipped = [path.join(MESSAGES_DIR, `${locale}.json`), path.join(MESSAGES_DIR, 'guides', `${locale}.json`), ...files(locale).map((file) => path.join(EMERALDS_DIR, locale, file))];
    const gzipped = shipped.reduce((total, file) => total + gzipSync(readFileSync(file)).length, 0);
    expect(gzipped).toBeLessThan(PER_LANGUAGE_TEXT_BUDGET_BYTES);
  });
});
