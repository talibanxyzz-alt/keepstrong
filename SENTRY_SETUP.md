# Sentry Error Monitoring Setup

## ✅ Completed Steps

1. ✅ Installed `@sentry/nextjs` package
2. ✅ Created Sentry configuration files:
   - `sentry.client.config.ts` - Client-side error tracking
   - `sentry.server.config.ts` - Server-side error tracking
   - `sentry.edge.config.ts` - Edge runtime error tracking
3. ✅ Updated `next.config.js` with Sentry integration
4. ✅ Created test pages for verification

## 📋 Required Environment Variables

Add these to your `.env.local` file:

```bash
# Sentry Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_DSN@o4505...ingest.sentry.io/4505...
SENTRY_ORG=your-org-name
SENTRY_PROJECT=keepstrong
SENTRY_AUTH_TOKEN=your-auth-token
```

### How to Get Your Sentry DSN:

1. Go to https://sentry.io and sign up/login
2. Create a new project (or select existing)
3. Choose "Next.js" as the platform
4. Copy your DSN from the project settings
5. Get your auth token from: Settings → Auth Tokens → Create New Token

## 🧪 Testing Sentry Integration

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit the test page:**
   - Go to: http://localhost:3000/test-sentry
   - Click "Test Client Error" button
   - Click "Test Server Error" button

3. **Check Sentry Dashboard:**
   - Go to https://sentry.io
   - Navigate to your project
   - Check if errors appear in the Issues tab

4. **Clean up (after verification):**
   - Delete `/app/test-sentry` directory
   - Delete `/app/api/test-sentry` directory

## 🔒 Security Notes

- The `sentry.server.config.ts` automatically filters out sensitive headers (authorization, cookies)
- Client-side config ignores common browser extension errors
- Source maps are hidden in production builds

## 📊 Configuration Details

### Traces Sample Rate
- Currently set to 10% (`tracesSampleRate: 0.1`)
- Adjust based on your traffic volume
- Higher rate = more data but more cost

### Session Replay
- Enabled for errors (100% of errors)
- 10% of normal sessions
- Masks all text and blocks media for privacy

### Environment
- Automatically uses `process.env.NODE_ENV`
- Helps filter errors by environment (development/production)

## 🚀 Production Deployment

1. **Set environment variables** in your hosting platform (Vercel, etc.)
2. **Source maps** will be uploaded automatically during build
3. **Errors** will be tracked automatically
4. **Performance monitoring** is enabled (10% sample rate)

## 📝 Next Steps

1. Add Sentry environment variables to `.env.local`
2. Test the integration using `/test-sentry` page
3. Verify errors appear in Sentry dashboard
4. Remove test pages after verification
5. Monitor your production errors!

