/**
 * Food Tolerance Rating Utilities
 * 
 * Functions for interacting with the food tolerance voting system.
 * Helps GLP-1 users identify which foods are well-tolerated by the community.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export interface FoodRating {
  food_name: string;
  total_votes: number;
  upvotes: number;
  downvotes: number;
  tolerance_percentage: number;
  last_voted_at: string;
}

export interface FoodVote {
  id: string;
  user_id: string;
  food_name: string;
  tolerated: boolean;
  notes: string | null;
  voted_at: string;
}

export type ToleranceLevel = 'excellent' | 'good' | 'moderate' | 'poor' | 'avoid';

/**
 * Get tolerance level based on percentage
 */
export function getToleranceLevel(percentage: number): ToleranceLevel {
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'moderate';
  if (percentage >= 20) return 'poor';
  return 'avoid';
}

/**
 * Get color class for tolerance level
 */
export function getToleranceColor(level: ToleranceLevel): string {
  const colors: Record<ToleranceLevel, string> = {
    excellent: 'text-green-600 bg-green-50',
    good: 'text-green-500 bg-green-50',
    moderate: 'text-yellow-600 bg-yellow-50',
    poor: 'text-orange-600 bg-orange-50',
    avoid: 'text-red-600 bg-red-50',
  };
  return colors[level];
}

/**
 * Get icon for tolerance level
 */
export function getToleranceIcon(level: ToleranceLevel): string {
  const icons: Record<ToleranceLevel, string> = {
    excellent: '👍👍',
    good: '👍',
    moderate: '🤷',
    poor: '👎',
    avoid: '🚫',
  };
  return icons[level];
}

/**
 * Get label for tolerance level
 */
export function getToleranceLabel(level: ToleranceLevel): string {
  const labels: Record<ToleranceLevel, string> = {
    excellent: 'Excellent Tolerance',
    good: 'Good Tolerance',
    moderate: 'Moderate Tolerance',
    poor: 'Poor Tolerance',
    avoid: 'Avoid',
  };
  return labels[level];
}

/**
 * Fetch all food ratings (minimum 3 votes)
 */
export async function getAllFoodRatings(
  supabase: SupabaseClient<Database>
): Promise<FoodRating[]> {
  const { data, error } = await supabase
    .from('food_tolerance_ratings')
    .select('*')
    .order('total_votes', { ascending: false });

  if (error) {
    console.error('Error fetching food ratings:', error);
    return [];
  }

  return (data || []) as FoodRating[];
}

/**
 * Fetch top-rated foods
 */
export async function getTopRatedFoods(
  supabase: SupabaseClient<Database>,
  limit: number = 10
): Promise<FoodRating[]> {
  const { data, error } = await supabase
    .from('food_tolerance_ratings')
    .select('*')
    .order('tolerance_percentage', { ascending: false })
    .order('total_votes', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top rated foods:', error);
    return [];
  }

  return (data || []) as FoodRating[];
}

/**
 * Fetch poorly-rated foods (to avoid)
 */
export async function getPoorlyRatedFoods(
  supabase: SupabaseClient<Database>,
  limit: number = 10
): Promise<FoodRating[]> {
  const { data, error } = await supabase
    .from('food_tolerance_ratings')
    .select('*')
    .order('tolerance_percentage', { ascending: true })
    .order('total_votes', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching poorly rated foods:', error);
    return [];
  }

  return (data || []) as FoodRating[];
}

/**
 * Search food ratings by name
 */
export async function searchFoodRatings(
  supabase: SupabaseClient<Database>,
  searchTerm: string
): Promise<FoodRating[]> {
  const { data, error } = await supabase
    .from('food_tolerance_ratings')
    .select('*')
    .ilike('food_name', `%${searchTerm}%`)
    .order('total_votes', { ascending: false });

  if (error) {
    console.error('Error searching food ratings:', error);
    return [];
  }

  return (data || []) as FoodRating[];
}

/**
 * Get rating for a specific food
 */
export async function getFoodRating(
  supabase: SupabaseClient<Database>,
  foodName: string
): Promise<FoodRating | null> {
  const { data, error } = await supabase
    .from('food_tolerance_ratings')
    .select('*')
    .eq('food_name', foodName)
    .single();

  if (error) {
    // Food might not have enough votes yet
    return null;
  }

  return data as FoodRating;
}

/**
 * Check if user has voted on a food
 */
export async function hasUserVoted(
  supabase: SupabaseClient<Database>,
  userId: string,
  foodName: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('food_tolerance_votes')
    .select('id')
    .eq('user_id', userId)
    .eq('food_name', foodName)
    .maybeSingle();

  if (error) {
    console.error('Error checking vote:', error);
    return false;
  }

  return !!data;
}

/**
 * Get user's vote on a food
 */
export async function getUserVote(
  supabase: SupabaseClient<Database>,
  userId: string,
  foodName: string
): Promise<FoodVote | null> {
  const { data, error } = await supabase
    .from('food_tolerance_votes')
    .select('*')
    .eq('user_id', userId)
    .eq('food_name', foodName)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user vote:', error);
    return null;
  }

  return data as FoodVote | null;
}

/**
 * Submit or update a vote
 */
export async function submitVote(
  supabase: SupabaseClient<Database>,
  userId: string,
  foodName: string,
  tolerated: boolean,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  // Check if user already voted
  const existingVote = await getUserVote(supabase, userId, foodName);

  if (existingVote) {
    // Update existing vote
    const { error } = await supabase
      .from('food_tolerance_votes')
      .update({
        tolerated,
        notes: notes || null,
        voted_at: new Date().toISOString(),
      })
      .eq('id', existingVote.id);

    if (error) {
      console.error('Error updating vote:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } else {
    // Insert new vote
    const { error } = await supabase
      .from('food_tolerance_votes')
      .insert({
        user_id: userId,
        food_name: foodName,
        tolerated,
        notes: notes || null,
      });

    if (error) {
      console.error('Error inserting vote:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}

/**
 * Delete a vote
 */
export async function deleteVote(
  supabase: SupabaseClient<Database>,
  userId: string,
  foodName: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('food_tolerance_votes')
    .delete()
    .eq('user_id', userId)
    .eq('food_name', foodName);

  if (error) {
    console.error('Error deleting vote:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all votes for a user
 */
export async function getUserVotes(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<FoodVote[]> {
  const { data, error } = await supabase
    .from('food_tolerance_votes')
    .select('*')
    .eq('user_id', userId)
    .order('voted_at', { ascending: false });

  if (error) {
    console.error('Error fetching user votes:', error);
    return [];
  }

  return (data || []) as FoodVote[];
}

/**
 * Get vote counts for a user
 */
export async function getUserVoteStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ total: number; upvotes: number; downvotes: number }> {
  const votes = await getUserVotes(supabase, userId);

  return {
    total: votes.length,
    upvotes: votes.filter(v => v.tolerated).length,
    downvotes: votes.filter(v => !v.tolerated).length,
  };
}

/**
 * Get recommended foods for user (highly tolerated, user hasn't tried)
 */
export async function getRecommendedFoods(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit: number = 5
): Promise<FoodRating[]> {
  // Get user's votes
  const userVotes = await getUserVotes(supabase, userId);
  const votedFoods = userVotes.map(v => v.food_name);

  // Get top-rated foods
  const topRated = await getTopRatedFoods(supabase, 50);

  // Filter out foods user already voted on
  const recommendations = topRated
    .filter(food => !votedFoods.includes(food.food_name))
    .slice(0, limit);

  return recommendations;
}

/**
 * Format tolerance percentage for display
 */
export function formatTolerancePercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/**
 * Get vote distribution text
 */
export function getVoteDistributionText(rating: FoodRating): string {
  return `${rating.upvotes} 👍  •  ${rating.downvotes} 👎  •  ${rating.total_votes} total`;
}

