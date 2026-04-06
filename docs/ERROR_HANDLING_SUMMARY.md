# Error Handling System - Quick Reference

## ✅ What Was Implemented

### 1. Core Error System
- `/lib/errors/types.ts` - Error types and codes
- `/lib/errors/handler.ts` - Error logging and user-friendly messages
- `/lib/errors/api-helpers.ts` - Standardized API responses

### 2. UI Components
- `/components/error-boundary.tsx` - React error boundary
- `/components/ui/error-state.tsx` - Error display components
- `/app/error.tsx` - Global error page
- `/app/not-found.tsx` - 404 page

### 3. Features
- ✅ User-friendly error messages
- ✅ Database error translation (Postgres → Human)
- ✅ Comprehensive error logging
- ✅ Standardized API responses
- ✅ Error recovery (Try Again buttons)
- ✅ Development vs Production modes

## 🚀 Quick Usage

### In Components

```typescript
import { handleError } from '@/lib/errors/handler';
import { ErrorState } from '@/components/ui/error-state';

try {
  await fetchData();
} catch (error) {
  const message = handleError(error, { component: 'MyComponent' });
  setError(message);
}

// Display
{error && <ErrorState message={error} onRetry={fetchData} />}
```

### In API Routes

```typescript
import { successResponse, errorResponse, notFound } from '@/lib/errors/api-helpers';

try {
  const data = await getData();
  if (!data) return notFound();
  return successResponse(data);
} catch (error) {
  return errorResponse(error);
}
```

### With Error Boundary

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## 📊 Error Code Reference

| Code | User Sees |
|------|-----------|
| `23505` | "This already exists" |
| `42501` | "You don't have permission" |
| `PGRST116` | "We couldn't find that" |
| `JWT error` | "Session expired, please sign in" |
| `Network` | "Check your connection" |

## 🎨 UI Components

```typescript
// Full error display
<ErrorState 
  type="network" 
  message="Connection lost"
  onRetry={retry}
/>

// Inline error (forms)
<InlineError message="Email is required" />

// Error badge (compact)
<ErrorBadge message="Failed" />
```

## 📝 Best Practices

✅ Always wrap async operations in try/catch
✅ Use `handleError()` for consistent messaging  
✅ Provide retry buttons for transient errors
✅ Log all errors for debugging
✅ Show user-friendly messages only

❌ Never show technical errors to users
❌ Don't ignore errors silently
❌ Don't let errors crash the app

## 🔧 Testing

Navigate to non-existent page: `/test-404`
- Should show custom 404 page

Simulate errors in development:
- Add `?simulate=error` to URL
- Disconnect internet and try actions

## 📖 Full Documentation

See `/docs/ERROR_HANDLING_GUIDE.md` for complete documentation.

