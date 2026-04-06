# Fix Supabase Connection Error

## ❌ Error: Failed to fetch (mnmnfaseiddqfiufckem.supabase.co)

This error means your app can't connect to Supabase. Here's how to fix it:

---

## 🔧 Quick Fix (Most Common Issues)

### 1. **Check if Supabase Project is Paused** ⚠️

**Free tier Supabase projects pause after 7 days of inactivity.**

**Fix:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Find your project: `mnmnfaseiddqfiufckem`
3. If you see "Project is paused", click **"Restore project"**
4. Wait 1-2 minutes for it to restore
5. Restart your dev server

---

### 2. **Verify Environment Variables** ✅

Check your `.env.local` file exists and has correct values:

```bash
# Required - Must have these!
NEXT_PUBLIC_SUPABASE_URL=https://mnmnfaseiddqfiufckem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**To get your keys:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 3. **Restart Dev Server** 🔄

**After updating `.env.local`, you MUST restart:**

```bash
# Stop server (Ctrl+C)
cd /home/horus/Downloads/glp_1

# Clear cache
rm -rf .next

# Restart
npm run dev
```

**Important:** Environment variables only load when the server starts!

---

## 🔍 Step-by-Step Diagnosis

### Step 1: Check Environment Variables

```bash
# In your terminal, run:
cd /home/horus/Downloads/glp_1
cat .env.local | grep SUPABASE
```

**Expected output:**
```
NEXT_PUBLIC_SUPABASE_URL=https://mnmnfaseiddqfiufckem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If missing or wrong:**
- Create/update `.env.local` in the root directory
- Add the correct values from Supabase dashboard

---

### Step 2: Test Supabase Connection

Create a test file to verify connection:

```bash
# Create test file
cat > app/test-supabase/page.tsx << 'EOF'
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function TestSupabase() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="space-y-2">
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET'}</p>
          <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET'}</p>
          <p><strong>Connection:</strong> {error ? `❌ ERROR: ${error.message}` : '✅ SUCCESS'}</p>
        </div>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Connection Failed</h1>
        <pre className="bg-red-50 p-4 rounded">{err.message}</pre>
      </div>
    );
  }
}
EOF
```

Visit `http://localhost:3000/test-supabase` to see the connection status.

---

### Step 3: Check Browser Console

1. Open your app in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for detailed error messages
5. Go to **Network** tab
6. Reload page
7. Find the failed request to Supabase
8. Check the error details

---

## 🚨 Common Issues & Solutions

### Issue 1: Project is Paused
**Symptom:** Error 503 or "Project not found"  
**Solution:** Restore project in Supabase dashboard

### Issue 2: Wrong URL/Key
**Symptom:** Error 401 or "Invalid API key"  
**Solution:** Get correct credentials from Supabase dashboard

### Issue 3: Missing .env.local
**Symptom:** "NEXT_PUBLIC_SUPABASE_URL is not defined"  
**Solution:** Create `.env.local` file with correct values

### Issue 4: CORS Error
**Symptom:** "CORS policy" error in console  
**Solution:** 
- In Supabase dashboard → Settings → API
- Add `http://localhost:3000` to allowed origins (should be default)

### Issue 5: Network/Firewall
**Symptom:** "Failed to fetch" or timeout  
**Solution:** 
- Check internet connection
- Check firewall settings
- Try accessing Supabase dashboard directly

---

## ✅ Verification Checklist

After fixing, verify:

- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- [ ] Supabase project is active (not paused)
- [ ] Dev server restarted after `.env.local` changes
- [ ] No errors in browser console
- [ ] Dashboard loads successfully
- [ ] Can login/signup

---

## 🎯 Quick Command Reference

```bash
# 1. Check if .env.local exists
ls -la .env.local

# 2. View environment variables (be careful - don't share keys!)
cat .env.local | grep SUPABASE

# 3. Clear cache and restart
rm -rf .next && npm run dev

# 4. Test connection
curl https://mnmnfaseiddqfiufckem.supabase.co/rest/v1/ -H "apikey: YOUR_ANON_KEY"
```

---

## 📞 Still Not Working?

If the error persists:

1. **Double-check Supabase Dashboard:**
   - Project is active (not paused)
   - API keys are correct
   - Project URL matches exactly

2. **Check Network Tab:**
   - What's the exact error code? (401, 403, 503, etc.)
   - What's the response body?

3. **Try Direct API Call:**
   ```bash
   curl https://mnmnfaseiddqfiufckem.supabase.co/rest/v1/ \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

4. **Check Supabase Status:**
   - Visit [status.supabase.com](https://status.supabase.com)
   - Check if there are any outages

---

## 🔐 Security Note

**Never commit `.env.local` to git!**

Make sure `.env.local` is in your `.gitignore`:
```bash
echo ".env.local" >> .gitignore
```

---

**Most likely fix:** Your Supabase project is paused. Go to the dashboard and restore it! 🚀

