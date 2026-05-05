# Andean Scapes — AI Agent Instructions

## Purpose
This is the canonical AI instruction file for all AI coding agents working in this repository.
Supported agents include:
- GitHub Copilot (Chat + code generation)
- OpenCode
- Cline
- Cursor / Windsurf
- Any other AI-assisted coding tool

This file mirrors `.github/copilot-instructions.md` (the authoritative source). When either file changes, update the other to keep both in sync.

If guidance elsewhere conflicts with this file, this file wins.

---

## Tech Baseline
- Next.js 16 App Router
- React 19
- TypeScript with `strict: true`
- Tailwind CSS v4
- daisyUI v5
- `next-intl` for i18n
- `use-context-selector` for shared client state
- Zod-based validation helpers in `src/lib/validation.ts`
- Landing page architecture with dual-layer schemas (raw mock → translated content)
- Cloudflare Pages deployment through `@opennextjs/cloudflare`
- Vitest + Testing Library for tests
- Storybook 8 for UI development

---

## Non-Negotiable Rules
1. Security first. Treat all external input as untrusted.
2. Minimal scope. Implement only what was requested.
3. No `any`. Use explicit types, `unknown`, discriminated unions, and type guards.
4. No secrets in code, tests, stories, docs, or examples.
5. Preserve the current architecture unless refactor is explicitly requested.
6. Keep user-facing copy synchronized across `en`, `es`, and `fr`.
7. New UI must follow the existing wrapper-first design system under `src/components/ui`.

---

## Project Structure Rules

### App Router and Locale Topology
- Locale root layout lives in `src/app/[locale]/layout.tsx`.
- Public-shell concerns live in `src/app/[locale]/(public)/layout.tsx`.
- API routes live under `src/app/api/**/route.ts`.
- Locale routing is defined in `src/i18n/routing.ts` with `localePrefix: 'as-needed'`.
- Request-level i18n resolution is handled in `src/i18n/request.ts`.

AI expectations:
- Do not bypass the locale segment architecture.
- Do not introduce a second i18n mechanism outside `next-intl`.
- Keep the default locale unprefixed and aligned with the existing routing config.
- Prefer `@/i18n/navigation` helpers for localized links and pathname access.

### Folder Ownership
- Reusable primitives belong in `src/components/ui/*`.
- Feature components belong in their existing feature folders under `src/components/*`.
- Shared business logic belongs in `src/lib/services/*`, `src/lib/schemas/*`, or `src/utils/*` depending on responsibility.
- Context providers belong in `src/contexts/*`.
- Selector hooks for contexts belong in `src/hooks/*`.
- Global styling and theme tokens belong in `src/styles/globals.css`.

Do not place feature-specific state, services, or presentation helpers into global locations without a clear architectural reason.

---

## Provider Topology
The global provider stack is intentional and must remain ordered as follows:

1. `ThemeProvider`
2. `NextIntlClientProvider`
3. `LanguageProvider`
4. `WebVitalsReporter`
5. Route content

This is implemented in `src/app/providers.tsx` and mounted from `src/app/[locale]/layout.tsx`.

Rules:
- Global providers belong only in `src/app/providers.tsx`.
- Public-layout state belongs in `src/app/[locale]/(public)/layout.tsx` or its scoped provider.
- Feature-specific providers belong at the feature entry point, not globally.
- `LayoutContext` (header scroll state) is scoped to the public layout.
- `ExperienceDetailProvider` wraps `ExperienceReservationProvider` — preserves context composition pattern.
- Do not move client-only concerns into the server layout.

Why this matters:
- Prevents hydration drift.
- Keeps server layouts deterministic.
- Avoids unnecessary app-wide re-renders.

---

## Server and Client Boundaries
- Server Components fetch and prepare data.
- Client Components own interactivity, browser APIs, and ephemeral UI state.
- Do not call browser APIs from Server Components.
- Do not move SSR data preparation into client components unless required.

Reference patterns already in use:
- Experience detail pages resolve data server-side, then pass translated data into client reservation components.
- `src/lib/services/experiences-catalog.service.ts` resolves catalog and route data.
- `src/lib/services/experiences-list.service.ts` builds translated list-page content.
- `src/lib/services/book.service.ts` is the booking-data service entry point.
- `src/lib/services/landing.service.ts` fetches and translates all landing sections.

---

## Design System and UI Composition

### Wrapper-First Rule
New components must compose the existing UI wrappers before introducing raw markup or third-party primitives.

Current reusable primitives live under `src/components/ui`:
- `Accordion`
- `Badge`
- `Button`
- `PrimaryCtaButton`
- `Card`
- `GlassCard`
- `FloatingWhatsApp`
- `GalleryModal`
- `Input`
- `Modal`
- `RadioGroup`
- `SectionContainer`
- `SegmentedControl`
- `Select`
- `Skeleton`
- `Stepper`

Rules:
- If an existing wrapper fits, use it.
- If a wrapper is missing for a repeated pattern, add or extend the wrapper before scattering one-off implementations.
- Keep new wrappers typed, small, and composable.
- Keep reusable primitives colocated with tests and stories when the repo already does so for that primitive family.

### Styling Rules
This project uses Tailwind v4 plus daisyUI semantic classes, with some legacy compatibility utilities still present.

Use these conventions:
- Prefer semantic daisyUI tokens such as `bg-primary`, `bg-secondary`, `bg-base-100`, `text-base-content`, `border-base-200`.
- Reuse existing focus-visible ring patterns for interactive controls.
- Reuse `SectionContainer` for outer width and section framing instead of ad hoc container markup.
- Reuse the existing spacing and typography scales from `src/styles/globals.css`.
- Preserve the current Inter-based typography setup. Do not introduce new font systems without an explicit design request.
- Follow the existing card language: soft borders, layered surfaces, rounded corners, subtle elevation, and restrained hover states.
- Maintain accessible target sizes for buttons, badges, and CTA links.

Avoid:
- Hardcoding a new visual language that ignores the current semantic token system.
- Mixing unrelated color systems when an existing semantic token or project token already covers the use case.
- Replacing existing wrappers with raw daisyUI or raw HTML unless there is a clear need.

### Link and CTA Rules
- Prefer `Link` from `@/i18n/navigation` for localized navigation inside the app.
- For button-like actions, prefer `Button` or `PrimaryCtaButton` when the element semantics fit.
- If an existing screen uses a direct daisyUI `btn` class on a link, preserve that established pattern unless the change is specifically about standardizing the primitive.

### Accessibility Rules
- Preserve visible focus states.
- Provide meaningful labels, helper text, and error text for form controls.
- Keep alt text, `aria-hidden`, and dialog semantics aligned with existing components.
- Do not create clickable `div` patterns unless the current primitive intentionally supports them and keyboard behavior is already handled.

---

## Responsive Layout and Media Patterns

### Layout
- Use the existing responsive breakpoints and spacing scale from `src/styles/globals.css`.
- Keep section widths aligned with `SectionContainer` and the current max-width strategy.
- Respect the existing public layout behavior for sticky header state and route-aware spacing.

### Images
- Experience cards must keep using `ExperienceCardImage` in `src/components/ExperienceList/ExperienceCardImage.tsx`.
- Use `<picture>`-based responsive image behavior where the repo already does so.
- Keep lazy loading, async decoding, and skeleton fallbacks for below-the-fold media.
- Wrap lazy-loaded image components in `Suspense` when following the existing experience-list pattern.

### Video
- Preserve the current responsive hero-video behavior.
- Respect `prefers-reduced-motion` and data-saver constraints.
- Keep Cloudflare-friendly caching and preload behavior aligned with the current implementation.

---

## Experience Data Architecture
- Route and catalog lookup belong in `src/lib/services/experiences-catalog.service.ts`.
- Experience-list assembly belongs in `src/lib/services/experiences-list.service.ts`.
- Booking data resolution belongs in `src/lib/services/book.service.ts`.
- Mock and configuration data belong in `src/lib/data-mocks/*`.

Rules:
- Keep services responsible for fetching, validating, translating, and shaping data for UI consumption.
- Keep pages thin. Pages should orchestrate, not embed business logic.
- Preserve the current pattern where services resolve translation keys into UI-ready data.
- Do not hardcode translated copy in component logic when translation keys already exist in data config.

When adding a new experience:
1. Add or update the catalog and any list/mock configuration.
2. Ensure the service layer can resolve the experience by route segment and internal id.
3. Add the route entry under the existing locale-aware experience structure.
4. Keep all locale messages synchronized.

---

## Landing Page Architecture

The landing page follows the same `fetch → validate → translate → return` pattern but with a dual-layer Zod schema.

### Data Flow
1. `LANDING_DATA_REGISTRY` (`src/lib/data-mocks/landing.registry.ts`) is the single mock entry point.
2. `landing.mock.ts` holds raw data with i18n keys (not translated strings).
3. `LandingDataMockSchema` validates the raw shape.
4. `landing.service.ts` validates then delegates to pure translator functions in `src/utils/landingTranslators.ts`.
5. Translators project raw `FooKey` strings into translated `FooContent` via `t()`.
6. `LandingContentSchema` validates the final UI-ready shape before it reaches the page.

### Component Map
| Section | Component | Data Source |
|---|---|---|
| Hero (brand) | `LandingHeroBrand/`, `LandingHeroBrandContent`, `LandingHeroBrandSearch`, `LandingHeroBrandTrustChips` | `heroBrand` |
| Booking card | `LandingHeroBookingCard/` | `heroBrand.bookingCard` |
| Categories | `LandingCategories/`, `LandingCategoryCard` | `categories` |
| Featured experiences | `LandingFeaturedExperiences/`, `LandingFeaturedExperienceCard` | `featuredExperiences` |
| Why us | `LandingWhyUs/` | `whyUs` |
| How it works | `LandingHowItWorks/` | `howItWorks` |
| Traveler segments | `LandingTravelerSegments/` | `travelerSegments` |
| Trust stats | `LandingTrustStats/` | `trustStats` |
| Location | `LandingLocation/` | `locationBrand` |
| Safety | `LandingSafety/` | `safety` |
| Value props | `LandingValueProps/` | `valueProps` |
| Inclusions | `LandingInclusions/` | `inclusions` |
| Tiers | `LandingTiers/` | `tiers` |
| Reviews | `Reviews/` | `reviews` |
| FAQs | `LandingFaqs/` | `faqs` |
| Final CTA | `FinalCtaBanner/` | `finalCta` |
| Mobile sticky | `LandingMobileSticky/` | `globalCtas` |

### Legacy Sections
Some components (ValuePropositions, Inclusions, Itinerary, AccommodationTiers, ExperienceHero) are shared between the experience detail page and the landing page via the `ExperienceReservation` feature folder. The landing service projects dedicated translated content for these; the same components render either context.

### Rules
- Keep `LandingDataMock` key-based — zero hardcoded strings in mock data.
- `landingTranslators.ts` is pure: accepts raw data + `t()`, returns projected content. No I/O.
- Landing section components are thin: receive translated content, render it. No logic.
- `LANDING_DATA_REGISTRY` is the single mock entry point. Phase 2 replaces its fetch with a real API call.
- When adding a landing section: add mock schema → add translated schema → add translator → add service composition → add component.

---

## Context and State Rules
This repo uses `use-context-selector` intentionally.

Rules:
- Keep context values explicitly typed.
- Export narrow selector hooks instead of broad context consumers when the pattern already exists.
- Fail fast when hooks are used outside their provider.
- Keep reducer actions as discriminated unions.
- Keep feature state scoped to the feature provider.
- Keep localStorage or browser persistence hydration-safe and client-only.

Reference pattern:
- `src/contexts/ExperienceReservationContext.tsx`
- `src/contexts/ExperienceDetailContext.tsx`
- `src/hooks/experiences/useReservationContext.ts`
- `src/hooks/experiences/useExperienceDetailContext.ts`

Do not replace selector hooks with broad `useContext` reads that increase render churn.

---

## API, Validation, and Security Rules

### Validation
- Validate untrusted input with Zod.
- Prefer the helpers in `src/lib/validation.ts` for normalized validation handling.
- Return stable, non-leaky error responses from route handlers.

### API Consumption
- Prefer `apiCall<T>()` from `src/lib/api-client.ts` for typed fetch calls and normalized error handling.
- Only skip `apiCall` when there is a concrete reason.

### Security Baseline
- Reject unsafe URL schemes such as `javascript:` and `data:` for untrusted links.
- Avoid `dangerouslySetInnerHTML` unless the content is sanitized.
- Never expose secrets or internal stack traces.
- Keep browser storage free of secrets and tokens.
- Align frontend behavior with `next.config.js` and `public/_headers` when security or caching changes are involved.

---

## Internationalization Rules
- Supported locales are `en`, `es`, and `fr`.
- User-facing copy belongs in `src/i18n/messages/*.json` unless the copy is intentionally data-driven through translated service output.
- Do not hardcode user-facing literals in components when a translation key already exists.
- Keep `timeZone: 'UTC'` behavior intact in intl configuration.
- Preserve the `as-needed` locale prefix behavior for English.

Any copy change is incomplete unless all three locale files are updated.

---

## Testing Guidance
- Use Vitest + Testing Library patterns already present in the repo.
- Prefer targeted tests over broad rewrites.
- For provider-dependent UI, use the wrapper strategy in `src/test/test-utils.tsx`.
- Keep tests deterministic and independent from live network calls.
- Update tests when behavior changes.
- For reusable primitives, add or update Storybook stories when the primitive already has stories.

For media and interactive UI, prefer assertions around:
- Accessibility semantics
- Loading and fallback states
- Localized text
- Responsive source selection when applicable

---

## Change Workflow for AI
1. Read the relevant files and confirm the current pattern.
2. Implement the smallest safe change.
3. Verify architecture, type safety, i18n, and security implications.
4. Run the smallest relevant checks when code changes warrant it:
   - `npm run lint`
   - `npm test`
5. Report what changed, where, and any residual risks.

---

## AI Review Checklist

### Correctness
- Does the change solve the requested outcome end to end?
- Are loading, empty, and error states still coherent?

### Architecture
- Are server and client boundaries respected?
- Are providers scoped correctly?
- Are service-layer responsibilities preserved?
- Are selector-hook patterns preserved where expected?

### Design System
- Does the change use existing UI wrappers where appropriate?
- Does it preserve the semantic token system and current visual language?
- Does it keep responsive layout and accessibility behavior consistent?

### Security
- Is untrusted input validated?
- Any XSS, unsafe URL, or secret exposure risk?

### i18n
- Are `en`, `es`, and `fr` kept in sync?
- Are localized navigation and translation helpers used correctly?

### Type Safety and Scope
- Any `any` introduced?
- Any unnecessary refactor or architecture drift?
- Are lint and tests appropriate for the change?

---

## Command Reference
- Dev: `npm run dev`
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Test: `npm test`
- Storybook: `npm run storybook`
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy prod: `npm run deploy`
- Deploy dev: `npm run deploy:dev`

Deployment rule: use npm scripts only. Do not use raw `wrangler deploy` commands.

---

## Recommended Review Prompt
Use this prompt for PR review:

"Review this PR against `.github/copilot-instructions.md` focusing on provider topology, server/client boundaries, service-layer integrity, design-system consistency, security validation, i18n correctness, strict TypeScript, and minimal-scope changes. Report concrete issues first, then optional improvements."

---

## Efficiency Rules for This Repo
- Do not inspect unrelated packages.
- For frontend changes, focus on the target component, its imports, and nearby tests.
- For backend changes, focus on the target service, route/controller, and related tests.
- Prefer `rg` over broad file reads.
- Prefer one small patch over multiple exploratory edits.

---

## General Coding Behavior
- Make minimal diffs.
- Preserve existing style.
- Do not add new dependencies unless needed.
- Ask before large refactors.
- Ask before destructive commands.
- Run only targeted tests/lint.
- Stop once the task is complete.

---

## Maintenance Rule
When architecture, design-system primitives, security posture, or workflow changes, update this file first.
Keep it concise, current, and enforceable.

---

## Future Architecture & Roadmap (AI Reference)

This section informs AI of the planned architecture so suggestions today do not block tomorrow's migration. **Current code remains source of truth**; this is forward-looking context only.

### Status
- **Today:** Mock-fed services (`EXPERIENCE_DATA_REGISTRY`, `EXPERIENCES_LIST_CONFIG`), translations in `src/i18n/messages/*.json`, no real API yet.
- **Target:** Pattern 4 — backend owns all content + translations, frontend fetches at runtime. UI and API live in **separate repositories**.
- **Timeline:** ~4-5 weeks to MVP (live paid bookings), ~7-8 weeks to marketing-team CMS.

### Repository Split (3 separate repos)

```
andean-scapes-web/       ← this repo (Next.js, Cloudflare Pages)
andean-scapes-api/       ← new repo (Cloudflare Workers, TypeScript)
andean-scapes-payments/  ← new repo (AWS Lambda, Go)
```

**Why separate repos:**
- Clean boundary per concern — independent deploy cycles
- API and payments can evolve independently
- Go lives only in payments (contained scope, ideal for learning Go)
- Frontend never touches payment or API internals

### Language per repo

| Repo | Language | Runtime | Why |
|---|---|---|---|
| `andean-scapes-web` | TypeScript / React | Cloudflare Pages (Next.js) | Current stack, no change |
| `andean-scapes-api` | TypeScript | Cloudflare Workers | Native D1/KV/R2 bindings, $0, edge-native |
| `andean-scapes-payments` | **Go** | AWS Lambda | First-class Go runtime, ~50ms cold start, small binaries, 1M req/mo free |

**Why Go is ideal for Lambda (payments):**
- AWS officially maintains the Go runtime (`provided.al2023`)
- Go binaries are small and fast — best cold start of any compiled language on Lambda
- Stripe webhook handlers are stateless, short-lived — perfect Lambda use case
- 1M requests/mo free tier is more than sufficient indefinitely
- Good scope to learn Go in production without risk (payments is isolated, well-defined)
- No runtime cost: Lambda charges only per invocation, not idle time

**Why Go on Cloudflare Workers is not viable:**
- Workers only support Go via WebAssembly (Wasm) — not first-class
- Free tier bundle limit: 1MB compressed; Go Wasm binaries: 2-8MB
- D1/KV/R2 bindings are JS APIs — Go Wasm requires JS interop glue
- WASI on Workers is experimental, not production-ready

### Target Stack

| Layer | Service | Language | Cost |
|---|---|---|---|
| Frontend hosting | Cloudflare Pages | TypeScript / Next.js | $0 |
| API runtime | Cloudflare Workers | TypeScript | $0 (100k req/day free) |
| Database | Cloudflare D1 (SQLite) | — | $0 (5GB + 25M reads/day) |
| Cache | Cloudflare Cache API + KV | — | $0 |
| Image storage | Cloudflare R2 | — | $0 (10GB, no egress) |
| Admin auth | Cloudflare Access | — | $0 (≤50 users) |
| Payments | AWS Lambda | **Go** | $0 (1M req/mo free) |
| Email | Resend | — | $0 (3k/mo free) |
| ORM (API) | Drizzle | TypeScript | $0 |

**Total: $0/mo** at launch scale. Workers paid tier ($5/mo) only needed above ~10M req/mo.

### Target Repository Structure

**`andean-scapes-web/` (this repo) — frontend only, no changes to structure**
```
andean_v3/
├── src/               # Next.js app (stays exactly here, nothing moves)
└── .github/
    └── copilot-instructions.md
```

**`andean-scapes-api/` (new repo) — Cloudflare Worker, TypeScript**
```
andean-scapes-api/
├── src/
│   ├── routes/        # experiences.ts, i18n.ts, bookings.ts, admin/
│   ├── db/            # Drizzle schema + D1 client
│   ├── cache.ts       # Cache API + KV helpers
│   └── index.ts       # Worker entry point (Hono router)
├── migrations/        # D1 SQL migration files
├── seeds/             # Seed scripts (experiences + translations from current JSON)
├── wrangler.toml      # Cloudflare Workers config (D1, KV, R2 bindings)
└── package.json
```

**`andean-scapes-payments/` (new repo) — AWS Lambda, Go**
```
andean-scapes-payments/
├── cmd/
│   ├── checkout/      # POST /checkout — creates Stripe session
│   └── webhook/       # POST /webhook — handles Stripe events
├── internal/
│   ├── stripe/        # Stripe client wrapper
│   └── db/            # D1 HTTP client (updates booking status)
├── template.yaml      # AWS SAM template (Lambda + API Gateway)
└── Makefile           # build, deploy, test targets
```

**Schema sharing between repos:**
- `andean-scapes-web`: Zod schemas stay in `src/lib/schemas/` — validated on API responses received
- `andean-scapes-api`: own Zod schemas for request/response validation — source of truth for API contract
- `andean-scapes-payments`: Go structs mirror the booking schema — kept in sync manually (small surface)
- No shared package needed at this scale. If contracts diverge significantly, publish `@andean/contracts` to npm and a Go module.

### Target API Contract (v1)

```
GET  /api/v1/experiences                         # list, locale-agnostic, cached
GET  /api/v1/experiences/:slug                   # detail, locale-agnostic, cached
GET  /api/v1/i18n/:locale?namespaces=...         # translation bundle, cached
POST /api/v1/bookings/checkout                   # creates Stripe session via Lambda
POST /api/v1/bookings/webhook                    # Stripe webhook (Lambda-forwarded)
GET|POST|PUT|DELETE /api/v1/admin/experiences/*  # CMS writes (Cloudflare Access gated)
PUT  /api/v1/admin/translations/:locale/:key     # translation edit
POST /api/v1/admin/images/upload                 # R2 signed URL
POST /api/v1/admin/publish                       # cache invalidation trigger
```

### Translation Architecture (Pattern 4, Strategy B — runtime fetch)

- D1 `translations` table holds every key/locale/value pair
- `GET /api/v1/i18n/:locale` serves flat JSON bundles (same shape as current `messages/*.json`)
- `src/i18n/request.ts` fetches bundle at runtime; static JSON kept as cold-start fallback
- **Component code is unchanged**: `t('experiences.tiers.heritage.title')` still works
- Marketing publishes in admin UI → Worker writes D1 → `revalidateTag()` → live within seconds
- Locale fallback: missing `fr` key → falls back to `en` in Worker handler

### Database Schema (D1 / SQLite)

```sql
experiences   (id, slug, i18n_namespace, data JSON, status, published_at, version, ...)
translations  (key, locale, value, updated_at)   PRIMARY KEY (key, locale)
bookings      (id, experience_id, stripe_session_id, status, total_amount, currency, ...)
admin_users   (id, email, role)
```

`experiences.data` is a JSON blob of structural data only (prices, images, dates, coordinates). Zero translatable text in this column.

### Phased Migration Plan

**Phase 0** — Pre-flight: account provisioning, finalize open decisions (1-2 days)
**Phase 1** — API contract on Workers, mock-fed (1-2 weeks). Frontend calls real HTTP API; Worker still serves current mocks. Zero user-facing change.
**Phase 2** — D1 + booking flow (2-3 weeks). DB-backed catalog. Stripe checkout end-to-end. Admin write API functional via Postman (no UI yet).
**Phase 3** — Admin UI for marketing team (2-3 weeks). `/admin/*` in Next.js, Cloudflare Access auth, CRUD for experiences + translations, R2 image upload.
**Phase 4** — Production hardening (1 week). Backups, alerts, email automation, locale fallback, rate limiting, staging environment.

**MVP cutline:** complete Phases 1+2. First paid booking possible before Phase 3 (marketing edits via Postman during interim).

### MVP Scope (First Live Sale)

- 1 live experience: **emerald-mining-adventure** (Emerald Mining Adventure)
- 3 locales: en / es / fr (seeded from current JSON files)
- Public landing, list, and detail pages functional
- Booking form: wire to `POST /api/v1/bookings/checkout`
- Stripe test → live checkout flow
- Booking confirmation email: manual until Phase 4 automates it

### AI Behavior Rules for Future Compatibility

AI MUST respect these rules when suggesting code, even before the migration happens:

1. **Preserve service seams.** `book.service.ts` and `experiences-list.service.ts` follow `fetch → validate → translate → return`. The "fetch" step is the single line that becomes a real `fetch()` in Phase 1. Never inline mock access into components or hooks.

2. **Zod schemas are the API contract.** Schemas in `src/lib/schemas/` will move to `packages/shared/` in Phase 1. Keep them pure — no `next/server`, no React imports, no Next.js-specific types.

3. **Key-based translations only.** Never embed localized strings in mock data or API responses. Always `i18nNamespace` + relative key references. Frontend `next-intl` remains the renderer. Do not propose returning pre-translated strings from the API (Pattern 2 — rejected).

4. **Mock registries are the seam.** Experience data flows through `EXPERIENCE_DATA_REGISTRY` (`src/lib/data-mocks/experiences.registry.ts`). Landing data flows through `LANDING_DATA_REGISTRY` (`src/lib/data-mocks/landing.registry.ts`). Each is the single fetch-replacement point for its domain. Do not create additional registries; extend existing ones with new entries or sections.

5. **`computeFromPrice` is interim.** This helper in `experiences-list.service.ts` is deleted in Phase 2 when the API returns `fromPrice` denormalized. Do not build on top of it.

6. **Translators are pure functions.** `src/utils/experienceTranslators.ts` accepts raw data + `t()`, returns projected content. No I/O, no side effects, no runtime dependencies. They run unchanged after migration.

7. **Context composition over storage bridging.** `ExperienceDetailProvider` wraps `ExperienceReservationProvider`. Never restore the deleted `useEffect` localStorage bridge. Cross-context state belongs in a shared parent provider.

8. **Test-data convention.** Extend `src/test/test-utils.tsx` (`MOCK_EXPERIENCE_DATA`, `MOCK_MESSAGES`) for experience-test data. Landing pages use Storybook fixtures in `__fixtures__/` folders (e.g., `LandingCategories/__fixtures__/categoriesFixture.ts`). Keep domain-specific mock data close to its test consumer.

9. **Workers-compatible backend code.** Prefer Workers-compatible patterns: no Node-only APIs, no long-running processes, mindful of 10ms CPU limit on free tier. Drizzle is the chosen ORM — do not suggest Prisma.

10. **SQLite-aware schema.** Respect D1/SQLite limitations: TEXT/INTEGER/JSON types, single-region writes, no Postgres-only features.

11. **Admin UI lives in Next.js.** `/admin/*` routes are part of `apps/web`, gated by Cloudflare Access. Do not propose Payload, Sanity, Strapi, or any external CMS — explicitly rejected for cost and lock-in reasons.

12. **Payments stay in Lambda.** Stripe logic lives in AWS Lambda. Workers handles routing only. Do not move Stripe interaction into Workers.

13. **Locale-agnostic API responses.** `/experiences/:slug` and `/experiences` never accept `?locale=`. Translations come exclusively from `/i18n/:locale`. Do not merge these endpoints.

14. **Cache via tags.** Reads use `next: { revalidate: 3600, tags: [...] }`. Writes trigger `revalidateTag()`. Do not introduce per-locale URLs on data endpoints that would fragment CDN caching.

### Decisions Locked — Do Not Re-Propose

| Decision | Rejected alternatives |
|---|---|
| Cloudflare-native stack | Vercel, AWS-primary, mixed clouds |
| Custom Next.js admin UI | Payload, Sanity, Contentful, Strapi |
| Cloudflare D1 for database | Postgres, MongoDB for v1 |
| Drizzle ORM | Prisma, raw SQL, TypeORM |
| Pattern 4 + Strategy B (runtime fetch) | Patterns 1/2/3, Strategy A (build-time) |
| AWS Lambda for payments | Stripe logic in Workers |
| Single repo, `api/` folder at root | pnpm workspaces monorepo, Turborepo, Nx, separate repos |
| Cloudflare Access for admin auth | Custom JWT, NextAuth for v1 |

### Open Decisions (AI may help evaluate)

- API domain: `api.andeanscapes.com` vs `*.workers.dev` for MVP
- Email provider: Resend vs SES
- Currency strategy: USD-only at launch vs multi-currency from day one
- Tax/VAT handling at Stripe checkout
- Booking cancellation/refund flow — MVP scope or post-launch

### Current State → Phase 1 Migration Map

| Current artifact | Phase 1 action | Phase 2 action |
|---|---|---|
| `EXPERIENCE_DATA_REGISTRY` | Copy to `apps/api/src/data/` (still mock) | Seed into D1, delete mock file |
| `EXPERIENCES_LIST_CONFIG` | Extract to `apps/api/src/data/` | Replace with D1 query |
| `LANDING_DATA_REGISTRY` | Copy to `apps/api/src/data/` (still mock) | Seed into D1, delete mock file |
| `book.service.ts` fetch step | `getFallbackData()` → `fetch(workerUrl)` | No change (already real fetch) |
| `experiences-list.service.ts` | Const access → `fetch(workerUrl)` | `computeFromPrice` deleted |
| `landing.service.ts` | `LANDING_DATA_REGISTRY` → `fetch(workerUrl)` | No change |
| Zod schemas | Stay in `src/lib/schemas/`; API repo owns its own | No change |
| `src/i18n/messages/*.json` | Copy to API repo as seed source | Seed D1, keep as fallback |
| Tests (170+ passing) | Update mocks for HTTP boundary | Add integration tests for Worker |

Zero throwaway work. Every refactor in the current codebase directly enables Phase 1.

### Correct vs Incorrect Suggestions (Examples)

```
✅ "Update Zod schema in src/lib/schemas/ for the new field, update mock, update translators"
✅ "Fix booking flow bug within service layer, preserve fetch-validate-translate-return shape"
✅ "Extend MOCK_EXPERIENCE_DATA in test-utils.tsx for new test coverage"
✅ "Add new landing section: schema + mock entry + translator + service composition + component"
✅ "Add a fixture in __fixtures__/ for new landing component Storybook stories"

❌ "Add a service that bypasses Zod validation"
❌ "Embed translated strings directly in experience or landing mock data"
❌ "Create a third mock registry for this new feature"
❌ "Use Payload/Sanity for content management"
❌ "Move pricing formula into a multi-file pipeline before the API exists"
❌ "Add ?locale= parameter to the experience detail endpoint"
❌ "Use Prisma for D1 access"
```
