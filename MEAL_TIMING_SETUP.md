# Meal Timing Feature - Quick Setup Guide

## ✅ What's New

The meal timing tracking and alerts feature has been fully implemented! This feature helps GLP-1 users maintain regular protein intake throughout the day.

## 📦 Files Added/Modified

### New Files:
1. `/lib/utils/meal-timing.ts` - Core utility functions
2. `/components/features/MealTimingAlert.tsx` - Alert component
3. `/components/features/QuickAddButton.tsx` - Quick add button
4. `/supabase/migrations/007_add_meal_timing_preferences.sql` - Database migration
5. `/docs/MEAL_TIMING_FEATURE.md` - Comprehensive documentation

### Modified Files:
1. `/app/dashboard/page.tsx` - Fetches meal timing data
2. `/app/dashboard/DashboardClient.tsx` - Displays alert
3. `/app/settings/SettingsClient.tsx` - Preferences UI

## 🚀 Setup Steps

### Step 1: Run Database Migration

Open your Supabase SQL Editor and run:

```bash
cat supabase/migrations/007_add_meal_timing_preferences.sql
```

Or manually execute:

```sql
ALTER TABLE profiles
ADD COLUMN meal_timing_alerts BOOLEAN DEFAULT true,
ADD COLUMN meal_timing_threshold_hours INTEGER DEFAULT 6;

COMMENT ON COLUMN profiles.meal_timing_alerts IS 'Whether to show meal timing reminders';
COMMENT ON COLUMN profiles.meal_timing_threshold_hours IS 'Hours without eating before showing alert (5-8)';

ALTER TABLE profiles
ADD CONSTRAINT meal_timing_threshold_check 
CHECK (meal_timing_threshold_hours >= 5 AND meal_timing_threshold_hours <= 8);
```

### Step 2: Restart Dev Server

```bash
# If server is running, stop it (Ctrl+C)
npm run dev:turbo
```

### Step 3: Test the Feature

1. **Log a meal:**
   - Go to Dashboard → Click "Quick Add"
   - Add any protein source

2. **Wait (or manually test):**
   - Option A: Wait 6+ hours, refresh dashboard
   - Option B: Use browser DevTools to modify localStorage date

3. **See the alert:**
   - Amber-colored alert appears at top of dashboard
   - Shows hours since last meal
   - Provides quick add buttons

4. **Test dismissal:**
   - Click "Dismiss for 2 hours"
   - Alert should hide
   - Refresh page → Still hidden

5. **Test preferences:**
   - Go to Settings → Preferences
   - Toggle "Alert me if I haven't eaten"
   - Change threshold (5-8 hours)
   - Click "Save Preferences"
   - Test again with new settings

## 🎯 Key Features

### 1. Smart Alerts
- ✅ Only shows when hours since last meal > threshold
- ✅ Respects nighttime (11 PM - 7 AM) - no alerts while sleeping
- ✅ Dismissible for 2 hours
- ✅ Gentle, supportive tone

### 2. Quick Add Suggestions
Time-aware meal suggestions:
- Morning: Eggs, Greek Yogurt, Protein Shake
- Lunch: Chicken, Tuna, Turkey
- Afternoon: Protein Bar, Cottage Cheese
- Dinner: Salmon, Steak, Tofu
- One-click logging!

### 3. User Preferences
- Enable/disable alerts
- Customize threshold (5-8 hours)
- Saves to database (syncs across sessions)

### 4. Weekly Reports (Future)
- Meal frequency stats
- "3.2 meals/day (target: 3-4)"
- Status indicators

## 🐛 Troubleshooting

### Alert Not Showing?
1. Check if you've logged a meal (need at least one)
2. Check if it's nighttime (11 PM - 7 AM)
3. Check if you dismissed it recently (< 2 hours ago)
4. Check Settings → Meal timing alerts are enabled
5. Check Hours since last meal >= threshold

### Alert Always Showing?
1. Check if meals are being logged with correct timestamps
2. Verify `logged_at` field in `protein_logs` table
3. Check browser console for errors

### Preferences Not Saving?
1. Check browser console for errors
2. Verify database migration ran successfully
3. Check RLS policies on `profiles` table
4. Ensure user is authenticated

### Quick Add Not Working?
1. Check browser console for errors
2. Verify `protein_logs` table exists
3. Check RLS policies allow INSERT
4. Ensure user ID is passed correctly

## 📊 Database Schema

```sql
-- Existing table (no changes needed)
protein_logs:
  - user_id
  - food_name
  - protein_grams
  - date
  - logged_at ← Used for timing calculations

-- Modified table (new columns)
profiles:
  - meal_timing_alerts (boolean, default: true)
  - meal_timing_threshold_hours (integer, default: 6, check: 5-8)
```

## 🧪 Manual Testing Checklist

- [ ] Alert appears after 6+ hours
- [ ] Alert does NOT appear < 6 hours
- [ ] Alert does NOT appear at night (11 PM - 7 AM)
- [ ] Quick add buttons work (meal logged)
- [ ] Dismissal works (hidden for 2 hours)
- [ ] Preferences save successfully
- [ ] Changing threshold works (5h, 7h, 8h)
- [ ] Disabling alerts hides alert
- [ ] New users (no meals) don't see alert

## 🔮 Future Enhancements

### Phase 2:
- Browser push notifications
- SMS reminders (opt-in)
- Meal streaks ("7-day streak!")
- Weekly report integration (already coded, needs UI)

### Phase 3:
- ML-based meal suggestions
- GLP-1 dose correlation tracking
- Nausea trigger patterns
- Calendar integration

## 📖 Documentation

- **Full Feature Docs:** `/docs/MEAL_TIMING_FEATURE.md`
- **Core Logic:** `/lib/utils/meal-timing.ts`
- **UI Component:** `/components/features/MealTimingAlert.tsx`
- **This Guide:** `/MEAL_TIMING_SETUP.md`

## ❓ Questions?

If you encounter any issues or have questions:
1. Check `/docs/MEAL_TIMING_FEATURE.md` for detailed explanations
2. Review the code comments in each file
3. Check browser console for errors
4. Verify database migration was successful

---

**That's it! The meal timing feature is ready to use.** 🎉

Test it out and let me know if you need any adjustments!

