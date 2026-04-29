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
