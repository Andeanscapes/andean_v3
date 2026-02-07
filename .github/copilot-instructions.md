# Andean Scapes - AI Coding Agent Instructions

## Project Overview
Next.js 16.1.6 + React 19 tourism website deployed to **Cloudflare Pages** via `@opennextjs/cloudflare`. GitFlow with `develop` (dev env) and `main` (prod) branches. **Public repo** - no credentials in code. **Security-first architecture** with comprehensive validation, HTTP headers, and XSS prevention patterns.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS + CSS Modules + daisyUI
- **Component Library:** daisyUI (wrapped via `/src/components/ui/` abstraction layer)
- **Deployment:** Cloudflare Pages (`@opennextjs/cloudflare`)
- **i18n:** next-intl (3 locales: `en`, `es`, `fr`)
- **State:** `use-context-selector` (performance-optimized contexts)
- **Validation:** Zod schemas ([src/lib/validation.ts](src/lib/validation.ts))
- **Testing:** Vitest + Testing Library
- **Component Docs:** Storybook

## Architecture

### Deployment & Environments
- **Production:** `andeanscapes.com` (push to `main` → GitHub Actions → Cloudflare)
- **Development:** `andean-v3-dev.workers.dev` (push to `develop` → auto-deploy)
- **Build:** `npm run build` → `opennextjs-cloudflare build` (generates `.open-next/`)
- **Deploy:** Use npm scripts, NOT direct Wrangler commands:
  - `npm run deploy` (prod)
  - `npm run deploy:dev` (dev)
  - Both require `.env.wrangler` file (see `.env.wrangler.example`)
- **Preview:** `npm run preview` - Local Cloudflare Workers preview

### Project Structure
```
src/
├── app/
│   ├── [locale]/          # i18n-aware routes (en, es, fr)
│   │   ├── (auth)/        # Route group: auth pages (login, signup)
│   │   ├── (public)/      # Route group: public pages (home, about)
│   │   ├── layout.tsx     # Root layout with fonts, providers
│   │   └── not-found.tsx  # 404 page
│   └── api/               # API routes (see src/app/api/README.md)
├── components/            # React components (see COMPONENT_PATTERNS.md)
├── contexts/              # LanguageContext, ThemeContext, LayoutContext
├── i18n/                  # routing.ts, messages/{en,es,fr}.json
├── lib/                   # api-client.ts, validation.ts
├── styles/                # globals.css
└── types/                 # ui.ts (TypeScript interfaces)
```

### i18n Architecture (next-intl)
- **Locales:** `en` (default), `es`, `fr` - defined in [src/i18n/routing.ts](src/i18n/routing.ts)
- **URL Structure:** `/` (English), `/es` (Spanish), `/fr` (French)
- **Locale prefix:** `as-needed` - keeps English unprefixed
- **Route structure:** ALL pages under `src/app/[locale]/` (NOT `src/app/`)
- **Proxy:** [src/proxy.ts](src/proxy.ts) with `localeDetection: false` (explicit routing, no auto-detection for security)
- **Contexts:** `LanguageContext` provides `currentLocale` and `availableLanguages` via `use-context-selector`
- **Messages:** [src/i18n/messages/](src/i18n/messages/) for translations
- **Usage:** Import `useTranslations('Namespace')` in components, `getMessages()` + `setRequestLocale()` in Server Components

### State Management Pattern
**Use `use-context-selector` NOT React Context:**
```typescript
// Pattern from src/contexts/LanguageContext.tsx
import { createContext, useContextSelector } from 'use-context-selector';

const Context = createContext<Type | null>(null);

export function useMyContext() {
  const value = useContextSelector(Context, (ctx) => ctx?.field ?? fallback);
  return value;
}
```
**Why:** Avoids unnecessary re-renders when only part of context changes.

## Development Philosophy & Guidelines

### Site Context
**Andean Scapes** is a public-facing ecommerce platform exposed to sensitive data (personal information, payment details, user accounts) and security-critical operations. All development must prioritize:
- **Security first:** Assume all user input is hostile; validate rigorously
- **Data protection:** GDPR/privacy compliance in all data handling
- **Simplicity:** Choose simple solutions over complex ones; avoid over-engineering
- **Minimal changes:** Only modify what's requested; don't refactor unrelated code or add unnecessary features
- **No premature optimization:** Solve today's problem simply, not tomorrow's speculative problem

### Code Style & Practices
- **No `any` types:** ALWAYS use explicit TypeScript types (if needed, use `unknown` and narrow via type guards)
- **No unnecessary comments:** Code should be self-documenting; omit comments unless they explain *why* not *what*
- **Separation of concerns:** UI components render data only; NO business logic in React components
- **No prop drilling:** Use `LanguageContext`, `ThemeContext`, `LayoutContext` patterns (via `use-context-selector`) to pass data down 2+ levels
- **Component wrappers for third-party libraries:**
  - If using daisyUI, Shadcn, or other UI libraries: wrap them in simple, abstracted components (`/src/components/ui/Button.tsx`, etc.)
  - This allows library swaps with minimal code changes (only update the wrapper)
  - Example: Create `/src/components/ui/Modal.tsx` that wraps daisyUI modal; swap daisyUI for another library by updating only that file
- **Composition over configuration:** Build small, focused components that compose into larger patterns
- **Scalability mindset:** Structure code to handle 10x more features/users without refactoring
- **Decouple dependencies:** Never import from 3rd-party libraries directly in business logic; always go through wrapper components

### When Writing Code
1. **Do the simplest thing that works** — resist adding "flexibility" for hypothetical future use cases
2. **Don't refactor:** If it works and passes linting/tests, leave it alone (unless explicitly asked)
3. **Don't overthink:** Simple, readable code > clever optimizations
4. **Keep components dumb:** Pass all logic as props/context; components should only render
5. **Reuse via context:** Before adding more props, check if data belongs in a context (e.g., user theme, language, layout state)

## daisyUI Component Architecture

### Installation & Configuration
- **Package:** `daisyui` installed as production dependency
- **Config (Tailwind v4):** Enabled via Tailwind v4 directives in `globals.css` (e.g., using the Tailwind `@plugin` mechanism), not via `tailwind.config.ts`
- **Themes:** Light/dark mode via `data-theme` attribute (controlled by `ThemeContext`)
- **Mode:** DaisyUI options such as `styled`, `base`, and `utils` are configured through the Tailwind v4 setup in `globals.css` so that classes, resets, and utilities are available as expected

### Component Wrapper Pattern (CRITICAL)
**Never use daisyUI classes directly in components.** Always wrap in `src/components/ui/` abstraction layer:

```typescript
// ❌ DON'T: Direct daisyUI usage
'use client';
export function MyComponent() {
  return <button className="btn btn-primary">Click me</button>;
}

// ✅ DO: Wrapped abstraction
// src/components/ui/Button.tsx
'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const variantMap = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  const sizeMap = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  return (
    <button
      className={`btn ${variantMap[variant]} ${sizeMap[size]} ${loading ? 'loading' : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage in components:
import { Button } from '@/components/ui/Button';
export function MyComponent() {
  return <Button variant="primary">Click me</Button>;
}
```

### Why Wrappers Matter
1. **Future-proof:** Swap daisyUI for Shadcn, Mantine, etc. by updating only `/src/components/ui/` files
2. **Type safety:** Define explicit prop interfaces (no magic `className` strings scattered everywhere)
3. **Consistency:** Enforce naming conventions and variant standardization across the app
4. **Testability:** Test wrapper components once; all consuming components inherit safety
5. **Maintainability:** Single source of truth for each component's styling logic

### Anti-patterns (DO NOT DO THIS)
❌ **Mixing daisyUI + Tailwind classes directly:**
```typescript
// WRONG: Classes scattered, hard to refactor
<div className="btn btn-primary px-4 py-2 text-lg font-bold shadow-lg">
  Content
</div>
```

❌ **Using `@apply` to create wrapper classes:**
```typescript
/* WRONG: Defeats the purpose of wrappers */
@apply btn btn-primary;
```

❌ **Conditional class strings:**
```typescript
// WRONG: Hard to track, prone to conflicts
const buttonClass = isActive ? 'btn-active' : 'btn-ghost';
return <button className={`btn ${buttonClass}`}>Click</button>;
```

✅ **CORRECT: Encapsulated, typed wrappers:**
```typescript
interface ButtonProps {
  isActive?: boolean;
}

export function Button({ isActive, ...props }: ButtonProps) {
  return (
    <button className={isActive ? 'btn btn-primary' : 'btn btn-ghost'} {...props} />
  );
}
```

### Common daisyUI Wrapper Examples
Create these in `/src/components/ui/`:
- `Button.tsx` - button with variants (primary, secondary, ghost, outline)
- `Modal.tsx` - dialog/modal with open/close handlers
- `Card.tsx` - card container with optional border/shadow variants
- `Input.tsx` - text input with label, error, placeholder
- `Select.tsx` - dropdown select (wraps daisyUI select or react-select)
- `Badge.tsx` - status badges (info, success, warning, danger)
- `Spinner.tsx` - loading indicator
- `Alert.tsx` - notification/alert box
- `Tabs.tsx` - tab navigation (if needed)
- `Dropdown.tsx` - dropdown menu (if needed)

### Theme Context Integration
daisyUI's theme system works via `data-theme` attribute. Use `ThemeContext` to manage it:
```typescript
// In ThemeContext.tsx
export function useTheme() {
  return useContextSelector(ThemeContext, (ctx) => ({
    theme: ctx?.theme ?? 'light',
    toggleTheme: ctx?.toggleTheme,
  }));
}

// In layout or root component
useEffect(() => {
  const root = document.documentElement;
  const { theme } = useTheme();
  root.setAttribute('data-theme', theme);
}, [theme]);
```

### Storybook Integration
Document wrapped components in Storybook:
```typescript
// src/components/ui/Button.stories.tsx
import { Button } from './Button';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Click me' },
};
```

## Security Patterns (CRITICAL)

### 1. Data Validation (Zod)
**Always validate external input** using [src/lib/validation.ts](src/lib/validation.ts):
```typescript
import { tryValidate, tourFilterSchema } from '@/lib/validation';

const result = tryValidate(tourFilterSchema, userInput);
if (!result.success) {
  // Handle validation errors: result.errors
  return NextResponse.json(
    { code: 'VALIDATION_ERROR', errors: result.errors },
    { status: 400 }
  );
}
// Use result.data (validated)
```

### 2. API Routes
Follow patterns in [src/app/api/README.md](src/app/api/README.md):
- **CORS validation:** Check `origin` header against allowed origins
- **Input validation:** Use `tryValidate()` on query params and request body
- **Error handling:** Return normalized `{ code, message, errors? }` responses
- **CORS headers:** Add via `addCorsHeaders()` helper

Example structure:
```typescript
export async function GET(request: NextRequest) {
  // 1. Validate origin
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 2. Validate input
  const filters = tryValidate(
    tourFilterSchema,
    Object.fromEntries(request.nextUrl.searchParams)
  );
  
  if (!filters.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', errors: filters.errors },
      { status: 400 }
    );
  }
  
  // 3. Fetch data with filters.data
  // 4. Return with CORS headers
}
```

### 3. React Components
See [src/components/COMPONENT_PATTERNS.md](src/components/COMPONENT_PATTERNS.md):
- **XSS Prevention:** NEVER use `dangerouslySetInnerHTML` without DOMPurify sanitization
- **Input Handling:** Validate on submit, set `maxLength` on inputs, encode before API calls
- **External Links:** Always use `rel="noopener noreferrer"` + validate URL schemes (no `javascript:` or `data:`)
- **Client-Side Fetch:** Use [src/lib/api-client.ts](src/lib/api-client.ts) `apiCall<T>()` helper (includes timeout, retry, CSRF headers)

Example:
```typescript
'use client';
import { apiCall } from '@/lib/api-client';

async function fetchTours(filters: TourFilters) {
  const tours = await apiCall<Tour[]>('/tours', {
    method: 'GET',
    timeout: 5000,
    retry: 2
  });
}
```

### 4. HTTP Security Headers
Auto-configured in [public/_headers](public/_headers) and [next.config.js](next.config.js):
- **HSTS:** `max-age=31536000` (production only)
- **X-Content-Type-Options:** `nosniff`
- **X-Frame-Options:** `SAMEORIGIN`
- **Referrer-Policy:** `strict-origin-when-cross-origin`
- **Permissions-Policy:** Blocks camera, microphone, payment, USB access
- **CSP-ready:** Add Content-Security-Policy when implementing
- **NEVER modify without reading** [SECURITY.md](SECURITY.md)

### Linting & Type Safety
- **ESLint v9 flat-config:** [eslint.config.mjs](eslint.config.mjs) (NOT `.eslintrc`)
  - CommonJS globals for `.js` files (`require`, `module`, `__dirname`)
  - Browser globals for `.ts/.tsx` (`Headers`, `AbortController`, `setTimeout`)
- **TypeScript:** Strict mode enabled ([tsconfig.json](tsconfig.json))
- **Lint command:** `npm run lint` (max-warnings=0 enforced in CI)
- **Path alias:** `@/*` → `src/*` (use in all imports)

## Critical Workflows

### Development Flow
1. Work in `develop` branch
2. Run `npm run dev` (port 3000)
3. Make changes, write tests (`npm test`)
4. Lint code (`npm run lint`)
5. Commit + push → auto-deploys to `andean-v3-dev.workers.dev`
6. Create PR `develop` → `main` when ready for prod
7. CI runs lint + tests (`ci.yml`)
8. Merge (squash) → auto-deploys to production (`deploy.yml`)

### Commands
| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` (or `npm run lint:fix`) |
| Test | `npm test` (or `npm run test:watch`) |
| Deploy prod | `npm run deploy` (requires `.env.wrangler`) |
| Deploy dev | `npm run deploy:dev` |
| Preview (local) | `npm run preview` |
| Storybook | `npm run storybook` (port 6006) |
| Build Storybook | `npm run build-storybook` |
| Cloudflare types | `npm run cf-typegen` |

### Branch Protection (Public Repo)
- **main:** Requires PR + CI passing (no direct push)
- **develop:** Requires PR (can self-approve)
- **Merge strategy:** Squash-only (clean history)
- **Secrets:** CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID in GitHub repo settings

## File Conventions

### Component Structure
```
src/components/ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.module.css   # CSS Modules (optional)
├── ComponentName.stories.tsx  # Storybook stories
└── ComponentName.test.tsx     # Vitest tests
```
**Patterns:** See [src/components/COMPONENT_PATTERNS.md](src/components/COMPONENT_PATTERNS.md) for XSS prevention, safe HTML rendering, input validation.

### API Routes
- Location: `src/app/api/[endpoint]/route.ts`
- Pattern: Export `GET`, `POST`, `OPTIONS` (for CORS preflight) functions
- Always validate CORS + inputs (see [src/app/api/README.md](src/app/api/README.md))

### Layout & Pages
- Root layout: [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx) (fonts: Jost, Playfair Display, Satisfy)
- Pages: `src/app/[locale]/(group)/page.tsx`
- Route groups: `(auth)`, `(public)` - organize routes without affecting URL

### Fonts (Pre-configured)
Available CSS variables in all components:
- `--font-jost` - Body text (weights: 200-700)
- `--font-playfair` - Headings (weights: 400-900)
- `--font-satisfy` - Accents/decorative (weight: 400)

## Common Gotchas

1. **Next.js 16 changes:**
   - No `next lint` command (use `npm run lint` with ESLint v9)
   - Proxy file convention: `src/proxy.ts` (NOT `src/middleware.ts` or `src/app/middleware.ts`)

2. **Cloudflare deployment:**
   - NEVER run `wrangler deploy` directly (breaks build)
   - Use `npm run deploy` or `npm run deploy:dev` (includes build step)
   - Dev environment has NO routes (only `workers.dev` subdomain)
   - Requires `.env.wrangler` file with CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN

3. **i18n routing:**
   - ALL pages must be under `src/app/[locale]/`
   - Use `next-intl` routing helpers (`Link`, `useRouter`) NOT Next.js directly
   - Locale detection is explicit (`localeDetection: false` in middleware)
   - Add translations to ALL 3 locales: `src/i18n/messages/{en,es,fr}.json`

4. **Contexts:**
   - Use `use-context-selector` for performance (see [src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx) example)
   - Export custom hooks (`useLanguageContext`) NOT raw context

5. **Git workflow:**
   - PR must pass CI (lint + test) before merge
   - Branches auto-delete after merge

6. **Path imports:**
   - Always use `@/*` alias: `import { apiCall } from '@/lib/api-client';`
   - NEVER use relative paths like `../../lib/api-client`

7. **TypeScript strict mode:**
   - No `any` types allowed
   - All function parameters and returns must be typed
   - Use `interface` for object shapes, `type` for unions/intersections

## When Adding Features

1. **Define types** in `src/types/` or extend existing interfaces
2. **Add Zod schema** to [src/lib/validation.ts](src/lib/validation.ts)
3. **Create API route** following [src/app/api/README.md](src/app/api/README.md) patterns (CORS + validation)
4. **Build component** per [src/components/COMPONENT_PATTERNS.md](src/components/COMPONENT_PATTERNS.md) (XSS prevention)
5. **Add translations** to all 3 locale files: `src/i18n/messages/{en,es,fr}.json`
6. **Write tests** in `.test.tsx` file (Vitest + Testing Library)
7. **Document in Storybook** via `.stories.tsx` if component is reusable
8. **Run lint + test** before committing

## Key Files to Reference

- **[SECURITY.md](SECURITY.md)** - Comprehensive security guide (HIGH/MEDIUM/LOW priority risks), audit results
- **[QUICKSTART.md](QUICKSTART.md)** - Step-by-step screen building guide with validation examples
- **[REVIEW_SUMMARY.md](REVIEW_SUMMARY.md)** - Project health status, dependency audit, security checklist
- **[src/lib/api-client.ts](src/lib/api-client.ts)** - Centralized fetch wrapper with retry, timeout, CSRF headers
- **[src/lib/validation.ts](src/lib/validation.ts)** - All Zod schemas (tours, auth, filters)
- **[src/app/api/README.md](src/app/api/README.md)** - API security patterns (CORS, validation, error handling)
- **[src/components/COMPONENT_PATTERNS.md](src/components/COMPONENT_PATTERNS.md)** - React XSS prevention, safe HTML, input handling
- **[src/i18n/routing.ts](src/i18n/routing.ts)** - Locale configuration
- **[wrangler.toml](wrangler.toml)** - Cloudflare config (prod routes + dev environment)
- **[next.config.js](next.config.js)** - Security headers, dev origins allowlist, OpenNext integration
- **[public/_headers](public/_headers)** - HTTP security headers for static assets

## Testing
- **Unit tests:** Vitest with Testing Library ([src/test/setup.ts](src/test/setup.ts))
- **Run:** `npm test` (single run) or `npm run test:watch` (watch mode)
- **Coverage:** Not configured (add if needed)
- **Component tests:** [src/components/BackToTop/BackToTop.test.tsx](src/components/BackToTop/BackToTop.test.tsx) as example

## Known Issues (from REVIEW_SUMMARY.md)
- **Unused code:** LanguageSelector component has dead code branches
- **Dev vulnerabilities:** 13 low/moderate in dev dependencies (AWS SDK, esbuild) - non-critical
- **Production vulnerabilities:** 0 (as of Feb 2026)
