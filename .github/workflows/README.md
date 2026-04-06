# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD.

## Playwright Tests (`playwright.yml`)

Runs end-to-end tests on every push and pull request to `main` and `develop` branches.

### Features

- ✅ Automatic server startup (Playwright handles this via `webServer` config)
- ✅ Runs tests in Chromium browser
- ✅ Uploads test reports and screenshots as artifacts
- ✅ Retries failed tests (2 retries in CI)
- ✅ 60-minute timeout for long-running tests

### Required Secrets

Configure these secrets in your GitHub repository settings:

1. **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Supabase anonymous key
3. **SUPABASE_SERVICE_ROLE_KEY** - Supabase service role key (for test cleanup)

### Optional Secrets

These are optional but recommended:

- **STRIPE_SECRET_KEY** - Stripe test secret key (for subscription tests)
- **STRIPE_PUBLISHABLE_KEY** - Stripe test publishable key
- **NEXT_PUBLIC_SENTRY_DSN** - Sentry DSN (for error tracking in tests)

### How to Set Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its value

### Artifacts

The workflow uploads these artifacts:

- **playwright-report** - HTML test report (retained for 30 days)
- **test-results** - Test result files (retained for 7 days)
- **test-screenshots** - Screenshots from failed tests (retained for 7 days)

### Viewing Test Results

1. Go to the **Actions** tab in your GitHub repository
2. Click on a workflow run
3. Scroll down to **Artifacts**
4. Download and open `playwright-report/index.html` to view the full report

### Troubleshooting

**Tests fail with "Connection refused"**
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify the Supabase project is accessible

**Tests timeout**
- Increase `timeout-minutes` in the workflow file
- Check if tests are waiting for external services

**Build fails**
- Ensure all required environment variables are set
- Check that `npm ci` completes successfully

### Local Testing

To test the workflow locally:

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps chromium

# Run tests (Playwright will start the dev server automatically)
npm run test:e2e
```

