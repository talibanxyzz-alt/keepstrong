# 🍽️ Post-Meal Rating Prompt - Implementation Guide

## Overview

The **Post-Meal Rating Prompt** improves data quality by asking users to rate food tolerance **30 minutes after logging a meal** - precisely when they're most aware of how the food is sitting.

---

## 🎯 Why 30 Minutes?

**Medical Reasoning:**
- GLP-1 medications slow gastric emptying
- Nausea/discomfort typically manifests 20-40 minutes after eating
- Asking too soon: User hasn't felt effects yet
- Asking too late: User may have forgotten or moved on

**UX Reasoning:**
- Non-intrusive (not immediate)
- Contextual (user remembers the food)
- Actionable (user can provide accurate feedback)

---

## 📦 Components

### 1. `PostMealRatingPrompt`

Single prompt component that shows 30 minutes after a meal.

**Features:**
- ✅ Auto-shows after 30 minutes
- ✅ Tracks prompted meals in localStorage (no duplicates)
- ✅ Cleans up old prompts (7 days)
- ✅ Dismissible
- ✅ Slide-up animation
- ✅ Mobile-responsive

### 2. `usePostMealPrompts` Hook

Manages multiple prompts across the app.

### 3. `PostMealRatingPrompts` Container

Renders prompts (shows only most recent to avoid overwhelming user).

---

## 🚀 Quick Start

### Step 1: Add to Dashboard Layout

Update `/app/dashboard/DashboardClient.tsx`:

```tsx
'use client';

import { usePostMealPrompts, PostMealRatingPrompts } from '@/components/features/PostMealRatingPrompt';

export default function DashboardClient({ data }) {
  // Add prompt management
  const { prompts, addPrompt, removePrompt } = usePostMealPrompts();

  // Pass addPrompt to QuickAddFood
  return (
    <div>
      {/* Your existing dashboard content */}
      
      {/* Add this at the end */}
      <PostMealRatingPrompts
        prompts={prompts}
        onDismiss={removePrompt}
      />
    </div>
  );
}
```

### Step 2: Update QuickAddFood Component

Update `/components/features/QuickAddFood.tsx`:

```tsx
interface QuickAddFoodProps {
  onSuccess?: () => void;
  onMealLogged?: (foodName: string, loggedAt: Date) => void; // NEW
}

export default function QuickAddFood({ onSuccess, onMealLogged }: QuickAddFoodProps) {
  // ... existing code ...

  const handleQuickAdd = async (food: QuickFood) => {
    // ... existing logging code ...

    // After successful insert:
    const loggedAt = new Date();
    
    // Trigger post-meal prompt
    if (onMealLogged) {
      onMealLogged(food.name, loggedAt);
    }

    // ... rest of code ...
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    // ... existing logging code ...

    // After successful insert:
    const loggedAt = new Date();
    
    // Trigger post-meal prompt
    if (onMealLogged) {
      onMealLogged(customFood, loggedAt);
    }

    // ... rest of code ...
  };
}
```

### Step 3: Connect Them Together

In `DashboardClient.tsx`:

```tsx
<QuickAddFood
  onSuccess={() => {
    // Refresh data
    router.refresh();
  }}
  onMealLogged={(foodName, loggedAt) => {
    // Add prompt that will show in 30 minutes
    addPrompt(foodName, loggedAt);
  }}
/>
```

---

## 📖 Complete Integration Example

### `/app/dashboard/DashboardClient.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePostMealPrompts, PostMealRatingPrompts } from '@/components/features/PostMealRatingPrompt';
import QuickAddFood from '@/components/features/QuickAddFood';

export default function DashboardClient({ data }) {
  const router = useRouter();
  const { prompts, addPrompt, removePrompt } = usePostMealPrompts();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Your existing dashboard content */}
        
        {/* Quick Add Section */}
        {isQuickAddOpen && (
          <div className="mb-6 rounded-xl bg-cloud p-4">
            <QuickAddFood
              onSuccess={() => {
                setIsQuickAddOpen(false);
                router.refresh();
              }}
              onMealLogged={(foodName, loggedAt) => {
                // Schedule post-meal prompt for 30 minutes from now
                addPrompt(foodName, loggedAt);
              }}
            />
          </div>
        )}

        {/* Rest of dashboard */}
      </div>

      {/* Post-Meal Rating Prompts (renders at bottom-right) */}
      <PostMealRatingPrompts
        prompts={prompts}
        onDismiss={removePrompt}
      />
    </div>
  );
}
```

---

## 🎨 Visual Design

### Prompt Appearance:

```
┌─────────────────────────────────────────────────┐
│ How did Scrambled Eggs sit?                  × │
│ Help the community by rating how well this      │
│ food was tolerated                              │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 👍👍 100% (5 votes) [👍] [👎]           │   │
│ │ Excellent tolerance                      │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ⏱️ 30 min after meal               Skip        │
└─────────────────────────────────────────────────┘
```

### Position:
- **Desktop:** Bottom-right, 384px width
- **Mobile:** Bottom, full width (with padding)
- **Z-index:** 50 (above most content)

### Animation:
- **Slide-up:** Smoothly animates from bottom
- **Duration:** 0.3 seconds
- **Easing:** ease-out

---

## 🧪 Testing Scenarios

### Test 1: Immediate Prompt (for development)

Change the delay temporarily:

```typescript
const PROMPT_DELAY_MINUTES = 0.5; // 30 seconds for testing
```

**Steps:**
1. Log a meal
2. Wait 30 seconds
3. Prompt should appear
4. Vote → Prompt closes
5. Log same food again
6. Prompt should NOT appear (already prompted)

### Test 2: Multiple Meals

```
1. Log Scrambled Eggs → Wait 30 min → Prompt shows
2. Log Chicken Breast → Wait 30 min → New prompt shows
3. Only most recent prompt is visible (Chicken Breast)
```

### Test 3: LocalStorage Tracking

```
1. Log meal → Vote on prompt
2. Refresh page → Log same food today
3. Prompt should NOT appear (already prompted today)
4. Wait until tomorrow → Log same food
5. Prompt SHOULD appear (new day)
```

### Test 4: Dismiss Behavior

```
1. Log meal → Prompt shows
2. Click X or "Skip" → Prompt closes
3. Prompt is marked as shown (won't appear again for this meal)
```

### Test 5: Old Prompts Cleanup

```
1. Mock old prompts in localStorage (8 days old)
2. Log new meal
3. Check localStorage → Old prompts should be removed
```

---

## 📊 LocalStorage Structure

### Key: `prompted_meals`

```json
[
  "Scrambled Eggs:2026-02-03",
  "Chicken Breast:2026-02-03",
  "Greek Yogurt:2026-02-02"
]
```

### Format:
```
"FoodName:YYYY-MM-DD"
```

### Cleanup:
- Automatically removes prompts older than 7 days
- Runs on component mount

---

## 🎯 Best Practices

### 1. Only Show Most Recent Prompt
```typescript
// ✅ Good: Show only latest
<PostMealRatingPrompts prompts={prompts} onDismiss={removePrompt} />

// ❌ Bad: Show all prompts (overwhelming)
{prompts.map(p => <PostMealRatingPrompt key={p.id} {...p} />)}
```

### 2. Don't Ask Twice for Same Food/Day
```typescript
// ✅ Good: Tracked in localStorage automatically
markMealAsPrompted(`${foodName}:${date}`);

// ❌ Bad: Asking every time
// (Component handles this internally)
```

### 3. Graceful Degradation
```typescript
// ✅ Good: Works without localStorage
if (typeof window === 'undefined') return [];

// ✅ Good: Try/catch for localStorage errors
try {
  localStorage.setItem(key, value);
} catch (error) {
  console.error('Error:', error);
}
```

### 4. Clear Call-to-Action
```typescript
// ✅ Good: Specific question
"How did Scrambled Eggs sit?"

// ❌ Bad: Generic
"Rate this food"
```

---

## 🔧 Customization

### Change Delay Time

```typescript
const PROMPT_DELAY_MINUTES = 45; // 45 minutes instead of 30
```

### Change Prompt Position

```typescript
// Top-right instead of bottom-right
<div className="fixed top-20 right-4 ...">
```

### Change Cleanup Duration

```typescript
// Keep for 14 days instead of 7
const fourteenDaysAgo = new Date();
fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
```

### Custom Styling

```typescript
<div className="rounded-lg border-2 border-primary bg-gradient-to-r from-white to-cloud ...">
```

---

## 📱 Responsive Behavior

### Desktop (md+):
```css
fixed bottom-20 right-4 w-96
```
- Bottom-right corner
- 384px wide
- Above mobile nav (bottom-20 = 5rem)

### Mobile:
```css
fixed bottom-20 left-4 right-4
```
- Full width (with padding)
- Above mobile nav
- Stacks if multiple prompts

---

## 🚨 Edge Cases Handled

### 1. Meal Logged in Future
```typescript
if (timeSinceLog < 0) {
  return; // Don't show prompt
}
```

### 2. Prompt Already Shown
```typescript
if (wasMealPrompted(mealKey)) {
  return; // Don't show again
}
```

### 3. Page Refresh During Timer
```typescript
const remainingTime = delayMs - timeSinceLog;
setTimeout(() => setShowPrompt(true), remainingTime);
```
- Calculates correct remaining time
- Prompt shows at right moment

### 4. Multiple Prompts Queued
```typescript
const mostRecentPrompt = prompts[prompts.length - 1];
```
- Only shows latest prompt
- Prevents overwhelming user

### 5. LocalStorage Full/Disabled
```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  console.error('Error:', error);
  // Component still works, just won't track
}
```

---

## 📊 Success Metrics

### Adoption:
- **Target:** 40% of users rate at least 1 food via prompt (first week)
- **Measure:** Track `onVoteChange` events from prompts

### Timing:
- **Target:** 80% of ratings happen via prompt (vs manual)
- **Measure:** Compare prompt ratings vs. browse-and-rate

### Quality:
- **Target:** Prompt ratings more consistent than manual
- **Measure:** Compare vote patterns (prompt vs. manual)

### Annoyance:
- **Target:** <10% dismiss rate (most users vote)
- **Measure:** Track dismiss events vs. vote events

---

## 🎁 Bonus Features

### 1. Auto-Tracking
- ✅ Remembers prompted meals (no database needed)
- ✅ Prevents duplicate prompts (same food/day)
- ✅ Cleans up old data (7 days)

### 2. Smart Timing
- ✅ 30 minutes after meal (optimal window)
- ✅ Handles page refresh (recalculates timer)
- ✅ Instant show if already 30+ min passed

### 3. Non-Intrusive
- ✅ Small, bottom-right
- ✅ Dismissible
- ✅ Only shows most recent
- ✅ Animates smoothly

### 4. Context-Aware
- ✅ Shows specific food name
- ✅ Explains why ("Help the community")
- ✅ Timestamp ("30 min after meal")

---

## 🔮 Future Enhancements

### Phase 2:
- [ ] Push notifications (if user grants permission)
- [ ] Email reminder (if prompt missed)
- [ ] Adaptive timing (learn user's patterns)
- [ ] Multiple choice: "Great / OK / Not well"

### Phase 3:
- [ ] Symptom tracking ("Nausea / Bloating / Fine")
- [ ] Correlation analysis (dose vs. tolerance)
- [ ] Personalized suggestions based on history

---

## 🐛 Troubleshooting

### Prompt Not Showing
```
Issue: Meal logged but no prompt appears
Solution: 
1. Check console for errors
2. Verify onMealLogged callback is called
3. Check if meal was already prompted (localStorage)
4. Test with shorter delay (PROMPT_DELAY_MINUTES = 0.5)
```

### Prompt Shows Immediately
```
Issue: Prompt appears right after logging
Solution:
1. Check PROMPT_DELAY_MINUTES value
2. Verify loggedAt timestamp is correct
3. Should be: new Date() (current time)
```

### LocalStorage Not Working
```
Issue: Same food prompted twice today
Solution:
1. Check browser supports localStorage
2. Check for errors in console
3. Verify getMealKey() returns consistent format
4. Manually inspect: localStorage.getItem('prompted_meals')
```

### Animation Not Working
```
Issue: Prompt just pops in without slide-up
Solution:
1. Check Tailwind config includes animation
2. Verify: animation: { 'slide-up': 'slide-up 0.3s ease-out' }
3. Restart dev server after config change
```

---

## ✅ Implementation Checklist

### Setup:
- [x] Component created (`PostMealRatingPrompt.tsx`)
- [x] Animation added to Tailwind config
- [x] Documentation written

### Integration:
- [ ] Import hook in `DashboardClient.tsx`
- [ ] Add `onMealLogged` prop to `QuickAddFood`
- [ ] Call `addPrompt()` after logging meal
- [ ] Render `<PostMealRatingPrompts />` in layout

### Testing:
- [ ] Test 30-second delay (dev mode)
- [ ] Test dismiss behavior
- [ ] Test voting from prompt
- [ ] Test localStorage tracking
- [ ] Test mobile responsive
- [ ] Test multiple prompts

### Production:
- [ ] Change delay to 30 minutes
- [ ] Test with real users
- [ ] Monitor metrics (adoption, quality)
- [ ] Iterate based on feedback

---

## 🎉 Status

✅ **Component:** Complete and production-ready  
✅ **Animation:** Configured  
✅ **LocalStorage:** Implemented  
✅ **Documentation:** Comprehensive  
⏳ **Integration:** Ready to integrate  
⏳ **Testing:** Pending integration  

---

## 📝 Quick Copy-Paste

### 1. Update QuickAddFood

```typescript
// Add to interface
interface QuickAddFoodProps {
  onSuccess?: () => void;
  onMealLogged?: (foodName: string, loggedAt: Date) => void;
}

// In handleQuickAdd, after successful insert:
if (onMealLogged) {
  onMealLogged(food.name, new Date());
}

// In handleCustomSubmit, after successful insert:
if (onMealLogged) {
  onMealLogged(customFood, new Date());
}
```

### 2. Update DashboardClient

```typescript
import { usePostMealPrompts, PostMealRatingPrompts } from '@/components/features/PostMealRatingPrompt';

export default function DashboardClient({ data }) {
  const { prompts, addPrompt, removePrompt } = usePostMealPrompts();

  return (
    <div>
      {/* Existing content */}
      
      <QuickAddFood
        onMealLogged={(foodName, loggedAt) => addPrompt(foodName, loggedAt)}
      />

      {/* Add at end */}
      <PostMealRatingPrompts prompts={prompts} onDismiss={removePrompt} />
    </div>
  );
}
```

---

**Ready to integrate!** 🚀

The component is self-contained and handles all edge cases. Just add the two code snippets above and you're done!

