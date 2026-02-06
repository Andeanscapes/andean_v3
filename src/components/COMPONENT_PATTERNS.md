// src/components/COMPONENT_PATTERNS.md
# React Component Security Patterns

## 1. Safe HTML Rendering (XSS Prevention)

### ❌ UNSAFE - Never do this:
```typescript
export function BlogPost({ content }: { content: string }) {
  // DANGEROUS: User-provided HTML can execute scripts
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

### ✅ SAFE - Render as text by default:
```typescript
export function BlogPost({ content }: { content: string }) {
  // Safe: Rendered as text, HTML entities escaped automatically
  return <div className="prose">{content}</div>;
}
```

### ✅ SAFE - Sanitize HTML when needed:
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function BlogPost({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

## 2. Input Handling (Validation + Sanitization)

### ❌ UNSAFE:
```typescript
export function SearchTours() {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    // Bad: Sends raw user input directly to API
    const results = await fetch(`/api/tours?search=${query}`);
  };

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### ✅ SAFE:
```typescript
'use client';

import { useState } from 'react';
import { tryValidate, tourFilterSchema } from '@/lib/validation';

export function SearchTours() {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const { success, errors } = tryValidate(tourFilterSchema, { search: query });

    if (!success) {
      setError(errors.search?.[0] || 'Invalid search query');
      return;
    }

    try {
      const response = await fetch(`/api/tours?search=${encodeURIComponent(query)}`);
      // ... handle response
    } catch (err) {
      setError('Failed to search tours');
    }
  };

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={100}
      />
      {error && <span className="text-red-500">{error}</span>}
    </>
  );
}
```

## 3. External Links (Click-Jacking Prevention)

### ❌ UNSAFE:
```typescript
export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Vulnerable to javascript: scheme or data: URLs
  return <a href={href}>{children}</a>;
}
```

### ✅ SAFE:
```typescript
export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Only allow http/https, reject javascript:, data:, etc.
  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return ['http:', 'https:'].includes(u.protocol);
    } catch {
      return false;
    }
  };

  if (!isValidUrl(href)) {
    console.warn(`Invalid URL blocked: ${href}`);
    return <span>{children}</span>;
  }

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" // Prevent window.opener
    >
      {children}
    </a>
  );
}
```

## 4. Sensitive Data in State (localStorage / Cookies)

### ❌ UNSAFE:
```typescript
export function UserProfile() {
  useEffect(() => {
    // Storing sensitive tokens in localStorage = XSS vulnerability
    localStorage.setItem('authToken', user.token);
  }, [user.token]);
}
```

### ✅ SAFE:
```typescript
export function UserProfile() {
  // Use httpOnly cookies (set by server) instead
  // They're automatically sent with requests and immune to XSS

  // Never store secrets in localStorage/sessionStorage
  // If needed for non-sensitive data only:
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    localStorage.setItem('theme', theme); // Non-sensitive
  }, [theme]);
}
```

## 5. Event Handler Security

### ❌ UNSAFE:
```typescript
export function ImageGallery({ images }: { images: any[] }) {
  return (
    <div>
      {images.map((img, i) => (
        // Eval-like behavior with onClick string
        <img
          key={i}
          src={img.url}
          onClick={() => eval(img.customClick)} // DANGEROUS
        />
      ))}
    </div>
  );
}
```

### ✅ SAFE:
```typescript
type Image = {
  url: string;
  id: string;
  onClickAction?: 'zoom' | 'download' | 'share'; // Enum, not string
};

export function ImageGallery({ images }: { images: Image[] }) {
  const handleImageClick = (image: Image) => {
    switch (image.onClickAction) {
      case 'zoom':
        // Handle zoom
        break;
      case 'download':
        // Handle download
        break;
      case 'share':
        // Handle share
        break;
    }
  };

  return (
    <div>
      {images.map((img) => (
        <img
          key={img.id}
          src={img.url}
          alt={`Gallery image ${img.id}`}
          onClick={() => handleImageClick(img)}
        />
      ))}
    </div>
  );
}
```

## 6. API Key & Secret Exposure

### ❌ UNSAFE:
```typescript
// NEVER embed API keys in frontend code
const STRIPE_KEY = 'sk_live_abc123'; // Exposed to users!

export function Checkout() {
  return <StripeProvider apiKey={STRIPE_KEY}> ... </StripeProvider>;
}
```

### ✅ SAFE:
```typescript
// Use environment variables accessible in Next.js
// NEXT_PUBLIC_* is exposed (OK for public keys)
// Other vars are server-only

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

export function Checkout() {
  return <StripeProvider apiKey={STRIPE_PUBLIC_KEY}> ... </StripeProvider>;
}

// Secret keys stay on server:
// src/server/stripe.ts
const stripeSecret = process.env.STRIPE_SECRET_KEY; // Server-only
```

## 7. File Upload Security

### ❌ UNSAFE:
```typescript
export function ImageUpload() {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); // No validation!

    await fetch('/api/upload', { method: 'POST', body: formData });
  };
}
```

### ✅ SAFE:
```typescript
'use client';

import { useState } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export function ImageUpload() {
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    // Validate dimensions (optional)
    const img = new Image();
    img.onload = async () => {
      if (img.width > 4000 || img.height > 4000) {
        setError('Image dimensions too large');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const error = await response.json();
          setError(error.message || 'Upload failed');
          return;
        }

        setError(null);
        // Handle success
      } catch (err) {
        setError('Upload failed');
      }
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <>
      <input
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleUpload}
      />
      {error && <span className="text-red-500">{error}</span>}
    </>
  );
}
```

## 8. Third-Party Script Security

### ❌ UNSAFE:
```typescript
// Loading untrusted scripts inline
export function Analytics() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://untrusted-analytics.com/tracker.js?key=${apiKey}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);
}
```

### ✅ SAFE:
```typescript
import Script from 'next/script';

// Use Next.js Script component with security options
export function Analytics() {
  return (
    <Script
      src="https://trusted-analytics.com/tracker.js"
      strategy="lazyOnload" // Don't block page load
      onError={(e) => console.error('Analytics failed to load', e)}
      data-api-key={process.env.NEXT_PUBLIC_ANALYTICS_KEY}
    />
  );
}
```

## 9. Environment Variable Security Checklist

```typescript
// ✅ SAFE - Public in Next.js
process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
process.env.NEXT_PUBLIC_ANALYTICS_ID

// ❌ DANGEROUS - If used in client code
process.env.DATABASE_URL
process.env.API_SECRET_KEY
process.env.STRIPE_SECRET_KEY

// ✅ SAFE - Server-only code:
// src/server/db.ts
import { db } from '@prisma/client';

export async function getTours() {
  // This file is never sent to client
  return db.tour.findMany();
}
```

## 10. Form Security (CSRF Prevention)

### ❌ UNSAFE:
```typescript
export function CreateTour() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // No CSRF token!
    await fetch('/api/tours', { method: 'POST', body: ... });
  };
}
```

### ✅ SAFE (with NextAuth):
```typescript
import { useSession } from 'next-auth/react';

export function CreateTour() {
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // NextAuth provides CSRF protection automatically
    // (session exists = user authenticated)
    if (!session?.user?.isAdmin) {
      return;
    }

    await fetch('/api/tours', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Prevents old-style CSRF
      }
    });
  };
}
```

---

## Summary

| Attack Vector | Prevention |
|---|---|
| **XSS** | React escapes by default; avoid `dangerouslySetInnerHTML` |
| **SQL Injection** | Use ORM with parameterized queries |
| **CSRF** | Use Next-Auth or token-based auth |
| **Clickjacking** | Set headers; X-Frame-Options: SAMEORIGIN ✅ |
| **Insecure URLs** | Validate with URL constructor |
| **File Upload** | Validate type, size, dimensions on client + server |
| **API Key Leak** | Use `NEXT_PUBLIC_*` only for public keys |
| **localStorage** | Avoid storing secrets (use httpOnly cookies) |
| **Third-party Scripts** | Use Next/Script with `strategy` and `onError` |

---

See [SECURITY.md](../../SECURITY.md) for project-wide security details.
