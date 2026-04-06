'use client';

import { useState, useEffect } from 'react';
import { FoodToleranceRating } from './FoodToleranceRating';
import { createClient } from '@/lib/supabase/client';
import { MealRatingPromptInsert } from '@/types/supabase';

interface PostMealRatingPromptProps {
  foodName: string;
  proteinLogId: string;
  loggedAt: Date;
}

const PROMPT_DELAY_MINUTES = 30; // Show prompt after 30 minutes

async function insertMealRatingPromptRecord(proteinLogId: string) {
  const supabase = createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const promptData: MealRatingPromptInsert = {
      user_id: user.id,
      protein_log_id: proteinLogId,
      responded: false,
    };

    const { error } = await supabase
      .from('meal_rating_prompts')
      .insert(promptData);

    if (error && error.code !== '23505') {
      console.error('Error recording prompt:', error);
    }
  } catch (error) {
    console.error('Error recording prompt:', error);
  }
}

export function PostMealRatingPrompt({ 
  foodName, 
  proteinLogId,
  loggedAt 
}: PostMealRatingPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasBeenPrompted, setHasBeenPrompted] = useState(false);

  useEffect(() => {
    setShowPrompt(false);
    setHasBeenPrompted(false);
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function checkIfAlreadyPrompted() {
      const supabase = createClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data, error } = await supabase
          .from('meal_rating_prompts')
          .select('id, responded')
          .eq('user_id', user.id)
          .eq('protein_log_id', proteinLogId)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          console.error('Error checking prompt status:', error);
          return;
        }

        if (data) {
          if (data.responded) {
            setHasBeenPrompted(true);
            return;
          }
          setShowPrompt(true);
          return;
        }

        const delay = PROMPT_DELAY_MINUTES * 60 * 1000;
        const timeSinceLog = Date.now() - loggedAt.getTime();

        if (timeSinceLog >= delay) {
          await insertMealRatingPromptRecord(proteinLogId);
          if (!cancelled) setShowPrompt(true);
        } else {
          timeoutId = setTimeout(() => {
            if (cancelled) return;
            void insertMealRatingPromptRecord(proteinLogId).then(() => {
              if (!cancelled) setShowPrompt(true);
            });
          }, delay - timeSinceLog);
        }
      } catch (error) {
        console.error('Error in checkIfAlreadyPrompted:', error);
      }
    }

    void checkIfAlreadyPrompted();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [proteinLogId, loggedAt]);

  async function handleVoteChange() {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark as responded
      const { error } = await supabase
        .from('meal_rating_prompts')
        .update({ responded: true })
        .eq('user_id', user.id)
        .eq('protein_log_id', proteinLogId);

      if (error) {
        console.error('Error updating prompt response:', error);
      } else {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error updating prompt response:', error);
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || hasBeenPrompted) return null;

  return (
    <div className="fixed bottom-[calc(var(--app-mobile-tabbar-offset)+0.5rem)] left-4 right-4 z-50 max-lg:max-w-[calc(100vw-2rem)] lg:bottom-8 lg:left-auto lg:right-4 lg:w-96 animate-slide-up">
      <div className="rounded-lg border border-line bg-surface p-4 shadow-xl">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-slate/60 transition-colors hover:bg-cloud hover:text-slate"
          aria-label="Dismiss"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-3 pr-6">
          <p className="font-semibold text-charcoal">
            How did <span className="text-primary">{foodName}</span> sit?
          </p>
          <p className="mt-1 text-xs text-slate">
            Help the community by rating how well this food was tolerated
          </p>
        </div>

        {/* Rating Component */}
        <div className="rounded-md bg-cloud p-3">
          <FoodToleranceRating
            foodName={foodName}
            showLabel={true}
            showVoteCount={true}
            onVoteChange={handleVoteChange}
          />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate">
          <span>⏱️ 30 min after meal</span>
          <button
            onClick={handleDismiss}
            className="text-primary hover:underline"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage post-meal rating prompts (in-memory, immediate)
 * 
 * This hook manages prompts that are added immediately when a meal is logged.
 * It works alongside the automatic discovery hook in hooks/usePostMealPrompts.ts
 * 
 * Usage:
 * const { prompts, addPrompt, removePrompt } = usePostMealPromptState();
 * 
 * // After logging meal:
 * addPrompt(foodName, proteinLogId, new Date());
 * 
 * Note: For automatic discovery of meals that need prompts, use the hook
 * from @/hooks/usePostMealPrompts instead.
 */
export function usePostMealPromptState() {
  const [prompts, setPrompts] = useState<Array<{ 
    foodName: string; 
    proteinLogId: string;
    loggedAt: Date; 
    id: string 
  }>>([]);

  const addPrompt = (foodName: string, proteinLogId: string, loggedAt: Date) => {
    const id = `${proteinLogId}-${loggedAt.getTime()}`;
    setPrompts((prev) => [...prev, { foodName, proteinLogId, loggedAt, id }]);
  };

  const removePrompt = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    prompts,
    addPrompt,
    removePrompt,
  };
}

/**
 * Container component to render multiple prompts
 * 
 * Usage in layout/dashboard:
 * const { prompts, removePrompt } = usePostMealPromptState();
 * 
 * <PostMealRatingPrompts
 *   prompts={prompts}
 *   onDismiss={removePrompt}
 * />
 */
interface PostMealRatingPromptsProps {
  prompts: Array<{ foodName: string; proteinLogId: string; loggedAt: Date; id: string }>;
  onDismiss: (id: string) => void;
}

export function PostMealRatingPrompts({ prompts, onDismiss }: PostMealRatingPromptsProps) {
  // Only show the most recent prompt (avoid overwhelming user)
  const mostRecentPrompt = prompts[prompts.length - 1];

  if (!mostRecentPrompt) return null;

  return (
    <PostMealRatingPrompt
      foodName={mostRecentPrompt.foodName}
      proteinLogId={mostRecentPrompt.proteinLogId}
      loggedAt={mostRecentPrompt.loggedAt}
    />
  );
}
