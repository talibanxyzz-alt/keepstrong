# KeepStrong (GLP-1 Fitness Tracker) — Project Review & Feedback

**Review date:** March 8, 2025  
**Scope:** Codebase structure, config, patterns, and actionable improvements

---

## Overall assessment

**Verdict: Strong product, some tech debt to clear before calling it “done”.**

- **Product:** Clear value for GLP-1 users (protein, workouts, dose calendar, progress, achievements). Feature set is broad and coherent.
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, Stripe — modern and appropriate.
- **Architecture:** App Router, server/client split, shared types and libs are used sensibly.
- **Docs:** `PROJECT_REVIEW_CURRENT.md` and others give a clear picture of scope and status.

Main gaps: TypeScript/ESLint are bypassed in build, duplicate/legacy files, and a few consistency and security tweaks.

---

## What’s working well

1. **Feature coverage** — Dashboard, protein logging, workouts (programs + active session + history), progress, dose calendar, photos, achievements, settings, pricing. Matches the “GLP-1 fitness tracker” positioning.
2. **Data layer** — Supabase client (server + middleware), typed `Database`, RLS-oriented design. Parallel data loading in `app/dashboard/page.tsx` is a good pattern.
3. **UX** — Dynamic imports for heavier UI (e.g. `PostMealRatingPrompt`, `AchievementUnlocked`), toast (Sonner), and structured layout (Sidebar + MainLayout).
4. **Config** — Image domains, Sentry, experimental optimizations (e.g. `optimizePackageImports` for recharts/lucide) are set up.
5. **Scripts** — `type-check`, E2E (Playwright), cache/clean and seed scripts are present and useful.

---

## Critical: build and type safety

### 1. TypeScript and ESLint skipped in build

**Current (`next.config.js`):**

```js
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true },
```

**Impact:** The app can build and deploy while type and lint errors exist. That hides regressions and makes refactors riskier.

**Recommendation:**

- Fix the remaining TypeScript errors (and any high-value ESLint issues) in batches.
- Turn both off: set `ignoreDuringBuilds: false` and `ignoreBuildErrors: false`.
- Keep them off so CI and local `npm run build` enforce type and lint.

### 2. TypeScript not on PATH

`npm run type-check` uses `tsc --noEmit` but `tsc` isn’t in PATH when run as-is (e.g. “tsc: command not found”). Use the local compiler:

- In `package.json`: `"type-check": "npx tsc --noEmit"` or rely on `node_modules/.bin/tsc` (e.g. `npm run type-check` which already uses npm’s path).
- Ensure `npm run type-check` is run from the project root after `npm install` so `node_modules/.bin` is available.

### 3. `as any` and type assertions

Example in `app/dashboard/page.tsx`:

```ts
supabase as any // Type assertion needed due to SSR client type mismatch
```

**Recommendation:** Prefer a properly typed server Supabase helper (or a shared type for “Supabase client used in server context”) so you can remove `as any`. Same for other `as any` or broad assertions; track them and replace with real types.

---

## High priority: repo and consistency

### 4. Duplicate / “(1)” files

These look like accidental copies (e.g. from macOS “Duplicate”) and are not imported anywhere:

- `components/features/EditProteinLogModal(1).tsx`
- `components/features/QuickAddFood(1).tsx`
- `components/features/WorkoutTracker(1).tsx`
- `components/features/DeleteProteinLogModal(1).tsx`
- Similar `(1)` variants in `types/` (e.g. `database.types(1).ts`) if present.

**Recommendation:** Delete these duplicates and leave a single source of truth for each component/type. Reduces noise and avoids someone editing the wrong file.

### 5. Middleware vs. protected routes

Protected routes in `lib/supabase/middleware.ts` are:

- `/dashboard`, `/workouts`, `/progress`, `/settings`, `/onboarding`

Pages like `/dose-calendar`, `/photos`, `/achievements` are not in this list. If those pages already redirect unauthenticated users (e.g. via server `getUser()` + `redirect`), behavior can be correct but inconsistent.

**Recommendation:** Either:

- Add all app routes that require login to the middleware’s “protected” list (e.g. `/dose-calendar`, `/photos`, `/achievements`), or  
- Document that protection is “page-level” for those routes and keep middleware as-is.

Prefer centralizing in middleware so one place defines “what requires auth”.

### 6. README vs. actual stack

README says “Next.js 14” and “Next.js 14 (App Router)”. `package.json` has Next.js 16.

**Recommendation:** Update README (and any other docs) to “Next.js 16” and “App Router” so new contributors and future you don’t get confused.

---

## Medium priority: code quality and ops

### 7. Console usage in app code

There are multiple `console.log` / `console.error` / `console.warn` calls in app and lib code (e.g. dashboard page, features, `lib/utils`, `lib/email`, `lib/errors`).

**Recommendation:**

- Use a small logger that can be swapped (e.g. log level, or Sentry in production) and replace `console.*` in app and lib code with that.
- Keep `console.*` only in scripts or local dev if you prefer.

### 8. Error handling

Some flows use `console.error` and return null or generic messages; others may throw or redirect. Standardizing on “user-facing message + structured server log (or Sentry)” will make debugging and UX more predictable.

### 9. Environment variables

Supabase and Stripe clients use `process.env.NEXT_PUBLIC_*` and `process.env.SUPABASE_SERVICE_ROLE_KEY` etc. with non-null assertions (`!`). If a key is missing, failure can be opaque.

**Recommendation:** At app startup or in a small env module, validate required env vars and throw a clear error if any are missing (e.g. in `next.config.js` or a shared bootstrap used by server code).

---

## Lower priority / later

- **Tests:** E2E exists; adding a few critical path unit tests (e.g. streak logic, dose-day logic) would help refactors.
- **Performance:** You already use parallel queries and dynamic imports; any further optimization can follow real metrics (e.g. LCP, TTI).
- **i18n / PWA:** Good “next phase” items once type/lint and cleanup are done.

---

## Suggested order of work

1. **This week:** Fix `type-check` script (use local `tsc`), then fix enough TypeScript errors so build passes with `ignoreBuildErrors: false`; remove duplicate `(1)` files; update README to Next.js 16.
2. **Next:** Re-enable ESLint in build (`ignoreDuringBuilds: false`) and fix blocking lint issues; then add missing protected routes to middleware (or document the split).
3. **Then:** Replace `as any` with proper types; introduce a simple logger and reduce `console.*` in app code; tighten env validation.

---

## Summary table

| Area              | Status   | Action                                      |
|-------------------|----------|---------------------------------------------|
| Feature set       | Good     | Keep as-is; optional enhancements later    |
| Stack & structure | Good     | Update README; optional small refactors    |
| TypeScript        | Needs work | Re-enable in build; fix errors; remove `as any` |
| ESLint            | Needs work | Re-enable in build; fix blocking issues    |
| Duplicate files   | Clean up | Delete `(1)` (and similar) copies          |
| Auth / middleware | Minor    | Align protected routes or document          |
| Logging / errors  | Improve  | Centralize logging; standardize handling  |
| Env validation    | Improve  | Validate required env on startup            |

If you want, next step can be: (1) a concrete patch for `package.json` + README + middleware, or (2) a list of files to delete for the `(1)` duplicates, or (3) a plan to fix TypeScript in one subfolder (e.g. `app/dashboard` or `lib/utils`) first.
