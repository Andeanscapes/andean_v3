# 🔐 Andean V3 - Security & Architecture Review

**Date:** February 6, 2026  
**Node Version:** >=20.19.0  
**Next.js:** 16.1.6 | **React:** 19.0.0  
**Deployment:** Cloudflare Pages (OpenNext)

---

## 📊 Audit Summary

| Aspect | Status | Details |
|--------|--------|---------|
| **Production Vulnerabilities** | ✅ **CLEAN** | npm audit --omit=dev: 0 vulnerabilities |
| **Dev Vulnerabilities** | ⚠️ **11 low, 2 moderate** | AWS SDK + esbuild (non-critical dev tools) |
| **Security Headers** | ✅ **CONFIGURED** | HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy |
| **TypeScript** | ✅ **STRICT** | tsconfig.json: `strict: true` |
| **Environment Secrets** | ✅ **PROTECTED** | .env.wrangler in .gitignore; .env.wrangler.example as template |
| **Linting** | ⚠️ **SETUP** | ESLint v9 flat-config configured; real issues in code (unused vars, empty blocks) |

---

## 🛡️ Security Strengths

### 1. **Dependency Management**
- ✅ Production code has **zero vulnerabilities**
- ✅ Locked npm version (10.8.2) + Volta pinning ensures reproducible builds
- ✅ package-lock.json committed (prevents drift)
- ✅ Modern, actively maintained libraries:
  - Next.js 16 (latest)
  - React 19 (latest)
  - TypeScript 5 (strict mode)

### 2. **HTTP Security Headers** (Auto-Applied)
```
Header                         Value
─────────────────────────────────────────────────────
X-Content-Type-Options        nosniff           → Prevents MIME-sniffing
Referrer-Policy              strict-origin-when-cross-origin → Limits referrer leak
X-Frame-Options              SAMEORIGIN        → Prevents clickjacking
Permissions-Policy           camera, microphone, payment, usb blocked → API access lockdown
Strict-Transport-Security    max-age=1yr (PROD) → Forces HTTPS in prod
```

### 3. **Middleware & i18n Routing**
- ✅ `localeDetection: false` in middleware → No automatic browser language detection (better security)
- ✅ Explicit locale routing under `app/[locale]` → No ambiguous URL handling
- ✅ Matcher ignores `_next`, `api`, `_vercel`, static files

### 4. **TypeScript & Type Safety**
- ✅ `strict: true` catches null/undefined/implicit any errors at compile time
- ✅ Defined types structure (`src/types/ui.ts`) prevents runtime surprises
- ✅ Path aliases `@/*` reduce import confusion and refactor risk

### 5. **Deployment (Cloudflare Edge)**
- ✅ Runs on Cloudflare Workers (edge computing) → DDoS protection, WAF, automatic HTTPS
- ✅ OpenNext abstraction handles Next.js → Edge transformation
- ✅ Built-in region failover and caching at edge

---

## ⚠️ Security Risks & Recommendations

### **HIGH PRIORITY** 🔴

#### 1. **Env Secrets Exposure** 
**Risk:** `.env.wrangler` (with real credentials) can be accidentally committed despite .gitignore

**Action:**
```bash
# Add a git hook to prevent commits of secret files
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
if git diff --cached --name-only | grep -E "\.env\.wrangler|\.env\.local"; then
  echo "ERROR: .env files must not be committed!"
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
```

**Better:** Use [husky](https://typicode.io/husky/) for reliable git hooks:
```bash
npm install -D husky
npx husky install
npx husky add .husky/pre-commit 'git diff --cached --name-only | grep -E "\.env\." && echo "ERROR: .env files detected" && exit 1'
```

---

#### 2. **CORS & API Security Not Configured**
**Risk:** No CORS headers defined; if you add `src/app/api/` routes, they default to permissive origin handling

**Action:** Create [API route template](src/app/api/README.md) documenting:
```typescript
// src/app/api/example/route.ts
export async function GET(request: Request) {
  // Check origin
  const origin = request.headers.get('origin');
  if (!['https://andeanscapes.com', 'https://www.andeanscapes.com'].includes(origin)) {
    return new Response('Unauthorized', { status: 403 });
  }
  // ... handler
}
```

---

#### 3. **Unused & Dead Code in LanguageSelector**
**Location:** [src/components/LanguageSelector/LanguageSelector.tsx](src/components/LanguageSelector/LanguageSelector.tsx)

**Issues Found:**
- `Link` imported but never used (L7)
- `isDarkDropdown` state created but never used (L34)
- Empty catch blocks (L76, L83) → errors silently ignored
- `any` type used (L75)

**Fix:**
```typescript
// Remove unused imports and state, add proper error handling
try {
  // ... code
} catch (error) {
  console.error('Failed to toggle dark mode:', error);
  // Optionally: toast.error('Theme change failed')
}
```

---

### **MEDIUM PRIORITY** 🟡

#### 4. **Missing Content Security Policy (CSP)**
**Status:** Not implemented (intentional default-open)

**Why it matters:** Without CSP, malicious scripts can run if a dependency is compromised

**Action:** Gradual rollout (for public sites, start permissive):
```javascript
// next.config.js → async headers()
async headers() {
  return [{
    source: '/:path*',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; img-src 'self' data: https:;"
      }
    ]
  }];
}
```

**Note:** Tighten `unsafe-inline` → `nonce` as you mature.

---

#### 5. **Image Optimization & Static File Exposure**
**Status:** Public assets folder at `/public/assets/images/` + Instagram feed component

**Risk:** User-uploaded content (if future feature) needs:
- Image validation (MIME type, size, dimensions)
- Rate limiting on image endpoints
- CDN caching headers (already set for `/_next/static/*`)

**Action:** When building image upload:
```typescript
// src/lib/image-upload.ts
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export async function validateImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid image format');
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error('Image too large');
  }
  // Additional: virus scan if handling UGC
}
```

---

#### 6. **Monitoring & Error Logging**
**Status:** Not visible in codebase

**Risk:** Errors silently fail; security events not tracked

**Recommendation:** Integrate one of:
- **Sentry** (error tracking + performance)
- **LogRocket** (session replay for debugging)
- **DataDog** (full observability)

**Minimal Setup (Sentry):**
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  environment: process.env.NODE_ENV
});
```

---

### **LOW PRIORITY** 🟢

#### 7. **Testing Coverage**
**Status:** Storybook + Vitest configured; BackToTop.test.tsx exists

**Note:** Only 1 test file visible. Expand coverage for:
- Context providers (LanguageContext, ThemeContext, LayoutContext)
- API routes (once created)
- Middleware (i18n routing)

---

#### 8. **Build Output Security**
**Status:** `.next`, `.open-next` in `.gitignore` (good)

**Recommendation:** Also ignore in production builds:
- Disable source maps in production:
```javascript
// next.config.js
productionBrowserSourceMaps: false,
```

---

#### 9. **Rate Limiting & Bot Protection**
**Status:** Relies on Cloudflare's default WAF

**For future API routes:** Add [rate-limit library](https://github.com/vercel/examples/blob/main/edge-functions/rate-limit/lib/rate-limit.ts):
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 req per 10 sec
});
```

---

## 🏗️ Architecture Recommendations

### **1. Feature Folder Structure** (as you scale)
```
src/
├── app/
│   └── [locale]/
│       ├── (auth)/
│       │   └── login/
│       │       ├── page.tsx
│       │       ├── layout.tsx
│       │       └── __tests__/login.test.tsx
│       ├── (public)/
│       │   ├── page.tsx
│       │   └── layout.tsx
│       └── api/
│           ├── auth/[...nextauth]/route.ts
│           ├── tours/
│           │   ├── route.ts (GET list, POST create)
│           │   └── [id]/
│           │       ├── route.ts (GET, PATCH, DELETE)
│           │       └── __tests__/[id].test.ts
│
├── components/
│   ├── common/ (used everywhere)
│   │   ├── Button/
│   │   ├── Card/
│   │   └── Modal/
│   ├── tours/ (tour-specific)
│   │   ├── TourCard/
│   │   ├── TourFilters/
│   │   └── __tests__/
│   └── auth/
│
├── lib/
│   ├── api-client.ts (fetch wrapper with error handling)
│   ├── auth.ts (session helpers)
│   ├── validate.ts (zod/yup schemas)
│   └── hooks/
│       ├── useTours.ts
│       ├── useAuth.ts
│       └── useLocalStorage.ts
│
├── server/
│   ├── db/
│   │   ├── schema.ts (if using prisma/drizzle)
│   │   └── client.ts
│   ├── auth/
│   │   └── nextauth.config.ts
│   └── actions/
│       ├── tours.ts (server actions)
│       └── auth.ts
│
├── types/
│   ├── api.ts (request/response types)
│   ├── domain.ts (Tour, User, etc.)
│   └── ui.ts (existing)
│
└── utils/
    ├── cn.ts (classname helpers)
    ├── format.ts (dates, prices, etc.)
    └── constants.ts
```

### **2. Error Handling Strategy**
```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

// In API routes:
try {
  // ...
} catch (error) {
  if (error instanceof AppError) {
    return Response.json({ error: error.code }, { status: error.statusCode });
  }
  // Log to Sentry
  return Response.json({ error: 'internal_error' }, { status: 500 });
}
```

### **3. Data Validation** (before any DB/API call)
```bash
npm install zod
# or npm install yup
```

```typescript
// src/lib/validate.ts
import { z } from 'zod';

export const tourFilterSchema = z.object({
  search: z.string().min(1).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  region: z.enum(['north', 'south', 'center']).optional(),
});

// In API route:
const filters = tourFilterSchema.parse(req.nextUrl.searchParams);
```

### **4. Environment Variables** (organized)
```bash
# .env.wrangler.example

# Cloudflare
CLOUDFLARE_API_TOKEN=sk_***
CLOUDFLARE_ACCOUNT_ID=***

# Database (if using Postgres/MySQL)
DATABASE_URL=postgresql://user:pass@host/db

# Auth (NextAuth, Auth0, etc.)
NEXTAUTH_SECRET=***
NEXTAUTH_URL=https://andeanscapes.com

# Third-party APIs
INSTAGRAM_ACCESS_TOKEN=***
STRIPE_SECRET_KEY=sk_***
SENDGRID_API_KEY=***

# Monitoring
SENTRY_DSN=https://***@sentry.io/***

# Features (feature flags)
ENABLE_BOOKING=true
ENABLE_INSTAGRAM_FEED=true
```

---

## 📋 Immediate Action Checklist

**Before launching pages/screens:**

- [ ] **Add git hooks** (husky) to prevent `.env` commits
- [ ] **Add Sentry** for error tracking (production requirement)
- [ ] **Fix ESLint warnings:**
  - [ ] Remove unused `Link` import from LanguageSelector
  - [ ] Replace empty catch blocks with error logging
  - [ ] Replace `any` with proper types
  - [ ] Remove unused state variables

- [ ] **API Security Template:** Create [src/app/api/README.md](src/app/api/README.md) with CORS + auth examples
- [ ] **Secrets Review:** Audit `.env.wrangler` contents; ensure no secrets in `.env.example`
- [ ] **CSP Roadmap:** Document plan for implementing Content-Security-Policy
- [ ] **Test Coverage:** Expand Vitest to cover contexts + future routes
- [ ] **Documentation:** Create [SECURITY.md](SECURITY.md) in repo root

---

## 🚀 Nice-to-Haves for Future Sprints

| Feature | Benefit | Effort |
|---------|---------|--------|
| **NextAuth.js** | Secure auth (OAuth, credentials, MFA) | Medium |
| **Prisma ORM** | Type-safe database queries | Medium |
| **tRPC** | End-to-end type safety for APIs | Medium |
| **Playwright E2E Tests** | Catch regressions before deploy | High |
| **Storybook Accessibility (a11y)** | WCAG compliance testing | Low |
| **GitHub Actions CI/CD** | Lint + test + deploy automation | Medium |
| **Cloudflare KV Cache** | Page caching layer | Low |

---

## 📖 References

- [OWASP Top 10 for Next.js](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Next.js Security Best Practices](https://nextjs.org/docs/architecture/security-best-practices)
- [Cloudflare Security](https://developers.cloudflare.com/workers/platform/security/)
- [npm Audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)

---

**Generated:** $(date)  
**Status:** ✅ Ready to build pages/screens  
**Risk Level:** 🟢 **LOW** (production-ready infrastructure)
