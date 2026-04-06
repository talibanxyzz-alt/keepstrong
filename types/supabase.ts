/**
 * Supabase Type Helpers
 * 
 * Convenient type exports for use throughout the application.
 * Import these types instead of accessing the Database type directly.
 */

import { Database } from './database.types';
import type { SupabaseClient as BaseSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

// =============================================================================
// TABLE ROW TYPES (for reading data)
// =============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type WorkoutProgram = Database['public']['Tables']['workout_programs']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type ProteinLog = Database['public']['Tables']['protein_logs']['Row'];
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];
export type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row'];
export type WeightLog = Database['public']['Tables']['weight_logs']['Row'];
export type FoodToleranceVote = Database['public']['Tables']['food_tolerance_votes']['Row'];
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];
export type UserStreak = Database['public']['Tables']['user_streaks']['Row'];
export type MealRatingPrompt = Database['public']['Tables']['meal_rating_prompts']['Row'];

// =============================================================================
// TABLE INSERT TYPES (for creating data)
// =============================================================================

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type WorkoutProgramInsert = Database['public']['Tables']['workout_programs']['Insert'];
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];
export type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];
export type ProteinLogInsert = Database['public']['Tables']['protein_logs']['Insert'];
export type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert'];
export type ExerciseSetInsert = Database['public']['Tables']['exercise_sets']['Insert'];
export type ProgressPhotoInsert = Database['public']['Tables']['progress_photos']['Insert'];
export type WeightLogInsert = Database['public']['Tables']['weight_logs']['Insert'];
export type FoodToleranceVoteInsert = Database['public']['Tables']['food_tolerance_votes']['Insert'];
export type UserAchievementInsert = Database['public']['Tables']['user_achievements']['Insert'];
export type UserStreakInsert = Database['public']['Tables']['user_streaks']['Insert'];
export type MealRatingPromptInsert = Database['public']['Tables']['meal_rating_prompts']['Insert'];

// =============================================================================
// TABLE UPDATE TYPES (for updating data)
// =============================================================================

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type WorkoutProgramUpdate = Database['public']['Tables']['workout_programs']['Update'];
export type WorkoutUpdate = Database['public']['Tables']['workouts']['Update'];
export type ExerciseUpdate = Database['public']['Tables']['exercises']['Update'];
export type ProteinLogUpdate = Database['public']['Tables']['protein_logs']['Update'];
export type WorkoutSessionUpdate = Database['public']['Tables']['workout_sessions']['Update'];
export type ExerciseSetUpdate = Database['public']['Tables']['exercise_sets']['Update'];
export type ProgressPhotoUpdate = Database['public']['Tables']['progress_photos']['Update'];
export type WeightLogUpdate = Database['public']['Tables']['weight_logs']['Update'];
export type FoodToleranceVoteUpdate = Database['public']['Tables']['food_tolerance_votes']['Update'];
export type UserAchievementUpdate = Database['public']['Tables']['user_achievements']['Update'];
export type UserStreakUpdate = Database['public']['Tables']['user_streaks']['Update'];
export type MealRatingPromptUpdate = Database['public']['Tables']['meal_rating_prompts']['Update'];

// =============================================================================
// VIEW TYPES
// =============================================================================

export type FoodToleranceRating = Database['public']['Views']['food_tolerance_ratings']['Row'];
export type UserDoseStatus = Database['public']['Views']['user_dose_status']['Row'];

// =============================================================================
// ENUM-LIKE TYPES (derived from column constraints)
// =============================================================================

export type GLP1Medication = 'ozempic' | 'wegovy' | 'mounjaro' | 'zepbound' | 'other';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type PhotoAngle = 'front' | 'back' | 'side_left' | 'side_right';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
export type SubscriptionPlan = 'core' | 'premium';

// =============================================================================
// TYPED SUPABASE CLIENT
// =============================================================================

// Use the actual return type from our createClient functions
export type TypedSupabaseClient = Awaited<ReturnType<typeof createServerClient>>;
export type TypedSupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Extract only the non-null required fields from a profile
 */
export type ProfileRequired = Required<Pick<Profile, 'id' | 'email'>>;

/**
 * Profile with subscription info
 */
export type ProfileWithSubscription = Profile & {
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  subscription_plan: SubscriptionPlan | null;
};

/**
 * Workout with exercises
 */
export type WorkoutWithExercises = Workout & {
  exercises: Exercise[];
};

/**
 * Workout session with sets
 */
export type WorkoutSessionWithSets = WorkoutSession & {
  exercise_sets: ExerciseSet[];
};

/**
 * Food tolerance rating from view
 */
export type FoodRating = {
  food_name: string;
  total_votes: number;
  upvotes: number;
  downvotes: number;
  tolerance_percentage: number;
  last_voted_at: string;
};

// =============================================================================
// RE-EXPORT DATABASE TYPE
// =============================================================================

export type { Database };

