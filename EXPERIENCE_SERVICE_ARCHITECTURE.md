# Experience Service Architecture

## Overview

This architecture is designed to support **server-side data fetching (SSR)** for experience configurations, making it easy to migrate from static configs to dynamic API-based data.

## Structure

```
src/
├── lib/
│   ├── experiences/
│   │   └── types.ts              # Core types including ExperienceData
│   ├── experiences-config/
│   │   └── emeraldMining.config.ts  # Mock data (EMERALD_MINING_DATA)
│   └── services/
│       └── experiences.service.ts   # Service layer with mock/API logic
└── app/
    └── [locale]/experiences/
        └── emerald-mining-adventure/
            ├── page.tsx             # Server Component (fetches data)
            └── MiningAdventureReservation.tsx  # Client Component (receives data)
```

## Key Concepts

### 1. **Consolidated Data Object**: `ExperienceData`

Instead of multiple exports, all experience data is bundled into a single object:

```typescript
export interface ExperienceData {
  config: ExperienceConfig;
  transportOptions: TransportOption[];
  roomModes: RoomModeOption[];
  whatsappLink: string;
}
```

### 2. **Service Layer**: Mock → API Ready

The service (`experiences.service.ts`) currently returns mock data but is structured for easy API integration:

**Current (Mock)**:
```typescript
export async function getExperienceData(experienceId: string): Promise<ExperienceData> {
  switch (experienceId) {
    case 'emeraldMining':
      return EMERALD_MINING_DATA;
    default:
      throw new Error(`Experience not found: ${experienceId}`);
  }
}
```

**Future (Real API)**:
```typescript
export async function getExperienceData(experienceId: string): Promise<ExperienceData> {
  const response = await fetch(`${API_BASE_URL}/experiences/${experienceId}`, {
    next: { revalidate: 3600 } // ISR: revalidate every hour
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch experience: ${response.statusText}`);
  }
  
  return response.json();
}
```

### 3. **SSR Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Server Component (page.tsx)                              │
│    - Fetches data via getExperienceDataSSR()                │
│    - Data fetched on server (SSR/ISR)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Client Component (MiningAdventureReservation.tsx)        │
│    - Receives experienceData as props                       │
│    - Hydrates client-side state                             │
└─────────────────────────────────────────────────────────────┘
```

**Server Component** (`page.tsx`):
```typescript
export default async function Page() {
  // Server-side fetch (runs during SSR/ISR)
  const experienceData = await getExperienceDataSSR('emeraldMining');
  
  return <MiningAdventureReservation experienceData={experienceData} />;
}
```

**Client Component** (`MiningAdventureReservation.tsx`):
```typescript
export default function MiningAdventureReservation({ experienceData }: Props) {
  const { config, transportOptions, roomModes, whatsappLink } = experienceData;
  
  return (
    <ExperienceReservationProvider config={config} roomModes={roomModes}>
      {/* Components receive data from props, not imports */}
      <Header config={config} />
      <TransportOptions transportOptions={transportOptions} />
      {/* ... */}
    </ExperienceReservationProvider>
  );
}
```

## Benefits

### ✅ SEO Optimized
- Data is rendered on the server (SSR)
- First paint includes all content
- No client-side loading spinners for initial data

### ✅ Performance
- Next.js can cache and revalidate data (ISR)
- Reduced client bundle size (no config imports)
- Progressive enhancement ready

### ✅ Backend Ready
- Single service layer to modify when API is available
- Components remain unchanged
- Just swap mock data source for real API calls

### ✅ Type Safe
- All data flows through `ExperienceData` type
- TypeScript catches mismatches
- Editor autocomplete fully functional

## Migration Path: Mock → Backend

When backend API is ready, only modify `experiences.service.ts`:

```typescript
// Step 1: Add API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.andeanscapes.com';

// Step 2: Update getExperienceData
export async function getExperienceData(experienceId: string): Promise<ExperienceData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/experiences/${experienceId}`, {
    headers: {
      'Content-Type': 'application/json',
      // Add auth if needed
    },
    next: {
      revalidate: 3600, // ISR: Cache for 1 hour
      tags: ['experience', experienceId], // For on-demand revalidation
    }
  });

  if (!response.ok) {
    // Fallback to mock data in case of error
    if (experienceId === 'emeraldMining') {
      console.warn('[ExperienceService] API failed, using fallback data');
      return EMERALD_MINING_DATA;
    }
    throw new Error(`Experience not found: ${experienceId}`);
  }

  return response.json();
}
```

**No changes needed in**:
- ✅ Page components
- ✅ Client components  
- ✅ Context/hooks
- ✅ UI components
- ✅ Tests (they can keep using mock exports)

## Adding New Experiences

### 1. Create config file:
```typescript
// src/lib/experiences-config/pottery.config.ts
export const POTTERY_DATA: ExperienceData = {
  config: { id: 'pottery', /* ... */ },
  transportOptions: [/* ... */],
  roomModes: [/* ... */],
  whatsappLink: 'https://wa.me/...',
};
```

### 2. Add to service:
```typescript
// src/lib/services/experiences.service.ts
case 'pottery':
  return POTTERY_DATA;
```

### 3. Create page:
```typescript
// src/app/[locale]/experiences/pottery-workshop/page.tsx
export default async function Page() {
  const experienceData = await getExperienceDataSSR('pottery');
  return <PotteryReservation experienceData={experienceData} />;
}
```

## Cache & Revalidation Strategies

When using real API:

```typescript
// Static Generation (build time)
fetch(url, { cache: 'force-cache' })

// ISR (Incremental Static Regeneration)
fetch(url, { next: { revalidate: 3600 } }) // Revalidate every hour

// SSR (Server-Side Rendering)
fetch(url, { cache: 'no-store' })

// On-demand Revalidation (manual trigger)
fetch(url, { next: { tags: ['experience'] } })
// Then: revalidateTag('experience')
```

## Testing

Tests can continue using direct imports for fast execution:

```typescript
import { EMERALD_MINING_DATA } from '@/lib/experiences-config/emeraldMining.config';

it('renders with mock data', () => {
  render(<Component experienceData={EMERALD_MINING_DATA} />);
  // assertions...
});
```

## Environment Variables

When backend is ready, add to `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.andeanscapes.com
# or
NEXT_PUBLIC_API_URL=http://localhost:3001  # for local development
```
