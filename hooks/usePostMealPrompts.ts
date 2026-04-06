'use client';

/**
 * Hook to automatically discover meals that need rating prompts
 * 
 * This hook automatically finds meals from the last 2 hours that haven't been
 * prompted yet. It refreshes every 5 minutes to catch meals logged from other
 * devices or missed prompts.
 * 
 * Works alongside usePostMealPromptState() in PostMealRatingPrompt.tsx:
 * - This hook: Automatic discovery (database-backed, cross-device)
 * - Component hook: Immediate prompts (in-memory, when meal is logged)
 * 
 * Usage:
 * const { pendingPrompts, refreshPrompts } = usePostMealPrompts();
 * 
 * // Render discovered prompts
 * {pendingPrompts.map(prompt => (
 *   <PostMealRatingPrompt
 *     key={prompt.proteinLogId}
 *     foodName={prompt.foodName}
 *     proteinLogId={prompt.proteinLogId}
 *     loggedAt={prompt.loggedAt}
 *   />
 * ))}
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from '@/lib/supabase/client';

interface PendingPrompt {
  proteinLogId: string;
  foodName: string;
  loggedAt: Date;
}

export function usePostMealPrompts() {
  const [pendingPrompts, setPendingPrompts] = useState<PendingPrompt[]>([]);

  const loadPendingPrompts = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPendingPrompts([]);
        return;
      }

      // Get meals from last 2 hours that haven't been prompted
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const { data: recentLogs, error: logsError } = await supabase
        .from('protein_logs')
        .select('id, food_name, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', twoHoursAgo.toISOString())
        .order('logged_at', { ascending: false });

      if (logsError && Object.keys(logsError).length > 0) {
        console.error('Error fetching recent logs:', logsError);
        return;
      }

      if (!recentLogs || recentLogs.length === 0) {
        setPendingPrompts([]);
        return;
      }

      // Get IDs of logs already prompted
      const logIds = recentLogs.map(log => log.id);
      const { data: promptedLogs, error: promptsError } = await supabase
        .from('meal_rating_prompts')
        .select('protein_log_id')
        .eq('user_id', user.id)
        .in('protein_log_id', logIds);

      if (promptsError && Object.keys(promptsError).length > 0) {
        console.error('Error fetching prompts:', promptsError);
        return;
      }

      const promptedLogIds = new Set(
        promptedLogs?.map(p => p.protein_log_id) || []
      );

      // Filter to unprompted logs
      const unpromptedLogs = recentLogs.filter(
        log => !promptedLogIds.has(log.id)
      );

      // Convert to pending prompts
      const prompts: PendingPrompt[] = unpromptedLogs.map(log => ({
        proteinLogId: log.id,
        foodName: log.food_name,
        loggedAt: new Date(log.logged_at || log.id), // Fallback to id if logged_at is null
      }));

      setPendingPrompts(prompts);
    } catch (error) {
      console.error("Error loading pending prompts:", error);
    }
  }, []);

  useEffect(() => {
    void loadPendingPrompts();
    const interval = setInterval(() => void loadPendingPrompts(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadPendingPrompts]);

  return { pendingPrompts, refreshPrompts: loadPendingPrompts };
}

