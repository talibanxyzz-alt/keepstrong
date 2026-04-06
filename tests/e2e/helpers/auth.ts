/**
 * E2E authentication helpers.
 *
 * Functions whose names match test-file imports:
 *   signUp, signIn, signOut, completeOnboarding
 *
 * Additional utilities:
 *   signInTestUser  – signs in using TEST_USER_EMAIL / TEST_USER_PASSWORD env vars
 *   signOutTestUser – alias of signOut (kept for semantic clarity)
 *   createTestUser  – creates a user via Supabase admin API (no browser needed)
 */

import { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Internal defaults
// ---------------------------------------------------------------------------

const DEFAULT_PASSWORD = 'TestPassword123!';

function generateTestEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
}

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------

/**
 * Sign up a new user through the browser UI.
 * If email/password are omitted, random values are generated.
 * Returns the email so tests can store it for later cleanup.
 */
export async function signUp(
  page: Page,
  email: string = generateTestEmail(),
  password: string = DEFAULT_PASSWORD
): Promise<{ email: string; password: string }> {
  await page.goto('/auth/signup');

  await page.fill('#email, input[type="email"], input[name="email"]', email);
  await page.fill('#password, input[type="password"], input[name="password"]', password);

  await page.click('button[type="submit"]');

  // After sign-up, app redirects to onboarding or dashboard
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 });

  return { email, password };
}

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------

/**
 * Sign in an existing user through the browser UI and wait for /dashboard.
 */
export async function signIn(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/auth/login');

  await page.fill('#email, input[type="email"], input[name="email"]', email);
  await page.fill('#password, input[type="password"], input[name="password"]', password);

  await page.click('button[type="submit"]');

  await page.waitForURL('/dashboard', { timeout: 15000 });
}

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------

/**
 * Sign out the current user via the UI and wait for the login page.
 */
export async function signOut(page: Page): Promise<void> {
  // Try sidebar / menu sign-out button first
  const signOutButton = page
    .locator('button:has-text("Sign Out"), button:has-text("Sign out"), button:has-text("Logout")')
    .first();

  if (await signOutButton.isVisible({ timeout: 3000 })) {
    await signOutButton.click();
  } else {
    // Fallback: navigate directly
    await page.goto('/auth/logout');
  }

  await page.waitForURL(/\/(auth\/login|login)/, { timeout: 10000 });
}

// ---------------------------------------------------------------------------
// completeOnboarding
// ---------------------------------------------------------------------------

interface OnboardingOptions {
  fullName?: string;
  weight?: number;
  height?: number;
  medication?: string;
  doseDay?: number;
}

/**
 * Step through the onboarding wizard and land on /dashboard.
 */
export async function completeOnboarding(
  page: Page,
  options: OnboardingOptions = {}
): Promise<void> {
  const {
    fullName = 'E2E Test User',
    weight = 80,
    height = 175,
    medication = 'ozempic',
    doseDay = 1,
  } = options;

  // Ensure we're on the onboarding page
  if (!page.url().includes('/onboarding')) {
    await page.waitForURL('/onboarding', { timeout: 10000 });
  }

  // ── Step 1: Basic info ──────────────────────────────────────────────────
  const fullNameInput = page.locator(
    'input[name="fullName"], input[name="full_name"], input[placeholder*="name" i]'
  ).first();
  if (await fullNameInput.isVisible({ timeout: 3000 })) {
    await fullNameInput.fill(fullName);
  }

  const weightInput = page.locator(
    'input[name="weight"], input[name="current_weight"], input[type="number"]'
  ).first();
  if (await weightInput.isVisible({ timeout: 3000 })) {
    await weightInput.fill(String(weight));
  }

  const heightInput = page.locator(
    'input[name="height"], input[name="height_cm"]'
  ).first();
  if (await heightInput.isVisible({ timeout: 3000 })) {
    await heightInput.fill(String(height));
  }

  // Advance to next step
  await clickNextOrContinue(page);

  // ── Step 2: GLP-1 medication ────────────────────────────────────────────
  const medicationOption = page.locator(
    `button:has-text("${medication}"), label:has-text("${medication}"), [value="${medication}"]`
  ).first();

  if (await medicationOption.isVisible({ timeout: 3000 })) {
    await medicationOption.click();
  } else {
    // Fallback: try a select element
    const medicationSelect = page.locator('select[name*="medication"]').first();
    if (await medicationSelect.isVisible({ timeout: 2000 })) {
      await medicationSelect.selectOption(medication);
    }
  }

  await clickNextOrContinue(page);

  // ── Step 3: Dose day ────────────────────────────────────────────────────
  const doseDayButton = page.locator(
    `button[data-day="${doseDay}"], button:has-text("${getDayName(doseDay)}")`
  ).first();

  if (await doseDayButton.isVisible({ timeout: 3000 })) {
    await doseDayButton.click();
  }

  await clickNextOrContinue(page);

  // ── Final step: finish / submit ─────────────────────────────────────────
  const finishButton = page
    .locator('button:has-text("Finish"), button:has-text("Get Started"), button:has-text("Complete"), button[type="submit"]')
    .first();

  if (await finishButton.isVisible({ timeout: 3000 })) {
    await finishButton.click();
  }

  await page.waitForURL('/dashboard', { timeout: 15000 });
}

// ---------------------------------------------------------------------------
// signInTestUser  (uses env vars instead of explicit credentials)
// ---------------------------------------------------------------------------

/**
 * Signs in using TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables.
 * Useful for tests that need a pre-existing seeded account.
 */
export async function signInTestUser(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'signInTestUser requires TEST_USER_EMAIL and TEST_USER_PASSWORD env vars.'
    );
  }

  await signIn(page, email, password);
}

// ---------------------------------------------------------------------------
// signOutTestUser
// ---------------------------------------------------------------------------

/** Alias of signOut — provided for semantic clarity. */
export async function signOutTestUser(page: Page): Promise<void> {
  return signOut(page);
}

// ---------------------------------------------------------------------------
// createTestUser  (Supabase admin API — no browser required)
// ---------------------------------------------------------------------------

/**
 * Creates a test user directly via the Supabase admin API.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */
export async function createTestUser(
  email: string = generateTestEmail(),
  password: string = DEFAULT_PASSWORD
): Promise<{ id: string; email: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'createTestUser requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.'
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`createTestUser failed: ${error?.message ?? 'unknown error'}`);
  }

  return { id: data.user.id, email: data.user.email! };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function clickNextOrContinue(page: Page): Promise<void> {
  const nextButton = page
    .locator(
      'button:has-text("Next"), button:has-text("Continue"), button:has-text("Next Step")'
    )
    .first();

  if (await nextButton.isVisible({ timeout: 2000 })) {
    await nextButton.click();
    // Brief pause to let the step transition
    await page.waitForTimeout(500);
  }
}

function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] ?? 'Monday';
}
