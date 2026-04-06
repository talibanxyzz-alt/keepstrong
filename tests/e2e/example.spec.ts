import { test, expect } from '@playwright/test';
import { signUp, signIn, signOut } from './helpers/auth';
import { cleanupTestUser } from './helpers/cleanup';

test.describe('Authentication', () => {
  let testEmail: string;
  let testPassword: string;

  test.beforeEach(() => {
    testEmail = `test-${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';
  });

  test.afterEach(async () => {
    // Cleanup test user after each test
    if (testEmail) {
      await cleanupTestUser(testEmail);
    }
  });

  test('should sign up a new user', async ({ page }) => {
    await signUp(page, testEmail, testPassword);
    
    // Should redirect to onboarding or dashboard
    await expect(page).toHaveURL(/\/(onboarding|dashboard)/);
  });

  test('should sign in an existing user', async ({ page }) => {
    // First create a user
    await signUp(page, testEmail, testPassword);
    
    // Sign out
    await signOut(page);
    
    // Sign in again
    await signIn(page, testEmail, testPassword);
    
    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type=submit]');
    
    // Should show error message
    await expect(page.locator('text=/error|invalid|incorrect/i')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  let testEmail: string;
  let testPassword: string;

  test.beforeEach(async ({ page }) => {
    testEmail = `test-${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';
    
    // Sign up and complete onboarding if needed
    await signUp(page, testEmail, testPassword);
    
    // If redirected to onboarding, complete it (adjust based on your onboarding flow)
    if (page.url().includes('/onboarding')) {
      // Add onboarding completion steps here
      // For now, just wait for redirect
      await page.waitForURL('/dashboard', { timeout: 10000 });
    }
  });

  test.afterEach(async () => {
    if (testEmail) {
      await cleanupTestUser(testEmail);
    }
  });

  test('should display dashboard after login', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    
    // Check for dashboard elements
    await expect(page.locator('text=/protein|dashboard/i')).toBeVisible();
  });
});

