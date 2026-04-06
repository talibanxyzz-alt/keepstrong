# Supabase Connection Error - Fix Guide

## ❌ Current Error

```
Console TypeError
Failed to fetch (mnmnfaseiddqfiufckem.supabase.co)
```

This error indicates the app cannot connect to your Supabase instance.

---

## 🔍 Possible Causes

1. **Missing Environment Variables** - `.env.local` file not configured
2. **Incorrect Supabase URL/Key** - Wrong credentials
3. **Supabase Project Paused** - Free tier projects pause after inactivity
4. **Network Issues** - Firewall or connectivity problems
5. **CORS Issues** - Domain not whitelisted in Supabase

---

## ✅ Solution Steps

### Step 1: Check Your `.env.local` File

Your `.env.local` file should contain:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional (for server-side)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Action Required:**
1. Open your `.env.local` file in the root directory
2. Verify the `NEXT_PUBLIC_SUPABASE_URL` matches your Supabase project URL
3. Verify the `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

---

### Step 2: Get Your Supabase Credentials

If you don't have these values or they're incorrect:

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (or create a new one)
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Step 3: Check if Your Supabase Project is Active

Free tier Supabase projects pause after **7 days of inactivity**.

**To check:**
1. Go to your Supabase dashboard
2. Look for a "Project is paused" message
3. If paused, click **"Restore project"** (takes 1-2 minutes)

---

### Step 4: Restart Your Development Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)

# Clear Next.js cache
npm run cache:clear

# Restart with Turbopack
npm run dev:turbo
```

**Important:** Environment variables are loaded when the server starts, so you MUST restart after changes.

---

### Step 5: Verify Connection

After restarting, check:

1. Open your browser console (F12)
2. Look for any new errors
3. Try to access the dashboard page
4. Check if data loads correctly

---

## 🔧 Quick Fix Command

Run this to restart cleanly:

```bash
cd /home/horus/Downloads/glp_1
npm run cache:clear
npm run dev:turbo
```

Then check your browser at `http://localhost:3000`

---

## 📋 Environment Variables Template

Create/update your `.env.local` file:

```bash
# ============================================
# SUPABASE CONFIGURATION
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://mnmnfaseiddqfiufckem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ============================================
# OPTIONAL: STRIPE (for payments)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# OPTIONAL: SENTRY (for error tracking)
# ============================================
SENTRY_AUTH_TOKEN=your_sentry_token
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# ============================================
# OPTIONAL: RESEND (for emails)
# ============================================
RESEND_API_KEY=re_...
```

---

## 🚨 Common Mistakes

### ❌ Wrong: Old/Invalid Credentials
```bash
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co  # Wrong project
```

### ❌ Wrong: Missing NEXT_PUBLIC_ Prefix
```bash
SUPABASE_URL=https://...  # Won't work in browser!
```

### ❌ Wrong: Quotes Around Values (not needed)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://..."  # Remove quotes
```

### ✅ Correct:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://mnmnfaseiddqfiufckem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔍 Debugging Tips

### Check if Environment Variables are Loaded

Create a test page to verify:

```typescript
// app/test-env/page.tsx
export default function TestEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables</h1>
      <pre className="bg-gray-100 p-4 rounded">
        NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET'}
      </pre>
      <pre className="bg-gray-100 p-4 rounded mt-2">
        ANON_KEY (first 20 chars): {
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || '❌ NOT SET'
        }
      </pre>
    </div>
  );
}
```

Visit `http://localhost:3000/test-env` to check.

---

## 📞 Still Having Issues?

If the error persists:

1. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for detailed error messages

2. **Check Network Tab:**
   - Press F12
   - Go to Network tab
   - Reload the page
   - Look for failed requests to Supabase
   - Check the response/error details

3. **Verify Supabase Project:**
   - Log into Supabase dashboard
   - Check project status
   - Check if migrations were run
   - Check if tables exist

4. **Check CORS Settings:**
   - In Supabase dashboard
   - Go to Settings → API
   - Add `http://localhost:3000` to allowed origins (should be default)

---

## ✅ After Fix Checklist

Once connected successfully, you should see:

- ✅ Dashboard loads without errors
- ✅ User profile data displays
- ✅ Protein logs can be added
- ✅ No "Failed to fetch" errors in console
- ✅ Authentication works (login/signup)

---

## 🎯 Next Steps

After fixing the connection:

1. Run database migrations (if not done):
   ```bash
   # Connect to Supabase and run migrations
   # Instructions in docs/SETUP_CHECKLIST.md
   ```

2. Seed workout data:
   ```bash
   npm run seed:workouts
   ```

3. Test all features:
   - Login/Signup
   - Dashboard
   - Protein tracking
   - Workout tracking
   - Settings

---

**TL;DR:**
1. Check your `.env.local` has correct Supabase credentials
2. Make sure your Supabase project isn't paused
3. Restart your dev server after any `.env.local` changes
4. Visit Supabase dashboard to get/verify credentials if needed

