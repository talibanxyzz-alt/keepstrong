# Supabase Migration Guide

## Manual Migration via Dashboard

This guide walks you through running all database migrations manually in the Supabase Dashboard.

**Project ID:** `mnmnfaseiddqfiufckem`  
**Dashboard URL:** https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem

---

## Step-by-Step Instructions

### 1. Open SQL Editor

1. Go to: https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem/sql/new
2. Click "New Query" if needed

### 2. Run Migrations in Order

Run each migration file **one at a time** in the order listed below. Copy the entire contents of each file and paste into the SQL Editor, then click "Run" (or press `Ctrl+Enter`).

---

## Migration Order

### ✅ Migration 001: Initial Schema
**File:** `supabase/migrations/001_initial_schema.sql`

**What it does:**
- Creates all core tables (profiles, workouts, exercises, protein_logs, etc.)
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance
- Sets up triggers for profile creation

**Expected result:** All tables created, RLS enabled

---

### ✅ Migration 002: Add Current Program
**File:** `supabase/migrations/002_add_current_program.sql`

**What it does:**
- Adds `current_program_id` column to profiles table
- Creates index for faster lookups

**Expected result:** Profiles table updated with new column

---

### ✅ Migration 003: Subscription Fields
**File:** `supabase/migrations/003_add_subscription_fields.sql`

**What it does:**
- Adds Stripe subscription columns to profiles
- Creates indexes for subscription lookups

**Expected result:** Profiles table updated with Stripe fields

---

### ✅ Migration 004: Storage Policies
**File:** `supabase/migrations/004_storage_policies.sql`

**What it does:**
- Sets up storage buckets and policies for file uploads (progress photos)

**Expected result:** Storage buckets configured

---

### ✅ Migration 005: Performance Indexes
**File:** `supabase/migrations/005_performance_indexes.sql`

**What it does:**
- Adds additional indexes for query optimization

**Expected result:** Additional indexes created

---

### ✅ Migration 006: Fix User Creation
**File:** `supabase/migrations/006_fix_user_creation.sql`

**What it does:**
- Fixes/updates the user creation trigger

**Expected result:** User creation trigger updated

---

### ✅ Migration 007: Meal Timing Preferences
**File:** `supabase/migrations/007_add_meal_timing_preferences.sql`

**What it does:**
- Adds `meal_timing_alerts` (boolean) and `meal_timing_threshold_hours` (integer) to profiles
- Adds constraint to ensure threshold is 5-8 hours

**Expected result:** Profiles table updated with meal timing columns

---

### ✅ Migration 008: Food Ratings System
**File:** `supabase/migrations/008_food_ratings.sql`

**What it does:**
- Creates `food_tolerance_votes` table
- Creates `food_tolerance_ratings` view
- Sets up RLS policies
- Creates helper functions

**Expected result:** Food rating system ready (no seed data - clean start)

---

### ✅ Migration 009: Dose Schedule
**File:** `supabase/migrations/009_dose_schedule.sql`

**What it does:**
- Adds medication scheduling columns to profiles (`medication_type`, `dose_day_of_week`, `dose_time`, `started_medication_at`)
- Creates helper functions (`is_dose_day`, `days_since_dose`, `get_side_effect_level`)
- Creates `user_dose_status` view

**Expected result:** Dose scheduling system ready

---

### ✅ Migration 010: Fix Seed Orphans
**File:** `supabase/migrations/010_fix_seed_orphans.sql`

**What it does:**
- Cleans up any orphan records from food_tolerance_votes (if they exist)
- Safe to run even if no orphans exist

**Expected result:** Database cleaned of orphan records

---

## Verification Queries

After running all migrations, verify everything is set up correctly:

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- profiles
- workout_programs
- workouts
- exercises
- protein_logs
- workout_sessions
- exercise_sets
- progress_photos
- weight_logs
- food_tolerance_votes

### Check Views Exist
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected views:**
- food_tolerance_ratings
- user_dose_status

### Check Profile Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

**Should include:**
- meal_timing_alerts
- meal_timing_threshold_hours
- medication_type
- dose_day_of_week
- dose_time
- started_medication_at
- stripe_customer_id
- subscription_status
- etc.

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**All tables should have `rowsecurity = true`**

---

## Troubleshooting

### Error: "relation already exists"
- **Cause:** Migration was already run
- **Solution:** Skip that migration and continue with the next one

### Error: "column already exists"
- **Cause:** Column was added in a previous migration
- **Solution:** Comment out the `ALTER TABLE ADD COLUMN` line and run the rest

### Error: "permission denied"
- **Cause:** Not running as database owner
- **Solution:** Make sure you're using the SQL Editor in the dashboard (not a restricted user)

### Error: "function already exists"
- **Cause:** Function was created previously
- **Solution:** The migration uses `CREATE OR REPLACE FUNCTION`, so this shouldn't happen. If it does, the function will be replaced.

---

## Optional: Seed Data (Development Only)

If you want to add seed data for testing:

1. **First, create a real user** through your app (sign up)
2. **Get the user's UUID** from the profiles table:
   ```sql
   SELECT id, email FROM profiles LIMIT 1;
   ```
3. **Run the seed script** (`supabase/seed/food_tolerance_seed.sql`) in the SQL Editor
   - It will automatically use the first user in the profiles table

**Note:** Seed data is optional. For production, let users generate organic ratings.

---

## After Migrations Complete

1. ✅ All tables created
2. ✅ All views created
3. ✅ RLS policies active
4. ✅ Indexes in place
5. ✅ Functions available

Your database is now ready to use! 🎉

---

## Quick Reference: Migration Files

```
supabase/migrations/
├── 001_initial_schema.sql              ← Start here
├── 002_add_current_program.sql
├── 003_add_subscription_fields.sql
├── 004_storage_policies.sql
├── 005_performance_indexes.sql
├── 006_fix_user_creation.sql
├── 007_add_meal_timing_preferences.sql
├── 008_food_ratings.sql
├── 009_dose_schedule.sql
└── 010_fix_seed_orphans.sql            ← End here
```

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs/guides/database
- **SQL Editor:** https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem/sql/new
- **Database Tables:** https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem/editor

