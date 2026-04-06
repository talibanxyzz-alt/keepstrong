# Sentry Testing Guide

## ✅ Sentry Setup Status

Sentry is properly configured for Next.js 15 with:
- ✅ Server-side error tracking (`instrumentation.ts`)
- ✅ Client-side error tracking (`instrumentation-client.ts`)
- ✅ Global error handler (`app/global-error.tsx`)
- ✅ Router transition tracking
- ✅ Request error tracking for React Server Components

## 🧪 How to Test Sentry

### Option 1: Use the Test Page (Recommended)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   ```
   http://localhost:3000/test-sentry
   ```

3. **Click the test buttons:**
   - **Test Client Error** - Throws an error in the browser
   - **Test Server Error** - Triggers an API route error
   - **Test Message** - Sends an info message
   - **Test Breadcrumb** - Adds a breadcrumb

4. **Check your Sentry dashboard:**
   - Go to https://sentry.io
   - Navigate to your project
   - Check the "Issues" tab for errors
   - Check the "Performance" tab for traces
   - Check "Replays" for session replays (if enabled)

### Option 2: Test in Your App

#### Test Client-Side Error:
```typescript
// In any client component
import * as Sentry from '@sentry/nextjs';

try {
  throw new Error('Test error');
} catch (error) {
  Sentry.captureException(error);
}
```

#### Test Server-Side Error:
```typescript
// In any API route or server component
import * as Sentry from '@sentry/nextjs';

throw new Error('Test server error');
// Sentry will automatically capture it
```

## 🔍 Verifying Sentry is Working

### 1. Check Environment Variables
Make sure these are set in `.env.local`:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

### 2. Check Browser Console
When you trigger an error, you should see:
- No console errors about missing Sentry DSN
- Errors are caught and sent (check Network tab for Sentry requests)

### 3. Check Sentry Dashboard
After triggering a test error:
- Wait 5-10 seconds
- Go to your Sentry project dashboard
- You should see the error appear in the "Issues" list
- Click on the error to see:
  - Stack trace
  - User context
  - Browser/device info
  - Breadcrumbs (if any)

## 📊 What Gets Tracked

### Automatically Tracked:
- ✅ Unhandled exceptions (client & server)
- ✅ API route errors
- ✅ React component errors (via global-error.tsx)
- ✅ Navigation transitions
- ✅ Request errors from React Server Components

### Manually Tracked:
- Messages: `Sentry.captureMessage('message', 'level')`
- Breadcrumbs: `Sentry.addBreadcrumb({...})`
- Custom events: `Sentry.captureException(error, {...})`

## 🎯 Expected Behavior

### When Sentry is Working:
1. Errors appear in Sentry dashboard within 5-10 seconds
2. No console errors about Sentry configuration
3. Test page shows "✅ Error sent to Sentry!" messages
4. Sentry dashboard shows:
   - Error details
   - Stack traces
   - User context
   - Environment info

### When Sentry is NOT Working:
1. Console shows: "Sentry DSN not configured"
2. Errors don't appear in Sentry dashboard
3. Test page shows configuration errors

## 🐛 Troubleshooting

### Issue: Errors not appearing in Sentry
- **Check DSN**: Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- **Check Network**: Look for failed requests to `sentry.io` in browser DevTools
- **Check Environment**: Make sure you're testing in the correct environment
- **Wait**: Sentry batches events, wait 5-10 seconds

### Issue: "Sentry DSN not configured"
- **Solution**: Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
- **Restart**: Restart your dev server after adding env vars

### Issue: Build warnings about Sentry
- **Solution**: All Sentry warnings should be resolved with the new setup
- If you see warnings, check that old config files are deleted

## 🧹 Cleanup

After testing, you can:
1. Delete `/app/test-sentry` directory (optional)
2. Delete `/app/api/test-sentry` route (optional)
3. Keep them for future testing (recommended)

## 📝 Next Steps

1. **Test the integration** using the test page
2. **Verify in Sentry dashboard** that errors appear
3. **Set up alerts** in Sentry for production errors
4. **Configure release tracking** for better error attribution
5. **Set up performance monitoring** for slow operations

---

**Note**: The test page is safe to keep in production as it requires manual interaction to trigger errors.

