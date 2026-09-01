/**
 * V2 feed contract guard.
 *
 * Reads the payloads downloaded from `REMOTE_DATA_BASE_URL` by
 * `scripts/fetch-fixtures.ts` — the same files the service tests use, so this
 * suite and the app can never disagree about what production serves.
 *
 * Reading the *downloaded* payload is the point: an earlier revision validated a
 * separate hand-authored copy, which meant these assertions could pass against a
 * payload nobody publishes.
 *
 * They are real business data, so they are **not committed** — `fixtures/` is
 * gitignored. When the directory is absent this suite skips rather than fails,
 * so a fresh clone stays green; `npm run fixtures:fetch` restores it.
 *
 * What this locks down:
 *   1. The v2 contract itself — no translation paths, no `*Key` properties.
 *   2. Every domain code in the payload has copy in en/es/fr.
 *   3. Identifier values still match the enums the booking flow persists.
 *   4. Every projected field equals its owner in the experience resource.
 *
 * The `*_I18N` tables are imported from `src/i18n/mappings/*`, never redeclared:
 * a local copy would let the production tables drift while these tests stayed
 * green. See `docs/V2_REMOTE_RESOURCES_MIGRATION.md`.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import enMessages from '@/i18n/messages/en.json';
import esMessages from '@/i18n/messages/es.json';
import frMessages from '@/i18n/messages/fr.json';
import { RoomModeSchema, RoomTypeSchema, TransportModeSchema } from '@/lib/schemas/experience.schema';
import {
  ExperienceFeedV2Schema,
  ExperiencesListFeedV2Schema,
  LandingFeedV2Schema,
} from '@/lib/schemas/feed/v2';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import { EXPERIENCES_LIST_I18N } from '@/i18n/mappings/experiences-list';
import { LANDING_I18N } from '@/i18n/mappings/landing';

const FEED_DIR = path.resolve(__dirname, '../../../fixtures');
const LOCALES = { en: enMessages, es: esMessages, fr: frMessages };

const V2_FILES = ['landing.json', 'experiences-list.json', 'experience-emerald-mining.json'] as const;

const presentFiles = V2_FILES.filter((file) => existsSync(path.join(FEED_DIR, file)));

/**
 * The v2 payloads are uncommitted and unpublished, so a fresh clone (and CI) has
 * none — skip rather than fail there.
 *
 * A *partial* directory is different: the cross-artifact assertions are the only
 * guard against a projection drifting from its owner, so a missing subset is a
 * broken checkout, not an expected state. Fail loudly instead of degrading to a
 * green run that silently checked less.
 */
if (presentFiles.length > 0 && presentFiles.length < V2_FILES.length) {
  const missing = V2_FILES.filter((file) => !presentFiles.includes(file));
  throw new Error(
    `[feed-v2] fixtures/ is incomplete — missing ${missing.join(', ')}. ` +
      'Run `npm run fixtures:fetch`, or remove the directory entirely to skip this suite.',
  );
}

const V2_AVAILABLE = presentFiles.length === V2_FILES.length;

if (!V2_AVAILABLE) {
  console.warn(
    '[feed-v2] Skipping the v2 contract suite: fixtures/*.json not found. ' +
      'Run `npm run fixtures:fetch` to download them.',
  );
}

const describeV2 = V2_AVAILABLE ? describe : describe.skip;

function readFeed(file: string): unknown {
  if (!V2_AVAILABLE) return {};
  return JSON.parse(readFileSync(path.join(FEED_DIR, file), 'utf8')) as unknown;
}

const LANDING = readFeed('landing.json');
const LIST = readFeed('experiences-list.json');
const EXPERIENCE = readFeed('experience-emerald-mining.json');

const ARTIFACTS = {
  'landing.json': LANDING,
  'experiences-list.json': LIST,
  'experience-emerald-mining.json': EXPERIENCE,
} as const;

// ── Contract-level guards ────────────────────────────────────────────────────

/** Namespaces owned by `src/i18n/messages/*.json`. None may appear in the feed. */
const FRONTEND_NAMESPACES = [
  'Landing',
  'ExperiencesList',
  'experiences',
  'Home',
  'BookingCtas',
  'EmeraldMiningAdventure',
  'Header',
  'Footer',
  'MobileMenu',
  'Error',
];

const TRANSLATION_PATH = new RegExp(`^(${FRONTEND_NAMESPACES.join('|')})\\.[A-Za-z0-9_.]+$`);

interface Finding {
  path: string;
  value: string;
}

function walk(
  node: unknown,
  visit: (nodePath: string, key: string | null, value: unknown) => void,
  nodePath = '$',
  key: string | null = null,
): void {
  visit(nodePath, key, node);

  if (Array.isArray(node)) {
    node.forEach((item, index) => walk(item, visit, `${nodePath}[${index}]`, null));
    return;
  }

  if (node && typeof node === 'object') {
    for (const [childKey, childValue] of Object.entries(node)) {
      walk(childValue, visit, `${nodePath}.${childKey}`, childKey);
    }
  }
}

function findKeySuffixedProperties(payload: unknown): string[] {
  const found: string[] = [];
  walk(payload, (nodePath, key) => {
    if (key && /Keys?$/.test(key)) found.push(nodePath);
  });
  return found;
}

function findTranslationPaths(payload: unknown): Finding[] {
  const found: Finding[] = [];
  walk(payload, (nodePath, _key, value) => {
    if (typeof value === 'string' && TRANSLATION_PATH.test(value)) {
      found.push({ path: nodePath, value });
    }
  });
  return found;
}

describeV2('v2 feed contract', () => {
  it('experience-emerald-mining.json parses with the production v2 schema', () => {
    const result = ExperienceFeedV2Schema.safeParse(EXPERIENCE);
    if (!result.success) console.error(JSON.stringify(result.error.issues, null, 2));
    expect(result.success).toBe(true);
  });

  it('experiences-list.json parses with the production v2 schema', () => {
    const result = ExperiencesListFeedV2Schema.safeParse(LIST);
    if (!result.success) console.error(JSON.stringify(result.error.issues, null, 2));
    expect(result.success).toBe(true);
  });

  it('landing.json parses with the production v2 schema', () => {
    const result = LandingFeedV2Schema.safeParse(LANDING);
    if (!result.success) console.error(JSON.stringify(result.error.issues, null, 2));
    expect(result.success).toBe(true);
  });

  /**
   * `experienceFeedAdapter` maps `media.highlights` positionally onto three
   * value-proposition tiles, and the translator falls back to a hardcoded stock
   * image per missing tile. Without a length constraint a short array parses,
   * and the page renders unrelated photography instead of throwing — a silent
   * content substitution, which is the one failure mode the feed contract is
   * supposed to make impossible.
   */
  it.each([
    ['too few', 2],
    ['too many', 4],
  ])('rejects media.highlights when there are %s', (_label, count) => {
    // Rebuilt with spreads rather than mutated: `EXPERIENCE` is shared by every
    // test in this file, so editing it in place would leak into the others.
    const source = EXPERIENCE as {
      experience: { media: { highlights: string[] } };
    };
    const [sample] = source.experience.media.highlights;

    const payload = {
      ...source,
      experience: {
        ...source.experience,
        media: {
          ...source.experience.media,
          highlights: Array.from({ length: count }, () => sample),
        },
      },
    };

    const result = ExperienceFeedV2Schema.safeParse(payload);

    expect(result.success).toBe(false);
    expect(
      result.success
        ? []
        : result.error.issues.map((issue) => issue.path.join('.')),
    ).toContain('experience.media.highlights');
  });

  it.each(Object.keys(ARTIFACTS))('%s declares schemaVersion 2', (file) => {
    const payload = ARTIFACTS[file as keyof typeof ARTIFACTS] as { schemaVersion?: unknown };
    expect(payload.schemaVersion).toBe(2);
  });

  it.each(Object.keys(ARTIFACTS))('%s has no *Key property', (file) => {
    expect(findKeySuffixedProperties(ARTIFACTS[file as keyof typeof ARTIFACTS])).toEqual([]);
  });

  it.each(Object.keys(ARTIFACTS))('%s carries no frontend translation path', (file) => {
    expect(findTranslationPaths(ARTIFACTS[file as keyof typeof ARTIFACTS])).toEqual([]);
  });
});

// ── Typed view of the asserted fields ────────────────────────────────────────

const ExperienceArtifactSchema = z.object({
  experience: z.object({
    id: z.string(),
    slug: z.string(),
    status: z.enum(['published', 'draft', 'archived']),
    difficulty: z.string(),
    schedule: z.object({ startTime: z.string(), timeZone: z.string() }),
    duration: z.object({ days: z.number(), nights: z.number() }),
    capacity: z.object({ minimum: z.number(), maximum: z.number() }),
    pricing: z.object({
      currency: z.string(),
      basePerPerson: z.number(),
      depositPercent: z.number(),
    }),
    location: z.object({
      id: z.string(),
      locality: z.string(),
      region: z.string(),
      countryCode: z.string(),
      coordinates: z.object({ latitude: z.number(), longitude: z.number() }),
    }),
    media: z.object({ hero: z.string(), card: z.string(), highlights: z.array(z.string()) }),
    host: z.object({ id: z.string(), displayName: z.string(), avatar: z.string() }),
    included: z.array(z.string()),
    notIncluded: z.array(z.string()),
  }),
  transportOptions: z.array(z.string()),
  roomModes: z.array(
    z.object({
      value: z.string(),
      tierId: z.string(),
      roomTypeId: z.string(),
      occupancy: z.number(),
      priceMultiplier: z.number(),
      unitsAvailable: z.number(),
    }),
  ),
  accommodationTiers: z.array(
    z.object({
      id: z.string(),
      isDefault: z.boolean(),
      rooms: z.array(
        z.object({
          id: z.string(),
          roomTypeId: z.string(),
          capacity: z.number(),
          pricePerNight: z.number(),
        }),
      ),
      services: z.array(z.object({ id: z.string(), pricePerPersonPerNight: z.number() })),
      roundtripTransfer: z.object({
        origin: z.string(),
        destination: z.string(),
        pricePerVehicle: z.number(),
        maxPeoplePerVehicle: z.number(),
      }),
      itinerary: z.array(
        z.object({
          day: z.number(),
          stops: z.array(
            z.object({
              id: z.string(),
              time: z.string(),
              categoryCode: z.string(),
              images: z.array(z.string()),
            }),
          ),
        }),
      ),
    }),
  ),
  addons: z.array(
    z.object({
      id: z.string(),
      pricePerPerson: z.number(),
      requiresTeamConfirmation: z.boolean(),
    }),
  ),
  availableDates: z.array(
    z.object({
      id: z.string(),
      startDate: z.string(),
      spots: z.number(),
      isAvailable: z.boolean(),
    }),
  ),
  reviews: z.array(
    z.object({
      id: z.string(),
      authorName: z.string(),
      countryCode: z.string().optional(),
      rating: z.number(),
      verified: z.boolean(),
      source: z.string(),
    }),
  ),
});

// Artifact schemas removed: use ExperiencesListFeedSchema and LandingFeedSchema directly

/**
 * Parse only when the payloads exist.
 *
 * `describe.skip` still executes its callback to collect tests, so any parse
 * reached during collection must not throw when `fixtures/` is absent. The
 * stand-in is never dereferenced — every suite that reads one is skipped — and
 * keeping the declared type means the assertions stay fully type-checked.
 */
function parseV2<T>(schema: z.ZodType<T>, payload: unknown): T {
  return V2_AVAILABLE ? schema.parse(payload) : ({} as T);
}

/** Parsed once at module scope because 60+ assertions read it. */
const experience = parseV2(ExperienceArtifactSchema, EXPERIENCE);

// ── Frontend i18n mapping ────────────────────────────────────────────────────
// Imported from `src/i18n/mappings/*`, never redeclared: a local copy would let
// the production tables drift while these tests stayed green.

const EMERALD_I18N = EXPERIENCE_I18N.emeraldMining;

const INCLUDED_I18N: Record<string, string> = EMERALD_I18N.included;
const NOT_INCLUDED_I18N: Record<string, string> = EMERALD_I18N.notIncluded;
const ROOM_MODE_I18N: Record<string, string> = EMERALD_I18N.roomMode;
const DIFFICULTY_I18N: Record<string, string> = EMERALD_I18N.difficulty;
const REVIEW_I18N: Record<string, string> = EMERALD_I18N.reviews;
const COUNTRY_I18N: Record<string, string> = LANDING_I18N.countries;
const REVIEW_SOURCE_I18N: Record<string, string> = LANDING_I18N.reviewSource;

/** Transport and add-on mappings carry a label + description pair. */
const TRANSPORT_I18N: Record<string, string> = Object.fromEntries(
  Object.entries(EMERALD_I18N.transport).map(([code, entry]) => [code, entry.label]),
);
const TRANSPORT_DESCRIPTION_I18N: Record<string, string> = Object.fromEntries(
  Object.entries(EMERALD_I18N.transport).map(([code, entry]) => [code, entry.description]),
);
const ADDON_I18N: Record<string, string> = Object.fromEntries(
  Object.entries(EMERALD_I18N.addons).map(([code, entry]) => [code, entry.label]),
);
const ADDON_DESCRIPTION_I18N: Record<string, string> = Object.fromEntries(
  Object.entries(EMERALD_I18N.addons).map(([code, entry]) => [code, entry.description]),
);

// Keyed by the host id the payload actually carries, so a renamed host fails
// the mapping sweep instead of silently passing.
const HOST_I18N: Record<string, string> = V2_AVAILABLE
  ? { [experience.experience.host.id]: EMERALD_I18N.host.bio }
  : {};

/** Room-type copy is tier-scoped, matching the namespace the v1 feed pointed at. */
const ROOM_TYPE_I18N: Record<string, string> = Object.assign(
  {},
  ...Object.values(EMERALD_I18N.tiers).map((tier) => tier.rooms),
) as Record<string, string>;

function resolveKey(messages: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

function expectMapped(codes: readonly string[], table: Record<string, string>, label: string): void {
  const unmapped = codes.filter((code) => !table[code]);
  expect(unmapped, `${label}: codes with no frontend mapping`).toEqual([]);

  for (const [locale, messages] of Object.entries(LOCALES)) {
    const missing = codes
      .map((code) => table[code])
      .filter((key) => typeof resolveKey(messages, key) !== 'string');
    expect(missing, `${label}: keys missing in ${locale}`).toEqual([]);
  }
}

describeV2('v2 domain codes resolve to copy in every locale', () => {
  it('included items', () => {
    expectMapped(experience.experience.included, INCLUDED_I18N, 'included');
  });

  it('excluded items', () => {
    expectMapped(experience.experience.notIncluded, NOT_INCLUDED_I18N, 'notIncluded');
  });

  it('transport options', () => {
    expectMapped(experience.transportOptions, TRANSPORT_I18N, 'transportOptions');
  });

  it('room modes', () => {
    expectMapped(
      experience.roomModes.map((mode) => mode.value),
      ROOM_MODE_I18N,
      'roomModes',
    );
  });

  it('room types', () => {
    const roomTypes = experience.accommodationTiers.flatMap((tier) =>
      tier.rooms.map((room) => room.roomTypeId),
    );
    expectMapped(roomTypes, ROOM_TYPE_I18N, 'roomTypes');
  });

  it('accommodation tiers', () => {
    const tierNames: Record<string, string> = Object.fromEntries(
      Object.entries(EMERALD_I18N.tiers).map(([tierId, entry]) => [tierId, entry.name]),
    );
    expectMapped(
      experience.accommodationTiers.map((tier) => tier.id),
      tierNames,
      'accommodationTiers',
    );
  });

  it('add-ons', () => {
    expectMapped(
      experience.addons.map((addon) => addon.id),
      ADDON_I18N,
      'addons',
    );
  });

  it('host', () => {
    expectMapped([experience.experience.host.id], HOST_I18N, 'host');
  });

  it('difficulty', () => {
    expectMapped([experience.experience.difficulty], DIFFICULTY_I18N, 'difficulty');
  });

  // Keys are looked up through the mapping table, never built from the feed's
  // tier/stop ids — string-concatenating a remote value is the defect this
  // migration exists to remove.
  it('itinerary stops resolve through the mapping table', () => {
    const stopKeys: string[] = [];

    for (const tier of experience.accommodationTiers) {
      const tierMap = EMERALD_I18N.tiers[tier.id as keyof typeof EMERALD_I18N.tiers];
      expect(tierMap, `tier "${tier.id}" has no i18n mapping`).toBeDefined();

      for (const day of tier.itinerary) {
        for (const stop of day.stops) {
          const stopMap = tierMap.stops[stop.id as keyof typeof tierMap.stops];
          expect(stopMap, `stop "${stop.id}" has no i18n mapping`).toBeDefined();
          stopKeys.push(stopMap.title, stopMap.shortDesc, stopMap.description);
        }
      }
    }

    for (const [locale, messages] of Object.entries(LOCALES)) {
      const missing = stopKeys.filter((key) => typeof resolveKey(messages, key) !== 'string');
      expect(missing, `itinerary stop keys missing in ${locale}`).toEqual([]);
    }
  });

  it('itinerary days resolve through the mapping table', () => {
    const dayKeys: string[] = [];

    for (const tier of experience.accommodationTiers) {
      const tierMap = EMERALD_I18N.tiers[tier.id as keyof typeof EMERALD_I18N.tiers];
      for (const day of tier.itinerary) {
        const dayKey = tierMap.days[String(day.day) as keyof typeof tierMap.days];
        expect(dayKey, `day "${day.day}" has no i18n mapping`).toBeDefined();
        dayKeys.push(dayKey);
      }
    }

    for (const [locale, messages] of Object.entries(LOCALES)) {
      const missing = dayKeys.filter((key) => typeof resolveKey(messages, key) !== 'string');
      expect(missing, `itinerary day keys missing in ${locale}`).toEqual([]);
    }
  });

  it('transport and add-on descriptions resolve too', () => {
    expectMapped(experience.transportOptions, TRANSPORT_DESCRIPTION_I18N, 'transportDescriptions');
    expectMapped(
      experience.addons.map((addon) => addon.id),
      ADDON_DESCRIPTION_I18N,
      'addonDescriptions',
    );
  });

  it('every key in every production mapping table resolves in en/es/fr', () => {
    // Exhaustive sweep: catches mapped codes the current payload does not use,
    // which is how fabricated keys slipped in previously.
    const mapped: string[] = [];
    const collect = (node: unknown): void => {
      if (typeof node === 'string') {
        mapped.push(node);
        return;
      }
      if (Array.isArray(node)) {
        node.forEach(collect);
        return;
      }
      if (node && typeof node === 'object') Object.values(node).forEach(collect);
    };

    collect(EXPERIENCE_I18N);
    collect(EXPERIENCES_LIST_I18N);
    collect(LANDING_I18N);

    expect(mapped.length).toBeGreaterThan(50);

    for (const [locale, messages] of Object.entries(LOCALES)) {
      const missing = mapped.filter((key) => typeof resolveKey(messages, key) !== 'string');
      expect(missing, `mapping keys missing in ${locale}`).toEqual([]);
    }
  });

  it('reviews', () => {
    const reviewIds = experience.reviews.map((review) => review.id);
    expectMapped(reviewIds, REVIEW_I18N, 'reviews');

    const countryCodes = experience.reviews
      .map((review) => review.countryCode)
      .filter((code): code is string => code !== undefined);
    expectMapped(countryCodes, COUNTRY_I18N, 'reviewCountries');

    expectMapped(
      experience.reviews.map((review) => review.source),
      REVIEW_SOURCE_I18N,
      'reviewSources',
    );
  });
});

// ── Identifier stability ─────────────────────────────────────────────────────

describeV2('v2 identifiers match the enums the booking flow persists', () => {
  it('transport codes are TransportMode values', () => {
    for (const code of experience.transportOptions) {
      expect(TransportModeSchema.safeParse(code).success, `transport "${code}"`).toBe(true);
    }
  });

  it('room mode values are RoomMode values', () => {
    for (const mode of experience.roomModes) {
      expect(RoomModeSchema.safeParse(mode.value).success, `room mode "${mode.value}"`).toBe(true);
    }
  });

  it('room type ids are RoomType values', () => {
    for (const mode of experience.roomModes) {
      expect(RoomTypeSchema.safeParse(mode.roomTypeId).success, mode.roomTypeId).toBe(true);
    }
  });

  it('room modes reference a declared tier', () => {
    const tierIds = experience.accommodationTiers.map((tier) => tier.id);
    for (const mode of experience.roomModes) {
      expect(tierIds).toContain(mode.tierId);
    }
  });

  it('exactly one tier is the default', () => {
    expect(experience.accommodationTiers.filter((tier) => tier.isDefault)).toHaveLength(1);
  });
});

// ── Machine-readable formats ─────────────────────────────────────────────────

describeV2('v2 formats are machine-readable', () => {
  it('times are 24-hour HH:mm', () => {
    const times = [
      experience.experience.schedule.startTime,
      ...experience.accommodationTiers.flatMap((tier) =>
        tier.itinerary.flatMap((day) => day.stops.map((stop) => stop.time)),
      ),
    ];

    for (const time of times) {
      expect(time, `time "${time}"`).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    }
  });

  it('availability dates are ISO 8601 UTC', () => {
    for (const date of experience.availableDates) {
      expect(date.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }
  });

  it('declares a single ISO 4217 currency for every amount', () => {
    expect(experience.experience.pricing.currency).toMatch(/^[A-Z]{3}$/);
  });

  it('media paths are app-relative', () => {
    const { hero, card, highlights } = experience.experience.media;
    for (const src of [hero, card, ...highlights]) {
      expect(src).toMatch(/^\/(?!\/)/);
    }
  });
});

// ── Referential integrity across the three artifacts ─────────────────────────

describeV2('v2 cross-artifact references', () => {
  const parsedExperience = parseV2(ExperienceFeedV2Schema, EXPERIENCE);
  const parsedList = parseV2(ExperiencesListFeedV2Schema, LIST);
  const parsedLanding = parseV2(LandingFeedV2Schema, LANDING);

  // Guarded rather than optional-chained: these fields are required by the
  // schema, so `?.` here would permanently hide a genuinely missing one. The
  // guard is only about `describe.skip` still executing this callback.
  const listEntry = V2_AVAILABLE
    ? parsedList.experiences.find((entry) => entry.id === parsedExperience.experience.id)
    : undefined;
  const landingEntry = V2_AVAILABLE
    ? parsedLanding.experiences.find((entry) => entry.id === parsedExperience.experience.id)
    : undefined;

  it('the experience appears in both projections', () => {
    expect(listEntry, 'experience missing from experiences-list.json').toBeDefined();
    expect(landingEntry, 'experience missing from landing.json').toBeDefined();
    expect(parsedLanding.flagshipExperienceId).toBe(parsedExperience.experience.id);
  });

  // ── Denormalization drift guards ───────────────────────────────────────────
  // list and landing intentionally duplicate a bounded subset of experience-owned
  // values so each page can render from a single fetch. The experience resource
  // is the canonical owner; these assertions are the only thing preventing a
  // partial CDN upload from advertising one price and charging another.

  it('slug is identical in all three artifacts', () => {
    expect(listEntry?.slug).toBe(parsedExperience.experience.slug);
    expect(landingEntry?.slug).toBe(parsedExperience.experience.slug);
  });

  it('status is identical in all three artifacts', () => {
    expect(listEntry?.status).toBe(parsedExperience.experience.status);
    expect(landingEntry?.status).toBe(parsedExperience.experience.status);
  });

  it('card media matches the experience-owned card image', () => {
    expect(listEntry?.card.image).toBe(parsedExperience.experience.media.card);
    expect(landingEntry?.media.card).toBe(parsedExperience.experience.media.card);
    expect(landingEntry?.media.hero).toBe(parsedExperience.experience.media.hero);
  });

  it('currency is identical in all three artifacts', () => {
    const canonical = parsedExperience.experience.pricing.currency;
    expect(listEntry?.card.fromPrice.currency).toBe(canonical);
    expect(landingEntry?.fromPrice.currency).toBe(canonical);
  });

  it('projected fromPrice equals the price the booking flow charges', () => {
    // Projection parity: fromPrice = basePerPerson + cheapest tier cost, and every
    // heritage room is priced at 0 with no services, so the floor is basePerPerson.
    const cheapestTierCost = Math.min(
      ...parsedExperience.accommodationTiers.map((tier) => {
        const cheapestRoomPerPerson = Math.min(
          ...tier.rooms.map((room) => room.pricePerNight / room.capacity),
        );
        const servicesPerPerson = tier.services.reduce(
          (sum, service) => sum + service.pricePerPersonPerNight,
          0,
        );
        return (cheapestRoomPerPerson + servicesPerPerson) * parsedExperience.experience.duration.nights;
      }),
    );
    const expected = parsedExperience.experience.pricing.basePerPerson + cheapestTierCost;

    expect(listEntry?.card.fromPrice.amount).toBe(expected);
    expect(landingEntry?.fromPrice.amount).toBe(expected);
  });

  it('duration is identical in all three artifacts', () => {
    expect(listEntry?.card.duration).toEqual(parsedExperience.experience.duration);
    expect(landingEntry?.duration).toEqual(parsedExperience.experience.duration);
  });

  it('location matches the experience-owned location', () => {
    expect(listEntry?.card.location.locality).toBe(parsedExperience.experience.location.locality);
    expect(listEntry?.card.location.countryCode).toBe(parsedExperience.experience.location.countryCode);
    expect(landingEntry?.location.locality).toBe(parsedExperience.experience.location.locality);
    expect(landingEntry?.location.region).toBe(parsedExperience.experience.location.region);
    expect(landingEntry?.location.countryCode).toBe(parsedExperience.experience.location.countryCode);
  });

  it('landing availability matches the experience departures exactly', () => {
    expect(landingEntry?.availableDates).toEqual(parsedExperience.availableDates);
  });

   it('landing reviews match the experience-owned review facts', () => {
     const byId = new Map(parsedExperience.reviews.map((review) => [review.id, review]));
     for (const review of parsedLanding.reviews) {
       expect(byId.get(review.id), `review "${review.id}" is not owned by the experience`).toEqual(review);
     }
   });

  /**
   * `depositPercent` is optional on the landing projection during rollout, so
   * this asserts drift rather than presence: if the payload carries the field it
   * must equal the owner. Absence is tolerated only until the published
   * `landing.json` carries it — then make it required in both places.
   */
  it('landing depositPercent, when projected, matches the experience pricing', () => {
    if (landingEntry?.depositPercent === undefined) return;
    expect(landingEntry.depositPercent).toBe(parsedExperience.experience.pricing.depositPercent);
  });

   it('landing review aggregate matches the experience reviews', () => {
    const ratings = parsedExperience.reviews.map((review) => review.rating);
    const mean = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    expect(parsedLanding.reviewSummary.count).toBe(parsedExperience.reviews.length);
    expect(parsedLanding.reviewSummary.rating).toBeCloseTo(mean, 5);
  });

  it('list badge and highlight codes are mapped', () => {
    for (const entry of parsedList.experiences) {
      if (entry.card.badgeCode) {
        expect(EXPERIENCES_LIST_I18N.badges[entry.card.badgeCode]).toBeDefined();
      }
      for (const code of entry.card.highlightCodes) {
        expect(EXPERIENCES_LIST_I18N.highlights[code]).toBeDefined();
      }
    }
  });
});

// ── Fail-closed behaviour ────────────────────────────────────────────────────

describeV2('v2 schemas fail closed', () => {
  /** Deep clone so a mutation in one case cannot leak into the next. */
  function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }

  const validList = clone(LIST) as Record<string, unknown>;

  it('rejects an unknown schemaVersion', () => {
    expect(ExperiencesListFeedV2Schema.safeParse({ ...validList, schemaVersion: 3 }).success).toBe(false);
    expect(ExperiencesListFeedV2Schema.safeParse({ ...validList, schemaVersion: undefined }).success).toBe(
      false,
    );
  });

  it('rejects unknown properties instead of ignoring them', () => {
    expect(
      ExperiencesListFeedV2Schema.safeParse({ ...validList, metadataNamespace: 'EmeraldMining' }).success,
    ).toBe(false);
  });

  it('rejects a lowercase currency rather than coercing it', () => {
    const payload = clone(LIST) as {
      experiences: { card: { fromPrice: { currency: string } } }[];
    };
    payload.experiences[0].card.fromPrice.currency = 'cop';
    expect(ExperiencesListFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects a lowercase country code rather than coercing it', () => {
    const payload = clone(LIST) as {
      experiences: { card: { location: { countryCode: string } } }[];
    };
    payload.experiences[0].card.location.countryCode = 'co';
    expect(ExperiencesListFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects an unknown domain code', () => {
    const payload = clone(LIST) as {
      experiences: { card: { highlightCodes: string[] } }[];
    };
    payload.experiences[0].card.highlightCodes = ['freeChampagne'];
    expect(ExperiencesListFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects a translation path where a code belongs', () => {
    const payload = clone(LIST) as {
      experiences: { card: { badgeCode: string } }[];
    };
    payload.experiences[0].card.badgeCode = 'ExperiencesList.featuredTag';
    expect(ExperiencesListFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects a landing flagship that is not in experiences', () => {
    const payload = clone(LANDING) as { experiences: unknown[] };
    payload.experiences = [];
    expect(LandingFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects a featured review id with no matching review', () => {
    const payload = clone(LANDING) as { featuredReviewIds: string[] };
    payload.featuredReviewIds = ['ghostReviewer'];
    expect(LandingFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects an absolute media URL that would bypass the CDN', () => {
    const payload = clone(LIST) as { experiences: { card: { image: string } }[] };
    payload.experiences[0].card.image = 'https://evil.example.com/x.webp';
    expect(ExperiencesListFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects a protocol-relative media URL that would bypass the CDN', () => {
    const payload = clone(LIST) as { experiences: { card: { image: string } }[] };
    payload.experiences[0].card.image = '//evil.example.com/x.webp';
    expect(ExperiencesListFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects a backslash-normalized media URL that would bypass the CDN', () => {
    const payload = clone(LIST) as { experiences: { card: { image: string } }[] };
    payload.experiences[0].card.image = '/\\evil.example.com/x.webp';
    expect(ExperiencesListFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  // The rollout media fields are optional, so their path guard needs its own
  // coverage: an unvalidated `media` block would reach `<img>`/`<source src>`.
  it('rejects an off-CDN host in the optional list hero video', () => {
    const payload = clone(LIST) as { media?: { video: { desktop: string; mobile: string } } };
    payload.media = { video: { desktop: '//evil.example.com/x.webm', mobile: '/videos/m.webm' } };
    expect(ExperiencesListFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects an off-CDN host in the optional experience hero video', () => {
    const payload = clone(EXPERIENCE) as {
      experience: { media: { video?: { desktop: string; mobile: string } } };
    };
    payload.experience.media.video = {
      desktop: 'https://evil.example.com/x.webm',
      mobile: '/videos/m.webm',
    };
    expect(ExperienceFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects an off-CDN host in the optional landing brand media', () => {
    const payload = clone(LANDING) as {
      media?: {
        hero: string;
        finalCta: string;
        categories: Record<'emeraldMining' | 'nature' | 'rural' | 'horseback', string>;
      };
    };
    payload.media = {
      hero: '//evil.example.com/x.webp',
      finalCta: '/images/brand/final-cta.webp',
      categories: {
        emeraldMining: '/images/brand/emerald.webp',
        nature: '/images/brand/nature.webp',
        rural: '/images/brand/rural.webp',
        horseback: '/images/brand/horseback.webp',
      },
    };
    expect(LandingFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects a room mode pointing at an undeclared tier', () => {
    const payload = clone(EXPERIENCE) as { roomModes: { tierId: string }[] };
    payload.roomModes[0].tierId = 'nonexistentTier';
    expect(ExperienceFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects more than one default tier', () => {
    const payload = clone(EXPERIENCE) as {
      accommodationTiers: { id: string; isDefault: boolean }[];
    };
    payload.accommodationTiers.push({ ...payload.accommodationTiers[0], id: 'second' });
    expect(ExperienceFeedV2Schema.safeParse(payload).success).toBe(false);
  });

  it('rejects a 12-hour display time', () => {
    const payload = clone(EXPERIENCE) as {
      experience: { schedule: { startTime: string } };
    };
    payload.experience.schedule.startTime = '11:00 AM';
    expect(ExperienceFeedV2Schema.safeParse(payload).success).toBe(false);
  });
});
