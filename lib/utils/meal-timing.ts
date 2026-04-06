/**
 * Meal Timing Utilities
 * 
 * Helps users maintain regular protein intake throughout the day.
 * Critical for GLP-1 users to prevent nausea and preserve muscle.
 */

import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import { TypedSupabaseClient } from '@/types/supabase';

/**
 * Get the timestamp of the user's most recent meal
 */
export async function getLastMealTime(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<Date | null> {
  const { data, error } = await supabase
    .from('protein_logs')
    .select('logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching last meal:', error);
    return null;
  }

  if (!data || !data.logged_at) {
    return null;
  }

  return new Date(data.logged_at);
}

/**
 * Calculate hours since last meal
 */
export async function getHoursSinceLastMeal(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<number> {
  const lastMealTime = await getLastMealTime(supabase, userId);

  if (!lastMealTime) {
    return 0; // No meals logged yet
  }

  const now = new Date();
  return differenceInHours(now, lastMealTime);
}

/**
 * Calculate hours since a given meal time (pure function)
 */
export function getHoursSinceLastMealFromDate(lastMeal: Date): number {
  const now = new Date();
  return differenceInHours(now, lastMeal);
}

/**
 * Calculate minutes since last meal (for more precision)
 */
export async function getMinutesSinceLastMeal(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<number> {
  const lastMealTime = await getLastMealTime(supabase, userId);

  if (!lastMealTime) {
    return 0;
  }

  const now = new Date();
  return differenceInMinutes(now, lastMealTime);
}

/**
 * Check if we should show meal timing alert
 * 
 * @param hoursSinceLastMeal - Hours since last meal (use getHoursSinceLastMealFromDate for pure function)
 * @param thresholdHours - Hours threshold before showing alert (default: 6)
 */
export function shouldShowMealAlert(
  hoursSinceLastMeal: number,
  thresholdHours: number = 6
): boolean {
  // Don't alert at night (11pm - 7am)
  const currentHour = new Date().getHours();
  if (currentHour >= 23 || currentHour < 7) {
    return false;
  }

  return hoursSinceLastMeal >= thresholdHours;
}

/**
 * Check if current time is nighttime (sleeping hours)
 */
export function isNighttime(): boolean {
  const now = new Date();
  const hour = now.getHours();

  // 11 PM (23:00) to 7 AM (07:00)
  return hour >= 23 || hour < 7;
}

/**
 * Check if alert was dismissed in the last 2 hours
 */
function isAlertRecentlyDismissed(userId: string): boolean {
  // Check localStorage (client-side only)
  if (typeof window !== 'undefined') {
    const dismissedAt = localStorage.getItem(`meal_alert_dismissed_${userId}`);
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt);
      const now = new Date();
      const hoursSinceDismiss = differenceInHours(now, dismissedTime);

      if (hoursSinceDismiss < 2) {
        return true;
      } else {
        // Clean up old dismissal
        localStorage.removeItem(`meal_alert_dismissed_${userId}`);
      }
    }
  }

  return false;
}

/**
 * Dismiss alert for 2 hours
 */
export function dismissMealAlert(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`meal_alert_dismissed_${userId}`, new Date().toISOString());
  }
}

/**
 * Get user's meal timing preferences
 */
export async function getUserMealTimingPreferences(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<{
  alertsEnabled: boolean;
  thresholdHours: number;
} | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('meal_timing_alerts, meal_timing_threshold_hours')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    alertsEnabled: data.meal_timing_alerts ?? true,
    thresholdHours: data.meal_timing_threshold_hours ?? 6,
  };
}

/**
 * Alias for backward compatibility
 */
export async function getMealTimingPreferences(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<{
  enabled: boolean;
  thresholdHours: number;
}> {
  const prefs = await getUserMealTimingPreferences(supabase, userId);
  return {
    enabled: prefs?.alertsEnabled ?? true,
    thresholdHours: prefs?.thresholdHours ?? 6,
  };
}

/**
 * Calculate average meals per day for a given period
 */
export async function getAverageMealsPerDay(
  supabase: TypedSupabaseClient,
  userId: string,
  daysBack: number = 7
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('protein_logs')
    .select('date')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'));

  if (error || !data) {
    return 0;
  }

  // Group by date and count unique dates
  const uniqueDates = new Set(data.map((log) => log.date));
  const totalMeals = data.length;
  const daysWithMeals = uniqueDates.size;

  if (daysWithMeals === 0) {
    return 0;
  }

  return Math.round((totalMeals / daysWithMeals) * 10) / 10; // Round to 1 decimal
}

/**
 * Get meal frequency stats for reporting
 */
export async function getMealFrequencyStats(
  supabase: TypedSupabaseClient,
  userId: string,
  daysBack: number = 7
) {
  const avgMealsPerDay = await getAverageMealsPerDay(supabase, userId, daysBack);

  const target = { min: 3, max: 4 };
  const isOnTarget = avgMealsPerDay >= target.min && avgMealsPerDay <= target.max;

  let status: 'good' | 'warning' | 'poor';
  let message: string;

  if (avgMealsPerDay === 0) {
    status = 'poor';
    message = 'No meals logged yet';
  } else if (avgMealsPerDay < 2) {
    status = 'poor';
    message = 'Too few meals - aim for 3-4 per day';
  } else if (avgMealsPerDay < 3) {
    status = 'warning';
    message = 'Try adding one more meal per day';
  } else if (avgMealsPerDay <= 4) {
    status = 'good';
    message = 'Great meal frequency!';
  } else if (avgMealsPerDay <= 5) {
    status = 'good';
    message = 'Good frequency - spreading protein intake';
  } else {
    status = 'warning';
    message = 'Frequent snacking - aim for bigger meals';
  }

  return {
    avgMealsPerDay,
    target,
    isOnTarget,
    status,
    message,
  };
}

/**
 * Format time since last meal for display
 */
export function formatTimeSinceLastMeal(hours: number): string {
  if (hours === 0) {
    return 'No meals logged yet';
  }

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minutes ago`;
  }

  if (hours < 24) {
    return `${Math.round(hours)} hours ago`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);

  if (remainingHours === 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  return `${days} day${days > 1 ? 's' : ''} and ${remainingHours} hour${remainingHours > 1 ? 's' : ''} ago`;
}

/**
 * Get quick add suggestions based on time of day
 */
export function getQuickAddSuggestions(): Array<{ food: string; protein: number }> {
  const hour = new Date().getHours();

  // Breakfast (5 AM - 10 AM)
  if (hour >= 5 && hour < 10) {
    return [
      { food: 'Eggs (2)', protein: 12 },
      { food: 'Greek Yogurt', protein: 15 },
      { food: 'Protein Shake', protein: 25 },
    ];
  }

  // Lunch (11 AM - 2 PM)
  if (hour >= 11 && hour < 14) {
    return [
      { food: 'Chicken Breast', protein: 30 },
      { food: 'Tuna Salad', protein: 25 },
      { food: 'Turkey Sandwich', protein: 20 },
    ];
  }

  // Afternoon Snack (2 PM - 5 PM)
  if (hour >= 14 && hour < 17) {
    return [
      { food: 'Protein Bar', protein: 20 },
      { food: 'Cottage Cheese', protein: 15 },
      { food: 'Almonds (1/4 cup)', protein: 8 },
    ];
  }

  // Dinner (5 PM - 9 PM)
  if (hour >= 17 && hour < 21) {
    return [
      { food: 'Salmon', protein: 35 },
      { food: 'Steak', protein: 40 },
      { food: 'Tofu Stir-fry', protein: 20 },
    ];
  }

  // Evening/Default
  return [
    { food: 'Protein Shake', protein: 25 },
    { food: 'Greek Yogurt', protein: 15 },
    { food: 'Protein Bar', protein: 20 },
  ];
}

/**
 * Calculate the longest gap between consecutive meals in hours
 */
export async function getLongestMealGap(
  supabase: TypedSupabaseClient,
  userId: string,
  daysBack: number = 7
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('protein_logs')
    .select('logged_at')
    .eq('user_id', userId)
    .gte('logged_at', startDate.toISOString())
    .order('logged_at', { ascending: true });

  if (error || !data || data.length < 2) {
    return 0; // Need at least 2 meals to calculate gap
  }

  let maxGap = 0;

  for (let i = 1; i < data.length; i++) {
    const prevLoggedAt = data[i - 1].logged_at;
    const currentLoggedAt = data[i].logged_at;
    
    if (!prevLoggedAt || !currentLoggedAt) continue;
    
    const prevMealTime = new Date(prevLoggedAt);
    const currentMealTime = new Date(currentLoggedAt);
    const gapHours = differenceInHours(currentMealTime, prevMealTime);

    // Only count gaps during waking hours (exclude overnight gaps > 10 hours)
    if (gapHours <= 16) { // Max realistic waking gap
      maxGap = Math.max(maxGap, gapHours);
    }
  }

  return maxGap;
}

/**
 * Count days with 3+ separate meals (meals must be >2 hours apart)
 */
export async function getDaysWithEnoughMeals(
  supabase: TypedSupabaseClient,
  userId: string,
  daysBack: number = 7
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data, error } = await supabase
    .from('protein_logs')
    .select('logged_at, date')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .order('logged_at', { ascending: true });

  if (error || !data) {
    return 0;
  }

  // Group meals by date
  const mealsByDate: Record<string, Date[]> = {};

  for (const log of data) {
    const date = log.date;
    if (!date || !log.logged_at) continue;
    
    if (!mealsByDate[date]) {
      mealsByDate[date] = [];
    }
    mealsByDate[date].push(new Date(log.logged_at));
  }

  // Count days with 3+ separate meals (>2 hours apart)
  let daysWithEnoughMeals = 0;

  for (const date in mealsByDate) {
    const meals = mealsByDate[date];

    // Filter out meals that are too close together (<2 hours)
    const separateMeals: Date[] = [];

    for (const mealTime of meals) {
      // Check if this meal is at least 2 hours from any existing separate meal
      const isSeparate = separateMeals.every(existingMeal => {
        const hoursDiff = Math.abs(differenceInHours(mealTime, existingMeal));
        return hoursDiff >= 2;
      });

      if (isSeparate) {
        separateMeals.push(mealTime);
      }
    }

    if (separateMeals.length >= 3) {
      daysWithEnoughMeals++;
    }
  }

  return daysWithEnoughMeals;
}

/**
 * Get comprehensive meal timing analytics for progress tracking
 */
export async function getMealTimingAnalytics(
  supabase: TypedSupabaseClient,
  userId: string,
  daysBack: number = 7
) {
  const [avgMealsPerDay, maxGapHours, daysWithEnoughMeals, frequencyStats] = await Promise.all([
    getAverageMealsPerDay(supabase, userId, daysBack),
    getLongestMealGap(supabase, userId, daysBack),
    getDaysWithEnoughMeals(supabase, userId, daysBack),
    getMealFrequencyStats(supabase, userId, daysBack),
  ]);

  return {
    avgMealsPerDay,
    maxGapHours,
    daysWithEnoughMeals,
    daysTracked: daysBack,
    status: frequencyStats.status,
    message: frequencyStats.message,
    isOnTarget: frequencyStats.isOnTarget,
  };
}

/**
 * Usage example in Server Component:
 * 
 * ```ts
 * import { createClient } from '@/lib/supabase/server';
 * import { getLastMealTime, getHoursSinceLastMealFromDate, shouldShowMealAlert } from '@/lib/utils/meal-timing';
 * 
 * const supabase = await createClient();
 * const lastMeal = await getLastMealTime(supabase, userId);
 * 
 * if (lastMeal) {
 *   const hours = getHoursSinceLastMealFromDate(lastMeal);
 *   const shouldAlert = shouldShowMealAlert(hours, 6);
 *   console.log(`${hours} hours since last meal, alert: ${shouldAlert}`);
 * }
 * ```
 */
