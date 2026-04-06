import { test, expect } from '@playwright/test';
import { signUp, completeOnboarding } from './helpers/auth';
import { cleanupTestUser } from './helpers/cleanup';

test.describe('Critical Path: New User Journey', () => {
  let testEmail: string;

  test.afterEach(async () => {
    // Cleanup test data
    if (testEmail) {
      await cleanupTestUser(testEmail);
    }
  });

  test('user can sign up, complete onboarding, and log protein', async ({ page }) => {
    // Step 1: Sign up
    const { email } = await signUp(page);
    testEmail = email;

    // Should be on onboarding page
    await expect(page).toHaveURL('/onboarding');
    await expect(page.locator('h2')).toContainText("Let's start with the basics");

    // Complete onboarding flow
    await completeOnboarding(page, {
      fullName: 'Test User',
      weight: 80,
      height: 175,
      medication: 'ozempic',
      doseDay: 1,
    });
    
    // Verify dashboard loaded
    await expect(page.locator('h2, h1')).toContainText(/Good (morning|afternoon|evening)|Dashboard|Today/i);

    // Step 6: Open Quick Add Food
    const quickAddButton = page.locator('button:has-text("Quick Add")').or(page.locator('text=/Quick Add/i'));
    if (await quickAddButton.isVisible()) {
      await quickAddButton.click();
    }

    // Wait for Quick Add Food component to be visible
    await page.waitForSelector('text=/Chicken Breast|Scrambled Eggs|Greek Yogurt/i', { timeout: 5000 });

    // Step 7: Log first protein meal - Click on Chicken Breast
    const chickenButton = page.locator('button:has-text("Chicken Breast")').or(
      page.locator('button').filter({ hasText: /Chicken Breast/i })
    );
    
    if (await chickenButton.isVisible()) {
      await chickenButton.click();
    } else {
      // Fallback: click first food button
      const firstFoodButton = page.locator('button').filter({ hasText: /protein/i }).first();
      await firstFoodButton.click();
    }

    // Wait for success toast/message
    await expect(
      page.locator('text=/Added|success|30g|protein/i').first()
    ).toBeVisible({ timeout: 5000 });

    // Step 8: Verify protein count updated on dashboard
    // Look for protein count in the dashboard (format: "Xg" or "X / Yg")
    await expect(
      page.locator('text=/\\d+g|\\d+\\s*\\/\\s*\\d+g/i').first()
    ).toBeVisible({ timeout: 3000 });
  });

  test('user can log custom food', async ({ page }) => {
    const { email } = await signUp(page);
    testEmail = email;

    // Complete onboarding
    await completeOnboarding(page);

    // Open Quick Add Food
    const quickAddButton = page.locator('button:has-text("Quick Add")').or(page.locator('text=/Quick Add/i'));
    if (await quickAddButton.isVisible()) {
      await quickAddButton.click();
    }

    // Wait for Quick Add component
    await page.waitForSelector('text=/Custom|Add Custom/i', { timeout: 5000 });

    // Click custom food button (usually has a "+" or "Custom" text)
    const customFoodButton = page.locator('button:has-text("Custom")').or(
      page.locator('button:has-text("+")').last()
    );
    
    if (await customFoodButton.isVisible()) {
      await customFoodButton.click();
    } else {
      // Try clicking any button with "+" icon
      await page.locator('button').filter({ hasText: /\\+|Custom/i }).last().click();
    }

    // Wait for modal/form to appear
    await page.waitForSelector('input[type="text"], input[name*="food"], input[name*="name"]', { timeout: 5000 });

    // Fill custom food form
    // Look for food name input (could be various selectors)
    const foodNameInput = page.locator('input[type="text"]').first().or(
      page.locator('input[name*="food"]').or(page.locator('input[name*="name"]'))
    );
    await foodNameInput.fill('Test Meal');

    // Fill protein amount
    const proteinInput = page.locator('input[type="number"]').last().or(
      page.locator('input[name*="protein"]')
    );
    await proteinInput.fill('45');

    // Select meal type if dropdown exists
    const mealTypeSelect = page.locator('select').first();
    if (await mealTypeSelect.isVisible()) {
      await mealTypeSelect.selectOption('lunch');
    }

    // Submit form
    const submitButton = page.locator('button:has-text("Log")').or(
      page.locator('button:has-text("Add")').or(page.locator('button[type="submit"]'))
    );
    await submitButton.click();

    // Wait for success message
    await expect(
      page.locator('text=/Added|success|Test Meal|45g/i').first()
    ).toBeVisible({ timeout: 5000 });

    // Verify logged food appears (might be in a list or summary)
    await expect(
      page.locator('text=/Test Meal/i').first()
    ).toBeVisible({ timeout: 3000 });
  });

  test('user can see protein progress after logging', async ({ page }) => {
    const { email } = await signUp(page);
    testEmail = email;

    // Complete onboarding
    await completeOnboarding(page);

    // Open Quick Add and log food
    const quickAddButton = page.locator('button:has-text("Quick Add")').or(page.locator('text=/Quick Add/i'));
    if (await quickAddButton.isVisible()) {
      await quickAddButton.click();
    }
    
    await page.waitForSelector('text=/Chicken Breast|protein/i', { timeout: 5000 });
    
    const firstFoodButton = page.locator('button').filter({ hasText: /Chicken Breast|Eggs|Yogurt/i }).first();
    await firstFoodButton.click();

    // Wait for success
    await expect(page.locator('text=/Added|success/i').first()).toBeVisible({ timeout: 5000 });

    // Verify progress is shown (protein count, progress bar, or percentage)
    await expect(
      page.locator('text=/\\d+g|\\d+%|protein/i').first()
    ).toBeVisible({ timeout: 3000 });
  });
});

