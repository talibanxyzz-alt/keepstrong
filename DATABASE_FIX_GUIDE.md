# 🔧 Database Fix Guide: User Signup Error

## Problem
Getting "Database error saving new user" when trying to sign up.

## Root Cause
The database trigger that automatically creates user profiles is either missing or misconfigured.

---

## ✅ Solution (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard:
   ```
   https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem
   ```

2. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Fix Migration

1. In your code editor, open:
   ```
   supabase/migrations/006_fix_user_creation.sql
   ```

2. **Select all** the SQL code (Ctrl+A / Cmd+A)

3. **Copy** it (Ctrl+C / Cmd+C)

4. Go back to Supabase SQL Editor

5. **Paste** the SQL (Ctrl+V / Cmd+V)

6. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

7. Wait for **"Success"** message ✓

### Step 3: Test Signup Again

1. Go to signup page:
   ```
   http://localhost:3000/auth/signup
   ```

2. Try signing up with a **NEW email** (don't reuse the one that failed)

3. Should work now! 🎉

---

## What the Fix Does

1. **Creates `handle_new_user()` function**
   - Automatically creates a profile when a user signs up
   - Runs with elevated privileges (`SECURITY DEFINER`)
   - Handles errors gracefully

2. **Creates database trigger**
   - Fires after a new user is created in `auth.users`
   - Calls `handle_new_user()` function

3. **Adds proper RLS policies**
   - `Users can view own profile` - Read access
   - `Users can update own profile` - Update access
   - `System can insert profiles` - Allows trigger to create profiles

---

## Troubleshooting

### If you still get the error:

1. **Check the trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
   Should return 1 row.

2. **Check the function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```
   Should return 1 row.

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
   Should show 3 policies.

4. **Try manually creating a profile:**
   ```sql
   -- Replace <your-user-id> with actual ID from auth.users
   INSERT INTO public.profiles (id, email, full_name)
   VALUES ('<your-user-id>', 'test@example.com', 'Test User');
   ```

### If signup succeeds but onboarding fails:

This is a different issue - the profile was created but can't be updated. Check:

1. **Verify you're logged in:**
   - Open browser console
   - Run: `await supabase.auth.getUser()`
   - Should show your user

2. **Check profile exists:**
   ```sql
   SELECT * FROM public.profiles WHERE id = auth.uid();
   ```

3. **Try updating manually:**
   ```sql
   UPDATE public.profiles 
   SET current_weight_kg = 80, height_cm = 175
   WHERE id = auth.uid();
   ```

---

## Quick Copy-Paste Fix

If you want to run everything at once, here's the full SQL:

**Open Supabase SQL Editor and paste this:**

```sql
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NOW(), NOW());
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
```

---

## Prevention

**To avoid this in the future:**

1. Always run all migrations when setting up a new environment
2. Use Supabase CLI for local development (migrations run automatically)
3. Keep a backup of your database schema
4. Test user signup after any database changes

---

## Direct Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem
- **SQL Editor**: https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem/sql
- **Authentication Settings**: https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem/auth/users
- **Database Tables**: https://supabase.com/dashboard/project/mnmnfaseiddqfiufckem/editor

---

**Need more help?** Check the terminal output when you try to sign up - it might show additional error details.

