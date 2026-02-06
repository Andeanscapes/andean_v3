// src/app/api/README.md
# API Routes - Security & Patterns

## Overview

All API routes under `src/app/api/` follow these security patterns:

1. **CORS validation** - only allow trusted origins
2. **Input validation** - use `src/lib/validation.ts`
3. **Error handling** - return normalized error responses
4. **Rate limiting** (future) - prevent abuse
5. **Authentication** (future) - verify session/token

## Basic Structure

```typescript
// src/app/api/tours/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { tryValidate, tourFilterSchema } from '@/lib/validation';
import { APIError } from '@/lib/api-client';

const ALLOWED_ORIGINS = ['https://andeanscapes.com', 'https://www.andeanscapes.com'];

function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return origin ? ALLOWED_ORIGINS.includes(origin) : true; // Allow same-origin always
}

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 'https://andeanscapes.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// Handle preflight
export async function OPTIONS(request: NextRequest) {
  if (!validateOrigin(request)) {
    return new NextResponse(null, { status: 403 });
  }
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// GET /api/tours?search=...&region=...
export async function GET(request: NextRequest) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // TODO: fetch tours from database with filters.data
    const tours = [];

    const response = NextResponse.json(tours);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('GET /api/tours error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch tours' },
      { status: 500 }
    );
  }
}

// POST /api/tours
export async function POST(request: NextRequest) {
  try {
    if (!validateOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // TODO: Check authentication here
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const validated = tryValidate(createTourSchema, body);

    if (!validated.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', errors: validated.errors },
        { status: 400 }
      );
    }

    // TODO: Save to database
    const tour = validated.data;

    const response = NextResponse.json(tour, { status: 201 });
    return addCorsHeaders(response);
  } catch (error) {
    console.error('POST /api/tours error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to create tour' },
      { status: 500 }
    );
  }
}
```

## Protected Routes (with Authentication)

```typescript
// src/app/api/tours/[id]/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/nextauth.config';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = tryValidate(updateTourSchema, body);

    if (!validated.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', errors: validated.errors },
        { status: 400 }
      );
    }

    // TODO: Update database
    const tour = validated.data;

    const response = NextResponse.json(tour);
    return addCorsHeaders(response);
  } catch (error) {
    console.error('PATCH /api/tours/[id] error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to update tour' },
      { status: 500 }
    );
  }
}
```

## Error Response Format

All errors follow this schema:

```json
{
  "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "INTERNAL_ERROR",
  "message": "Human-readable error message",
  "errors": {
    "fieldName": ["error1", "error2"]
  }
}
```

## Security Checklist

- [ ] **CORS**: Only allow trusted origins
- [ ] **Input Validation**: Use `tryValidate()` for all request bodies
- [ ] **Authentication**: Check session/token for protected endpoints
- [ ] **Error Handling**: Never expose stack traces; use generic messages
- [ ] **Rate Limiting**: Add rate limit headers and enforcement
- [ ] **Logging**: Log suspicious requests without exposing secrets
- [ ] **Content-Type**: Validate `Content-Type: application/json`
- [ ] **SQL Injection**: Use parameterized queries (ORM handles this)
- [ ] **XSS Protection**: Don't return unvalidated user input; headers already set

## Future Enhancements

1. **Rate Limiting** (using Redis or Cloudflare KV)
   ```typescript
   import { Ratelimit } from '@upstash/ratelimit';
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '10 s')
   });
   
   const { success } = await ratelimit.limit(request.ip);
   if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
   ```

2. **Request Signing** (for webhook verification)
   ```typescript
   import crypto from 'crypto';
   
   function verifySignature(body: string, signature: string, secret: string) {
     const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
     return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
   }
   ```

3. **Database Transaction Logging**
   ```typescript
   // Log all mutations for audit trail
   await db.logs.create({
     user_id: session.user.id,
     action: 'CREATE_TOUR',
     resource: 'tours',
     resource_id: tour.id,
     timestamp: new Date()
   });
   ```
