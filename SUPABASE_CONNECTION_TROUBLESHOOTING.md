# 🔧 Supabase Connection Error - Complete Troubleshooting Guide

## ❌ Current Error

```
TypeError: Failed to fetch (mnmnfaseiddqfiufckem.supabase.co)
ERR_NAME_NOT_RESOLVED
```

**This means:** The browser cannot resolve the hostname `mnmnfaseiddqfiufckem.supabase.co`. This is typically because:

1. **Supabase project is paused** (most common - free tier pauses after 7 days)
2. **Project was deleted or doesn't exist**
3. **Wrong URL in environment variables**
4. **Network/DNS issues**

---

## 🚨 Quick Fix Checklist

### Step 1: Check Supabase Project Status ⭐ MOST COMMON FIX

**Free tier Supabase projects automatically pause after 7 days of inactivity.**

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Look for your project `mnmnfaseiddqfiufckem`
4. **If you see "Project is paused":**
   - Click **"Restore project"** or **"Resume"**
   - Wait 1-2 minutes for the project to wake up
   - The URL will become accessible again

**This fixes 90% of these errors!**

---

### Step 2: Verify Environment Variables

Check if your `.env.local` file exists and has correct values:

```bash
# In your project root
cat .env.local
```

**Required variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://mnmnfaseiddqfiufckem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Common issues:**
- ❌ Missing `.env.local` file
- ❌ Wrong URL (typo, wrong project ID)
- ❌ Missing `NEXT_PUBLIC_` prefix
- ❌ Quotes around values (not needed)

---

### Step 3: Get Correct Supabase Credentials

If you don't have the correct credentials:

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

---

### Step 4: Restart Development Server

**Environment variables are only loaded when the server starts!**

```bash
# Stop current server (Ctrl+C)

# Clear Next.js cache
npm run cache:clear

# Restart dev server
npm run dev
```

**Or with Turbopack:**
```bash
npm run cache:clear
npm run dev:turbo
```

---

### Step 5: Test Connection

After restarting, check:

1. Open browser console (F12)
2. Look for errors
3. Try accessing `/dashboard` or `/auth/login`
4. Check Network tab for Supabase requests

---

## 🔍 Detailed Diagnosis

### Check if Project Exists

Try accessing the Supabase URL directly in your browser:

```
https://mnmnfaseiddqfiufckem.supabase.co
```

**Expected responses:**
- ✅ **200 OK** or JSON response = Project is active
- ❌ **DNS error** or **Connection refused** = Project is paused or deleted
- ❌ **404 Not Found** = Project doesn't exist

---

### Verify Environment Variables in Browser

Create a test page to check if variables are loaded:

```typescript
// app/test-env/page.tsx
export default function TestEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Check</h1>
      <div className="space-y-2">
        <div>
          <strong>Supabase URL:</strong>{' '}
          {supabaseUrl ? (
            <span className="text-green-600">✅ {supabaseUrl}</span>
          ) : (
            <span className="text-red-600">❌ NOT SET</span>
          )}
        </div>
        <div>
          <strong>Anon Key:</strong>{' '}
          {hasAnonKey ? (
            <span className="text-green-600">✅ Set (hidden)</span>
          ) : (
            <span className="text-red-600">❌ NOT SET</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

Visit `http://localhost:3000/test-env` to verify.

---

## 🛠️ Solutions by Error Type

### Error: `ERR_NAME_NOT_RESOLVED`

**Cause:** DNS cannot resolve the hostname

**Solutions:**
1. **Check if project is paused** (most common)
   - Go to Supabase dashboard
   - Restore paused project
   
2. **Verify URL is correct**
   - Check `.env.local` file
   - Ensure URL matches your Supabase project
   
3. **Check if project exists**
   - Log into Supabase dashboard
   - Verify project ID matches

---

### Error: `Failed to fetch` (Network Error)

**Cause:** Network connectivity issue or CORS

**Solutions:**
1. **Check internet connection**
2. **Verify CORS settings** in Supabase:
   - Settings → API
   - Ensure `http://localhost:3000` is in allowed origins
3. **Check firewall/proxy** settings

---

### Error: `401 Unauthorized`

**Cause:** Wrong API key

**Solutions:**
1. **Verify anon key** in `.env.local`
2. **Get fresh key** from Supabase dashboard
3. **Restart dev server** after updating

---

## 📋 Environment Variables Template

Create/update `.env.local` in project root:

```bash
# ============================================
# SUPABASE (REQUIRED)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubW5mYXNlaWRkcWZpdWZjZW0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2ODAwMCwiZXhwIjoyMDE0MzQ0MDAwfQ.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# STRIPE (OPTIONAL - for payments)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CORE_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# ============================================
# EMAIL (OPTIONAL - for email features)
# ============================================
RESEND_API_KEY=re_...

# ============================================
# SENTRY (OPTIONAL - for error tracking)
# ============================================
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
```

---

## 🎯 Step-by-Step Fix Process

### Option A: Project is Paused (Most Likely)

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Find your project** `mnmnfaseiddqfiufckem`

3. **Click "Restore" or "Resume"**

4. **Wait 1-2 minutes** for project to wake up

5. **Restart your dev server:**
   ```bash
   npm run cache:clear
   npm run dev
   ```

6. **Test again** - error should be gone!

---

### Option B: Wrong Credentials

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Select your project**

3. **Go to Settings → API**

4. **Copy the correct values:**
   - Project URL
   - anon/public key

5. **Update `.env.local`:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_ACTUAL_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY
   ```

6. **Restart dev server:**
   ```bash
   npm run cache:clear
   npm run dev
   ```

---

### Option C: Project Doesn't Exist

1. **Create a new Supabase project:**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Fill in details
   - Wait for project to be created

2. **Get new credentials** (Settings → API)

3. **Update `.env.local`** with new credentials

4. **Run database migrations:**
   - Go to SQL Editor in Supabase
   - Run all migrations from `supabase/migrations/`

5. **Restart dev server**

---

## ✅ Verification Checklist

After fixing, verify everything works:

- [ ] No "Failed to fetch" errors in console
- [ ] Can access `/auth/login` page
- [ ] Can sign up / log in
- [ ] Dashboard loads without errors
- [ ] Can view profile data
- [ ] Can log protein entries
- [ ] Can start workouts

---

## 🆘 Still Not Working?

If none of the above fixes work:

1. **Check Supabase Status Page:**
   - [status.supabase.com](https://status.supabase.com)

2. **Verify Network Connection:**
   ```bash
   # Test DNS resolution
   nslookup mnmnfaseiddqfiufckem.supabase.co
   
   # Test connectivity
   curl https://mnmnfaseiddqfiufckem.supabase.co
   ```

3. **Check Browser Console:**
   - Press F12
   - Go to Network tab
   - Reload page
   - Look for failed requests
   - Check response details

4. **Try Different Browser:**
   - Sometimes browser extensions interfere

5. **Check Firewall/Proxy:**
   - Ensure `*.supabase.co` is not blocked

---

## 📞 Quick Reference

**Most Common Fix:**
```bash
# 1. Restore paused Supabase project in dashboard
# 2. Restart dev server
npm run cache:clear && npm run dev
```

**Get Credentials:**
```
Supabase Dashboard → Settings → API
```

**Test Connection:**
```
Visit: http://localhost:3000/test-env
```

---

## 🎯 TL;DR

1. **90% of the time:** Supabase project is paused → Restore it in dashboard
2. **5% of the time:** Wrong credentials → Update `.env.local`
3. **5% of the time:** Project deleted → Create new project

**Always restart dev server after changing `.env.local`!**

