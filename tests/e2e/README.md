# End-to-End Testing with Playwright

This directory contains end-to-end tests for the GLP-1 Fitness Tracker application.

## Setup

1. **Install Playwright browsers** (if not already installed):
   ```bash
   npx playwright install
   ```

2. **Set up environment variables**:
   Make sure your `.env.local` includes:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (for test cleanup)

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Compliance / production smoke (chromium only — see below)
npm run test:e2e:smoke

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Production smoke (Vercel)

`tests/e2e/production-smoke.spec.ts` hits the same routes as compliance checks.

**Shell env (replace placeholders, then run tests):**

```bash
export PLAYWRIGHT_PRODUCTION_URL="https://YOUR_PROJECT.vercel.app"
export PLAYWRIGHT_SKIP_WEBSERVER=1
export TEST_USER_EMAIL="your-test@email.com"
export TEST_USER_PASSWORD="your-test-password"
npx playwright test --project=chromium --grep "Production smoke"
```

- **`PLAYWRIGHT_SKIP_WEBSERVER=1`** — required for production URL so Playwright does not start `npm run dev`.
- **Supabase** — keep `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (loaded by `playwright.config.ts`) so onboarding tests can create confirmed users and `cleanupTestUser` can run.
- **`TEST_USER_*`** — use a **fully onboarded** account for the two `/settings` tests; omit exports to skip those tests.

Onboarding tests use the **Admin API** (`createTestUser`) when the service-role key is present so they still pass if Supabase requires email confirmation on signup.

See also commented placeholders in **`.env.example`** under “Playwright E2E — production smoke”.

## Test Helpers

### Authentication Helpers (`helpers/auth.ts`)

- `signUp(page, email?, password?, fullName?)` - Sign up a new user
- `signIn(page, email, password)` - Sign in an existing user
- `signOut(page)` - Sign out the current user

### Cleanup Helpers (`helpers/cleanup.ts`)

- `cleanupTestUser(email)` - Delete a test user and all related data

## Writing Tests

Example test structure:

```typescript
import { test, expect } from '@playwright/test';
import { signUp, signIn } from './helpers/auth';
import { cleanupTestUser } from './helpers/cleanup';

test.describe('Feature Name', () => {
  let testEmail: string;

  test.beforeEach(async ({ page }) => {
    testEmail = `test-${Date.now()}@example.com`;
    await signUp(page, testEmail, 'TestPassword123!');
  });

  test.afterEach(async () => {
    await cleanupTestUser(testEmail);
  });

  test('should do something', async ({ page }) => {
    // Your test code here
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## Test Configuration

Tests are configured in `playwright.config.ts`:

- **Test Directory**: `./tests/e2e`
- **Base URL**: `http://localhost:3000` (or `PLAYWRIGHT_TEST_BASE_URL` env var)
- **Browsers**: Chromium (Desktop) and Mobile (iPhone 13)
- **Auto-start server**: Development server starts automatically

## Best Practices

1. **Always cleanup**: Use `test.afterEach` to clean up test users
2. **Unique emails**: Use `Date.now()` to generate unique test emails
3. **Wait for navigation**: Use `page.waitForURL()` after form submissions
4. **Use data-testid**: Prefer `data-testid` attributes for selectors when possible
5. **Isolate tests**: Each test should be independent and not rely on other tests

## CI/CD

In CI environments:
- Tests run with 2 retries
- Screenshots and traces are captured on failure
- Single worker mode for stability

