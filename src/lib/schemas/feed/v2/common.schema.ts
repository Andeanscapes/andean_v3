import { z } from 'zod';
import { CurrencyCodeSchema } from '../../currency.schema';

/**
 * V2 feed primitives shared by the list, landing and experience contracts.
 *
 * Booking-critical enums are NOT redefined here: `RoomModeSchema`,
 * `TransportModeSchema` and `RoomTypeSchema` key localStorage and URL state
 * (see `src/utils/reservationStorage.ts`), so `experience.schema.ts` stays their
 * single definition and this module re-exports it. Two copies of those enums
 * would eventually diverge and break persisted reservations.
 */
export {
  RoomModeSchema,
  RoomTypeSchema,
  TransportModeSchema,
} from '../../experience.schema';

// Re-exported so the v2 contract keeps a single import surface. The definition
// lives in `currency.schema.ts` because the UI schemas need it too and cannot
// import from here — this module re-exports from `experience.schema.ts`, so that
// dependency would be circular.
export { CurrencyCodeSchema };
export type { RoomMode, RoomType, TransportMode } from '../../experience.schema';

// ── Identifier formats ───────────────────────────────────────────────────────
// Regex, not `.toUpperCase()`: that helper coerces (`"cop"` -> `"COP"`, parse
// succeeds), which silently normalizes a malformed feed. The contract must fail
// closed instead.
const COUNTRY_CODE = /^[A-Z]{2}$/;
/** 24-hour `HH:mm`. Display formatting is locale-owned. */
const TIME_24H = /^([01]\d|2[0-3]):[0-5]\d$/;

export const CountryCodeSchema = z.string().regex(COUNTRY_CODE, 'Expected an uppercase ISO-3166-1 alpha-2 code');
export const Time24hSchema = z.string().regex(TIME_24H, 'Expected 24-hour HH:mm');
/**
 * Feed media are app-relative paths; absolute and protocol-relative URLs are rejected.
 *
 * `..` segments are rejected too. These paths are not only resolved to URLs —
 * the `media:*` scripts join them onto `r2-cache/` to read and write files, so a
 * traversing key in a tampered payload would escape that directory. A dot
 * *inside* a segment (`hero..webp`) is still allowed; only a whole `..` segment
 * is not.
 */
export const MediaPathSchema = z
  .string()
  .regex(
    // The `..` lookahead sits before `\/` is consumed, so it can still see the
    // leading slash — anchored after it, `/../x` would read as a first segment
    // with no separator in front of it and slip through.
    /^(?!.*(?:^|\/)\.\.(?:\/|$))\/(?!\/)[^\s\\]*$/,
    'Expected a safe app-relative path with a single leading "/" and no ".." segment',
  );

// ── Domain codes ─────────────────────────────────────────────────────────────

/**
 * URL slug. Constrained because it is interpolated into hrefs by
 * `experiencePath()` — a slug with slashes or spaces would silently produce a
 * broken route rather than failing validation.
 */
export const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase kebab-case');

/**
 * `emeraldMining` is transitional, for exactly one release. Production still
 * serves the pre-split feed, and this code must read it: without the alias there
 * is no safe order — the deployed code rejects the Chivor feed, and this code
 * would reject the live one. Remove it, and its aliases in
 * `src/i18n/mappings/experience.ts`, once the Chivor feed is republished.
 */
export const ExperienceIdSchema = z.enum(['chivorEmeraldCore', 'chivorEmeraldPrime', 'emeraldMining']);
export type ExperienceId = z.infer<typeof ExperienceIdSchema>;

export const PublicationStatusSchema = z.enum(['published', 'draft', 'archived']);
export type PublicationStatus = z.infer<typeof PublicationStatusSchema>;

export const AddonCodeSchema = z.enum(['apiary_cattle', 'horseback_riding']);
export type AddonCode = z.infer<typeof AddonCodeSchema>;

export const DifficultyCodeSchema = z.enum(['moderate']);
export type DifficultyCode = z.infer<typeof DifficultyCodeSchema>;

export const ItineraryCategoryCodeSchema = z.enum([
  'mining',
  'workshop',
  'accommodation',
  'dining',
  'education',
  'farewell',
]);
export type ItineraryCategoryCode = z.infer<typeof ItineraryCategoryCodeSchema>;

export const BadgeCodeSchema = z.enum(['featured', 'coming-soon']);
export type BadgeCode = z.infer<typeof BadgeCodeSchema>;

export const HighlightCodeSchema = z.enum([
  'transportIncluded',
  'smallGroups',
  'localGuides',
  'twoMines',
  'horsebackRiding',
  'allMeals',
  'haciendaStay',
]);
export type HighlightCode = z.infer<typeof HighlightCodeSchema>;

/**
 * Highlights one experience may publish. Six, because a higher tier must list
 * everything the lower tier includes *plus* its own extras — Prime carries
 * Core's four (guides, small groups, meals, hacienda stay) alongside its second
 * mine and horseback riding. A tier that showed fewer shared items read as
 * offering less.
 */
export const FEED_MAX_HIGHLIGHTS = 6;

/**
 * Package-level selling points, rendered as a highlighted badge rather than a
 * neutral chip. Presentation (colour) is frontend-owned; the feed only states
 * which apply.
 *
 * Deliberately positive only. A red "transport not included" badge sat beside
 * "all-inclusive" and read as a contradiction at the moment of discovery;
 * exclusions are stated where the guest decides — the "not included" list and
 * the arrival selector — not on the card.
 */
export const PackageTagCodeSchema = z.enum(['allInclusive']);
export type PackageTagCode = z.infer<typeof PackageTagCodeSchema>;

/** Optional during rollout: the published payloads do not carry it yet. */
export const PackageTagsSchema = z
  .array(PackageTagCodeSchema)
  .max(PackageTagCodeSchema.options.length)
  .refine((codes) => new Set(codes).size === codes.length, { message: 'Duplicate package tag' })
  .optional();

export const IncludedCodeSchema = z.enum([
  'guide',
  'equipment',
  'meals',
  'insurance',
  'mineAccess',
  'workshop',
  'smallGroups',
  'healthInsurance',
]);
export type IncludedCode = z.infer<typeof IncludedCodeSchema>;

export const NotIncludedCodeSchema = z.enum(['airportTransfer', 'drinks', 'souvenirs', 'transportToChivor']);
export type NotIncludedCode = z.infer<typeof NotIncludedCodeSchema>;

export const ReviewSourceCodeSchema = z.enum(['airbnb']);
export type ReviewSourceCode = z.infer<typeof ReviewSourceCodeSchema>;

export const HostIdSchema = z.enum(['heinnerAlexandra']);
export type HostId = z.infer<typeof HostIdSchema>;

// ── Shared value objects ─────────────────────────────────────────────────────

export const PricingSchema = z
  .object({
    amount: z.number().int().nonnegative(),
    currency: CurrencyCodeSchema,
  })
  .strict();
export type Pricing = z.infer<typeof PricingSchema>;

export const DurationSchema = z
  .object({
    days: z.number().int().positive(),
    nights: z.number().int().nonnegative(),
  })
  .strict();
export type Duration = z.infer<typeof DurationSchema>;

/**
 * Card-sized location: the list renders "Starts in {locality}" only, so `region`
 * is intentionally absent rather than optional — an optional field that some
 * consumers require is how the previous revision let landing type-check against
 * a value that could be missing.
 */
export const CardLocationSchema = z
  .object({
    locality: z.string().min(1),
    countryCode: CountryCodeSchema,
  })
  .strict();
export type CardLocation = z.infer<typeof CardLocationSchema>;

/** Full location: landing and detail render the region, so it is required. */
export const FullLocationSchema = z
  .object({
    locality: z.string().min(1),
    region: z.string().min(1),
    countryCode: CountryCodeSchema,
  })
  .strict();
export type FullLocation = z.infer<typeof FullLocationSchema>;

export const AvailableDateSchema = z
  .object({
    id: z.string().min(1),
    startDate: z.string().datetime(),
    spots: z.number().int().nonnegative(),
    isAvailable: z.boolean(),
  })
  .strict();
export type AvailableDate = z.infer<typeof AvailableDateSchema>;

export const ReviewSchema = z
  .object({
    id: z.string().min(1),
    authorName: z.string().min(1),
    countryCode: CountryCodeSchema.optional(),
    rating: z.number().int().min(1).max(5),
    verified: z.boolean(),
    source: ReviewSourceCodeSchema,
  })
  .strict();
export type Review = z.infer<typeof ReviewSchema>;

/** Reject duplicate ids in a collection; drift here silently breaks lookups. */
export function uniqueBy<T>(items: readonly T[], select: (item: T) => string): boolean {
  const seen = new Set<string>();
  for (const item of items) {
    const key = select(item);
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}
