# Empty State Components

Beautiful, helpful empty states that guide users when there's no data to display.

## Philosophy

Good empty states:
- ✅ Explain why the state is empty
- ✅ Guide users on what to do next
- ✅ Use friendly, encouraging language
- ✅ Provide clear actions
- ❌ Never just say "No data"

## Components

### Base Components

#### `EmptyState`
The foundational component for creating custom empty states.

```tsx
import { EmptyState } from "@/components/ui/empty-states";

<EmptyState
  emoji="🎉"
  heading="Welcome!"
  description="Get started by adding your first entry."
  buttonText="Add Entry"
  onButtonClick={() => console.log("clicked")}
/>
```

**Props:**
- `icon?: React.ReactNode` - Custom icon component
- `emoji?: string` - Emoji to display (alternative to icon)
- `heading: string` - Main heading
- `description: string` - Helpful description text
- `buttonText?: string` - Primary button text
- `onButtonClick?: () => void` - Primary button handler
- `secondaryButtonText?: string` - Secondary button text (optional)
- `onSecondaryButtonClick?: () => void` - Secondary button handler
- `className?: string` - Additional CSS classes

### Pre-Built Empty States

#### 1. `NoProteinLogs`

For protein tracking pages when no meals are logged.

```tsx
import { NoProteinLogs } from "@/components/ui/empty-states";

<NoProteinLogs
  onAddFood={() => router.push('/dashboard/protein')}
/>
```

**Display:**
- 🍗 Icon
- "No food logged yet"
- Encouraging message about protein tracking
- "Add Food" button

#### 2. `NoWorkouts`

For workout pages when no workouts are logged.

```tsx
import { NoWorkouts } from "@/components/ui/empty-states";

<NoWorkouts
  onChooseProgram={() => router.push('/workouts/programs')}
  onStartWorkout={() => router.push('/workouts/active')}
/>
```

**Display:**
- 💪 Icon
- "No workouts logged"
- Message about strength training importance
- "Choose a Program" button
- "Quick Workout" button (optional)

#### 3. `NoProgressPhotos`

For progress photo sections.

```tsx
import { NoProgressPhotos } from "@/components/ui/empty-states";

<NoProgressPhotos
  onUploadPhotos={() => setShowUploadModal(true)}
/>
```

**Display:**
- 📸 Icon
- "No progress photos yet"
- Encouraging message about visual progress
- "Upload Photos" button

#### 4. `NoWeightLogs`

For weight tracking pages.

```tsx
import { NoWeightLogs } from "@/components/ui/empty-states";

<NoWeightLogs
  onLogWeight={() => setShowWeightModal(true)}
/>
```

**Display:**
- ⚖️ Icon
- "No weight entries"
- Message about tracking progress
- "Log Weight" button

### Additional Empty States

#### `NoActiveWorkout`

When user has no active workout session.

```tsx
import { NoActiveWorkout } from "@/components/ui/empty-states";

<NoActiveWorkout
  onStartWorkout={() => startWorkout()}
  onBrowsePrograms={() => router.push('/workouts/programs')}
/>
```

#### `NoProgramSelected`

When user hasn't chosen a workout program.

```tsx
import { NoProgramSelected } from "@/components/ui/empty-states";

<NoProgramSelected
  onChooseProgram={() => router.push('/workouts/programs')}
/>
```

#### `NoPersonalRecords`

When no PRs have been achieved yet.

```tsx
import { NoPersonalRecords } from "@/components/ui/empty-states";

<NoPersonalRecords
  onStartTracking={() => router.push('/workouts/active')}
/>
```

#### `NoProgressData`

For charts/graphs with insufficient data.

```tsx
import { NoProgressData } from "@/components/ui/empty-states";

<NoProgressData
  onGetStarted={() => router.push('/dashboard')}
/>
```

### Utility Empty States

#### `CompactEmptyState`

For smaller containers.

```tsx
import { CompactEmptyState } from "@/components/ui/empty-states";
import { Utensils } from "lucide-react";

<CompactEmptyState
  message="No meals logged today"
  icon={<Utensils className="h-6 w-6" />}
/>
```

#### `InlineEmptyState`

For inline, minimal empty states.

```tsx
import { InlineEmptyState } from "@/components/ui/empty-states";

<InlineEmptyState message="No data available" />
```

#### `GenericEmptyState`

For custom use cases.

```tsx
import { GenericEmptyState } from "@/components/ui/empty-states";

<GenericEmptyState
  emoji="🎯"
  heading="Custom Heading"
  description="Custom description text"
  buttonText="Custom Action"
  onButtonClick={() => console.log("clicked")}
/>
```

## Usage Examples

### In Protein Tracker

```tsx
"use client";

import { NoProteinLogs } from "@/components/ui/empty-states";

export default function ProteinTimeline({ logs }: { logs: any[] }) {
  if (logs.length === 0) {
    return <NoProteinLogs onAddFood={() => setShowAddModal(true)} />;
  }

  return (
    <div>
      {logs.map((log) => (
        <ProteinLogItem key={log.id} log={log} />
      ))}
    </div>
  );
}
```

### In Workout List

```tsx
import { NoWorkouts } from "@/components/ui/empty-states";
import { useRouter } from "next/navigation";

export default function WorkoutList({ workouts }: { workouts: any[] }) {
  const router = useRouter();

  if (workouts.length === 0) {
    return (
      <NoWorkouts
        onChooseProgram={() => router.push("/workouts/programs")}
      />
    );
  }

  return <div>{/* render workouts */}</div>;
}
```

### In Progress Photos

```tsx
import { NoProgressPhotos } from "@/components/ui/empty-states";

export default function PhotoGrid({ photos }: { photos: any[] }) {
  const [showUpload, setShowUpload] = useState(false);

  if (photos.length === 0) {
    return <NoProgressPhotos onUploadPhotos={() => setShowUpload(true)} />;
  }

  return <div>{/* render photos */}</div>;
}
```

### With Conditional Rendering

```tsx
export default function Dashboard({ data }: { data: any }) {
  return (
    <div>
      {data.proteinLogs.length === 0 ? (
        <NoProteinLogs onAddFood={() => router.push("/dashboard/protein")} />
      ) : (
        <ProteinChart data={data.proteinLogs} />
      )}
    </div>
  );
}
```

### Custom Empty State

```tsx
import { GenericEmptyState } from "@/components/ui/empty-states";

<GenericEmptyState
  emoji="🔍"
  heading="No results found"
  description="Try adjusting your filters or search terms."
  buttonText="Clear Filters"
  onButtonClick={() => clearFilters()}
/>
```

## Design Specifications

### Layout
- **Container**: Rounded card with border (`rounded-xl border border-gray-200`)
- **Background**: White (`bg-white`)
- **Padding**: 48px all sides (`p-12`)
- **Alignment**: Centered (`items-center justify-center`)

### Typography
- **Heading**: 24px, semibold, charcoal color
- **Description**: 16px, regular, slate color
- **Max width**: 28rem for description (better readability)

### Icon/Emoji
- **Size**: 48px (emoji) or 40px (icon in 64px circle)
- **Spacing**: 16px margin below
- **Icon container**: Circular, cloud background

### Buttons
- **Primary**: Ocean blue background, white text, shadow
- **Secondary**: Border, charcoal text, hover background
- **Spacing**: 12px gap between buttons
- **Padding**: 12px × 24px
- **Hover**: Scale 1.02x

### Compact Variant
- **Padding**: 32px (`p-8`)
- **Background**: Cloud (`bg-cloud`)
- **Icon**: Smaller (48px container)

### Inline Variant
- **Border**: Dashed, gray
- **Background**: Light gray (`bg-gray-50`)
- **Padding**: 24px (`p-6`)

## Icon vs Emoji

Each component has two variants:

```tsx
// Emoji version (default)
import { NoProteinLogs } from "@/components/ui/empty-states";
<NoProteinLogs /> // Shows 🍗

// Icon version (lucide-react icons)
import { NoProteinLogsIcon } from "@/components/ui/empty-states";
<NoProteinLogsIcon /> // Shows Utensils icon
```

**When to use:**
- **Emoji**: More friendly, casual, fun
- **Icon**: More professional, consistent with UI

## Best Practices

### ✅ Do:
- Use encouraging, action-oriented language
- Explain why the state is empty
- Provide clear next steps
- Use appropriate icons/emojis
- Make buttons actionable (not just "OK")
- Consider user context (new user vs returning user)

### ❌ Don't:
- Just say "No data" or "Empty"
- Use technical jargon
- Blame the user ("You haven't...")
- Leave users without guidance
- Make the CTA unclear

### Writing Tips

**Good:**
- "No food logged yet" + "Track your first meal!"
- "No workouts logged" + "Start a program to build strength"
- "No progress photos yet" + "Photos show progress the scale doesn't!"

**Bad:**
- "No data"
- "Empty list"
- "You haven't added anything"
- "No results"

## Accessibility

- ✅ Semantic HTML structure
- ✅ Clear button labels
- ✅ Adequate color contrast
- ✅ Readable font sizes
- ✅ Keyboard accessible buttons
- ⚠️ Consider adding ARIA labels for screen readers

## Examples in Codebase

### Replace Generic Empty States

**Before:**
```tsx
{logs.length === 0 && <div>No logs</div>}
```

**After:**
```tsx
{logs.length === 0 && (
  <NoProteinLogs onAddFood={() => setShowModal(true)} />
)}
```

### Where to Use

1. **Protein Tracker Page** - `NoProteinLogs`
2. **Workout List** - `NoWorkouts`
3. **Progress Photos Section** - `NoProgressPhotos`
4. **Weight Chart** - `NoWeightLogs` or `NoProgressData`
5. **Active Workout Page** - `NoActiveWorkout`
6. **Personal Records** - `NoPersonalRecords`
7. **Dashboard Cards** - Compact variants

## Customization

### Custom Styles

```tsx
<NoProteinLogs
  className="min-h-[400px] bg-blue-50"
  onAddFood={() => {}}
/>
```

### Without Button

```tsx
// Just pass undefined or omit onButtonClick
<NoProteinLogs />
```

### Custom Button Action

```tsx
<NoProteinLogs
  onAddFood={async () => {
    await logFood();
    router.refresh();
  }}
/>
```

## Testing

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { NoProteinLogs } from "@/components/ui/empty-states";

test("renders empty state and handles click", () => {
  const handleClick = jest.fn();
  
  render(<NoProteinLogs onAddFood={handleClick} />);
  
  expect(screen.getByText("No food logged yet")).toBeInTheDocument();
  
  const button = screen.getByText("Add Food");
  fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Migration Guide

### Find and Replace Empty States

1. **Search for generic empty states:**
```bash
grep -r "No data" --include="*.tsx"
grep -r "No logs" --include="*.tsx"
grep -r "length === 0" --include="*.tsx"
```

2. **Replace with appropriate component:**
```tsx
// Before
{logs.length === 0 ? (
  <div className="text-center text-gray-500">No logs</div>
) : (
  <LogList logs={logs} />
)}

// After
{logs.length === 0 ? (
  <NoProteinLogs onAddFood={() => openModal()} />
) : (
  <LogList logs={logs} />
)}
```

## Performance

- Lightweight: No external dependencies
- No animations by default (can be added)
- Pure components (can be memoized)
- Minimal re-renders

## Future Enhancements

Possible additions:

- [ ] Animation variants (fade in, slide up)
- [ ] Illustration support (SVG graphics)
- [ ] Loading state variants
- [ ] Multi-step empty states (onboarding)
- [ ] Interactive tutorials
- [ ] Video backgrounds
- [ ] Lottie animations

