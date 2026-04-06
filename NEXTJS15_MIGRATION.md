# Next.js 15 Migration - Breaking Changes Fixed

## Problem

Next.js 15 introduced breaking changes to the `cookies()` function from `next/headers`. It's now **async** and must be awaited.

### Error Message
```
Error: You're importing a component that needs next/headers. 
That only works in a Server Component which is not supported in the pages/ directory.
```

---

## What Changed in Next.js 15

### Before (Next.js 14)
```typescript
import { cookies } from "next/headers";

export const createClient = () => {
  const cookieStore = cookies(); // Sync call
  // ...
};
```

### After (Next.js 15)
```typescript
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies(); // Async call
  // ...
}
```

---

## Files Updated

### Core Files
1. **`lib/supabase/server.ts`**
   - Changed `createClient` from arrow function to async function
   - Added `await` to `cookies()` call

2. **`lib/subscription.ts`**
   - Added `await` to `createClient()` calls in:
     - `getCurrentPlan()`
     - `getSubscriptionDetails()`

### Server Components & API Routes
3. **`app/dashboard/page.tsx`**
4. **`app/dashboard/protein/page.tsx`**
5. **`app/progress/page.tsx`**
6. **`app/settings/page.tsx`**
7. **`app/workouts/active/page.tsx`**
8. **`app/workouts/programs/page.tsx`**
9. **`app/workouts/programs/[programId]/page.tsx`**
10. **`app/api/debug/database/route.ts`**

All changed from:
```typescript
const supabase = createClient();
```

To:
```typescript
const supabase = await createClient();
```

---

## Migration Checklist

- [x] Update `lib/supabase/server.ts` to async
- [x] Update all server components using `createClient()`
- [x] Update all API routes using `createClient()`
- [x] Update utility functions using `createClient()`
- [x] Test all pages compile correctly
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test protected routes
- [ ] Test API endpoints

---

## Important Notes

### ✅ What Works
- **Middleware**: `lib/supabase/middleware.ts` doesn't need updates because it uses `request.cookies` directly, not the `cookies()` function
- **Client Components**: Components using `@/lib/supabase/client` are unaffected

### ⚠️ What to Watch For
- Any new server components must use `await createClient()`
- Any new API routes must use `await createClient()`
- Forgetting `await` will cause build errors

---

## Testing

### Quick Test
```bash
# Clean build
npm run dev:clean

# Should compile without errors
# Check: http://localhost:3000
```

### Full Test
1. Visit home page: `http://localhost:3000`
2. Try signup: `http://localhost:3000/auth/signup`
3. Try login: `http://localhost:3000/auth/login`
4. Visit dashboard: `http://localhost:3000/dashboard`
5. Try all protected routes

---

## Related Changes Needed

If you encounter "Database error saving new user":
1. Run migration: `supabase/migrations/006_fix_user_creation.sql`
2. See: `DATABASE_FIX_GUIDE.md`

---

## References

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Supabase + Next.js 15](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Breaking Changes: async cookies()](https://nextjs.org/docs/messages/sync-dynamic-apis)

---

## Quick Fix Script

If you need to update more files in the future:

```bash
# Find all files using createClient() from server
grep -r "from \"@/lib/supabase/server\"" app/ lib/ --include="*.ts" --include="*.tsx"

# Check each file and add await before createClient()
```

---

**Last Updated**: 2026-02-02
**Next.js Version**: 15.1.4
**Status**: ✅ Fixed

