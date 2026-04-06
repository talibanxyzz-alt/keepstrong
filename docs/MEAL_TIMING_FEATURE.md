# Meal Timing Tracking & Alerts

## Overview

The Meal Timing feature helps GLP-1 medication users maintain regular protein intake throughout the day. Regular eating patterns are critical for:
- Preventing the "nausea → not eating → worse nausea" spiral common with GLP-1 medications
- Preserving muscle mass during weight loss
- Meeting daily protein targets consistently

## Medical Context

**American Society for Nutrition Guidelines:**
- Recommends "small meals every 3-4 hours" for GLP-1 users
- Regular protein distribution (25-40g per meal) is more effective than one large meal
- Skipping meals can exacerbate GLP-1 side effects (nausea, fatigue)

## Features

### 1. Automatic Time Tracking
- System tracks `logged_at` timestamp for every protein log
- No additional user input required
- Calculates hours since last meal automatically

### 2. Smart Alerts
The dashboard displays a gentle, non-intrusive alert when:
- ✅ Hours since last meal > threshold (default: 6 hours)
- ✅ User hasn't dismissed the alert in the last 2 hours
- ✅ Meal timing alerts are enabled in settings
- ✅ Current time is NOT during sleeping hours (11 PM - 7 AM)

**Alert Design:**
- Amber color scheme (warning, not error)
- Gentle, supportive tone ("Time for a snack?" not "YOU MUST EAT")
- Quick action buttons with contextual suggestions
- Dismissible for 2 hours

### 3. Quick Add Suggestions
Time-aware meal suggestions:
- **Morning (5-10 AM):** Eggs, Greek Yogurt, Protein Shake
- **Lunch (11 AM-2 PM):** Chicken Breast, Tuna Salad, Turkey Sandwich
- **Afternoon (2-5 PM):** Protein Bar, Cottage Cheese, Almonds
- **Dinner (5-9 PM):** Salmon, Steak, Tofu Stir-fry
- **Evening/Default:** Protein Shake, Greek Yogurt, Protein Bar

One-click logging: Alert → Click "Protein Shake (25g)" → Done!

### 4. User Preferences
In Settings → Preferences:
- **Enable/Disable:** Toggle meal timing alerts on/off
- **Threshold:** Choose between 5, 6, 7, or 8 hours (default: 6h)
- **Why configurable?** 
  - Some users prefer 3 large meals (8h threshold)
  - Others prefer 4-5 smaller meals (5-6h threshold)
  - Personal schedules vary (shift work, intermittent fasting, etc.)

### 5. Weekly Report Integration
Progress page shows:
```
Meal frequency: 3.2 meals/day (target: 3-4)
Status: Good meal frequency!
```

**Status indicators:**
- **Good:** 3-5 meals/day (spreading protein intake)
- **Warning:** 2-3 meals/day ("Try adding one more meal")
- **Poor:** <2 meals/day ("Too few meals - aim for 3-4")

## Database Schema

### Existing Table: `protein_logs`
```sql
- user_id (uuid)
- food_name (text)
- protein_grams (integer)
- date (date)
- logged_at (timestamp) ← Used for time tracking
```

### Modified Table: `profiles`
```sql
-- New columns (migration 007)
- meal_timing_alerts (boolean, default: true)
- meal_timing_threshold_hours (integer, default: 6, check 5-8)
```

## Implementation Files

### Core Utilities
**`/lib/utils/meal-timing.ts`**
- `getLastMealTime()` - Query most recent meal timestamp
- `getHoursSinceLastMeal()` - Calculate time since last meal
- `shouldShowMealAlert()` - Determine if alert should display
- `isNighttime()` - Check if current time is sleeping hours
- `dismissMealAlert()` - Store dismissal in localStorage (2h)
- `getQuickAddSuggestions()` - Time-aware meal suggestions
- `getAverageMealsPerDay()` - Calculate meal frequency
- `getMealFrequencyStats()` - Stats for progress reports

### Components
**`/components/features/MealTimingAlert.tsx`**
- Main alert component
- Displays on dashboard when criteria met
- Shows quick add suggestions
- Handles dismissal

**`/components/features/QuickAddButton.tsx`**
- One-click meal logging
- Pre-filled food name and protein amount
- Inserts into `protein_logs` table
- Triggers success toast

### Pages
**`/app/dashboard/page.tsx`** (Server Component)
- Fetches meal timing data server-side
- Calculates `hoursSinceLastMeal`
- Checks `shouldShowMealAlert`
- Passes data to client component

**`/app/dashboard/DashboardClient.tsx`** (Client Component)
- Renders `MealTimingAlert` if criteria met
- Manages alert visibility state
- Handles alert dismissal

**`/app/settings/SettingsClient.tsx`** (Client Component)
- Meal timing preferences UI
- Enable/disable toggle
- Threshold selection (5-8 hours)
- Save preferences handler

## User Flow

### First-Time User
1. User signs up and completes onboarding
2. User logs first meal → Timestamp recorded
3. 6 hours pass with no additional meals
4. User opens dashboard → Alert displays
5. User clicks "Protein Shake (25g)" → Meal logged, alert hides
6. Timer resets

### Dismissing Alerts
1. User sees alert but isn't ready to eat
2. User clicks "Dismiss for 2 hours"
3. Alert hidden for 2 hours (stored in localStorage)
4. After 2 hours, if still over threshold, alert reappears

### Customizing Preferences
1. User navigates to Settings → Preferences
2. User enables/disables "Alert me if I haven't eaten"
3. User selects threshold (e.g., "8 hours" for 3-meals-per-day approach)
4. User clicks "Save Preferences"
5. Changes apply immediately

## Edge Cases Handled

### ✅ New User (No Meals Logged)
- `getLastMealTime()` returns `null`
- `getHoursSinceLastMeal()` returns `0`
- Alert does NOT show

### ✅ Nighttime (11 PM - 7 AM)
- `isNighttime()` returns `true`
- `shouldShowMealAlert()` returns `false`
- Alert does NOT show (user is sleeping)

### ✅ Recently Dismissed
- Dismissal timestamp stored in localStorage: `meal_alert_dismissed_{userId}`
- `isAlertRecentlyDismissed()` checks timestamp
- If < 2 hours ago, alert does NOT show

### ✅ Just Logged Meal
- User logs meal → `logged_at` updated to now
- `getHoursSinceLastMeal()` calculates fresh time
- Alert immediately hides (hours reset to 0)

### ✅ Threshold Below Minimum
- Database constraint: `meal_timing_threshold_hours >= 5 AND <= 8`
- Settings UI only offers 5-8 hour options
- Invalid values rejected at database level

## Performance Considerations

### Server-Side Calculations
- Meal timing data fetched during dashboard page load (server component)
- Single query for last meal: `ORDER BY logged_at DESC LIMIT 1`
- Minimal overhead (~5ms)

### Client-Side Storage
- Alert dismissal uses localStorage (not database)
- Reduces server round-trips
- Persists across page reloads
- Clears automatically after 2 hours

### Caching
- User preferences cached in server component
- No real-time updates needed (preferences change rarely)
- Refresh page to see updated preferences

## Testing Scenarios

### Manual Testing Checklist

1. **Alert Display:**
   - [ ] Log a meal, wait 6+ hours, check dashboard → Alert appears
   - [ ] Log a meal, wait < 6 hours → No alert
   - [ ] Enable alerts, check dashboard at 2 AM → No alert (nighttime)

2. **Quick Add:**
   - [ ] Click "Protein Shake (25g)" → Meal logged, alert hides
   - [ ] Check protein tracker → New entry appears
   - [ ] Check timestamp → Current time recorded

3. **Dismissal:**
   - [ ] Click "Dismiss for 2 hours" → Alert hides
   - [ ] Refresh page immediately → Still hidden
   - [ ] Wait 2+ hours → Alert reappears (if still over threshold)

4. **Preferences:**
   - [ ] Disable alerts in settings → No alerts on dashboard
   - [ ] Enable alerts, set threshold to 8h → Alert after 8h, not 6h
   - [ ] Change threshold to 5h → Alert after 5h

5. **Edge Cases:**
   - [ ] New user (no meals) → No alert
   - [ ] Log meal, immediately check dashboard → No alert (just ate)
   - [ ] Check alert at 3 AM → No alert (nighttime)

### Automated Testing (Future)
```typescript
describe('Meal Timing', () => {
  test('calculates hours correctly', async () => {
    // Mock protein log 7 hours ago
    // Call getHoursSinceLastMeal()
    // Expect result ≈ 7
  });

  test('respects threshold', async () => {
    // Set threshold to 8 hours
    // Mock meal 7 hours ago
    // Call shouldShowMealAlert()
    // Expect false (7 < 8)
  });

  test('blocks alerts at night', async () => {
    // Mock current time: 2 AM
    // Mock meal 8 hours ago
    // Call shouldShowMealAlert()
    // Expect false (nighttime)
  });
});
```

## Future Enhancements

### Phase 2 (Optional)
- **Browser Notifications:** Push notifications when alert triggers (requires permission)
- **SMS Reminders:** Text message alerts for users who opt in
- **Meal Streaks:** "7-day streak: 3+ meals every day! 🔥"
- **Smart Suggestions:** ML-based meal suggestions based on past preferences
- **Integration with Calendar:** Don't alert during scheduled meetings/events

### Phase 3 (Advanced)
- **GLP-1 Dose Correlation:** Track if meal frequency changes with dose adjustments
- **Nausea Triggers:** "You tend to feel nauseous when you wait >7h"
- **Social Features:** "Your friend Sarah just logged a meal - stay on track!"

## Accessibility

- ✅ Semantic HTML (proper heading hierarchy)
- ✅ ARIA labels on dismiss button
- ✅ Keyboard navigation (Tab, Enter)
- ✅ Color contrast (amber text on light background meets WCAG AA)
- ✅ Screen reader friendly ("Alert: Time for a protein snack?")

## Security & Privacy

- ✅ No PHI (Protected Health Information) in localStorage
- ✅ User ID stored, but no sensitive data
- ✅ RLS (Row Level Security) on `protein_logs` table
- ✅ Server-side validation of preferences
- ✅ No external API calls (all internal)

## Analytics & Monitoring

### Metrics to Track (Optional)
- **Alert Impressions:** How often does alert show?
- **Dismissal Rate:** % of alerts dismissed vs. acted upon
- **Quick Add Usage:** Which suggestions are most popular?
- **Frequency Changes:** Do users improve meal frequency over time?
- **Preference Distribution:** What thresholds do users prefer?

### Success Metrics
- **Primary:** Increase in average meals/day (2.5 → 3.2)
- **Secondary:** Improved protein target adherence (70% → 85%)
- **Tertiary:** Reduced "no meals logged" days (30% → 10%)

## Deployment Checklist

- [x] Create utility functions (`meal-timing.ts`)
- [x] Create components (`MealTimingAlert`, `QuickAddButton`)
- [x] Update dashboard (server + client)
- [x] Update settings page
- [x] Create database migration (`007_add_meal_timing_preferences.sql`)
- [ ] Run migration in production
- [ ] Test on staging environment
- [ ] Monitor error logs for 24h
- [ ] Collect user feedback
- [ ] Iterate based on feedback

## Support & Documentation

### User-Facing Documentation
Create help article in app:
- **Title:** "Why am I seeing meal timing alerts?"
- **Content:** Explain GLP-1 side effects, muscle preservation, nutrition guidelines
- **FAQ:** How to disable, how to change threshold, why 6 hours?

### Customer Support Scripts
```
Q: "How do I turn off meal reminders?"
A: "Go to Settings → Preferences → Uncheck 'Alert me if I haven't eaten' → Save"

Q: "Why am I getting alerts so often?"
A: "The default is 6 hours. You can increase it to 7-8h in Settings → Preferences"

Q: "I just ate but still seeing the alert"
A: "Did you log your meal in the app? The alert only knows about logged meals."
```

## Technical Debt & Known Issues

### ⚠️ Current Limitations
1. **localStorage only:** Dismissals don't sync across devices
2. **No timezone handling:** Uses local device time (could cause issues for travelers)
3. **No "snooze" feature:** Only full 2-hour dismiss
4. **Desktop only tested:** Mobile UX needs validation

### 🔧 Potential Improvements
1. Store dismissals in database for cross-device sync
2. Add timezone awareness (convert to UTC, display in local)
3. Add 30-min and 1-hour snooze options
4. Optimize mobile layout (smaller cards, fewer suggestions)

---

## Questions?

For technical questions, see:
- `/lib/utils/meal-timing.ts` - Core logic
- `/components/features/MealTimingAlert.tsx` - UI implementation
- `/docs/MEAL_TIMING_FEATURE.md` - This file

For feature requests, create an issue with label `enhancement: meal-timing`.

