# 🍽️ Food Tolerance Rating Component

## Overview

The `FoodToleranceRating` component displays community tolerance ratings for foods and allows users to vote. Designed specifically for GLP-1 medication users.

---

## Components

### 1. `FoodToleranceRating` (Main Component)

Full-featured rating display with voting buttons and detailed stats.

### 2. `FoodToleranceRatingCompact`

Compact variant for inline use (e.g., in protein logger).

### 3. `FoodToleranceBadge`

Minimal display badge without voting functionality.

---

## Usage Examples

### Basic Usage

```tsx
import { FoodToleranceRating } from '@/components/features/FoodToleranceRating';

<FoodToleranceRating
  foodName="Scrambled Eggs"
  currentUserVote={true}
  tolerancePercentage={85}
  totalVotes={12}
  upvotes={10}
  downvotes={2}
  onVoteChange={() => {
    // Refetch data after vote
    router.refresh();
  }}
/>
```

**Output:**
```
👍👍 85% (12 votes)  [👍] [👎]  Excellent tolerance  • 10 👍 • 2 👎
```

---

### Compact Variant (Inline)

```tsx
import { FoodToleranceRatingCompact } from '@/components/features/FoodToleranceRating';

<div className="flex items-center gap-2">
  <span>Scrambled Eggs</span>
  <FoodToleranceRatingCompact
    foodName="Scrambled Eggs"
    currentUserVote={null}
    tolerancePercentage={85}
    totalVotes={12}
  />
</div>
```

**Output:**
```
Scrambled Eggs  👍👍 85%  [👍] [👎]
```

---

### Badge Only (No Voting)

```tsx
import { FoodToleranceBadge } from '@/components/features/FoodToleranceRating';

<div className="flex items-center gap-2">
  <span>Scrambled Eggs</span>
  <FoodToleranceBadge
    tolerancePercentage={85}
    totalVotes={12}
  />
</div>
```

**Output:**
```
Scrambled Eggs  [👍👍 85%]
```
*(Badge has green background)*

---

## Props

### FoodToleranceRating Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `foodName` | `string` | **Required** | Name of the food (must match database) |
| `currentUserVote` | `boolean \| null` | `undefined` | User's current vote (true = 👍, false = 👎, null = no vote) |
| `tolerancePercentage` | `number` | `undefined` | Percentage of upvotes (0-100) |
| `totalVotes` | `number` | `0` | Total number of votes |
| `upvotes` | `number` | `0` | Number of upvotes |
| `downvotes` | `number` | `0` | Number of downvotes |
| `showLabel` | `boolean` | `true` | Show text label ("Excellent tolerance") |
| `showVoteCount` | `boolean` | `true` | Show vote count next to percentage |
| `compact` | `boolean` | `false` | Compact mode (smaller buttons) |
| `onVoteChange` | `() => void` | `undefined` | Callback after successful vote |

### FoodToleranceBadge Props

| Prop | Type | Description |
|------|------|-------------|
| `tolerancePercentage` | `number` | Percentage of upvotes (0-100) |
| `totalVotes` | `number` | Total number of votes |

---

## Visual States

### Tolerance Levels

| Percentage | Icon | Color | Label |
|-----------|------|-------|-------|
| 80-100% | 👍👍 | Green | "Excellent tolerance" |
| 60-79% | 👍 | Light Green | "Good tolerance" |
| 40-59% | 🤷 | Yellow | "Mixed reviews" |
| 20-39% | 👎 | Orange | "Often difficult" |
| 0-19% | 🚫 | Red | "Commonly avoided" |

### Vote States

**Not Yet Rated:**
```
❓ No ratings yet  [👍] [👎]  No ratings yet
```

**Needs More Votes (1-2 votes):**
```
❓ 2 / 3 votes needed  [👍] [👎]
```

**Fully Rated (3+ votes):**
```
👍👍 85% (12 votes)  [👍] [👎]  Excellent tolerance  • 10 👍 • 2 👎
```

**User Has Voted (Thumbs Up):**
```
👍👍 85% (12 votes)  [👍✓] [👎]  Excellent tolerance
```
*(Green background on selected button)*

**User Has Voted (Thumbs Down):**
```
👎 25% (8 votes)  [👍] [👎✓]  Often difficult
```
*(Red background on selected button)*

---

## Integration Examples

### 1. In Protein Logger

```tsx
// components/features/QuickAddFood.tsx
import { FoodToleranceRatingCompact } from '@/components/features/FoodToleranceRating';

<div className="space-y-3">
  <label>Food</label>
  <input value={foodName} onChange={...} />
  
  {/* Show rating if food is in database */}
  {rating && (
    <FoodToleranceRatingCompact
      foodName={foodName}
      currentUserVote={userVote}
      tolerancePercentage={rating.tolerance_percentage}
      totalVotes={rating.total_votes}
      onVoteChange={() => refetchRating()}
    />
  )}
  
  <button>Log Meal</button>
</div>
```

---

### 2. In Food Directory Page

```tsx
// app/foods/page.tsx
import { FoodToleranceRating } from '@/components/features/FoodToleranceRating';

{foods.map((food) => (
  <div key={food.food_name} className="border p-4 rounded">
    <h3 className="font-semibold mb-2">{food.food_name}</h3>
    
    <FoodToleranceRating
      foodName={food.food_name}
      currentUserVote={food.user_vote}
      tolerancePercentage={food.tolerance_percentage}
      totalVotes={food.total_votes}
      upvotes={food.upvotes}
      downvotes={food.downvotes}
      onVoteChange={() => router.refresh()}
    />
    
    <p className="mt-2 text-sm text-gray-600">
      {food.description}
    </p>
  </div>
))}
```

---

### 3. As a Badge in Cards

```tsx
// Dashboard widget
import { FoodToleranceBadge } from '@/components/features/FoodToleranceRating';

<div className="bg-white p-4 rounded border">
  <h3>Recommended Foods</h3>
  <ul className="space-y-2">
    {recommendedFoods.map((food) => (
      <li key={food.food_name} className="flex items-center justify-between">
        <span>{food.food_name}</span>
        <FoodToleranceBadge
          tolerancePercentage={food.tolerance_percentage}
          totalVotes={food.total_votes}
        />
      </li>
    ))}
  </ul>
</div>
```

---

## Fetching Data

### Server Component (Page)

```tsx
// app/foods/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getAllFoodRatings } from '@/lib/utils/food-ratings';

async function getFoodData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get all ratings
  const ratings = await getAllFoodRatings(supabase);
  
  // Get user's votes
  const { data: userVotes } = await supabase
    .from('food_tolerance_votes')
    .select('food_name, tolerated')
    .eq('user_id', user?.id || '');
  
  // Combine data
  return ratings.map(rating => ({
    ...rating,
    user_vote: userVotes?.find(v => v.food_name === rating.food_name)?.tolerated ?? null,
  }));
}

export default async function FoodsPage() {
  const foods = await getFoodData();
  
  return (
    <div>
      {foods.map(food => (
        <FoodToleranceRating key={food.food_name} {...food} />
      ))}
    </div>
  );
}
```

### Client Component (with SWR)

```tsx
// components/FoodList.tsx
'use client';

import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { getAllFoodRatings } from '@/lib/utils/food-ratings';

export function FoodList() {
  const supabase = createClient();
  
  const { data: foods, mutate } = useSWR('food-ratings', async () => {
    const ratings = await getAllFoodRatings(supabase);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: userVotes } = await supabase
      .from('food_tolerance_votes')
      .select('food_name, tolerated')
      .eq('user_id', user?.id || '');
    
    return ratings.map(rating => ({
      ...rating,
      user_vote: userVotes?.find(v => v.food_name === rating.food_name)?.tolerated ?? null,
    }));
  });
  
  return (
    <div>
      {foods?.map(food => (
        <FoodToleranceRating
          key={food.food_name}
          {...food}
          onVoteChange={() => mutate()} // Refetch after vote
        />
      ))}
    </div>
  );
}
```

---

## Accessibility

- ✅ Keyboard accessible (buttons are focusable)
- ✅ ARIA labels on buttons
- ✅ Color is not the only indicator (icons + text)
- ✅ Screen reader friendly
- ✅ Disabled state during voting (prevents double-clicks)

---

## Responsive Behavior

- **Mobile:** Vote breakdown hidden (saves space)
- **Desktop:** Full stats with vote breakdown (10 👍 • 2 👎)
- **Compact mode:** Always minimal (regardless of screen size)

---

## States & Loading

### Voting State
```tsx
// While voting
[Loading spinner] [👍✓] [👎]
```

### Success State
```tsx
// Toast notification
✓ Marked as well-tolerated
Thanks for helping the community!
```

### Error State
```tsx
// Toast notification
✗ Failed to save vote
Please try again
```

---

## Customization

### Hide Label
```tsx
<FoodToleranceRating
  foodName="Scrambled Eggs"
  showLabel={false}
  {...props}
/>
```

### Hide Vote Count
```tsx
<FoodToleranceRating
  foodName="Scrambled Eggs"
  showVoteCount={false}
  {...props}
/>
```

### Compact Mode
```tsx
<FoodToleranceRating
  foodName="Scrambled Eggs"
  compact={true}
  {...props}
/>
```

### All Minimal
```tsx
<FoodToleranceRating
  foodName="Scrambled Eggs"
  showLabel={false}
  showVoteCount={false}
  compact={true}
  {...props}
/>
```

Or use the pre-built compact variant:
```tsx
<FoodToleranceRatingCompact foodName="Scrambled Eggs" {...props} />
```

---

## Best Practices

### 1. Always Provide `onVoteChange`
```tsx
// ✅ Good: Refetch data after vote
<FoodToleranceRating
  {...props}
  onVoteChange={() => router.refresh()}
/>

// ❌ Bad: Data won't update
<FoodToleranceRating {...props} />
```

### 2. Use Correct Food Name
```tsx
// ✅ Good: Exact match with database
<FoodToleranceRating foodName="Scrambled Eggs" />

// ❌ Bad: Case mismatch, won't find rating
<FoodToleranceRating foodName="scrambled eggs" />
```

### 3. Handle Missing Data Gracefully
```tsx
// ✅ Good: Component handles missing data
<FoodToleranceRating
  foodName="New Food"
  totalVotes={0}
/>
// Output: "❓ No ratings yet"

// ✅ Also good: Conditional rendering
{rating && rating.total_votes >= 3 && (
  <FoodToleranceRating {...rating} />
)}
```

### 4. Choose the Right Variant
```tsx
// In a list/card → Full component
<FoodToleranceRating {...props} />

// Inline next to text → Compact
<FoodToleranceRatingCompact {...props} />

// Just a visual indicator → Badge
<FoodToleranceBadge {...props} />
```

---

## Troubleshooting

### Votes Not Saving
```
Error: insert or update on table "food_tolerance_votes" violates foreign key constraint
```
**Solution:** Ensure user is authenticated and profile exists

### Rating Not Updating
```
Vote saved but percentage doesn't change
```
**Solution:** Pass `onVoteChange` callback to trigger refetch
```tsx
<FoodToleranceRating
  {...props}
  onVoteChange={() => router.refresh()} // Add this
/>
```

### Wrong Food Name
```
New vote but rating still shows 0 votes
```
**Solution:** Ensure `foodName` prop matches database exactly (case-sensitive)

---

## Related Files

- **Component:** `/components/features/FoodToleranceRating.tsx`
- **Utilities:** `/lib/utils/food-ratings.ts`
- **Migration:** `/supabase/migrations/008_food_ratings.sql`
- **Documentation:** `/FOOD_RATINGS_SYSTEM.md`

---

## Examples Gallery

### Example 1: Excellent Food (85%+)
```
👍👍 92% (24 votes)  [👍✓] [👎]  Excellent tolerance  • 22 👍 • 2 👎
```

### Example 2: Good Food (60-79%)
```
👍 68% (15 votes)  [👍] [👎]  Good tolerance  • 10 👍 • 5 👎
```

### Example 3: Mixed Food (40-59%)
```
🤷 52% (12 votes)  [👍] [👎]  Mixed reviews  • 6 👍 • 6 👎
```

### Example 4: Poor Food (20-39%)
```
👎 28% (10 votes)  [👍] [👎✓]  Often difficult  • 3 👍 • 7 👎
```

### Example 5: Avoid Food (0-19%)
```
🚫 8% (18 votes)  [👍] [👎]  Commonly avoided  • 1 👍 • 17 👎
```

### Example 6: New Food (No votes)
```
❓ No ratings yet  [👍] [👎]  Be the first to rate!
```

### Example 7: Needs More Votes (1-2 votes)
```
❓ 2 / 3 votes needed  [👍] [👎]
```

---

## Design Decisions

### Why Minimum 3 Votes?
- **Statistical significance:** 1-2 votes not representative
- **Prevents gaming:** Single users can't skew ratings
- **Community consensus:** 3+ votes show true pattern

### Why Can't Users Un-Vote?
- **Intentional:** Users can only change vote (👍 ↔️ 👎)
- **Reasoning:** Encourages commitment, reduces frivolous voting
- **Alternative:** Users can change their vote anytime

### Why Show Icon + Percentage?
- **Accessibility:** Color-blind users see icons
- **Quick scanning:** Icons allow fast visual scanning
- **Clarity:** Percentage provides exact data

---

## Future Enhancements

- [ ] Show user notes on hover
- [ ] "Report incorrect rating" button
- [ ] Trending indicator (▲ rising popularity)
- [ ] Personal vs. community rating comparison
- [ ] Filter by medication (Ozempic vs. Mounjaro)

---

✅ **Component is production-ready and fully documented!**

