# TypeScript Errors - Resolution Plan

## Summary
Found 115 TypeScript errors. Main issues:
1. Database types missing columns from migration 013
2. TypedSupabaseClient type mismatch
3. Query return types inferring as `never`
4. Missing type assertions in reduce functions

## ✅ Fixed So Far
1. ✅ Added missing columns to `workout_sessions` (migration 013)
2. ✅ Added `workout_stats` view to database types
3. ✅ Added alternative column names to `user_streaks`
4. ✅ Added 4-angle photo columns to `progress_photos`
5. ✅ Fixed `TypedSupabaseClient` type definition
6. ✅ Fixed dashboard data return type
7. ✅ Fixed reduce function type assertions in ProgressClient

## 🔄 Remaining Issues (115 errors)

### Category 1: TypedSupabaseClient Type Mismatches
**Files affected:**
- `app/api/analytics/meal-timing/route.ts`
- `app/dashboard/page.tsx`
- `app/progress/page.tsx`
- `components/features/FoodToleranceRating.tsx`

**Solution:** The `TypedSupabaseClient` type needs to match the actual return type from `createClient()`. Current fix uses `Awaited<ReturnType<typeof createServerClient>>` which should work, but may need adjustment.

### Category 2: Query Return Types (`never`)
**Files affected:**
- `app/api/foods/ratings/route.ts` - food_tolerance_ratings view
- `app/api/stripe/checkout/route.ts` - profiles table
- `app/api/stripe/portal/route.ts` - profiles table
- `app/dashboard/DashboardClient.tsx` - user_achievements table
- `app/dashboard/page.tsx` - protein_logs, workout_sessions
- `app/onboarding/page.tsx` - profiles table
- `app/settings/SettingsClient.tsx` - profiles table
- `app/workouts/active/ActiveWorkoutClient.tsx` - workout_sessions table
- `app/workouts/active/page.tsx` - profiles table
- `app/workouts/programs/[programId]/page.tsx` - workout_programs, workouts
- `app/workouts/programs/page.tsx` - workout_programs
- `components/features/EditProteinLogModal.tsx` - protein_logs table
- `components/features/ExerciseCard.tsx` - exercise_sets table
- `components/features/PhotoUpload.tsx` - progress_photos table

**Solution:** These are likely due to TypeScript not being able to infer types from Supabase queries. Need to add explicit type annotations or use type assertions.

### Category 3: Type Assertions Needed
**Files affected:**
- `app/progress/ProgressClient.tsx` - Already fixed reduce functions
- `app/dashboard/protein/ProteinTrackerClient.tsx` - ProteinLog type missing `date` property
- `app/workouts/programs/[programId]/page.tsx` - Spread types and implicit any

### Category 4: Specific Type Issues
- `app/api/debug/database/route.ts` - Environment comparison (development vs production)
- `app/api/stripe/webhook/route.ts` - Stripe API version mismatch
- `app/settings/SettingsClient.tsx` - SubscriptionStatus type mismatch
- `components/error-boundary.tsx` - null vs undefined type

## 🎯 Recommended Fix Strategy

### Phase 1: Fix Database Types (DONE ✅)
- ✅ Add migration 013 columns
- ✅ Add workout_stats view
- ✅ Add alternative column names

### Phase 2: Fix TypedSupabaseClient (IN PROGRESS)
- Update type to match actual return type
- Or remove TypedSupabaseClient and use direct types

### Phase 3: Add Type Assertions
- Add explicit return types to Supabase queries
- Use type assertions where needed
- Fix implicit any types

### Phase 4: Fix Specific Issues
- Fix environment comparison
- Update Stripe API version
- Fix SubscriptionStatus types
- Fix null/undefined handling

## 📝 Quick Wins

1. **Add explicit return types to queries:**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single() as { data: Profile | null; error: PostgrestError | null };
```

2. **Use type assertions for known types:**
```typescript
const profile = data as Profile;
```

3. **Fix implicit any:**
```typescript
.reduce((sum: number, workout: Workout) => sum + workout.exercises.length, 0)
```

## ⚠️ Note
The build currently succeeds because `typescript.ignoreBuildErrors: true` is set in `next.config.js`. Once all errors are fixed, this should be set to `false` for production builds.

