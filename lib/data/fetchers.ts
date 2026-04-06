/**
 * Data fetching functions optimized for SWR
 * These functions are used with SWR for caching and revalidation
 */

import { createClient } from '@/lib/supabase/client';
import { performanceMonitor } from '@/lib/performance/monitoring';

const supabase = createClient();

/**
 * Fetch user profile
 */
export async function fetchUserProfile(userId: string) {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    performanceMonitor.trackQuery('fetch_user_profile', startTime);
    return data;
  } catch (error) {
    performanceMonitor.trackQuery('fetch_user_profile_error', startTime);
    throw error;
  }
}

/**
 * Fetch protein logs for a specific date
 */
export async function fetchProteinLogs(userId: string, date: string) {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from('protein_logs')
      .select('id, food_name, protein_grams, meal_type, logged_at')
      .eq('user_id', userId)
      .eq('date', date)
      .order('logged_at', { ascending: true });

    if (error) throw error;
    
    performanceMonitor.trackQuery('fetch_protein_logs', startTime);
    return data || [];
  } catch (error) {
    performanceMonitor.trackQuery('fetch_protein_logs_error', startTime);
    throw error;
  }
}

/**
 * Fetch workout programs (cached for long time)
 */
export async function fetchWorkoutPrograms() {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from('workout_programs')
      .select(`
        id,
        name,
        description,
        difficulty_level,
        workouts_per_week
      `)
      .order('difficulty_level');

    if (error) throw error;
    
    performanceMonitor.trackQuery('fetch_workout_programs', startTime);
    return data || [];
  } catch (error) {
    performanceMonitor.trackQuery('fetch_workout_programs_error', startTime);
    throw error;
  }
}

/**
 * Fetch recent workout sessions
 */
export async function fetchRecentWorkouts(userId: string, limit: number = 10) {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        id,
        started_at,
        completed_at,
        workout:workouts(name)
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    performanceMonitor.trackQuery('fetch_recent_workouts', startTime);
    return data || [];
  } catch (error) {
    performanceMonitor.trackQuery('fetch_recent_workouts_error', startTime);
    throw error;
  }
}

/**
 * Fetch weight logs
 */
export async function fetchWeightLogs(userId: string, limit: number = 30) {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('id, weight_kg, logged_at, notes')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    performanceMonitor.trackQuery('fetch_weight_logs', startTime);
    return data || [];
  } catch (error) {
    performanceMonitor.trackQuery('fetch_weight_logs_error', startTime);
    throw error;
  }
}

/**
 * Fetch progress photos
 */
export async function fetchProgressPhotos(userId: string) {
  const startTime = performance.now();
  
  try {
    const { data, error } = await supabase
      .from('progress_photos')
      .select('id, photo_url, angle, taken_at')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false });

    if (error) throw error;
    
    performanceMonitor.trackQuery('fetch_progress_photos', startTime);
    return data || [];
  } catch (error) {
    performanceMonitor.trackQuery('fetch_progress_photos_error', startTime);
    throw error;
  }
}

/**
 * Generic fetcher for SWR
 */
export const swrFetcher = async (url: string) => {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    const data = await response.json();
    performanceMonitor.trackAPICall(url, startTime, true);
    return data;
  } catch (error) {
    performanceMonitor.trackAPICall(url, startTime, false);
    throw error;
  }
};

