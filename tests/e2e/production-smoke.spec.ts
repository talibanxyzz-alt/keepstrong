/**
 * Compliance / production smoke tests.
 *
 * Local (default): uses baseURL from playwright.config (localhost + auto webServer).
 * Production: set PLAYWRIGHT_PRODUCTION_URL=https://YOUR_APP.vercel.app and PLAYWRIGHT_SKIP_WEBSERVER=1
 * (see tests/e2e/README.md).
 */
import { test, expect, type Page } from '@playwright/test';
import { createTestUser, signInTestUser } from './helpers/auth';
import { cleanupTestUser } from './helpers/cleanup';

const DEFAULT_SMOKE_PASSWORD = 'TestPassword123';

function hasSupabaseAdminEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Land on /onboarding as a fresh user.
 * When Supabase service-role env vars are set, creates a confirmed user via Admin API and
 * signs in (works even if "confirm email" is required). Otherwise uses the signup UI, which
 * needs immediate session / auto-confirm in Supabase.
 */
async function signUpForOnboarding(page: Page): Promise<{ email: string }> {
  const email = `pw-smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

  if (hasSupabaseAdminEnv()) {
    await createTestUser(email, DEFAULT_SMOKE_PASSWORD);
    await page.goto('/auth/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(DEFAULT_SMOKE_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/onboarding/, { timeout: 45_000 });
    return { email };
  }

  await page.goto('/auth/signup');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(DEFAULT_SMOKE_PASSWORD);
  await page.locator('#gdpr-consent').check();
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForURL(/\/onboarding/, { timeout: 45_000 });
  return { email };
}

function continueButton(page: Page) {
  return page.locator('div.mt-8.flex.justify-between').getByRole('button', { name: 'Continue' });
}

test.describe('Production smoke — compliance UI', () => {
  test.describe.configure({ timeout: 90_000, retries: 0 });

  test('onboarding: consent is first step; Continue disabled until checkbox is checked', async ({
    page,
  }) => {
    let email = '';
    try {
      const created = await signUpForOnboarding(page);
      email = created.email;
      test.info().annotations.push({ type: 'testUser', description: email });

      await expect(page.getByRole('heading', { name: 'Before we get started' })).toBeVisible();

      const consentCheckbox = page.getByRole('checkbox', {
        name: /not a substitute for medical advice/i,
      });
      await expect(consentCheckbox).not.toBeChecked();

      const nextContinue = continueButton(page);
      await expect(nextContinue).toBeDisabled();

      await consentCheckbox.check();
      await expect(nextContinue).toBeEnabled();
    } finally {
      if (email) {
        await cleanupTestUser(email);
      }
    }
  });

  test('onboarding: under-18 DOB shows block screen and Go to Homepage', async ({ page }) => {
    let email = '';
    try {
      const created = await signUpForOnboarding(page);
      email = created.email;
      test.info().annotations.push({ type: 'testUser', description: email });

      await page.getByRole('checkbox', { name: /not a substitute for medical advice/i }).check();
      await continueButton(page).click();

      await expect(page.getByRole('heading', { name: 'What is your date of birth?' })).toBeVisible();

      await page.locator('#dob-day').selectOption('15');
      await page.locator('#dob-month').selectOption('1');
      await page.locator('#dob-year').selectOption('2015');

      await continueButton(page).click();

      await expect(page.getByRole('heading', { name: 'KeepStrong is for adults 18+' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Go to Homepage' })).toBeVisible();
    } finally {
      if (email) {
        await cleanupTestUser(email);
      }
    }
  });

  test('signup: GDPR checkbox present, unchecked; submit disabled until checked', async ({
    page,
  }) => {
    await page.goto('/auth/signup');

    const gdpr = page.locator('#gdpr-consent');
    await expect(gdpr).toBeVisible();
    await expect(gdpr).not.toBeChecked();

    const submit = page.getByRole('button', { name: /create account/i });
    await expect(submit).toBeDisabled();

    await gdpr.check();
    await expect(submit).toBeEnabled();
  });

  test('privacy: page loads and #what-we-collect exists', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('#what-we-collect')).toBeAttached();
  });

  test('terms: page loads and #medical-disclaimer exists', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('#medical-disclaimer')).toBeAttached();
  });

  test('settings: Export Your Data section visible when TEST_USER_* credentials are set', async ({
    page,
  }) => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      'Requires TEST_USER_EMAIL and TEST_USER_PASSWORD for authenticated /settings checks. ' +
        'Set these in the environment (e.g. .env.local loaded via dotenv-cli) or verify manually in production.'
    );

    await signInTestUser(page);
    await page.goto('/settings');

    await expect(
      page.getByRole('heading', { name: 'Export Your Data', exact: true })
    ).toBeVisible();
  });

  test('settings: Delete My Account visible when TEST_USER_* credentials are set', async ({
    page,
  }) => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      'Requires TEST_USER_EMAIL and TEST_USER_PASSWORD for authenticated /settings checks. ' +
        'Set these in the environment or verify manually in production.'
    );

    await signInTestUser(page);
    await page.goto('/settings');

    await expect(page.getByRole('button', { name: 'Delete My Account' })).toBeVisible();
  });
});
