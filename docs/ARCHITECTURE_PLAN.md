# Andean Scapes — Architecture Plan

> Single source of truth for the planned backend architecture.
> The current frontend codebase in `andean-scapes-web` is unaffected until Phase 1 begins.

---

## Repository Split

Three separate repos, one concern each. Independent deploy cycles.

```
andean-scapes-web/        ← this repo  (Next.js, Cloudflare Pages, TypeScript)
andean-scapes-api/        ← new repo   (Cloudflare Workers, TypeScript → Go)
andean-scapes-payments/   ← new repo   (serverless Lambda, provider + language TBD)
```

---

## API Strategy: TypeScript now → Go later

### Phase 1–N: TypeScript on Cloudflare Workers

- **$0 cost** — 100k req/day free, no idle charges
- Native bindings: D1, KV, R2 — no glue code
- Same language as frontend — no context switching during early development
- Hono router — lightweight, Workers-native, idiomatic
- Drizzle ORM — TypeScript-first, SQLite-compatible, D1-native
- Start here. Ship here. Stay here until scale or learning justifies migration.

### Future migration: Go on a paid provider (TBD)

**Trigger criteria** (any one of these justifies migration):

- Workers free tier exceeded sustainably (>100k req/day consistently)
- Go production experience desired in a well-scoped, isolated service
- Workers paid tier ($5/mo) is justified but Go on another provider offers better value
- A specific Go library is needed with no TypeScript equivalent

**Provider candidates** (evaluated at migration time):

| Provider | Notes |
|---|---|
| Google Cloud Run | Scales to zero, generous free tier, first-class Go |
| Fly.io | Good DX, predictable pricing, no free tier anymore |
| Render | Simple deploys, free tier limited |
| Railway | $5/mo minimum |
| AWS Lambda | First-class Go runtime (`provided.al2023`), 1M req/mo free |

**Decision:** not locked. Evaluate at migration time based on cost, DX, and team familiarity.

### Why Go on Cloudflare Workers is rejected permanently

- Workers only supports Go via WebAssembly (Wasm) — not first-class
- Free tier bundle limit: 1MB compressed; Go Wasm binaries: 2–8MB
- D1/KV/R2 bindings are JS APIs — Go Wasm requires significant JS interop glue
- WASI on Workers is experimental, not production-ready

**Go will never run on Cloudflare Workers in this project. This decision is locked.**

### Migration-readiness rules (write TypeScript as if Go will replace it)

These rules apply to `andean-scapes-api` from day one. They ensure the TypeScript Worker is a thin translation layer, not a place to accumulate logic that becomes hard to port.

1. **Stateless handlers.** No in-memory state between requests. All state in D1/KV/R2.
2. **Pure business logic in isolated modules.** Handler files are thin (validate → call logic → respond). Logic lives in `src/lib/`, not in route files. Each `lib/` module maps 1:1 to a future Go `internal/` package.
3. **No framework lock-in in business logic.** `src/lib/` modules must not import Hono, Workers-specific APIs, or anything that doesn't have a Go equivalent. Only `src/routes/` touches Hono.
4. **Explicit dependency injection.** Pass D1/KV/R2 bindings into lib functions as arguments. Do not access `env` globally. Makes Go port straightforward — replace binding type with Go client.
5. **Typed request/response contracts.** Every route has a Zod schema for input and a TypeScript interface for output. These become Go structs directly.
6. **No runtime magic.** No decorators, no auto-wiring, no reflection-based patterns. Go doesn't support these; avoid them now.
7. **SQL in migration files only.** No raw SQL strings in application code. Drizzle schema is the source of truth. Go migration will use a Go SQL library against the same schema.
8. **Errors are values.** Use `Result`-style patterns (`{ data, error }`) rather than throwing exceptions for expected errors. Aligns with Go's `(value, error)` return convention.

### Target API repo structure

```
andean-scapes-api/
├── src/
│   ├── routes/          # Hono route handlers — thin (validate, call lib, respond)
│   │   ├── experiences.ts
│   │   ├── i18n.ts
│   │   ├── bookings.ts
│   │   └── admin/
│   ├── lib/             # Pure business logic — Go-portable, no framework imports
│   │   ├── experiences.ts
│   │   ├── translations.ts
│   │   └── bookings.ts
│   ├── db/              # Drizzle schema + D1 client
│   ├── cache.ts         # Cache API + KV helpers
│   └── index.ts         # Worker entry point (Hono router)
├── migrations/          # D1 SQL migration files
├── seeds/               # Seed scripts (from the current feed JSON)
├── wrangler.toml        # D1, KV, R2 bindings
└── package.json
```

When Go migration happens, `src/lib/` maps directly to `internal/` packages. `src/routes/` maps to `cmd/api/` handlers. The D1 HTTP API replaces Drizzle.

---

## Payments Service

### Decision status: deferred

Locked principles (provider + language TBD):

- Lives in `andean-scapes-payments/` — never inside the API or frontend
- Serverless model: stateless, short-lived, pay-per-invocation
- Handles: `POST /checkout` (create Stripe session) and `POST /webhook` (handle Stripe events)
- Communicates with `andean-scapes-api` via HTTPS for booking status updates

### Provider candidates

| Provider | Language options | Notes |
|---|---|---|
| AWS Lambda | Go, TypeScript, Node | 1M req/mo free, first-class Go runtime (`provided.al2023`) |
| Cloudflare Workers | TypeScript only (Go = Wasm, rejected) | Free, but Go ruled out |
| Vercel Functions | TypeScript, Node | Simple DX, generous free tier |
| Google Cloud Functions | Go, TypeScript | Scales to zero |

### Language candidates

| Language | Pros | Cons |
|---|---|---|
| TypeScript | Same as API, fast to ship | Less isolation from API codebase |
| Go | First-class on Lambda, small binaries, ~50ms cold start | Learning curve |

**Decision at Phase 2 entry.** Evaluate based on free-tier comparison and team readiness at that time.

---

## Target Stack (v1, $0 baseline)

| Layer | Service | Language | Cost |
|---|---|---|---|
| Frontend hosting | Cloudflare Pages | TypeScript / Next.js | $0 |
| API runtime | Cloudflare Workers | TypeScript (→ Go TBD) | $0 (100k req/day free) |
| Database | Cloudflare D1 (SQLite) | — | $0 (5GB + 25M reads/day) |
| Cache | Cloudflare Cache API + KV | — | $0 |
| Image storage | Cloudflare R2 | — | $0 (10GB, no egress) |
| Admin auth | Cloudflare Access | — | $0 (≤50 users) |
| Payments | Serverless Lambda (TBD) | TBD | $0 (free tier targeted) |
| Email | Resend | — | $0 (3k/mo free) |
| ORM (API v1) | Drizzle | TypeScript | $0 |

**Total: $0/mo at launch.** Workers paid tier ($5/mo) only if >10M req/mo.

---

## API Contract (v1)

```
GET    /api/v1/experiences                       # list, locale-agnostic, cached
GET    /api/v1/experiences/:slug                 # detail, locale-agnostic, cached
GET    /api/v1/i18n/:locale?namespaces=...       # translation bundle, cached
POST   /api/v1/bookings/checkout                 # creates Stripe session via payments service
POST   /api/v1/bookings/webhook                  # Stripe webhook (payments-forwarded)
GET|POST|PUT|DELETE /api/v1/admin/experiences/*  # CMS writes (Cloudflare Access gated)
PUT    /api/v1/admin/translations/:locale/:key   # translation edit
POST   /api/v1/admin/images/upload               # R2 signed URL
POST   /api/v1/admin/publish                     # cache invalidation trigger
```

Rules:
- `/experiences` and `/experiences/:slug` never accept `?locale=`
- Translations come exclusively from `/i18n/:locale`
- These two endpoint families are never merged

---

## Database Schema (D1 / SQLite)

```sql
experiences   (id, slug, i18n_namespace, data JSON, status, published_at, version)
translations  (key, locale, value, updated_at)   PRIMARY KEY (key, locale)
bookings      (id, experience_id, stripe_session_id, status, total_amount, currency)
admin_users   (id, email, role)
```

- `experiences.data`: structural data only (prices, images, dates, coordinates). Zero translatable text.
- Translations live exclusively in the `translations` table.

---

## Translation Architecture (Pattern 4, Strategy B)

- D1 `translations` table holds every key/locale/value pair
- `GET /api/v1/i18n/:locale` serves flat JSON (same shape as current `messages/*.json`)
- `src/i18n/request.ts` fetches bundle at runtime; static JSON kept as cold-start fallback
- Component code unchanged: `t('experiences.tiers.heritage.title')` still works
- **Feed/API payloads never name a key or namespace.** They carry stable domain
  codes; the frontend maps codes → keys in `src/i18n/mappings/*`. The `experiences`
  table therefore stores no translatable text and no key strings. Contract and
  migration order: `docs/V2_REMOTE_RESOURCES_MIGRATION.md`
- Locale fallback: missing `fr` key → falls back to `en` in Worker handler
- Marketing edits in admin UI → Worker writes D1 → `revalidateTag()` → live within seconds

---

## Phased Migration Plan

### Phase 0 — Pre-flight (1–2 days)
- Provision: Cloudflare Workers, D1, KV, R2, Cloudflare Access
- Provision: Stripe test mode, Resend account
- Bootstrap `andean-scapes-api` repo (Hono + Wrangler + Drizzle)
- Finalize payments provider + language decision

### Phase 1 — real HTTP data boundary ✅ DONE
- Services fetch all data over HTTP via `fetchRemoteJson` (`src/lib/remote-data.ts`)
- Feed served as static JSON from R2/CDN at `REMOTE_DATA_BASE_URL` (`https://cdn.andeanscapes.com/services`)
- Local mocks and registries **deleted**; services throw when the feed is unavailable
- Contract: `landing.json`, `experiences-list.json`, `experience-<kebab-id>.json`
- No dedicated catalog endpoint — routes/SEO derive from `experiences-list.json`
- Tests use local copies of the feed in the gitignored `fixtures/` (`npm run fixtures:fetch`)

**Phase 1.5 — remaining before Phase 2:**
- Replace the static feed with a Worker serving the same paths (frontend change = base URL only)
- `revalidateTag()` trigger so edits appear faster than the 1h `revalidate`
- **Decide whether the feed should be authenticated.** The payloads are not
  committed and are downloaded into gitignored `fixtures/`, but the CDN is
  unauthenticated and its public URL is documented in `wrangler.toml` and
  `scripts/lib/feed.ts` — so anyone can download them. Either accept that they
  are public marketing data, or put auth in front of the Worker in Phase 2 and
  give the scripts a token. Git hygiene alone is not confidentiality.
- ~~Migrate the wire format to the translation-free v2 contract~~ — **done.** v2 is
  published and every service reads it; see `docs/V2_REMOTE_RESOURCES_MIGRATION.md`.
  Seed the API from the v2 payloads, not the retired `*Key` ones.

### Known pre-existing defects

Surfaced while reviewing the v2 migration. All of these predate that work, so
they were deliberately left out of it rather than bundled into an unrelated
diff. Ordered by user impact.

1. **Locale is dropped on the featured-experience card.**
   `LandingFeaturedExperienceCard.tsx` imports `next/link` and passes an
   internal `experience.href`, so an `/es` or `/fr` visitor lands on the default
   locale. Fix: use `Link` from `@/i18n/navigation`, as the sibling
   `ExperienceList/ExperienceCard.tsx` already does.
2. **`Footer.tsx` has no `'use client'`** despite `useState`, `useEffect`,
   `useTranslations` and `window`. It only compiles because
   `app/[locale]/(public)/layout.tsx` is a Client Component — so converting that
   layout to a Server Component (which is otherwise the right call) breaks the
   build. Add the directive before touching the layout.
3. **A feed outage in `generateMetadata` is not caught.** `error.tsx` covers
   render throws, but metadata runs outside the render tree, so
   `experiences/page.tsx` and `[experienceName]/page.tsx` return an unhandled
   500 instead of the localized error page. There is also no `global-error.tsx`.
4. **Untranslated visible copy:** the `Partner` badge in `Footer.tsx`, the
   `<video>` fallback text in `ExperienceHero.tsx`, and `alt='logo'` in
   `Header.tsx` (which should carry `SITE_INFO.name`, or be `alt=""` since the
   wrapping link is already labelled).
5. **Hardcoded stock imagery in `experienceTranslators.ts`** —
   `/assets/images/hero/*.webp` defaults contradict "the feed is the only source
   of data". The v2 schema now pins `media.highlights` to exactly 3 so the
   value-proposition tiles can no longer reach these defaults, but the hero
   default remains reachable.
6. **`Stepper` primitive:** buttons lack `type="button"`, so both steppers submit
   any enclosing `<form>`; the visible `<label>` has no `htmlFor`/`id` pairing,
   so it is not the accessible name.
7. **Primary booking CTA does a full page reload.** `PrimaryCtaButton` always
   emits a raw `<a href>`, losing client-side navigation and prefetch on the
   most important conversion path.
8. **`getMessages()` ships the whole ~50 KB catalog** to the client from
   `[locale]/layout.tsx`. Narrowing to the namespaces actually consumed is a
   straightforward Lighthouse TBT win.

Lower priority, same review: ~15 i18n keys are written inline in services and
adapters instead of routing through `src/i18n/mappings/*`, and
`landingFeedAdapter.ts` builds FAQ keys by template
(`` `Landing.faqs.items.${id}.question` ``), which no static check can verify.

### Phase 2 — D1 + booking flow (2–3 weeks)
- DB-backed catalog (seed from the current feed JSON)
- Stripe checkout end-to-end via payments service
- Admin write API functional via Postman (no UI yet)
- List projection already returns `fromPrice` denormalized

### Phase 3 — Admin UI (2–3 weeks)
- `/admin/*` routes in Next.js, Cloudflare Access gated
- CRUD for experiences + translations
- R2 image upload

### Phase 4 — Production hardening (1 week)
- Backups, alerts, email automation
- Locale fallback, rate limiting, staging environment

**MVP cutline:** Phases 1 + 2. First paid booking possible before Phase 3.

---

## MVP Scope (First Live Sale)

- 2 experiences: Hacienda El Recuerdo + 1 emerald-mining experience
- 3 locales: en / es / fr (seeded from current JSON files)
- Public list + detail pages: repoint `REMOTE_DATA_BASE_URL` at the Worker API
- Booking form: wire to `POST /api/v1/bookings/checkout`
- Stripe test → live checkout flow

---

## Schema Sharing Between Repos

- `andean-scapes-web`: Zod schemas stay in `src/lib/schemas/` — validated on API responses
- `andean-scapes-api`: owns its own Zod schemas for request/response — source of API contract
- `andean-scapes-payments`: own structs (Go or TS) mirror the booking schema — synced manually
- No shared package for v1. If contracts diverge significantly → publish `@andean/contracts` to npm.

---

## Current State → Next Steps Migration Map

Phase 1 is done — the frontend already reads a real HTTP feed. Remaining:

| Current artifact | Next action | Phase 2 action |
|---|---|---|
| Static feed on R2 (`/services/*.json`) | Serve the same paths from the Worker | Back with D1 queries |
| `fetchRemoteJson` | No change — swap `REMOTE_DATA_BASE_URL` | No change |
| Feed payloads | Seed `andean-scapes-api/src/data/` from them | Replace with D1 rows |
| `fromPrice` list projection | Keep | API generates the projection |
| Zod schemas | Stay in `src/lib/schemas/`; API repo owns its own | No change |
| `src/i18n/messages/*.json` | Copy to API repo as seed source | Serve via `/api/v1/i18n/:locale`, keep static as fallback |
| `fixtures/*.json` (gitignored) | Re-download with `npm run fixtures:fetch` | Add integration tests for Worker |
| Manual feed upload | Add `verify:feed` schema gate | Replaced by admin UI + `revalidateTag()` |

The frontend service layer does not change again: only the base URL moves.

---

## Decisions Locked — Do Not Re-Propose

| Decision | Rejected alternatives |
|---|---|
| 3 separate repos | Single repo, monorepo, Turborepo, Nx |
| Cloudflare-native stack for v1 | Vercel, AWS-primary, mixed clouds |
| TypeScript for API v1 (Workers) | Go-via-Wasm on Workers |
| Future Go API on paid provider (TBD) | Go on Workers (Wasm, rejected permanently) |
| Custom Next.js admin UI | Payload, Sanity, Contentful, Strapi |
| Cloudflare D1 for database | Postgres, MongoDB for v1 |
| Drizzle ORM | Prisma, raw SQL, TypeORM |
| Pattern 4 + Strategy B (runtime fetch) | Patterns 1/2/3, Strategy A (build-time) |
| Payments isolated in dedicated repo | Stripe logic in API or frontend |
| Cloudflare Access for admin auth | Custom JWT, NextAuth for v1 |

---

## Open Decisions (evaluate at decision time)

- **Payments provider** — AWS Lambda, Cloudflare Workers (TS only), Vercel Functions, Google Cloud Functions
- **Payments language** — TypeScript (fast) or Go (isolated, ideal for Lambda)
- **Future Go API provider** — Cloud Run, Fly.io, Render, Railway, Lambda
- API domain: `api.andeanscapes.com` vs `*.workers.dev` for MVP
- Email provider: Resend vs SES
- Currency strategy: USD-only vs multi-currency from day one
- Tax/VAT handling at Stripe checkout
- Booking cancellation/refund flow — MVP scope or post-launch
