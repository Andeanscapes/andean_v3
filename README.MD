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
- 🧪 **Well-Tested**: 127+ unit tests covering core features and performance patterns

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
│   └── validation.ts       # Centralized input validation
├── contexts/               # React context (theme, language, reservation)
├── i18n/                   # next-intl config, messages per locale
└── test/                   # Test utilities + setup
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
npm run dev          # Start dev server (localhost:3000)
npm run lint         # Check code quality
npm test             # Run tests
npm run build        # Build for production
```

### Cloudflare Deployment
```bash
npm run deploy       # Deploy to production
npm run deploy:dev   # Deploy to dev environment
```

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

- **Coverage**: 127+ tests across components, services, and utilities
- **Media Tests**: Responsive images, media queries, lazy attributes validated
- **Pattern**: Provider-wrapped components use `src/test/test-utils.tsx`
- **CI Ready**: Deterministic tests, no network calls in unit tests

Run tests:
```bash
npm test           # Single run
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
- **Component Stories**: `npm run storybook` to explore UI components
- **i18n**: Messages in `src/i18n/messages/{en,es,fr}.json`
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
