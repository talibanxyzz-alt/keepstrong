# Error Handling Guide

Complete guide for error handling throughout the application.

## Overview

Our error handling system provides:
- ✅ User-friendly error messages
- ✅ Comprehensive error logging
- ✅ Standardized API responses
- ✅ Database error handling
- ✅ React error boundaries
- ✅ Global error pages

## Core Principles

1. **Never show technical errors to users**
   - ❌ Bad: "PGRST116: No rows found"
   - ✅ Good: "We couldn't find that workout"

2. **Always log full errors for debugging**
   - Log to console in development
   - Send to error tracking in production (Sentry, etc.)

3. **Provide actionable feedback**
   - Include "Try again" or "Go back" buttons
   - Suggest what the user can do

4. **Handle errors gracefully**
   - App shouldn't crash
   - Show fallback UI
   - Preserve user data

## Usage Examples

### 1. Component Error Handling

```typescript
'use client';

import { useState } from 'react';
import { handleError, showUserError } from '@/lib/errors/handler';
import { ErrorState } from '@/components/ui/error-state';

export default function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
    } catch (err) {
      const message = handleError(err, {
        component: 'MyComponent',
        action: 'fetchData',
      });
      setError(message);
      showUserError(message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  // ... rest of component
}
```

### 2. API Route Error Handling

```typescript
import { NextRequest } from 'next/server';
import { 
  successResponse, 
  errorResponse, 
  unauthorized, 
  notFound 
} from '@/lib/errors/api-helpers';
import { logError } from '@/lib/errors/handler';

export async function GET(request: NextRequest) {
  try {
    // Check auth
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    // Fetch data
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    if (!data) return notFound('No workouts found');

    return successResponse(data);
  } catch (error) {
    logError(error, { action: 'get_workouts' });
    return errorResponse(error);
  }
}
```

### 3. Database Error Handling

```typescript
import { handleError } from '@/lib/errors/handler';

async function saveWorkout(workout: Workout) {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout);

    if (error) {
      // This will convert Postgres errors to user-friendly messages
      throw error;
    }

    return data;
  } catch (error) {
    // Logs error and returns user-friendly message
    const message = handleError(error, {
      action: 'save_workout',
      metadata: { workout },
    });
    
    // Show to user
    toast.error(message);
    throw error; // Re-throw if you want to handle it further up
  }
}
```

### 4. Form Validation Errors

```typescript
import { InlineError } from '@/components/ui/error-state';

export default function MyForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form>
      <input type="email" />
      {errors.email && <InlineError message={errors.email} />}
      
      <input type="password" />
      {errors.password && <InlineError message={errors.password} />}
    </form>
  );
}
```

### 5. Error Boundary Usage

```typescript
import { ErrorBoundary } from '@/components/error-boundary';

export default function Layout({ children }) {
  return (
    <ErrorBoundary
      context={{ component: 'MainLayout' }}
      onError={(error, errorInfo) => {
        // Custom error handling
        console.log('Layout error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Database Error Mappings

### Postgres Error Codes

| Code | Technical Meaning | User Message |
|------|-------------------|--------------|
| 23505 | Duplicate key | "This item already exists" |
| 42501 | Permission denied | "You don't have permission" |
| PGRST116 | No rows | "We couldn't find that" |
| 23503 | Foreign key violation | "Related data doesn't exist" |
| 23514 | Check constraint | "Data doesn't meet requirements" |
| 22P02 | Invalid text | "Invalid data format" |

### RLS Errors

```typescript
// RLS error
if (error.message.includes('RLS')) {
  return 'You don\'t have access to this data';
}

// JWT/Auth error
if (error.message.includes('JWT')) {
  return 'Your session has expired. Please sign in again';
}
```

## Error UI Components

### ErrorState

Full error display with icon and retry:

```typescript
<ErrorState
  title="Failed to load workouts"
  message="We had trouble loading your workout data"
  type="database"
  onRetry={fetchWorkouts}
/>
```

Types:
- `generic` - General errors
- `network` - Connection issues
- `database` - Data loading errors
- `permission` - Access denied

### InlineError

Small error message for forms:

```typescript
<InlineError message="Email is required" />
```

### ErrorBadge

Compact error indicator:

```typescript
<ErrorBadge message="Failed to save" />
```

## Global Error Pages

### /app/error.tsx

Catches unhandled errors in any page:
- Shows friendly error message
- "Try Again" button (resets error boundary)
- "Go Home" link
- Logs error automatically

### /app/not-found.tsx

Handles 404 errors:
- Shows 404 page
- Links to dashboard and other pages
- "Go Back" button

## API Response Standards

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

### Error Response

```json
{
  "error": true,
  "code": "DB_NOT_FOUND",
  "message": "We couldn't find that workout",
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

### Validation Error

```json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required", "Must be valid email"],
    "password": ["Password must be at least 8 characters"]
  },
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

## Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `AUTH_REQUIRED` | 401 | Not authenticated |
| `AUTH_INVALID` | 403 | No permission |
| `AUTH_EXPIRED` | 401 | Session expired |
| `DB_NOT_FOUND` | 404 | Resource not found |
| `DB_DUPLICATE` | 409 | Already exists |
| `DB_PERMISSION_DENIED` | 403 | No access to data |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `NETWORK_ERROR` | 500 | Connection failed |
| `SERVER_ERROR` | 500 | Server error |

## Logging

### Development

Errors are logged to console with full details:

```typescript
logError(error, {
  userId: user.id,
  action: 'save_workout',
  component: 'WorkoutForm',
  metadata: { workoutId: 123 },
});
```

Output:
```
🔴 Error: {
  error: Error(...),
  context: { userId, action, component, metadata },
  timestamp: "2026-02-02T10:00:00.000Z"
}
```

### Production

In production, integrate with error tracking service:

```typescript
// In lib/errors/handler.ts
if (process.env.NODE_ENV === 'production') {
  // Send to Sentry, LogRocket, etc.
  Sentry.captureException(error, {
    contexts: { custom: context }
  });
}
```

## Best Practices

### ✅ Do

- Show user-friendly messages
- Log full error details
- Provide retry buttons
- Handle errors at boundaries
- Test error states
- Use try/catch for async operations
- Validate input before sending to API
- Use TypeScript for type safety

### ❌ Don't

- Show stack traces to users
- Ignore errors silently
- Use generic "Error" messages everywhere
- Let errors crash the app
- Forget to log errors
- Re-throw errors without handling
- Show technical error codes to users

## Testing Error States

### Manual Testing

1. **Network errors**: Disconnect internet, try actions
2. **Validation errors**: Submit invalid forms
3. **Auth errors**: Try accessing protected routes while logged out
4. **404 errors**: Navigate to non-existent pages
5. **Permission errors**: Try accessing others' data

### Error Simulation

```typescript
// Simulate errors in development
if (process.env.NODE_ENV === 'development') {
  // Random errors
  if (Math.random() < 0.1) {
    throw new Error('Simulated error for testing');
  }
  
  // Specific error type
  if (searchParams.get('simulate') === 'error') {
    throw new Error('Simulated error');
  }
}
```

## Future Enhancements

### Sentry Integration

```bash
npm install @sentry/nextjs
```

```typescript
// lib/errors/handler.ts
import * as Sentry from '@sentry/nextjs';

export function logError(error: unknown, context?: ErrorContext) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }
}
```

### Error Analytics

Track error patterns:
- Most common errors
- Errors by user
- Errors by page
- Error resolution rate

### Retry Logic

Auto-retry failed requests:

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await wait(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

## Support

For questions about error handling:
- Check this guide first
- Review error components in `/components/ui/error-state.tsx`
- See examples in existing components
- Check error types in `/lib/errors/types.ts`

