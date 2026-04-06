import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(__dirname, '.env.local') });

/**
 * Base URL for E2E tests.
 * - PLAYWRIGHT_PRODUCTION_URL — Vercel / production smoke (also set PLAYWRIGHT_SKIP_WEBSERVER=1)
 * - PLAYWRIGHT_TEST_BASE_URL — override for any environment
 * - default — local dev
 */
const baseURL =
  process.env.PLAYWRIGHT_PRODUCTION_URL ||
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  'http://localhost:3000';

const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  ...(skipWebServer
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          // Prefer reusing a running dev server so local runs don't fail when port 3000 is taken.
          reuseExistingServer: true,
        },
      }),
});

