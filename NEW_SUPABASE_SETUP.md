# Setting Up a New Supabase Account

## 1. Create a new project

1. Go to [supabase.com](https://supabase.com) and sign up or log in.
2. Click **New Project**.
3. Choose an organization (or create one).
4. Set a project name, database password, and region.
5. Wait for the project to finish provisioning.

---

## 2. Get your credentials

1. In the Supabase dashboard, open your project.
2. Go to **Project Settings** (gear icon) → **API**.
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret; server-side only)

---

## 3. Update `.env.local`

Create or edit `.env.local` in the project root:

```env
# Supabase (from your new project)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with the values from step 2.

---

## 4. Run database migrations

You need to apply the schema from `supabase/migrations/` to your new database.

### Option A: Supabase CLI (recommended)

```bash
# Link to your new project (use the project ref from the URL: supabase.com/dashboard/project/XXXXX)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
npx supabase db push
```

The project ref is the part after `/project/` in the dashboard URL (e.g. `abcdefghijklmnop`).

### Option B: SQL Editor (manual) — use when `db push` fails with TLS errors

1. In the Supabase dashboard, go to **SQL Editor** → **New Query**.
2. Open `supabase/run_all_migrations.sql` in your project.
3. Copy the entire file contents and paste into the SQL Editor.
4. Click **Run** (or Cmd+Enter).

All 13 migrations run in one go. If you prefer to run them one by one, use the individual files in `supabase/migrations/` in order (001 through 013).

---

## 5. Enable Auth providers (optional)

If you use email/password signup:

1. Go to **Authentication** → **Providers**.
2. Enable **Email** (and any others you need).
3. Under **URL Configuration**, add your site URL (e.g. `http://localhost:3000` for dev).

---

## 6. Enable Storage (for progress photos)

1. Go to **Storage**.
2. The migrations create a `progress-photos` bucket; if it doesn’t exist, create it.
3. Set policies as needed (migration `004_storage_policies.sql` should define them).

---

## 7. Regenerate types (optional)

To refresh TypeScript types from the new database:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > types/database.types.ts
```

---

## Quick checklist

- [ ] New Supabase project created
- [ ] `.env.local` updated with URL, anon key, service_role key
- [ ] Migrations applied (`npx supabase db push` or manual SQL)
- [ ] Auth providers configured
- [ ] App tested (`npm run dev`)
