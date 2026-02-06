// QUICKSTART.md - Build Your First Screen Safely

## 🚀 Quick Start Guide

You've got a solid foundation. Here's how to build pages/screens securely:

---

## Step 1: Define Your Data Model

**File:** `src/types/domain.ts`

```typescript
export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // days
  region: 'north' | 'south' | 'center';
  images: string[]; // URLs
  rating: number; // 0-5
  reviews: number;
  capacity: number;
  booked: number;
  startDate: Date;
  availability: 'available' | 'limited' | 'full';
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'guide';
  createdAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  tourId: string;
  startDate: Date;
  travelers: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}
```

---

## Step 2: Add Validation Schemas

**File:** `src/lib/validation.ts` (already started)

Add your models:

```typescript
import { z } from 'zod';

export const tourSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  region: z.enum(['north', 'south', 'center']),
  images: z.array(z.string().url()).min(1),
  rating: z.number().min(0).max(5),
  reviews: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  booked: z.number().int().nonnegative(),
  startDate: z.string().datetime(),
  availability: z.enum(['available', 'limited', 'full'])
});

export type Tour = z.infer<typeof tourSchema>;
```

---

## Step 3: Create Your First API Route

**File:** `src/app/api/tours/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { tourFilterSchema } from '@/lib/validation';
import { tryValidate } from '@/lib/validation';

// Mock data (replace with DB calls later)
const mockTours = [
  {
    id: '1',
    title: 'Lost City Trek',
    description: 'Adventure to the ancient ruins...',
    price: 1200,
    duration: 4,
    region: 'north',
    images: ['/assets/images/tours/lost-city.jpg'],
    rating: 4.8,
    reviews: 245,
    capacity: 10,
    booked: 8,
    startDate: new Date('2026-03-15'),
    availability: 'limited'
  }
  // ... more tours
];

export async function GET(request: NextRequest) {
  try {
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

    let tours = mockTours;

    // Apply filters
    if (filters.data.search) {
      const q = filters.data.search.toLowerCase();
      tours = tours.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    if (filters.data.region && filters.data.region !== 'all') {
      tours = tours.filter(t => t.region === filters.data.region);
    }

    if (filters.data.minPrice) {
      tours = tours.filter(t => t.price >= filters.data.minPrice);
    }

    if (filters.data.maxPrice) {
      tours = tours.filter(t => t.price <= filters.data.maxPrice);
    }

    // Pagination
    const start = (filters.data.page - 1) * filters.data.limit;
    const end = start + filters.data.limit;

    return NextResponse.json({
      data: tours.slice(start, end),
      total: tours.length,
      page: filters.data.page,
      limit: filters.data.limit
    });
  } catch (error) {
    console.error('GET /api/tours error:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch tours' },
      { status: 500 }
    );
  }
}
```

---

## Step 4: Create a Page Component

**File:** `src/app/[locale]/(public)/tours/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiCall } from '@/lib/api-client';
import { Tour, tourFilterSchema } from '@/lib/validation';
import TourCard from '@/components/TourCard';

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    region: 'all',
    minPrice: 0,
    maxPrice: 5000,
    page: 1
  });

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.region !== 'all') params.append('region', filters.region);
        params.append('minPrice', String(filters.minPrice));
        params.append('maxPrice', String(filters.maxPrice));
        params.append('page', String(filters.page));

        const response = await apiCall<{ data: Tour[] }>(
          `/tours?${params.toString()}`,
          { method: 'GET' }
        );

        setTours(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tours');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [filters]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Explore Our Tours</h1>

      {/* Filters */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search tours..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="px-4 py-2 border rounded"
            maxLength={100}
          />

          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value, page: 1 })}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Regions</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="center">Center</option>
          </select>

          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value), page: 1 })}
            className="px-4 py-2 border rounded"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 mb-8 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tours...</p>
        </div>
      )}

      {/* Tours Grid */}
      {!loading && tours.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <Link key={tour.id} href={`/tours/${tour.id}`}>
              <TourCard tour={tour} />
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tours.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No tours found matching your criteria.</p>
          <button
            onClick={() => setFilters({
              search: '',
              region: 'all',
              minPrice: 0,
              maxPrice: 5000,
              page: 1
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </main>
  );
}
```

---

## Step 5: Create a Reusable Component

**File:** `src/components/TourCard/TourCard.tsx`

```typescript
import { Tour } from '@/lib/validation';
import Image from 'next/image';

interface TourCardProps {
  tour: Tour;
}

export default function TourCard({ tour }: TourCardProps) {
  const isAvailable = tour.availability === 'available';
  const isLimited = tour.availability === 'limited';

  return (
    <div className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative w-full h-48">
        <Image
          src={tour.images[0]}
          alt={`${tour.title} tour`}
          fill
          className="object-cover"
        />
        {isLimited && (
          <span className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded">
            Limited Spots
          </span>
        )}
        {!isAvailable && (
          <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded">
            Full
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{tour.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tour.description}</p>

        {/* Details */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="flex items-center">
            ⏱️ {tour.duration} days
          </span>
          <span className="flex items-center">
            ⭐ {tour.rating.toFixed(1)} ({tour.reviews})
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${tour.price.toLocaleString()}
          </span>
          <button
            disabled={!isAvailable}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              isAvailable
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: Test Your Page Locally

```bash
# Install remaining dependencies if needed
npm install zod

# Start dev server
npm run dev

# Visit http://localhost:3000/tours
```

---

## Step 7: Deploy to Cloudflare

```bash
# Build for Cloudflare
npm run build

# Preview locally
npm run preview

# Deploy
npm run deploy
```

---

## Next Checklist

- [ ] Add Sentry error tracking
- [ ] Implement authentication (NextAuth)
- [ ] Add database (Prisma + PostgreSQL/MySQL)
- [ ] Build detail page (`/tours/[id]`)
- [ ] Add booking form with payment (Stripe)
- [ ] Set up admin panel for tour CRUD
- [ ] Add e-mail notifications (SendGrid/Resend)
- [ ] Implement Instagram feed integration
- [ ] Add contact form
- [ ] Deploy to production

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/lib/api-client.ts` | Fetch wrapper with error handling |
| `src/lib/validation.ts` | Zod schemas + validation helpers |
| `src/app/api/README.md` | API route patterns & security |
| `src/components/COMPONENT_PATTERNS.md` | React security patterns |
| `SECURITY.md` | Project-wide security guide |

---

Happy building! 🚀
