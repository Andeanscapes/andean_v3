# Andean Scapes — Canonical AI Instructions

## Purpose
This is the single authoritative instruction file for AI behavior in this repository.
Use it for:
- GitHub Copilot code generation
- Copilot Chat in VS Code
- AI-assisted PR and code review

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
- `Input`
- `Modal`
- `RadioGroup`
- `SectionContainer`
- `SegmentedControl`
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
- `src/hooks/experiences/useReservationContext.ts`

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

## Maintenance Rule
When architecture, design-system primitives, security posture, or workflow changes, update this file first.
Keep it concise, current, and enforceable.
# Andean Scapes — Canonical AI Instructions

## Purpose
This is the single, authoritative instruction file for AI behavior in this repository.
Use it for:
- GitHub Copilot code generation
- Copilot Chat in VS Code
- AI-assisted PR/code review

If any guidance elsewhere conflicts with this file, this file is authoritative.

---

## Tech Baseline
- Next.js 16 (App Router) + React 19
- TypeScript (`strict: true`)
- Tailwind CSS v4 + daisyUI
- i18n with `next-intl` (`en`, `es`, `fr`; `en` unprefixed)
- State with `use-context-selector`
- Validation with Zod (`src/lib/validation.ts`)
- Deployment on Cloudflare Pages via `@opennextjs/cloudflare`
- Tests with Vitest + Testing Library

---

## Non-Negotiable Rules
1. Security first: treat all external input as untrusted.
2. Minimal scope: implement only what was requested.
3. No `any`: use explicit types, `unknown`, and type guards.
4. No secrets in code/docs/tests/examples.
5. Feature UI must consume wrappers from `src/components/ui/*`.
6. Any user-facing copy change must keep `en`, `es`, `fr` in sync.
7. Preserve behavior and architecture unless refactor is explicitly requested.

---

## Architecture (Deep)

### 1) App Router + Locale Topology
- Root locale shell: `src/app/[locale]/layout.tsx`.
- Route groups: `src/app/[locale]/(public)` and `src/app/[locale]/(auth)`.
- Middleware (`src/middleware.ts`) uses `localeDetection: false` and excludes `api`, `_next`, `_vercel`, static files.
- `src/i18n/request.ts` resolves locale from middleware segment (`requestLocale`) and loads `messages/{locale}.json`.

AI expectation:
- Never bypass locale segment patterns.
- Do not introduce alternative i18n mechanisms outside `next-intl`.
- Keep default-locale unprefixed behavior aligned with `src/i18n/routing.ts` (`localePrefix: 'as-needed'`).

### 2) Provider Topology (Critical)
Current provider stack is intentional and must be preserved:

1. `ThemeProvider` (global theme and hydration-safe theme init)
2. `NextIntlClientProvider` (locale/messages/timeZone)
3. `LanguageProvider` (derived locale metadata for UI selectors)
4. `WebVitalsReporter` (performance monitoring)
5. Route content (`children`)

Implemented in: `src/app/providers.tsx` and mounted in `src/app/[locale]/layout.tsx`.

#### Provider Scope Rules
- Global providers belong in `src/app/providers.tsx` only.
- Segment/layout-specific providers belong in their own layout scope (example: `LayoutProvider` inside `(public)/layout.tsx`).
- Feature-state providers belong in feature entry components (example: `ExperienceReservationProvider` in `MiningAdventureReservation.tsx`).
- Do not move feature providers to global scope unless explicitly requested.

#### Why this matters
- Keeps server layout clean and deterministic.
- Avoids unnecessary re-renders and state coupling.
- Prevents hydration drift by isolating browser-dependent state.

### 3) Server/Client Boundaries
Follow this exact split:
- Server Components fetch/prepare data (`page.tsx`, metadata, i18n server calls).
- Client Components render interactive flows and local UI state.
- Do not call browser APIs in Server Components.
- Do not move data-fetching concerns into client code unless required.

Reference flow:
- `.../emerald-mining-adventure/page.tsx` (server) calls `getExperienceDataSSR(...)`.
- `MiningAdventureReservation.tsx` (client) receives ready-to-render data and mounts `ExperienceReservationProvider`.

### 4) Experience Data Architecture
Business/data logic lives in `src/lib/services/experiences.service.ts`.
- Service fetches raw experience config and applies translation key resolution via `next-intl`.
- UI components consume translated `ExperienceData` objects.
- Keep translation-key architecture intact (config stores keys, service resolves text).

AI expectation:
- New experience: add config + update service switch + create route entry.
- Avoid embedding translated literals directly in service config when key-based pattern exists.

### 5) Context + Selector Pattern
This project uses `use-context-selector` to reduce re-renders.

Rules:
- Context shape must be explicit and typed.
- Export narrow selector hooks (`useReservationDate`, `useReservationRooms`, etc.) instead of broad mutable context access in feature components.
- If a hook requires provider presence, fail fast with clear error (existing `requireContext` pattern).
- Keep reducer actions discriminated unions (no untyped payloads).

### 6) Media & Image Optimization (Branch: Performance)
Responsive images use `<picture>` element with media queries and lazy loading.

Rules:
- All experience cards must use `ExperienceCardImage` component from `src/components/ExperienceList/ExperienceCardImage.tsx`.
- Mobile images derive from desktop path: `emerald-mining-card.webp` → `emerald-mining-card-mobile.webp`.
- Media breakpoint: `(max-width: 767px)` for mobile, `(min-width: 768px)` for desktop.
- Wrap images in `Suspense` with light fallback skeleton (see `src/app/[locale]/(public)/experiences/page.tsx`).
- Always use `loading="lazy"` + `decoding="async"` for images below the fold.
- Quality: mobile 740x700 (~150–200 KB), desktop 740x700 (~200–300 KB).

Why:
- Browsers only download size-appropriate images based on viewport.
- Lazy loading + Suspense defers rendering until user scrolls or code-splits.
- Zero wasted bandwidth; mobile users avoid desktop-sized assets.

---

## Code Patterns (Required)

### Pattern A — API Input Validation
- Validate query/body/path input with Zod in `src/lib/validation.ts`.
- Prefer `tryValidate(...)` for normalized error output.
- Return stable error payloads from routes; never expose stack traces.

### Pattern B — API Consumption
- Prefer `apiCall<T>()` from `src/lib/api-client.ts` for typed requests and normalized errors.
- Only skip `apiCall` when there is a clear technical reason (document it in code review notes).

### Pattern C — External URL Safety
- Reject unsafe schemes (`javascript:`, `data:`) for user-controlled links.
- For external tabs use `target="_blank"` + `rel="noopener noreferrer"`.

### Pattern D — HTML Rendering
- Avoid `dangerouslySetInnerHTML` unless content is sanitized.
- Treat CMS/user HTML as untrusted by default.

### Pattern E — Storage/Hydration
- Browser persistence (e.g., `localStorage`) is client-only and hydration-safe.
- Use hydration flags where needed (`isHydrated` pattern in reservation context).
- Never persist secrets/tokens in localStorage/sessionStorage.

### Pattern F — UI Composition
- Feature components should compose typed wrappers from `src/components/ui/*`.
- If wrapper missing, add wrapper first; do not scatter raw third-party primitive usage across features.

### Pattern G — Responsive Media & Lazy Loading
- Card images must use `<picture>` element with media queries; never hardcode single-size src.
- Always wrap images in `Suspense` with `ExperienceCardImageFallback` loader skeleton.
- Use `lazy()` + `Suspense` at the page level to defer image component code-splitting.
- Mobile images: `{name}-mobile.webp` (740x700, ~150–200 KB). Desktop: `{name}.webp` (740x700, ~200–300 KB).
- Set `loading="lazy"`, `decoding="async"`, `quality={75}` for all images.
- Placeholder: Use blur SVG data URL for fade-in effect during load.

Example flow:
```tsx
const ExperienceCardImage = lazy(() => import('@/components/ExperienceList/ExperienceCardImage'));

<Suspense fallback={<ExperienceCardImageFallback />}>
  <ExperienceCardImage src={card.image} alt={card.title} sizes="..." />
</Suspense>
```

Why:
- Reduces initial page weight; mobile avoids desktop images entirely.
- Suspense + lazy decouples image component from page bundle.
- Skeleton UX keeps UI responsive during async image load.

---

## Route & Layout Conventions
- Keep shared app shell concerns in `src/app/[locale]/layout.tsx`.
- Keep public-shell concerns (`Header`, `Footer`, sticky state) in `src/app/[locale]/(public)/layout.tsx`.
- Avoid introducing global side effects in feature pages.
- Metadata generation stays in server page modules via `generateMetadata`.

---

## Hero Videos & Performance (Branch: Performance)
Hero background videos must be optimized for Cloudflare deployment.

Rules:
- Use `.webm` format (VP9 codec) as primary source; keep `.mp4` (H.264) as fallback for older browsers.
- Mobile conditional rendering: detect viewport with `window.matchMedia('(min-width: 768px)')` + `prefers-reduced-motion`.
- Desktop: `preload="metadata"`. Mobile: `preload="none"` to defer download until needed.
- Set `decoding="async"` and `playsInline` for all videos.
- Cache headers in `public/_headers`: `/videos/*` → `Cache-Control: public,max-age=31536000,immutable`.

Example flow (see `ExperienceHero.tsx`):
```tsx
const isDesktop = window.matchMedia('(min-width: 768px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasDataSaver = navigator.connection?.saveData === true;

setShouldRenderVideo(!prefersReducedMotion && !hasDataSaver);
setIsDesktopViewport(isDesktop);
```

Why:
- Reduces hero jank; mobile doesn't decode heavy video on first paint.
- Respects accessibility + network constraints (prefers-reduced-motion, data-saver).
- Cloudflare aggressively caches static video assets.

---

## Security Baseline

### API routes (`src/app/api/**/route.ts`)
1. Validate origin/CORS according to project policy.
2. Validate all inputs before business logic.
3. Return normalized errors.
4. Do not leak internals.

### Frontend security
- Sanitize/encode user-controlled values.
- No unsafe URL schemes.
- No secret exposure in client code.
- Keep security headers strategy aligned with `next.config.js` + `public/_headers`.

---

## i18n Rules
- Locales are `en`, `es`, `fr`.
- Keep copy keys and messages synchronized across all locales.
- Do not hardcode user-facing literals in components when translation keys exist.
- Preserve UTC + locale formatting strategy (`timeZone: 'UTC'` in intl providers/request config).

---

## Testing Guidance
- Use targeted tests first; broaden only when needed.
- For provider-dependent components, use existing wrapper strategy in `src/test/test-utils.tsx`.
- Keep tests deterministic; avoid network dependency in unit tests.
- Update tests only when behavior changed.
- Media components: test responsive `<picture>` sources, media queries, lazy attributes, and loading states (see `src/components/ExperienceList/ExperienceCardImage.test.tsx`).
- Always test accessibility: `aria-hidden`, image alt text, loading skeletons.

---

## AI Delivery Workflow
1. Read scope and affected files.
2. Implement smallest safe change.
3. Verify architecture/security/i18n/type impacts.
4. Run checks (when applicable):
   - `npm run lint`
   - `npm test`
5. Report: what changed, where, risks/follow-ups.

---

## AI Code Review Checklist (PR)

### Correctness
- Does it solve the requested outcome end-to-end?
- Are error/empty/loading/null states handled?

### Architecture
- Are server/client boundaries respected?
- Are providers placed in correct scope (global vs layout vs feature)?
- Are service-layer and selector-hook patterns preserved?

### Security
- Is untrusted input validated?
- Any XSS/open redirect/unsafe URL risk?
- Any secret exposure risk?

### i18n
- Are translation keys/messages used consistently?
- Are `en/es/fr` updated for user-visible text changes?

### Type Safety
- Any `any` introduced?
- Are exports explicitly typed?

### Quality/Scope
- Is change minimal and reversible?
- Any unrelated refactor slipped in?
- Are lint/tests results clear?

---

## Command Reference
- Dev: `npm run dev`
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Test: `npm test`
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy prod: `npm run deploy`
- Deploy dev: `npm run deploy:dev`
- Storybook: `npm run storybook`

Deployment rule: use npm scripts only (never raw `wrangler deploy`).

---

## Recommended Copilot Review Prompt
Use this prompt for PR review:

"Review this PR against `.github/copilot-instructions.md` focusing on provider topology, server/client boundaries, service-layer integrity, security validation, i18n consistency, strict TypeScript, and minimal-scope changes. Report concrete issues first, then optional improvements."

---

## Maintenance Rule
When architecture, security posture, or workflow changes, update this file first.
Keep this document concise, current, and enforceable.
