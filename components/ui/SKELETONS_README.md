# Skeleton Loading Components

Reusable skeleton components for loading states throughout the application.

## Base Components

### 1. Skeleton
Basic building block for all skeleton components.

```tsx
import { Skeleton } from "@/components/ui/skeletons";

<Skeleton className="h-4 w-32" />
```

### 2. CardSkeleton
Matches card dimensions with pulsing animation.

```tsx
import { CardSkeleton } from "@/components/ui/skeletons";

<CardSkeleton />
<CardSkeleton height="h-64" />
<CardSkeleton className="md:col-span-2" height="h-96" />
```

**Props:**
- `className?: string` - Additional Tailwind classes
- `height?: string` - Height class (default: `h-48`)

### 3. TextSkeleton
Pulsing bar for text loading.

```tsx
import { TextSkeleton } from "@/components/ui/skeletons";

<TextSkeleton width="sm" />
<TextSkeleton width="md" />
<TextSkeleton width="lg" />
<TextSkeleton width="xl" />
<TextSkeleton width="full" />
<TextSkeleton width="w-[200px]" height="h-6" />
```

**Props:**
- `width?: "sm" | "md" | "lg" | "xl" | "full" | string` - Width preset or custom class
- `height?: string` - Height class (default: `h-4`)
- `className?: string` - Additional classes

**Width Presets:**
- `sm`: 5rem (80px)
- `md`: 8rem (128px)
- `lg`: 12rem (192px)
- `xl`: 16rem (256px)
- `full`: 100%

### 4. ChartSkeleton
Simulates a bar chart with pulsing bars.

```tsx
import { ChartSkeleton } from "@/components/ui/skeletons";

<ChartSkeleton />
<ChartSkeleton bars={7} height="h-80" />
<ChartSkeleton bars={12} height="h-96" />
```

**Props:**
- `bars?: number` - Number of bars (default: 7)
- `height?: string` - Chart height (default: `h-64`)
- `className?: string` - Additional classes

### 5. ListSkeleton
Multiple rows for lists.

```tsx
import { ListSkeleton } from "@/components/ui/skeletons";

<ListSkeleton rows={5} />
<ListSkeleton rows={3} showAvatar />
```

**Props:**
- `rows?: number` - Number of rows (default: 5)
- `showAvatar?: boolean` - Show circular avatar (default: false)
- `className?: string` - Additional classes

### 6. AvatarSkeleton
Circular skeleton for avatars.

```tsx
import { AvatarSkeleton } from "@/components/ui/skeletons";

<AvatarSkeleton size="sm" />
<AvatarSkeleton size="md" />
<AvatarSkeleton size="lg" />
```

**Props:**
- `size?: "sm" | "md" | "lg"` - Avatar size (default: `md`)
- `className?: string` - Additional classes

### 7. ButtonSkeleton
Skeleton for buttons.

```tsx
import { ButtonSkeleton } from "@/components/ui/skeletons";

<ButtonSkeleton />
<ButtonSkeleton width="w-32" />
```

**Props:**
- `width?: string` - Width class (default: `w-24`)
- `className?: string` - Additional classes

## Composed Skeletons

### DashboardSkeleton
Full dashboard layout with 3-4 cards.

```tsx
import { DashboardSkeleton } from "@/components/ui/skeletons";

export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
```

### ProteinPageSkeleton
Protein tracker page layout (tracker + timeline + chart).

```tsx
import { ProteinPageSkeleton } from "@/components/ui/skeletons";

export default function ProteinLoading() {
  return <ProteinPageSkeleton />;
}
```

### WorkoutSkeleton
Exercise list layout.

```tsx
import { WorkoutSkeleton } from "@/components/ui/skeletons";

export default function WorkoutLoading() {
  return <WorkoutSkeleton />;
}
```

### ProgramListSkeleton
Workout programs grid layout.

```tsx
import { ProgramListSkeleton } from "@/components/ui/skeletons";

export default function ProgramsLoading() {
  return <ProgramListSkeleton />;
}
```

### ProgressPageSkeleton
Progress page layout (tabs + cards + charts).

```tsx
import { ProgressPageSkeleton } from "@/components/ui/skeletons";

export default function ProgressLoading() {
  return <ProgressPageSkeleton />;
}
```

### TableSkeleton
Table with header and rows.

```tsx
import { TableSkeleton } from "@/components/ui/skeletons";

<TableSkeleton rows={10} />
```

### FormSkeleton
Form fields skeleton.

```tsx
import { FormSkeleton } from "@/components/ui/skeletons";

<FormSkeleton fields={6} />
```

### PhotoGridSkeleton
Photo grid layout.

```tsx
import { PhotoGridSkeleton } from "@/components/ui/skeletons";

<PhotoGridSkeleton photos={12} />
```

## Usage Patterns

### 1. Loading States in Components

```tsx
import { CardSkeleton } from "@/components/ui/skeletons";

export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  if (isLoading) {
    return <CardSkeleton />;
  }

  return <DataCard data={data} />;
}
```

### 2. Next.js Loading Files

```tsx
// app/dashboard/loading.tsx
import { DashboardSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return <DashboardSkeleton />;
}
```

### 3. Conditional Rendering

```tsx
{isLoading ? (
  <ListSkeleton rows={5} />
) : (
  <ProteinLogList logs={logs} />
)}
```

### 4. Custom Compositions

```tsx
import { Skeleton, TextSkeleton, ButtonSkeleton } from "@/components/ui/skeletons";

function CustomCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <TextSkeleton width="lg" height="h-6" className="mb-4" />
      <Skeleton className="mb-4 h-32 w-full" />
      <div className="flex gap-2">
        <ButtonSkeleton width="w-32" />
        <ButtonSkeleton width="w-24" />
      </div>
    </div>
  );
}
```

## Design Specifications

### Colors
- **Base**: `#E2E8F0` (gray-200)
- **Background**: white cards with gray borders

### Animation
- **Duration**: 1.5s
- **Timing**: cubic-bezier(0.4, 0, 0.6, 1)
- **Effect**: Opacity pulse (1 → 0.5 → 1)
- **Loop**: Infinite

### Border Radius
- **Cards**: 12px (`rounded-xl`)
- **Buttons**: 6px (`rounded-md`)
- **Small elements**: 4px (`rounded`)
- **Avatars**: 50% (`rounded-full`)

## Best Practices

### ✅ Do:
- Match skeleton dimensions to actual content
- Use composed skeletons for full page layouts
- Maintain consistent animation timing
- Show skeletons during data fetching
- Use in Next.js `loading.tsx` files

### ❌ Don't:
- Mix loading states (show skeleton OR spinner, not both)
- Make skeletons too generic (match your UI)
- Forget to remove skeletons when data loads
- Use skeletons for instant operations (< 100ms)

## Examples in Codebase

### Dashboard
```tsx
// app/dashboard/loading.tsx
import { DashboardSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return <DashboardSkeleton />;
}
```

### Protein Tracker
```tsx
// app/dashboard/protein/loading.tsx
import { ProteinPageSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return <ProteinPageSkeleton />;
}
```

### Settings
```tsx
// app/settings/loading.tsx
import { FormSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white p-6">
            <FormSkeleton fields={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Accessibility

All skeletons include:
- Proper semantic HTML structure
- No interactive elements during loading
- Clear visual indication of loading state
- No accessibility warnings

## Performance

- **Lightweight**: Pure CSS animations
- **No JavaScript**: Uses Tailwind's `animate-pulse`
- **GPU Accelerated**: Opacity animations are optimized
- **Reusable**: Prevents duplicate code

