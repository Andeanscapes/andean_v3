# Andean Scapes

> Discover Colombia's hidden treasures through immersive eco-tourism experiences

![Andean Scapes](./public/assets/images/logo.png)

## Overview

**Andean Scapes** is a modern, high-performance web platform for booking eco-tourism experiences in the Colombian Andes. Built with cutting-edge web technologies, it delivers fast, accessible, and multilingual booking experiences for travelers worldwide.

## ✨ Key Features

- 🌍 **Multilingual Support**: English, Spanish, and French with real-time locale switching
- 📱 **Mobile-First Design**: Responsive across all devices with optimized media delivery
- ⚡ **Performance Optimized**: Cloudflare deployment with smart asset caching and lazy loading
- 🎥 **Adaptive Videos**: WebM + MP4 hero videos with automatic quality selection based on device
- 📸 **Smart Image Loading**: Responsive `<picture>` elements with mobile/desktop variants
- 🎯 **SEO Ready**: Server-side rendering with dynamic metadata per experience
- 🔐 **Secure by Default**: Input validation, CORS policies, and safe external links
- ♿ **Accessible**: WCAG compliance with reduced-motion respect and semantic HTML
- 🧪 **Well-Tested**: 402 unit tests covering core features and performance patterns

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 + daisyUI |
| **i18n** | next-intl (en, es, fr) |
| **State** | use-context-selector |
| **Validation** | Zod |
| **Testing** | Vitest + Testing Library |
| **Deployment** | Cloudflare Pages |

## 📁 Project Structure

```
fixtures/                   # Gitignored local copies of the remote feed (see Data Source)
│   └── v2/                 # Hand-authored v2 payloads, local-only, not published yet
scripts/
├── lib/feed.ts             # Shared base-URL resolution + timed fetch for the CLI scripts
├── fetch-fixtures.ts       # Downloads the feed into fixtures/ (runs via `pretest`)
└── verify-feed.ts          # Validates the live feed against the app's schemas (CI gate)
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Locale-aware routing
│   │   ├── (public)/       # Public-facing pages + header/footer
│   │   └── (auth)/         # Protected routes
│   ├── api/                # API routes, isomorphic validation
│   └── providers.tsx       # Global providers (theme, intl, etc.)
├── components/
│   ├── ui/                 # Reusable button, input, badge, etc.
│   ├── ExperienceList/     # Card list with responsive images
│   └── ExperienceReservation/
│       ├── ExperienceHero.tsx    # Adaptive video hero
│       └── ...experience form flow
├── lib/
│   ├── services/           # Business logic: data fetching, translations
│   ├── schemas/            # Zod validators + TypeScript types
│   ├── remote-data.ts      # Remote feed fetcher (validation + timeout + logging)
│   └── validation.ts       # Centralized input validation
├── contexts/               # React context (theme, language, reservation)
├── i18n/                   # next-intl config, messages per locale
└── test/
    ├── fixtures/           # Loader for the local feed copies in `fixtures/`
    └── test-utils.tsx      # Provider wrappers + setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js ≥20.19.0
- npm ≥10.8.2

### Installation
```bash
git clone <repo>
cd andean-scapes
npm install
```

### Development
```bash
npm run dev             # Start dev server (localhost:3000)
npm run lint            # Check code quality
npm run typecheck       # tsc --noEmit
npm test                # Run tests (pretest downloads the feed into fixtures/)
npm run fixtures:fetch  # Refresh the local feed copies on demand
npm run build           # Build for production (requires REMOTE_DATA_BASE_URL)
npm run verify:feed     # Validate the live remote feed
```

Create local configuration after cloning. `.env.example` is a blank template —
copy it and fill in the values, which are listed in [Data Source](#-data-source).
Real env files are gitignored and must never contain credentials:

```bash
cp .env.example .env.local
```

A fresh clone does need **network on the first `npm test`**: the feed payloads are
not committed, so `pretest` downloads them. After that the copies on disk are
reused and tests run offline.

### Cloudflare Deployment
```bash
npm run deploy       # Deploy to production
npm run deploy:dev   # Deploy to dev environment
```

## 🗃️ Data Source

All site data is fetched at runtime from a remote JSON feed. **There are no local
mocks** — the feed is the single source of truth.

| Feed file | Drives |
|---|---|
| `landing.json` | Landing page |
| `experiences-list.json` | `/experiences` cards + route/SEO metadata |
| `experience-<kebab-id>.json` | Experience detail + booking pages |

Base URL is `REMOTE_DATA_BASE_URL` (currently `https://cdn.andeanscapes.com/services`).
It's public config, not a credential. Resolution order
(highest precedence first):

| Source | Applies to |
|---|---|
| Shell / CI `env:` | overrides everything |
| `.env.local` (gitignored) | `next dev` / `next build` on your machine |
| `wrangler.toml` `[vars]` | deployed Worker runtime |

The GitHub Actions variables `REMOTE_DATA_BASE_URL_PROD` / `_DEV` supply the
build-time value in CI and must stay in sync with `wrangler.toml`.

### Local values to put in `.env.local`

All three are public configuration, not credentials — the two `NEXT_PUBLIC_`
ones are compiled into the browser bundle and are already visible in any
rendered page.

| Variable | Value | Needed at | Required |
|---|---|---|---|
| `REMOTE_DATA_BASE_URL` | `https://cdn.andeanscapes.com/services` | build + Worker runtime | yes |
| `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` | the public business number, digits only | build only | yes |
| `NEXT_PUBLIC_CDN_BASE_URL` | defaults to `https://cdn.andeanscapes.com` | build only | no — override only |

CI therefore needs **three** repository Variables: `REMOTE_DATA_BASE_URL_PROD`,
`REMOTE_DATA_BASE_URL_DEV` and `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER`. There is
deliberately no Variable for `NEXT_PUBLIC_CDN_BASE_URL`: its value would only
restate the in-code default, and an unset Variable inlines as `''` rather than
`undefined`, which is a way to break every image URL for no benefit.

> **An empty value is not the same as unset.** An unset Actions variable resolves
> to `''`, and the build fails with an opaque `Failed to collect page data`. Every
> workflow checks all required build variables before expensive work begins.
>
> The CLI scripts run under `vite-node`, which does not load `.env` files at all —
> see [Testing against the feed locally](#testing-against-the-feed-locally).

`src/lib/remote-data.ts` fetches, validates against the same Zod schema used
everywhere else, aborts after 5s, and logs one line per read:

```
[RemoteData] remote /landing.json 84ms
[RemoteData] local  /landing.json 58ms reason="HTTP 404 from https://..."
```

Watch it live with `npx wrangler tail | grep RemoteData`.

**There is no fallback.** If the feed is unavailable or fails schema validation,
the service throws and `src/app/[locale]/error.tsx` renders a localized error with
a retry. Content changes are made by editing and re-uploading the feed JSON.

Validate the live feed before and after an upload:

```bash
REMOTE_DATA_BASE_URL=https://cdn.andeanscapes.com/services npm run verify:feed
```

It checks every file exists, satisfies its Zod schema, references only keys that
exist in en/es/fr, and has future availability. It also runs in CI.

### Testing against the feed locally

```bash
# serve a local copy as a stand-in for the CDN
python3 -m http.server 8787 --directory <folder-with-feed-json>
REMOTE_DATA_BASE_URL=http://localhost:8787 npm run dev
```

Tests never hit the network — they stub `fetch` and serve local copies of the
feed. Those payloads are real business data, so they are **not committed**: they
live in the gitignored `fixtures/` directory and are downloaded on demand.

```bash
npm run fixtures:fetch   # also runs automatically via `pretest`
```

`npm test` therefore always checks against what is actually published. Offline,
the script keeps the copy already on disk and warns instead of failing.

The script reads `REMOTE_DATA_BASE_URL` from the **shell only** — `vite-node` does
not load `.env` files, so a `.env.local` override applies to `npm run dev` but not
to `npm test`. To test against a local feed, export it inline:

```bash
REMOTE_DATA_BASE_URL=http://localhost:8787 npm test
```

Without the variable it falls back to the committed production URL and says so.
In CI that fallback is refused, so a missing repository variable fails the job
instead of quietly testing production.

`fixtures/v2/` holds the hand-authored v2 payloads. They are not published
anywhere yet, so nothing can re-download them — keep a backup outside the repo.
Without them `src/test/feed-v2/contract.test.ts` **skips**, which means CI never
runs it; see the Publishing section of `docs/V2_REMOTE_RESOURCES_MIGRATION.md`.

The v1 and v2 sets share filenames because both are named after the CDN path they
serve — `fixtures/README.md` (the only committed file in that directory) explains
which is which.

## 📊 Performance Highlights

### Image Optimization
- **Responsive Delivery**: Mobile gets 740×700 `.webp` (~150–200 KB); Desktop gets same size (~200–300 KB)
- **Lazy Loading**: `loading="lazy"` + `decoding="async"` for all images below fold
- **Code Splitting**: Experience card images load via React lazy + Suspense
- **Smart Fallback**: Gradient skeleton + icon shown during image load

### Video Optimization
- **Hero Videos**: WebM (VP9) primary, MP4 (H.264) fallback
- **Mobile Aware**: Conditional rendering based on viewport + `prefers-reduced-motion`
- **Intelligent Preload**: `preload="metadata"` on desktop, `preload="none"` on mobile
- **Aggressive Caching**: 1-year immutable cache on Cloudflare for all video assets

### SEO & Metadata
- Server-side rendering for all experience routes
- Dynamic `generateMetadata()` per experience
- i18n-aware Open Graph tags (en/es/fr)

## 🌐 i18n Architecture

- **Default Locale**: English (unprefixed, e.g., `/experiences`)
- **Other Locales**: Prefixed (e.g., `/es/experiences`, `/fr/experiences`)
- **Middleware**: Auto-detects locale but respects user override via URL
- **Key-Based Config**: Experience data stores translation keys; service resolves text at runtime

Example:
```typescript
// Stored in config
{ titleKey: 'experiences.emeraldMining.title' }

// Resolved at runtime
title: t('experiences.emeraldMining.title') // → "Emerald Mining Adventure"
```

## 🔐 Security & Validation

- **Input Validation**: All API requests validated with Zod schemas in `src/lib/validation.ts`
- **URL Safety**: Rejects unsafe schemes (`javascript:`, `data:`); enforces `noopener noreferrer`
- **XSS Prevention**: No `dangerouslySetInnerHTML` without sanitization
- **CORS Policy**: Defined via `next.config.js` and `public/_headers`
- **Secrets**: Never stored in code; use environment variables only

## 🧪 Testing

- **Coverage**: 402 tests across components, services, and utilities
- **Media Tests**: Responsive images, media queries, lazy attributes validated
- **Pattern**: Provider-wrapped components use `src/test/test-utils.tsx`
- **Deterministic**: no test makes a network call — service tests stub `fetch` and
  serve the local feed copies. The only network access is the `pretest` download,
  which happens before Vitest starts.

Run tests:
```bash
npm test           # Single run (pretest downloads the feed first)
npm run test:watch # Watch mode
```

## 📝 Architecture Decisions

### Why `ExperienceCardImage` component?
- **Reusable**: Single point for media optimization across experience cards
- **Maintainable**: Media queries, lazy loading, loading state all in one place
- **Testable**: Responsive behavior, Suspense fallbacks covered by tests

### Why `<picture>` over Next.js Image `sizes` alone?
- `<picture>` with media queries ensures mobile browsers fetch mobile image *before* rendering
- Next.js Image `sizes` prop is advisory; browser may ignore and fetch desktop if early in layout
- For mobile users on slow 3G: `<picture>` saves ~100–150 KB per card load

### Why Suspense at page level?
- Defers image component code-splitting to when page hydrates
- Fallback skeleton shows while component bundle loads (handles slow connections)
- In-component skeleton handles image bytes download

## 🗺️ Experience Routes

| Route | Experience |
|-------|-----------|
| `/experiences/emerald-mining-adventure` | Emerald Mining Adventure (2D/1N) |
| Future | Andean Culture Route |
| Future | Nature Escape |

## 📚 Documentation

- **Architecture**: See `.github/copilot-instructions.md` for full technical baseline
- **Roadmap / future architecture**: `docs/ARCHITECTURE_PLAN.md`
- **Feed v2 contract + publish order**: `docs/V2_REMOTE_RESOURCES_MIGRATION.md`
- **Component Stories**: `npm run storybook` to explore UI components
- **Data feed**: See [Data Source](#-data-source) — remote JSON, no local mocks
- **i18n**: Messages in `src/i18n/messages/{en,es,fr}.json` (bundled at build, not part of the remote feed)
- **Types**: Core schemas in `src/lib/schemas/`

## 🛣️ Roadmap

- [ ] Experience gallery pages
- [ ] Advanced booking calendar with availability sync
- [ ] Payment integration (Stripe/PSE)
- [ ] User account dashboard
- [ ] Instagram feed integration
- [ ] Blog integration

## 🤝 Contributing

1. Read `.github/copilot-instructions.md` for AI and architecture guidelines
2. Create feature branch: `git checkout -b feature/your-feature`
3. Test locally: `npm test` + `npm run lint`
4. Submit PR with description of changes

## 📄 License

Private project. All rights reserved.

## 🙋 Support

For questions or technical issues, refer to `.github/copilot-instructions.md` or contact the development team.

---

**Built with ❤️ for eco-tourism in the Colombian Andes**
