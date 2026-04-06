# How to Find Your Supabase Account

If you've lost access to your Supabase project (e.g. "Load failed" errors, project paused), try these steps to recover it.

---

## 1. Check Your Email

Search your inbox for:

- **"Supabase"** – signup confirmation, project invites, password reset
- **"Welcome to Supabase"** – initial signup
- **"Your Supabase project is ready"** – project creation

The email you used to sign up is your Supabase login.

---

## 2. Try Sign-In Methods

Go to **[supabase.com](https://supabase.com)** and click **Sign in**:

- **Sign in with Google** – if you used Google
- **Sign in with GitHub** – if you used GitHub
- **Sign in with Email** – use "Forgot password?" if needed

---

## 3. Use Your Password Manager

If you use 1Password, Bitwarden, LastPass, etc.:

- Search for **"supabase"**
- Look for `supabase.com` or `app.supabase.com`

---

## 4. Check Your `.env.local`

Your project ID is in the Supabase URL:

```
NEXT_PUBLIC_SUPABASE_URL=https://mnmnfaseiddqfiufckem.supabase.co
```

The project ID is: **`mnmnfaseiddqfiufckem`**

- Go to **[supabase.com/dashboard](https://supabase.com/dashboard)**
- If you're logged in, your projects (including this one) appear in the list
- If the project is **paused**, you’ll see a banner to **Restore project**

---

## 5. If You Still Can’t Find It

- **Create a new Supabase project** at [supabase.com/dashboard](https://supabase.com/dashboard)
- Update `.env.local` with the new project URL and keys
- Re-run migrations: `npx supabase db push` (or apply migrations manually in the SQL Editor)

---

## 6. Restoring a Paused Project

Free-tier projects pause after ~1 week of inactivity:

1. Log in at [supabase.com](https://supabase.com)
2. Open your project
3. Click **Restore project** in the banner
4. Wait 1–2 minutes
5. Retry your app – auth and data should work again
