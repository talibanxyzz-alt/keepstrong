# Next.js 16 Async API Migration

**Date:** February 5, 2026  
**Status:** ✅ Complete  
**Build Status:** ✅ Passing

---

## Overview

Next.js 16 made several APIs asynchronous. This document tracks the migration status for the GLP-1 Fitness Tracker app.

---

## Breaking Changes in Next.js 16

### 1. `params` is now async
- **Before:** `params: { id: string }`
- **After:** `params: Promise<{ id: string }>`
- **Fix:** `const { id } = await params;`

### 2. `searchParams` is now async
- **Before:** `searchParams: { filter?: string }`
- **After:** `searchParams: Promise<{ filter?: string }>`
- **Fix:** `const { filter } = await searchParams;`

### 3. `cookies()` is now async
- **Before:** `const cookieStore = cookies();`
- **After:** `const cookieStore = await cookies();`

### 4. `headers()` is now async
- **Before:** `const headersList = headers();`
- **After:** `const headersList = await headers();`

### 5. `draftMode()` is now async
- **Before:** `const { isEnabled } = draftMode();`
- **After:** `const { isEnabled } = await draftMode();`

---

## Migration Steps Completed

### ✅ Step 1: Ran Automated Codemod
```bash
npx @next/codemod@canary next-async-request-api .
```

**Result:** 1 file modified, 124 unmodified, 0 errors

### ✅ Step 2: Checked for Codemod Errors
- Searched for `@next-codemod-error` comments
- **Result:** No errors found

### ✅ Step 3: Fixed Pages with params/searchParams

#### Files Updated:

1. **`app/workouts/programs/[programId]/page.tsx`**
   ```typescript
   // BEFORE
   export default async function ProgramDetailPage({
     params,
   }: {
     params: { programId: string };
   }) {
     const data = await getProgramDetails(params.programId);
   
   // AFTER
   export default async function ProgramDetailPage({
     params,
   }: {
     params: Promise<{ programId: string }>;
   }) {
     const { programId } = await params;
     const data = await getProgramDetails(programId);
   ```

2. **`app/dashboard/protein/page.tsx`**
   ```typescript
   // BEFORE
   export default async function ProteinTrackerPage({
     searchParams,
   }: {
     searchParams: { date?: string };
   }) {
     const data = await getProteinData(searchParams.date);
   
   // AFTER
   export default async function ProteinTrackerPage({
     searchParams,
   }: {
     searchParams: Promise<{ date?: string }>;
   }) {
     const { date } = await searchParams;
     const data = await getProteinData(date);
   ```

### ✅ Step 4: Fixed cookies() Calls

**`lib/supabase/server.ts`** - Already fixed by codemod:
```typescript
export async function createClient() {
  const cookieStore = await cookies(); // ✅ Awaited
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // ...
      },
    }
  );
}
```

### ✅ Step 5: Fixed headers() Calls

**`app/api/stripe/webhook/route.ts`** - Already fixed by codemod:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature'); // ✅ Awaited
  // ...
}
```

### ✅ Step 6: Verified API Routes

All API routes checked and confirmed:
- ✅ `/api/stripe/checkout/route.ts` - Uses `await createClient()` (which awaits cookies)
- ✅ `/api/stripe/portal/route.ts` - Uses `await createClient()` (which awaits cookies)
- ✅ `/api/stripe/webhook/route.ts` - Uses `await headers()`
- ✅ `/api/analytics/meal-timing/route.ts` - Uses `await createClient()`
- ✅ `/api/emails/send/route.ts` - No dynamic APIs used
- ✅ `/api/emails/cron/daily/route.ts` - Uses `await createClient()`
- ✅ `/api/emails/cron/weekly/route.ts` - Uses `await createClient()`
- ✅ `/api/emails/unsubscribe/route.ts` - Uses `await createClient()`
- ✅ `/api/foods/ratings/route.ts` - Uses `await createClient()`
- ✅ `/api/debug/database/route.ts` - Uses `await createClient()`
- ✅ `/api/test-sentry/route.ts` - No dynamic APIs used

**Note:** API routes use `new URL(request.url).searchParams`, which is NOT a Next.js async API - it's the standard URL API and doesn't need await.

### ✅ Step 7: Verified Middleware

**`middleware.ts`** and **`lib/supabase/middleware.ts`**:
- Uses `request.cookies` (not `cookies()` from next/headers)
- No changes needed ✅

### ✅ Step 8: Cleared Cache and Built

```bash
rm -rf .next
npm run build
```

**Result:** ✅ Build successful with no async-related warnings or errors

---

## Files Modified

### Pages (2 files)
1. `app/workouts/programs/[programId]/page.tsx` - Fixed `params`
2. `app/dashboard/protein/page.tsx` - Fixed `searchParams`

### Server Utilities (1 file)
1. `lib/supabase/server.ts` - Fixed `cookies()` (by codemod)

### API Routes (1 file)
1. `app/api/stripe/webhook/route.ts` - Fixed `headers()` (by codemod)

---

## Verification Checklist

- ✅ No `@next-codemod-error` comments in codebase
- ✅ All `cookies()` calls are awaited
- ✅ All `headers()` calls are awaited
- ✅ All `draftMode()` calls are awaited (none used in this app)
- ✅ All page `params` props are typed as `Promise<>` and awaited
- ✅ All page `searchParams` props are typed as `Promise<>` and awaited
- ✅ Middleware is async and handles cookies correctly
- ✅ Build completes without errors
- ✅ No async-related warnings in build output

---

## Build Output

```
✓ Compiled successfully in 16.3s
✓ Generating static pages using 7 workers (27/27) in 533.0ms
✓ Finalizing page optimization

Route (app)
├ ○ /
├ ƒ /dashboard
├ ƒ /dashboard/protein
├ ƒ /workouts
├ ƒ /workouts/active
├ ƒ /workouts/programs
└ ƒ /workouts/programs/[programId]
... (all routes)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

**No async-related errors or warnings!** ✅

---

## Common Patterns Fixed

### Pattern 1: Dynamic Route Params
```typescript
// ✅ Correct
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

### Pattern 2: Search Params
```typescript
// ✅ Correct
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  return <div>{filter}</div>;
}
```

### Pattern 3: Cookies in Server Components
```typescript
// ✅ Correct
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session');
  // ...
}
```

### Pattern 4: Headers in API Routes
```typescript
// ✅ Correct
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const headersList = await headers();
  const signature = headersList.get('signature');
  // ...
}
```

---

## What Doesn't Need Changes

### ❌ URL searchParams (API Routes)
```typescript
// ✅ This is fine - it's the standard URL API, not Next.js
const { searchParams } = new URL(request.url);
const value = searchParams.get('param');
```

### ❌ Request Cookies (Middleware)
```typescript
// ✅ This is fine - it's the Request API, not next/headers
const token = request.cookies.get('token');
```

### ❌ useParams() Hook (Client Components)
```typescript
// ✅ This is fine - already returns resolved values
'use client';
import { useParams } from 'next/navigation';

const params = useParams(); // Not a Promise
const { id } = params;
```

---

## Testing

### Manual Testing
1. ✅ Navigate to `/workouts/programs/[programId]` - Works
2. ✅ Navigate to `/dashboard/protein?date=2026-02-05` - Works
3. ✅ Stripe webhook receives events - Works
4. ✅ All API routes respond correctly - Works

### Build Testing
```bash
npm run build
```
✅ Passes without errors

### Dev Server
```bash
npm run dev
```
✅ No async-related warnings

---

## Summary

**Migration Status:** ✅ Complete  
**Files Modified:** 4 files  
**Build Status:** ✅ Passing  
**Warnings:** 0 async-related warnings  
**Errors:** 0 async-related errors  

The GLP-1 Fitness Tracker app is now fully compatible with Next.js 16's async APIs!

---

## References

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-16)
- [Async Request APIs Migration](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Next.js Codemod Documentation](https://nextjs.org/docs/app/building-your-application/upgrading/codemods)

