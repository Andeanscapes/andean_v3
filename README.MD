<div align="center">

<img src="./public/assets/images/logo.png" alt="Andean Scapes Logo" width="200"/>

# 🏔️ Andean Scapes

**Your Digital Nomad Retreat in the Heart of the Colombian Andes**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-orange?style=flat-square&logo=cloudflare)](https://pages.cloudflare.com/)

[Live Demo](https://andean-scapes.pages.dev) · [Report Bug](https://github.com/your-username/andean-scapes/issues) · [Request Feature](https://github.com/your-username/andean-scapes/issues)

</div>

---

## 📖 About The Project

**Andean Scapes** is a **security-first**, multilingual web platform for a unique co-living and adventure experience in the Colombian Andes. Located at Hacienda El Recuerdo in Boyacá, Colombia, this platform enables digital nomads to discover and book:

- 🏡 **Co-living spaces** with stunning mountain views
- 💎 **Emerald mine tours** in Colombia's famous emerald region
- 🌄 **Adventure activities** (hiking, horseback riding, farm experiences)
- 💻 **Remote work retreats** amidst nature

The platform is built with cutting-edge web technologies, optimized for **performance**, **accessibility**, and **security**.

> **Public Repository Notice:** This is a public repo. Never commit secrets, tokens, credentials, or private customer data. All sensitive data must be stored in environment variables and GitHub Secrets.

---

## ⚡ TL;DR — Quick Rules

- **Branching:** `develop` (dev) → PR → `main` (production)
- **Deploy:** Use npm scripts only (`npm run deploy`, `npm run deploy:dev`) — **never** `wrangler deploy` directly
- **UI Components:** **Always** use `/src/components/ui/*` wrappers — **never** use daisyUI classes directly in feature components
- **Security:** Validate ALL input with **Zod** schemas from `src/lib/validation.ts`
- **i18n:** Maintain translations in all 3 languages: `en`, `es`, `fr`
- **State Management:** Use `use-context-selector` for performance-optimized contexts
- **Testing:** Run `npm run lint` and `npm test` before every commit

---

## ✨ Key Features

### 🌍 **Internationalization (i18n)**
- **3 Languages**: English, Spanish, French
- Dynamic locale routing with `next-intl`
- SEO-optimized metadata per language

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with Tailwind CSS 4.x
- **DaisyUI Components**: Pre-styled, accessible UI components
- **Dark/Light Mode**: Theme switcher with persistent preferences
- **Smooth Animations**: Swiper.js carousels, React Parallax effects
- **Photo Gallery**: React Photo Album with Lightbox integration

### ⚡ **Performance & Optimization**
- **Next.js 16** with React 19 Server Components
- **Cloudflare Pages** deployment via OpenNext
- **Image Optimization**: Automatic optimization with Next.js Image
- **Font Optimization**: Self-hosted Google Fonts (Jost, Playfair Display, Satisfy)

### 🎯 **UI Architecture**
- **daisyUI Wrapper Pattern**: All UI components abstracted via `src/components/ui/*`
- **Type-Safe Components**: Fully typed Button, Input, Select, Modal, Card, Badge, etc.
- **Design System Flexibility**: Swap UI libraries by changing only wrapper files
- **Consistent Variants**: Unified sizing, colors, and accessibility patterns

### 🔒 **Security First**
- **Strict TypeScript** configuration (`strict: true`, no `any` types)
- **Security Headers**: HSTS, CSP-ready, X-Frame-Options, Referrer-Policy
- **Input Validation**: All external input validated with **Zod** schemas
- **XSS Protection**: No `dangerouslySetInnerHTML` without sanitization
- **CORS Protection**: Origin validation on all API routes
- **Secret Management**: Environment variables only, never in code

### 🧪 **Testing & Quality**
- **Vitest**: Unit testing setup
- **React Testing Library**: Component testing
- **Storybook**: Component documentation and visual testing
- **ESLint 9**: Flat config with TypeScript support
- **Type Safety**: Full TypeScript coverage

---

## 🛠️ Tech Stack

### **Core**
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.1.6 | React framework with SSR/SSG |
| [React](https://react.dev/) | 19.0.0 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.18 | Utility-first CSS |

### **UI Components & Libraries**
- **DaisyUI** 5.5.18 - Component library built on Tailwind
- **Swiper** 11.0.4 - Modern touch slider
- **React Leaflet** 5.0.0 - Interactive maps
- **React Photo Album** 2.3.0 - Photo gallery
- **Yet Another React Lightbox** 3.15.6 - Image lightbox
- **React Parallax** 3.5.1 - Parallax scrolling effects
- **React Fast Marquee** 1.6.2 - Animated marquees

### **Internationalization**
- **next-intl** 4.7.0 - Type-safe i18n for Next.js

### **Deployment**
- **OpenNext Cloudflare** 1.16.2 - Cloudflare Pages adapter
- **Wrangler** 4.63.0 - Cloudflare CLI

### **State Management**
- **use-context-selector** 1.4.1 - Performance-optimized context (prevents re-render storms)

### **Development Tools**
- **Vitest** 3.2.4 - Test runner
- **Storybook** 8.6.15 - Component explorer
- **ESLint** 9.39.0 - Linting (flat config)
- **Patch Package** 8.0.1 - NPM package patching
- **Zod** (via validation.ts) - Runtime type validation

---

## 🚀 Getting Started

### Prerequisites

**Required:**
- **Node.js**: >= 20.19.0
- **npm**: >= 10.8.2

**Tip**: This repo includes a `.nvmrc` file. If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install
nvm use

```

**Optional (Recommended for Teams):**  
This project uses [Volta](https://volta.sh) to pin Node/npm versions. Install Volta once and it will automatically use the correct toolchain when you enter the project.

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/andean-scapes.git
   cd andean-scapes/andean_v3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.wrangler.example .env.wrangler
   cp .env.wrangler.example .env.local
   ```
   
   Edit `.env.local` and `.env.wrangler` with your configuration:
   ```env
   # .env.local
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   
   # Add your secrets (never commit these!)
   # DATABASE_URL=your_database_url
   # API_SECRET=your_api_secret
   ```
   
   > **⚠️ Security Warning:** `.env.local` and `.env.wrangler` are gitignored. Never commit secrets to version control!

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on `localhost:3000` |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint (max 0 warnings) |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run build-storybook` | Build Storybook for production |
| `npm run preview` | Preview Cloudflare deployment locally |
| `npm run deploy` | 🚀 Deploy to Cloudflare Pages (production) |
| `npm run deploy:dev` | 🔧 Deploy to Cloudflare Pages (dev environment) |
| `npm run cf-typegen` | Generate Cloudflare environment types |

> **⚠️ Important:** Always use npm scripts for deployment. **Never** run `wrangler deploy` directly — it can break the build flow.

---

## 📁 Project Structure

```
andean_v3/
├── .github/                    # GitHub Actions workflows
├── public/                     # Static assets (images, fonts, etc.)
│   └── assets/images/         # Organized by feature
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes (en, es, fr)
│   │   │   ├── (auth)/        # Authentication routes (login, register)
│   │   │   ├── (public)/      # Public routes (landing, booking, tours)
│   │   │   ├── layout.tsx     # Root layout with fonts, theme, i18n
│   │   │   └── not-found.tsx  # 404 page
│   │   └── api/               # API routes (see src/app/api/README.md)
│   │
│   ├── middleware.ts          # Locale routing (localeDetection: false)
│   │
│   ├── components/            # Feature components
│   │   ├── BackToTop/         # Scroll-to-top button
│   │   ├── Footer/            # Site footer
│   │   ├── Header/            # Navigation header
│   │   ├── Hero/              # Hero sections
│   │   ├── LandingSection/    # Landing page sections
│   │   ├── LanguageSelector/  # i18n language picker
│   │   ├── ThemeToggle/       # Dark/light mode switcher
│   │   ├── VideoBanner/       # Video player component
│   │   ├── ui/                # 🎨 daisyUI wrappers (Button, Input, Modal, etc.)
│   │   │   │                  # ⚠️ ALWAYS use these, never daisyUI classes directly
│   │   └── COMPONENT_PATTERNS.md  # Security best practices
│   │
│   ├── constant/              # Static data (Hero, Footer content)
│   │
│   ├── contexts/              # React Context providers
│   │   ├── LanguageContext.tsx
│   │   ├── LayoutContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── i18n/                  # Internationalization
│   │   ├── routing.ts         # Locale routing config
│   │   ├── request.ts         # Server-side i18n setup
│   │   └── messages/          # Translation files (en/es/fr.json)
│   │
│   ├── lib/                   # Utilities & helpers
│   │   ├── api-client.ts      # Fetch wrapper with error handling
│   │   └── validation.ts      # Zod validation schemas (ready to use)
│   │
│   ├── styles/
│   │   └── globals.css        # Global styles + Tailwind imports
│   │
│   ├── test/
│   │   └── setup.ts           # Vitest configuration
│   │
│   └── types/
│       └── ui.ts              # TypeScript type definitions
│
├── .storybook/                # Storybook configuration
├── storybook-static/          # Built Storybook (gitignored)
├── patches/                   # NPM package patches
├── eslint.config.mjs          # ESLint 9 flat config
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── vitest.config.ts           # Vitest configuration
├── wrangler.toml              # Cloudflare Workers config
├── QUICKSTART.md              # 🚀 Quick guide to build features
├── SECURITY.md                # 🔒 Security review & guidelines
└── REVIEW_SUMMARY.md          # 📋 Project audit summary
```

---

## � UI Architecture & Component Pattern

### **daisyUI Wrapper Pattern (CRITICAL)**

✅ **DO:** Use typed wrappers from `src/components/ui/*`
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg">Book Now</Button>
```

❌ **DON'T:** Use daisyUI classes directly
```tsx
// WRONG - Don't do this
<button className="btn btn-primary btn-lg">Book Now</button>
```

### **Why Wrappers?**
1. **Flexibility**: Swap UI libraries (daisyUI → Shadcn, etc.) by changing only wrapper files
2. **Type Safety**: Full TypeScript support with autocomplete for variants, sizes, etc.
3. **Consistency**: Unified design tokens across the entire app
4. **Testability**: Mock UI components easily in tests
5. **Accessibility**: Centralized ARIA attributes and keyboard navigation

### **Suggested Wrappers**
Create these in `src/components/ui/` as needed:
- `Button` (primary, secondary, ghost variants)
- `Input` (text, email, password types)
- `Select` (single, multi-select)
- `Modal` (confirmation, form modals)
- `Card` (content containers)
- `Badge` (status indicators)
- `Alert` (success, error, warning)
- `Spinner` (loading states)
- `Tabs` (navigation)
- `Dropdown` (menus)

---

## �🌍 Internationalization

The project uses **`next-intl`** for robust i18n support:

- **Supported Locales**: `en` (English, default), `es` (Spanish), `fr` (French)
- **URL Pattern**: `/` (English), `/es`, `/fr`
- **Locale Prefix**: `as-needed` (English stays unprefixed)
- **Translation Files**: `src/i18n/messages/{locale}.json`
- **Middleware**: `src/middleware.ts` with `localeDetection: false`

### **Adding a New Language**

1. Add the locale to `src/i18n/routing.ts`:
   ```typescript
   export const locales = ['en', 'es', 'fr', 'de'] as const; // Add 'de'
   ```

2. Create `src/i18n/messages/de.json` with translations

3. Test with `/de/...` routes

> **⚠️ Non-negotiable:** Add translations to **all 3 files** (`en.json`, `es.json`, `fr.json`) for every new key. Missing translations will cause runtime errors.

---

## 🎨 Theming & Styling

### Tailwind CSS Configuration
- **Version**: 4.1.18 (latest)
- **Plugin**: `@tailwindcss/postcss`
- **DaisyUI Themes**: Configured with custom patches

### Available Themes
The app supports light/dark modes via `ThemeContext`:
- Toggle via `<ThemeToggle />` component
- Persisted in `localStorage`

### Custom Fonts
- **Body**: Jost (200-700 weights)
- **Headings**: Playfair Display (400-900 weights)
- **Accent**: Satisfy (cursive)

All fonts are optimized with `next/font` for best performance.

---

## 🔄 State Management

### **Performance-Optimized Contexts**

This project uses `use-context-selector` instead of plain React Context to **prevent re-render storms**.

**Why?** Plain Context re-renders all consumers when any value changes. `use-context-selector` lets components subscribe to specific slices.

**Example:**
```typescript
import { createContext, useContextSelector } from 'use-context-selector';

// Create context
const UserContext = createContext<UserContextType | null>(null);

// Provider (same as React Context)
<UserContext.Provider value={value}>{children}</UserContext.Provider>

// Consumer (only re-renders when username changes)
const username = useContextSelector(UserContext, (ctx) => ctx?.username);
```

**Existing Contexts:**
- `LanguageContext` (`src/contexts/LanguageContext.tsx`)
- `ThemeContext` (`src/contexts/ThemeContext.tsx`)
- `LayoutContext` (`src/contexts/LayoutContext.tsx`)

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test          # Run once
npm run test:watch    # Watch mode
```

### Component Tests
Tests are located alongside components:
```
src/components/BackToTop/
├── BackToTop.tsx
├── BackToTop.test.tsx
└── BackToTop.stories.tsx
```

### Storybook
```bash
npm run storybook           # Dev mode
npm run build-storybook     # Build static site
```

---

## 🚢 Deployment

### **Cloudflare Pages (Primary)**

This project is optimized for **Cloudflare Pages** using **OpenNext**.

#### **Environments**
- **Production:** `andeanscapes.com` (from `main` branch)
- **Development:** `andean-v3-dev.workers.dev` (from `develop` branch)

#### **Deployment Commands**

**1. Preview Locally (Cloudflare Workers simulator):**
```bash
npm run preview
```

**2. Deploy to Production:**
```bash
npm run deploy  # Deploys to main environment
```

**3. Deploy to Dev Environment:**
```bash
npm run deploy:dev  # Deploys to dev environment
```

> **⚠️ CRITICAL RULE:** Always use npm scripts. **Never** run `wrangler deploy` directly — it bypasses the OpenNext build process and can break the deployment.

#### **Required Files**
Ensure these exist:
- `.env.wrangler` (local secrets, see `.env.wrangler.example`)
- `wrangler.toml` (Cloudflare configuration)
- `open-next.config.ts` (OpenNext adapter config)

### **Environment Variables on Cloudflare**

Add these in your Cloudflare Pages dashboard under **Settings → Environment Variables**:

**Public Variables:**
- `NEXT_PUBLIC_SITE_URL` (e.g., `https://andeanscapes.com`)
- `NEXT_PUBLIC_API_URL` (e.g., `https://andeanscapes.com/api`)

**Secret Variables (never commit):**
- `DATABASE_URL`
- `API_SECRET`
- `STRIPE_SECRET_KEY`
- Any authentication tokens

### Vercel Alternative

If deploying to Vercel:
```bash
npm run build
```
Then connect your GitHub repo to Vercel.

---

## 🔒 Security (CRITICAL)

This app handles **sensitive data** (accounts, personal info, payments). Treat **all input as hostile**.

### **Security Checklist**

✅ **Strict TypeScript** (`strict: true`, no `any` allowed)  
✅ **HTTP Security Headers** (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)  
✅ **Input Validation** — ALL external input validated with Zod  
✅ **XSS Protection** — No `dangerouslySetInnerHTML` without sanitization  
✅ **CORS Protection** — Origin validation on API routes  
✅ **Secret Management** — Environment variables only, never in code  
✅ **0 Production Vulnerabilities** (npm audit --omit=dev clean)  

### **Key Security Patterns**

#### **1. Validate All Input (Zod)**
Schemas live in `src/lib/validation.ts`:
```typescript
import { tryValidate, tourFilterSchema } from '@/lib/validation';

const { success, errors } = tryValidate(tourFilterSchema, req.body);
if (!success) {
  return NextResponse.json({ code: 'VALIDATION_ERROR', errors }, { status: 400 });
}
```

Validate:
- Request bodies
- Query parameters
- Route parameters
- User uploads

#### **2. API Routes (CORS + Validation)**
Follow patterns in `src/app/api/README.md`:
```typescript
// Validate origin
const origin = request.headers.get('origin');
if (!allowedOrigins.includes(origin)) {
  return new Response('Forbidden', { status: 403 });
}

// Validate input
const { success, data, errors } = tryValidate(schema, body);

// Normalized errors
return NextResponse.json(
  { code: 'VALIDATION_ERROR', message: 'Invalid input', errors },
  { status: 400 }
);
```

#### **3. XSS Prevention**
❌ **Never** use `dangerouslySetInnerHTML` without sanitization
✅ Use plain React rendering (automatically escapes)
✅ If HTML required: sanitize with DOMPurify and document why

#### **4. Secret Management**
- Store secrets in `.env.local` (gitignored)
- Use GitHub Secrets for CI/CD
- Never hardcode API keys, tokens, or passwords
- Prefix public vars with `NEXT_PUBLIC_` only when necessary

📚 **Read More**: See [SECURITY.md](SECURITY.md) for comprehensive security guidelines and [COMPONENT_PATTERNS.md](src/components/COMPONENT_PATTERNS.md) for secure React patterns.

---

## 📚 Documentation

| File | Description |
|------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | 🚀 Build your first feature in 5 minutes |
| [SECURITY.md](SECURITY.md) | 🔒 Security audit & best practices |
| [REVIEW_SUMMARY.md](REVIEW_SUMMARY.md) | 📋 Project audit summary |
| [src/components/COMPONENT_PATTERNS.md](src/components/COMPONENT_PATTERNS.md) | ⚛️ React security patterns |
| [src/app/api/README.md](src/app/api/README.md) | 🔌 API route security patterns |

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Current)
- [x] Project setup with Next.js 16
- [x] Internationalization (3 languages)
- [x] Responsive UI with Tailwind & DaisyUI
- [x] Security headers & best practices
- [x] Cloudflare Pages deployment

### Phase 2: Core Features (Next)
- [ ] Tour listing & filtering
- [ ] Tour detail pages
- [ ] Booking system
- [ ] User authentication (NextAuth.js)
- [ ] Payment integration (Stripe)

### Phase 3: Advanced Features
- [ ] Admin dashboard
- [ ] Content management system
- [ ] Blog/news section
- [ ] Review & rating system
- [ ] Real-time availability
- [ ] Email notifications

---

## 🌿 Git Workflow

### **Branching Strategy**

```
main (production)    ←  PR + CI  ←  develop (dev)  ←  feature branches
```

- **`main`**: Production branch (requires PR + CI approval)
- **`develop`**: Development branch (PR required)
- **`feature/*`**: Feature branches (merge to `develop`)

### **Workflow**

1. **Create feature branch:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes, commit:**
   ```bash
   git add .
   git commit -m "feat: add tour booking form"
   ```

3. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   Open PR to `develop` on GitHub

4. **After approval, squash merge**

### **Merge Strategy**
- **Squash only** (keeps main/develop history clean)
- All commits squashed into single commit with descriptive message

### **Secrets Management**
- Secrets stored in **GitHub repo settings** (Settings → Secrets and variables)
- Never commit secrets to any branch
- Use `.env.*.example` files as templates

### **CI/CD**
- **GitHub Actions** runs on PR to `main`
- Checks: linting, tests, type checking, build
- Auto-deploys to Cloudflare on merge to `main` or `develop`

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### **Contribution Process**

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes following the rules below
4. Commit your Changes (`git commit -m 'feat: add some amazing feature'`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request to `develop`

### **Non-Negotiable Rules** ⚠️

These rules are **mandatory** for all contributions:

1. **Security First**
   - Validate ALL external input with Zod schemas
   - Follow API patterns from `src/app/api/README.md`
   - Never use `dangerouslySetInnerHTML` without sanitization
   - No hardcoded secrets or credentials

2. **UI Architecture**
   - **Always** use `src/components/ui/*` wrappers
   - **Never** use daisyUI classes directly in feature components
   - Create new wrappers if needed

3. **Internationalization**
   - Maintain translations in **all 3 languages** (`en`, `es`, `fr`)
   - Add new keys to all `src/i18n/messages/*.json` files
   - Test with all locales

4. **Type Safety**
   - No `any` types (use `unknown` + type guards)
   - Follow TypeScript strict mode
   - Use path alias `@/*` for imports

5. **Testing & Quality**
   - Run `npm run lint` (must pass with 0 warnings)
   - Run `npm test` (all tests must pass)
   - Write tests for new features
   - Update Storybook for new UI components

6. **Minimal Changes**
   - Don't refactor existing code unless explicitly requested
   - Keep diffs focused on the feature/fix
   - Avoid "while I'm here" changes

### **Commit Message Convention**
```
feat: add tour booking confirmation email
fix: resolve payment validation error
docs: update API documentation
test: add tests for booking flow
chore: update dependencies
```

---

## ⚠️ Known Issues

- **LanguageSelector Component**: Contains dead code branches that need cleanup
- **Dev Dependencies**: Low/moderate severity vulnerabilities exist in dev tools (non-blocking)
- **Production Dependencies**: ✅ 0 vulnerabilities (as of February 2026)
- **Test Coverage**: Limited (only 1 test file currently)
- **Rate Limiting**: Not implemented yet (Cloudflare provides baseline protection)

See [REVIEW_SUMMARY.md](REVIEW_SUMMARY.md) for full audit details.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Andean Scapes**  
- Email: [andeanscapes@gmail.com](mailto:andeanscapes@gmail.com)
- WhatsApp: [+57 319-2510498](https://wa.me/573192510498)
- Location: Hacienda El Recuerdo, Mundo Nuevo - Ubalá, Boyacá, Colombia

**Project Links:**
- Repository: [https://github.com/your-username/andean-scapes](https://github.com/your-username/andean-scapes)
- Live Site: [https://andean-scapes.pages.dev](https://andean-scapes.pages.dev)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com/) - Tailwind CSS component library
- [next-intl](https://next-intl-docs.vercel.app/) - Internationalization for Next.js
- [Cloudflare Pages](https://pages.cloudflare.com/) - Fast, secure hosting
- [OpenNext](https://open-next.js.org/) - Open-source Next.js adapter

---

<div align="center">

**Made with ❤️ for Digital Nomads exploring the Colombian Andes**

</div>
