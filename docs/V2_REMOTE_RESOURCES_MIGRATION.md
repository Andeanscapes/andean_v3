# Remote Feed V2 — Translation-Free Contract

> **Status: published and live. Every service reads v2.**
> `<base>/{landing,experiences-list,experience-*}.json` all serve `schemaVersion: 2`.
> `landing`, `experiences-list`, `experiences-catalog` and `book` services consume
> it through the adapters in `src/utils/{landing,experience}FeedAdapter.ts`;
> v1 schemas and translators are gone.
>
> `fixtures/*.json` (gitignored) are local copies downloaded by
> `npm run fixtures:fetch`, validated by `src/lib/schemas/feed/v2/*` and guarded
> by `src/test/feed-v2/contract.test.ts`. See [Remaining work](#remaining-work).

## Why

The v1 feed decides which translation key the UI renders (`titleKey`,
`descriptionKey`, `metadataNamespace`, …). That couples the CDN to the internal
layout of `src/i18n/messages/*.json`: renaming a locale key is a breaking feed
change, and a typo in a feed string renders a raw key in production.

V2 removes that coupling. The feed carries **stable domain codes**; the frontend
owns every translation lookup.

```
v1:  feed → "experiences.emeraldMining.transport.bus" → t(value)
v2:  feed → "bus" → t(EXPERIENCE_I18N.emeraldMining.transport.bus.label)
```

## Architecture constraint: one resource per page

This is the constraint that shapes everything below. Each page fetches **exactly
one** feed resource:

| Page | Fetches | May not fetch |
|---|---|---|
| `/` (landing) | `landing.json` | anything else |
| `/experiences` + catalog/sitemap | `experiences-list.json` | anything else |
| detail + booking | `experience-<kebab-id>.json` | anything else |

An earlier revision of this document proposed an IDs-only list plus per-experience
fan-out. **That was rejected**: it turns one list render into N+1 CDN reads and
makes route generation depend on every experience file resolving.

### Consequence: bounded read-model projections

Because a page cannot fan out, `experiences-list.json` and `landing.json` each
carry a **bounded copy** of the experience-owned values they render. This is
deliberate denormalization, not an accident.

- The **experience resource is the canonical owner** of every mutable value.
- Projections carry only what the page renders.
- **Booking inventory is never projected** — rooms, capacity, transport pricing,
  add-ons, itinerary live only in the experience resource.
- **Exception, in rollout:** `landing.json` may project `depositPercent`, because
  the landing sticky bar renders it and the page cannot fan out to fetch the
  experience resource. It is `.optional()` in the schema until the published
  payload carries it; see `LandingExperienceV2Schema`.
- Every projected field is equality-asserted against the owner in
  `contract.test.ts`. That test is the only thing standing between a partial CDN
  upload and a card advertising one price while checkout charges another.

## Artifacts

| File | Publishes to | Owns / projects |
|---|---|---|
| `fixtures/experience-emerald-mining.json` | `<base>/experience-emerald-mining.json` | **Owner.** Pricing, deposit, capacity, inventory, transport, add-ons, availability, itinerary, host, reviews |
| `fixtures/experiences-list.json` | `<base>/experiences-list.json` | Catalog order + card projection (slug, status, image, fromPrice, duration, locality, badge/highlight codes) |
| `fixtures/landing.json` | `<base>/landing.json` | Flagship/featured selection + landing projection (media, fromPrice, duration, full location, availability), review facts, aggregate, brand metrics |

### What each projection deliberately excludes

`experiences-list.json`: availability, capacity, rooms, transport pricing,
add-ons, itinerary, host, reviews, deposit.

`landing.json`: rooms, capacity, transport pricing, add-ons, itinerary.
It *does* carry availability, because the hero booking card renders next-departure
state, and *may* carry `depositPercent` (see the rollout exception above).

## Contract rules

1. `schemaVersion: 2` on every artifact; any other value fails closed.
2. All objects `.strict()` — unknown properties are rejected, not ignored.
3. No property name ending in `Key` / `Keys`.
4. No string matching a frontend namespace (`Landing.`, `experiences.`, …).
5. The feed never names a translation namespace. Frontend SEO/i18n namespaces are
   keyed by `experience.id` in `src/i18n/mappings/*`.
6. One currency declaration per resource; all amounts inherit it. Validated by
   regex (`/^[A-Z]{3}$/`), **not** `.toUpperCase()` — that helper coerces
   `"cop"` into a successful parse and silently normalizes a broken feed.
7. Times are 24-hour `HH:mm` plus an IANA `timeZone`. Dates are ISO 8601 UTC.
8. Media are app-relative paths (`/assets/...`); an absolute URL is rejected so a
   compromised feed cannot point the UI at third-party hosts.
9. Identifier **values** persisted by the booking flow are frozen:
   `car_no_4x4`, `have_4x4`, `bus`, `roundtrip_transfer`, `standard_single`,
   `standard_couple`, `family_single`, `family_couple`, `family_3`,
   `apiary_cattle`, `horseback_riding`, tier `heritage`, rooms `h_std` / `h_fam`,
   and every existing `availableDates[].id`. They key `localStorage` and URL
   state (`src/utils/reservationStorage.ts`, `src/utils/helpers.ts`).
   Property *names* are camelCase; identifier *values* keep their existing form.
10. Booking enums are **not redefined** in v2. `src/lib/schemas/feed/v2/common.schema.ts`
    re-exports `RoomModeSchema` / `RoomTypeSchema` / `TransportModeSchema` from
    `experience.schema.ts` so there is one definition of the values that key
    persisted reservations.

## Ownership

### Feed owns
IDs and slugs · publication status · amounts and currency · deposit percent ·
duration · capacity · availability and spots · room inventory, occupancy,
multipliers, units · transfer pricing and vehicle capacity · add-on pricing and
confirmation policy · coordinates and location parts · operational times ·
`isDefault` / `isAvailable` / `requiresTeamConfirmation` · relationships ·
media paths · review facts (author, rating, verified, source, country code).

### Frontend owns
All copy in `src/i18n/messages/*.json` · translation key selection · section
headings, CTA labels, badges, trust lines, microcopy · icons (including itinerary
category icons) · routes and hrefs · section order and layout · locale formatting
of currency, dates, times, percentages, counts · map zoom · WhatsApp message.

### Environment owns
`NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` (digits only, E.164 without `+`). The safe
default is documented in `.env.example`; local env files are gitignored. The
CTAs render in Client Components, so the value is inlined at build time; a
runtime Worker var would be dead configuration that disagrees with the shipped
bundle.

`src/constant/SiteConfig.ts` is the single reader and derives the display form
from the same digits, so the dialable and rendered numbers cannot drift. There is
no hardcoded fallback: a default is what previously let the committed config and
the rendered number disagree silently.

The destination is configuration; the message is localized copy, so the URL is
composed at render time via `whatsappUrl(t(...))`. The v1 feed shipped one
Spanish-only encoded URL for all three locales — that is the bug this removes.

## Removed from the feed

- **Dead sections:** `valueProps`, `inclusions`, `tiers`, `heroBrand.search` —
  translated by the v1 service but never mounted by `LandingPage`.
- **Fixed UI:** hero copy, categories, why-us, how-it-works, traveler segments,
  safety, location bullets, FAQs, final CTA, trust panel, all `*Key` fields.
- **Presentation:** Lucide icon names, `ctaTargetId`, `mapZoom`, slot names.
- **Derived:** `nextAvailability` (recomputed from availability).
- **Display strings:** `"11:00 AM"` → `"11:00"` + `timeZone`;
  `"2 days / 1 night"` → `duration { days, nights }`; `"98%"` → `98`;
  `"500+"` → `500`; `"Chivor, Boyacá, Colombia"` → structured `location`.
- **Lossless simplifications:** stop `imageUrl` (always equalled `images[0]`);
  `transportOptions[]` objects reduced to code strings.

## Implemented so far

- `src/lib/schemas/feed/v2/common.schema.ts` — primitives, domain codes,
  re-exported booking enums, `CardLocationSchema` vs `FullLocationSchema`.
- `src/lib/schemas/feed/v2/experience.schema.ts` — booking contract with
  cross-field refinements (one default tier, room-mode→tier/room-type integrity,
  unique ids, spots ≤ capacity).
- `src/lib/schemas/feed/v2/experiences-list.schema.ts` — card projection, unique
  id/slug.
- `src/lib/schemas/feed/v2/landing.schema.ts` — flagship/featured/review
  referential integrity, aggregate sanity.
- `src/i18n/mappings/{experience,experiences-list,landing}.ts` — typed
  `as const satisfies` tables. Itinerary and tier copy point at
  `experiences.tiers.<tierId>.*`, the same namespace v1 rendered, so output is
  unchanged.
- `src/test/feed-v2/contract.test.ts` — 60 assertions over the **downloaded**
  payloads: schema parse, no `*Key`, no translation paths, locale coverage in
  en/es/fr, exhaustive mapping sweep, identifier parity, cross-artifact
  projection drift, fail-closed cases.

V2 schema names keep the `V2` suffix (`LandingFeedV2Schema`). The v2 barrel is
intentionally **not** re-exported from `src/lib/schemas/index.ts`.

`src/lib/schemas/landing.schema.ts` and `experience.schema.ts` still define the
**UI-facing** shapes (`LandingContent`, `ExperienceData`) that components
consume. Those are not feed schemas — the adapters produce them — which is why
~50 components needed no change.

## Remaining work

The migration is complete and the defects it surfaced are fixed, except where a
fix depends on a feed change.

**Blocked on a CDN upload**

1. **`landing.json` does not project `depositPercent`.**
   `LandingExperienceV2Schema` marks it optional and the adapter passes
   `undefined` through, so the mobile sticky bar suppresses the deposit note
   rather than rendering "0%". Upload the field, then tighten the schema to
   required — `contract.test.ts` already equality-asserts it against the
   experience resource whenever it is present.
2. **The deposit percentage is still hardcoded in 7 landing locale strings**
   (for example `Landing.finalCta.badges.deposit` = "15% deposit to confirm",
   `Landing.brand.howItWorks.steps.pay.title` = "Reserve with 15%"), in all three
   locales. They cannot be parameterized until (1) lands, because landing has no
   deposit value to interpolate. The experience-side equivalent
   (`experiences.common.ctaPrimary`) is already parameterized and reads
   `config.depositPercent`.

**Fixed**

- `roundtrip_transfer` is bookable — `reservationSchema` now reuses
  `TransportModeSchema` instead of re-listing three modes by hand.
- Party size is validated against `experience.capacity` via
  `buildReservationSchema({ minPeople, maxPeople })`, not a hardcoded 10.
- `pricing.currency` is threaded through every price surface, including the
  JSON-LD offer; `formatMoney(value, locale, currency)` replaced the inline
  `Intl.NumberFormat` copies.
- Remaining hardcoded UI copy localized: featured-card availability (now an ICU
  plural), the "Live network" badge, the `Stepper` button labels (passed as props
  so the primitive stays i18n-free), and the map iframe title.
- `LandingLocation` uses `@/i18n/navigation`'s `Link`, so its CTA keeps the locale
  prefix.

**Known, out of scope**

- `src/utils/validationSchemas.ts` still emits Spanish-only validation messages
  regardless of locale. Fixing it means threading `t` into a module that is
  currently pure, so it is deliberately left for its own change.

## Publishing

Already done — v2 is live. Kept for reference and for the next contract change.

> **The contract gate now runs in CI.** `scripts/fetch-fixtures.ts` downloads the
> published payloads into `fixtures/` and validates them with the v2 schemas, and
> `src/test/feed-v2/contract.test.ts` reads those same files. Earlier revisions
> validated a separate hand-authored `fixtures/v2/` copy, which meant the gate
> could pass against a payload nobody publishes. One tree, one source of truth.
>
> `fixtures/` is regenerable — `npm run fixtures:fetch` — so no backup is needed.

Ordering for any future contract change:

1. Upload `experience-*.json` first — the owner must exist before projections
   reference it.
2. Upload `experiences-list.json` — activates route discovery.
3. Upload `landing.json`.
4. Purge the CDN and Next/OpenNext tag caches. **Also clear `.next/cache` before
   building**: the persistent fetch cache holds responses for the
   `revalidate: 3600` window, and a warm cache will build the *old* contract
   against new code. This bit during this migration — the build failed on a v1
   payload while `verify:feed` read v2 from the same URL seconds earlier.
5. Redeploy if any slug changed — `sitemap.xml` and `generateStaticParams` are
   build-time.
6. Verify `/`, `/es`, `/fr`, list, detail, booking, a full price calculation, and
   reservation hydration from existing `localStorage`.

```bash
npm run verify:feed    # validates the live payloads against the v2 schemas
npm run fixtures:fetch # refresh local copies
npm test               # contract gate + service suites
```

Rollback: re-upload the previous payloads and purge. Identifier values are frozen
(`emeraldMining`, `heritage`, `h_std`/`h_fam`, date ids, room modes, transport
modes), so in-flight reservations in `localStorage` survive a roll back and forth.

## Adding an experience later

1. Publish `experience-<kebab-id>.json` (v2) with a unique `id` and `slug`.
2. Add its projection entry to `experiences-list.json` (and `landing.json` if it
   should be featured).
3. Add locale copy for its codes to **all three** message files.
4. Add its entries to `src/i18n/mappings/*` — `ExperienceIdSchema` and the
   mapping tables are exhaustive, so a missing entry fails typecheck or the
   contract test. This is intentional: a new experience is a deploy.
5. Redeploy so route generation and the sitemap pick up the slug.

## Verification

```bash
npm run typecheck
npm run lint
npx vitest run src/test/feed-v2/contract.test.ts
npm test
npm run build
```
