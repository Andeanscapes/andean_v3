# Dynamic Translations System

## 🎯 Overview

This system allows experience data to be:
1. **Fetched dynamically from the server** (or API in the future)
2. **Translated based on the user's selected language**
3. **Rendered in SSR** for optimal SEO
4. **Changed instantly** when user navigates between locales
5. **Dates formatted according to user's locale** (auto-adapts to es/en/fr)

## 📐 Architecture

```
┌─────────────────┐
│   Server API    │ → Returns technical data only (prices, IDs, limits)
│  (Future: REST) │   + Translation keys instead of text
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Service Layer   │ → getExperienceDataSSR(experienceId, locale)
│ experiences.    │   Fetches data + translates using next-intl
│ service.ts      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Server Comp     │ → page.tsx (Server Component)
│ page.tsx        │   Calls service, receives translated data
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Client Comp     │ → MiningAdventureReservation (Client)
│ Reservation.tsx │   Receives fully translated props
└─────────────────┘
```

## 🔑 How Translation Keys Work

### Config File (emeraldMining.config.ts)
Instead of hardcoded text:
```typescript
// ❌ Before
title: 'Aventura de Minería de Esmeraldas'

// ✅ Now
title: 'experiences.emeraldMining.title'
```

### Translation Files (i18n/messages/*.json)
```json
// es.json
{
  "experiences": {
    "emeraldMining": {
      "title": "Aventura de Minería de Esmeraldas"
    }
  }
}

// en.json
{
  "experiences": {
    "emeraldMining": {
      "title": "Emerald Mining Adventure"
    }
  }
}
```

### Service Layer (experiences.service.ts)
```typescript
async function translateExperienceData(data, locale) {
  const t = await getTranslations({ locale });
  
  return {
    ...data,
    config: {
      ...data.config,
      title: t(data.config.title), // ✅ Translates the key
    }
  };
}
```

## 🌍 Language Change Flow

When user changes language:
1. **Navigation**: User clicks language selector
2. **Route change**: `/es/experiences/...` → `/en/experiences/...`
3. **SSR re-render**: Server Component re-executes
4. **Service call**: `getExperienceDataSSR('emeraldMining', 'en')`
5. **Translation**: Service translates keys with new locale
6. **Hydration**: Client receives English content

## 📊 Data Structure

### What Server/API Returns (Technical Data)
```typescript
{
  id: 'emeraldMining',
  basePricePerPerson: 430000,  // ✅ number
  depositPercent: 15,           // ✅ number
  maxPeople: 10,                // ✅ number
  title: 'experiences.emeraldMining.title',  // ✅ translation key
  transportOptions: [
    {
      value: 'car_no_4x4',
      label: 'experiences.emeraldMining.transport.carNo4x4',  // ✅ key
      description: 'experiences.emeraldMining.transport.carNo4x4Description'
    }
  ]
}
```

### What Client Component Receives (Translated Data)
```typescript
{
  id: 'emeraldMining',
  basePricePerPerson: 430000,
  depositPercent: 15,
  maxPeople: 10,
  title: 'Aventura de Minería de Esmeraldas',  // ✅ Spanish text
  transportOptions: [
    {
      value: 'car_no_4x4',
      label: 'Carro Particular (No 4x4)',       // ✅ translated
      description: 'Aplica costo adicional...'   // ✅ translated
    }
  ]
}
```

## 🚀 Future: Real API Integration

When backend is ready, only modify `experiences.service.ts`:

```typescript
// Before (Mock)
export async function getExperienceDataSSR(experienceId: string, locale: string) {
  const rawData = await getExperienceData(experienceId);
  return translateExperienceData(rawData, locale);
}

// After (Real API)
export async function getExperienceDataSSR(experienceId: string, locale: string) {
  const response = await fetch(`${API_URL}/experiences/${experienceId}`);
  const rawData = await response.json();
  return translateExperienceData(rawData, locale);  // ✅ Same translation logic
}
```

**No changes needed in:**
- ✅ Components
- ✅ Pages
- ✅ Context
- ✅ Tests
- ✅ Translation files

## 📝 Adding New Translation Keys

### 1. Add to config
```typescript
// emeraldMining.config.ts
{
  newField: 'experiences.emeraldMining.newField'
}
```

### 2. Add to translation files
```json
// es.json
{
  "experiences": {
    "emeraldMining": {
      "newField": "Texto en español"
    }
  }
}

// en.json
{
  "experiences": {
    "emeraldMining": {
      "newField": "English text"
    }
  }
}
```

### 3. Update translation function
```typescript
// experiences.service.ts
async function translateExperienceData(data, locale) {
  const t = await getTranslations({ locale });
  
  return {
    config: {
      ...data.config,
      newField: t(data.config.newField),  // ✅ Add translation
    }
  };
}
```

## ✅ Benefits

1. **Dynamic Data**: Prices, availability from API/database
2. **Instant Translation**: Language change via route navigation
3. **SEO Optimized**: Each locale has its own server-rendered page
4. **Maintainable**: Translations in one place (i18n files)
5. **Type Safe**: TypeScript ensures correct types throughout
6. **Scalable**: Add new experiences without changing architecture
7. **Testable**: Mock translated data in tests

## 🧪 Testing

Tests use mock translated data (simulating SSR output):
```typescript
// test-utils.tsx
const MOCK_TRANSLATED_CONFIG = {
  title: 'Aventura de Minería de Esmeraldas',  // Already translated
  // ...
};
```

This simulates what the Server Component passes to Client Component.

## 🔗 Related Files

- `src/lib/services/experiences.service.ts` - Service layer with translation
- `src/lib/experiences-config/emeraldMining.config.ts` - Config with keys
- `src/i18n/messages/es.json` - Spanish translations
- `src/i18n/messages/en.json` - English translations
- `src/app/[locale]/experiences/emerald-mining-adventure/page.tsx` - Server Component
- `src/test/test-utils.tsx` - Test mocks

## 💡 Key Concept

**Separation of Concerns:**
- **Config**: Technical data + translation keys (what to fetch)
- **Translations**: Human-readable text (how to display)
- **Service**: Combines both (when to translate)
- **Components**: Render final result (where to show)

## 📅 Date Handling (UTC + Locale Formatting)

### Why This Approach?

Available dates come from the server in **UTC format** and are formatted client-side based on user's locale. This ensures:
- ✅ Server returns timezone-agnostic data
- ✅ Dates auto-adapt to language (Sáb/Sat/Sam)
- ✅ No client-side fetch needed (SSR)
- ✅ Consistent with translation system

### Data Flow

```typescript
// 1. Server returns UTC ISO strings
{
  availableDates: [
    {
      id: 'mar-16-2026',
      startDate: '2026-03-16T00:00:00.000Z',  // UTC
      endDate: '2026-03-17T23:59:59.999Z',     // UTC
      spots: 2,
      isAvailable: true
    }
  ]
}

// 2. Client formats based on locale
formatDateRange(startDate, endDate, 'es')
→ "Sáb 16 - Dom 17 Mar"

formatDateRange(startDate, endDate, 'en')
→ "Sat 16 - Sun 17 Mar"

formatDateRange(startDate, endDate, 'fr')
→ "Sam 16 - Dim 17 Mar"
```

### Implementation

**Date Formatter Utility** ([dateFormatters.ts](src/lib/experiences/dateFormatters.ts)):
```typescript
export function formatDateRange(
  startDate: string,  // ISO 8601 UTC
  endDate: string,    // ISO 8601 UTC
  locale: string      // User's locale
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC',  // Keep in UTC, don't convert
  });

  // ... format logic
  return `${startWeekday} ${startDay} - ${endWeekday} ${endDay} ${month}`;
}
```

**Component Usage** ([DateSelector.tsx](src/components/ExperienceReservation/DateSelector.tsx)):
```typescript
export function DateSelector({ availableDates }: DateSelectorProps) {
  const { currentLocale } = useLanguageContext();

  // Memoized formatting
  const formattedDates = useMemo(
    () => formatAvailableDates(availableDates, currentLocale),
    [availableDates, currentLocale]
  );

  return (
    // Render formatted dates
  );
}
```

### Why No Client Hook?

**Previously had:** `useAvailableDates()` hook that fetched dates  
**Now:** Dates come with `experienceData` via SSR

**Reasons for removal:**
1. ❌ Duplicated data fetching (already in SSR)
2. ❌ CSR fetch = worse SEO
3. ❌ Labels were hardcoded in Spanish
4. ❌ Didn't use i18n system
5. ✅ SSR + locale formatting is better

### Future API Integration

When backend is ready, API should return:
```json
{
  "config": { ... },
  "availableDates": [
    {
      "id": "mar-16-2026",
      "startDate": "2026-03-16T00:00:00.000Z",
      "endDate": "2026-03-17T23:59:59.999Z",
      "spots": 2,
      "isAvailable": true
    }
  ]
}
```

Client will automatically format based on locale. No changes needed!

