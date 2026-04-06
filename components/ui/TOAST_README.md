# Custom Toast Notification System

A custom-built toast notification system with support for multiple toast types, auto-dismiss, stacking, and animations.

## ⚠️ Note About Sonner

**This app is currently using [Sonner](https://sonner.emilkowal.ski/) for toast notifications**, which is already integrated and working throughout the application. This custom toast system provides an alternative implementation if you prefer more control or want to learn how to build one from scratch.

### Current Implementation (Sonner)
```tsx
import { toast } from "sonner";

toast.success("Protein logged!");
toast.error("Failed to save workout");
```

### Custom Implementation (This System)
```tsx
import { useToast } from "@/components/ui/toast";

const { toast } = useToast();

toast.success("Protein logged!");
toast.error("Failed to save workout");
```

## Setup

### 1. Add ToastProvider to Root Layout

**Option A: Replace Sonner with Custom Toast**

```tsx
// app/layout.tsx
import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

**Option B: Use Both (Not Recommended)**

```tsx
// app/layout.tsx
import { Toaster } from "sonner";
import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ToastProvider>
      </body>
    </html>
  );
}
```

### 2. CSS Animations Already Added

The required animations have been added to `app/globals.css`.

## Usage

### Basic Usage

```tsx
"use client";

import { useToast } from "@/components/ui/toast";

export default function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast.success("Protein logged successfully!");
  };

  const handleError = () => {
    toast.error("Failed to save workout");
  };

  const handleInfo = () => {
    toast.info("Remember to track protein today");
  };

  const handleWarning = () => {
    toast.warning("You're approaching your daily limit");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={handleWarning}>Show Warning</button>
    </div>
  );
}
```

### With Custom Duration

```tsx
// Auto-dismiss after 5 seconds instead of default 3
toast.success("Changes saved!", 5000);

// Never auto-dismiss (duration = 0)
toast.error("Critical error!", 0);
```

### In Form Submissions

```tsx
const handleSubmit = async (data: FormData) => {
  try {
    await saveToDatabase(data);
    toast.success("Profile updated successfully!");
  } catch (error) {
    toast.error("Failed to update profile. Please try again.");
  }
};
```

### In API Routes

```tsx
const response = await fetch("/api/workouts", {
  method: "POST",
  body: JSON.stringify(workout),
});

if (response.ok) {
  toast.success("Workout saved!");
} else {
  toast.error("Failed to save workout");
}
```

## API Reference

### `useToast()`

Hook that provides access to the toast system.

**Returns:**
```typescript
{
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
  toasts: Toast[];
  dismissToast: (id: string) => void;
}
```

### Toast Types

#### `toast.success(message, duration?)`
- **Color**: Green (`#059669`)
- **Icon**: ✓ (CheckCircle)
- **Use for**: Successful actions, confirmations

#### `toast.error(message, duration?)`
- **Color**: Red (`#DC2626`)
- **Icon**: ✕ (XCircle)
- **Use for**: Errors, failed actions

#### `toast.info(message, duration?)`
- **Color**: Blue (`#2563EB`)
- **Icon**: ℹ (Info)
- **Use for**: Informational messages, tips

#### `toast.warning(message, duration?)`
- **Color**: Amber (`#D97706`)
- **Icon**: ⚠ (AlertCircle)
- **Use for**: Warnings, cautions

## Design Specifications

### Layout
- **Position**: Fixed, top center
- **Transform**: `translateX(-50%)` for perfect centering
- **Z-index**: 9999 (above all content)
- **Stack**: Multiple toasts stack vertically with 12px gap

### Styling
- **Border radius**: 12px (`rounded-xl`)
- **Padding**: 12px 20px
- **Shadow**: `shadow-lg` (elevated)
- **Min width**: 320px
- **Max width**: 500px

### Animations

#### Slide In
- **From**: `translateY(-100px)`, `opacity: 0`
- **To**: `translateY(0)`, `opacity: 1`
- **Duration**: 300ms
- **Easing**: `ease-out`

#### Slide Out (Dismiss)
- **From**: `translateY(0)`, `opacity: 1`
- **To**: `translateY(-100px)`, `opacity: 0`
- **Duration**: 300ms

#### Hover
- **Scale**: 1.02x
- **Transition**: 200ms

## Features

### ✅ Implemented

- [x] 4 toast types (success, error, info, warning)
- [x] Auto-dismiss after 3 seconds (configurable)
- [x] Click to dismiss
- [x] Stack multiple toasts
- [x] Slide in animation from top
- [x] Fade in/out animations
- [x] Icons for each type
- [x] React Context for global state
- [x] TypeScript support
- [x] Responsive design
- [x] Hover effects

### 🎯 Optional Enhancements

Possible future additions:

- [ ] Position options (top-left, top-right, bottom-center, etc.)
- [ ] Progress bar showing time until auto-dismiss
- [ ] Sound effects
- [ ] Action buttons in toasts
- [ ] Custom icons
- [ ] Toast queue with max limit
- [ ] Persistent toasts (saved to localStorage)
- [ ] Dark mode support
- [ ] Accessibility improvements (ARIA labels, screen reader announcements)

## Comparison: Custom vs Sonner

### Custom Toast System (This)
**Pros:**
- Full control over styling and behavior
- No external dependencies
- Learning experience
- Customizable to exact needs

**Cons:**
- More code to maintain
- Need to handle edge cases yourself
- Less battle-tested

### Sonner (Current)
**Pros:**
- Battle-tested, used by thousands
- More features out of the box
- Regular updates and bug fixes
- Smaller bundle size (optimized)
- Better accessibility

**Cons:**
- Less control over internals
- Styling limited to theme options
- External dependency

## Migration Guide

### From Sonner to Custom Toast

1. **Remove Sonner:**
```bash
npm uninstall sonner
```

2. **Update Layout:**
```tsx
// Before
import { Toaster } from "sonner";

// After
import { ToastProvider } from "@/components/ui/toast";
```

3. **Update Imports:**
```tsx
// Before
import { toast } from "sonner";

// After
import { useToast } from "@/components/ui/toast";
const { toast } = useToast();
```

4. **Update Calls:**
- API is identical for basic usage!
- `toast.success()`, `toast.error()`, etc. work the same way

### From Custom Toast to Sonner

1. **Install Sonner:**
```bash
npm install sonner
```

2. **Update Layout:**
```tsx
// Before
import { ToastProvider } from "@/components/ui/toast";

// After
import { Toaster } from "sonner";
```

3. **Update Imports:**
```tsx
// Before
import { useToast } from "@/components/ui/toast";
const { toast } = useToast();

// After
import { toast } from "sonner";
```

## Troubleshooting

### Toasts Not Showing

1. Make sure `ToastProvider` is in your root layout
2. Check that you're calling `useToast()` inside a component (not at top level)
3. Verify CSS animations are loaded

### Toasts Appear in Wrong Position

- Check for CSS conflicts with `fixed` positioning
- Ensure no parent has `transform` that creates new stacking context

### Multiple Toasts Overlap

- Check that `gap-3` is applied to container
- Verify each toast has unique `key` (handled automatically)

## Examples in Codebase

After migration, update these files:

- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `app/onboarding/page.tsx`
- `components/features/QuickAddFood.tsx`
- `components/features/WeightLogger.tsx`
- And ~20 more files using `toast`

## Accessibility

- ✅ Keyboard accessible (can be dismissed with click)
- ✅ Visual feedback (icons + colors)
- ⚠️ No ARIA live regions (enhancement needed)
- ⚠️ No screen reader announcements (enhancement needed)

For better accessibility, consider using Sonner which has these built-in.

## Performance

- Lightweight: ~5KB gzipped
- No external dependencies
- Pure CSS animations (GPU accelerated)
- Context updates only affect toast container
- Auto-cleanup on dismiss

## Conclusion

Both systems work great! Choose based on your needs:

- **Use Custom**: If you need full control or want to learn
- **Use Sonner**: If you want best practices and less maintenance (recommended)

