/**
 * FoodToleranceRating Component
 * 
 * Displays community tolerance ratings for foods and allows users to vote.
 * Specifically designed for GLP-1 medication users to share food experiences.
 */

'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { submitVote } from '@/lib/utils/food-ratings';

interface FoodToleranceRatingProps {
  foodName: string;
  currentUserVote?: boolean | null; // true = upvote, false = downvote, null = no vote
  tolerancePercentage?: number;
  totalVotes?: number;
  upvotes?: number;
  downvotes?: number;
  showLabel?: boolean; // Show text label (default: true)
  showVoteCount?: boolean; // Show vote count (default: true)
  compact?: boolean; // Compact mode (smaller buttons)
  onVoteChange?: () => void; // Callback to refetch data
}

export function FoodToleranceRating({
  foodName,
  currentUserVote,
  tolerancePercentage,
  totalVotes = 0,
  upvotes = 0,
  downvotes = 0,
  showLabel = true,
  showVoteCount = true,
  compact = false,
  onVoteChange,
}: FoodToleranceRatingProps) {
  const [voting, setVoting] = useState(false);
  const [localVote, setLocalVote] = useState(currentUserVote);
  const supabase = createClient();
  const { toast } = useToast();

  const handleVote = async (tolerated: boolean) => {
    if (voting) return;

    // If user clicks the same vote, do nothing (they can't un-vote, only change vote)
    if (localVote === tolerated) return;

    setVoting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: 'Please log in to vote',
          variant: 'destructive',
        });
        return;
      }

      // Use the utility function
      const result = await submitVote(supabase, user.id, foodName, tolerated);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save vote');
      }

      setLocalVote(tolerated);
      
      // Trigger refetch in parent component
      if (onVoteChange) {
        onVoteChange();
      }

      toast({
        title: tolerated ? '👍 Marked as well-tolerated' : '👎 Marked as difficult',
        description: 'Thanks for helping the community!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: 'Failed to save vote',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  // Color coding based on tolerance percentage
  const getColorClass = () => {
    if (!tolerancePercentage || totalVotes < 3) return 'text-slate';
    if (tolerancePercentage >= 80) return "text-success";
    if (tolerancePercentage >= 60) return "text-success";
    if (tolerancePercentage >= 40) return "text-warning";
    if (tolerancePercentage >= 20) return "text-warning";
    return 'text-danger';
  };

  // Icon based on tolerance percentage
  const getIcon = () => {
    if (!tolerancePercentage || totalVotes < 3) return '❓';
    if (tolerancePercentage >= 80) return '👍👍';
    if (tolerancePercentage >= 60) return '👍';
    if (tolerancePercentage >= 40) return '🤷';
    if (tolerancePercentage >= 20) return '👎';
    return '🚫';
  };

  // Label text
  const getLabel = () => {
    if (!tolerancePercentage || totalVotes < 3) {
      return totalVotes === 0 ? 'No ratings yet' : 'Not yet rated (min 3)';
    }
    if (tolerancePercentage >= 80) return 'Excellent tolerance';
    if (tolerancePercentage >= 60) return 'Good tolerance';
    if (tolerancePercentage >= 40) return 'Mixed reviews';
    if (tolerancePercentage >= 20) return 'Often difficult';
    return 'Commonly avoided';
  };

  const buttonSize = compact ? 14 : 16;
  const buttonPadding = compact ? 'p-1' : 'p-1.5';

  return (
    <div className="flex items-center gap-3">
      {/* Rating Display */}
      {totalVotes >= 3 && (
        <div className={`text-sm font-medium ${getColorClass()}`}>
          <span className="mr-1">{getIcon()}</span>
          <span className="font-semibold">{Math.round(tolerancePercentage || 0)}%</span>
          {showVoteCount && (
            <span className="text-xs ml-1 font-normal opacity-75">
              ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
            </span>
          )}
        </div>
      )}

      {totalVotes < 3 && totalVotes > 0 && (
        <div className="text-sm text-slate">
          <span className="mr-1">❓</span>
          <span className="text-xs">
            {totalVotes} / 3 votes needed
          </span>
        </div>
      )}

      {totalVotes === 0 && (
        <div className="text-sm text-slate/60">
          <span className="mr-1">❓</span>
          <span className="text-xs">Be the first to rate!</span>
        </div>
      )}

      {/* Voting Buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => handleVote(true)}
          disabled={voting}
          className={`${buttonPadding} rounded transition-all ${
            localVote === true
              ? "bg-success/15 text-success shadow-sm"
              : "hover:bg-cloud text-slate/60 hover:text-success hover:scale-110"
          } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Tolerated well"
          aria-label="Vote thumbs up - tolerated well"
        >
          <ThumbsUp size={buttonSize} className={localVote === true ? 'fill-current' : ''} />
        </button>

        <button
          onClick={() => handleVote(false)}
          disabled={voting}
          className={`${buttonPadding} rounded transition-all ${
            localVote === false
              ? 'bg-danger-muted text-danger shadow-sm'
              : 'hover:bg-cloud text-slate/60 hover:text-danger hover:scale-110'
          } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Didn't sit well"
          aria-label="Vote thumbs down - didn't sit well"
        >
          <ThumbsDown size={buttonSize} className={localVote === false ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Label */}
      {showLabel && (
        <span className={`text-xs ${totalVotes >= 3 ? getColorClass() : 'text-slate'}`}>
          {getLabel()}
        </span>
      )}

      {/* Detailed vote breakdown (when available) */}
      {totalVotes >= 3 && upvotes > 0 && downvotes > 0 && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-slate/60">
          <span>•</span>
          <span>{upvotes} 👍</span>
          <span>•</span>
          <span>{downvotes} 👎</span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact variant for inline use (e.g., in protein logger)
 */
export function FoodToleranceRatingCompact(props: FoodToleranceRatingProps) {
  return (
    <FoodToleranceRating
      {...props}
      compact={true}
      showLabel={false}
      showVoteCount={false}
    />
  );
}

/**
 * Badge variant (minimal display, no voting)
 */
interface FoodToleranceBadgeProps {
  tolerancePercentage: number;
  totalVotes: number;
}

export function FoodToleranceBadge({ tolerancePercentage, totalVotes }: FoodToleranceBadgeProps) {
  if (totalVotes < 3) return null;

  const getColorClass = () => {
    if (tolerancePercentage >= 80) return "bg-success/10 text-success border-success/25";
    if (tolerancePercentage >= 60) return "bg-success/10 text-success border-success/25";
    if (tolerancePercentage >= 40) return "bg-warning/10 text-warning border-warning/25";
    if (tolerancePercentage >= 20) return "bg-warning/10 text-warning border-warning/25";
    return 'bg-danger-muted text-danger border-danger/20';
  };

  const getIcon = () => {
    if (tolerancePercentage >= 80) return '👍👍';
    if (tolerancePercentage >= 60) return '👍';
    if (tolerancePercentage >= 40) return '🤷';
    if (tolerancePercentage >= 20) return '👎';
    return '🚫';
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getColorClass()}`}
    >
      <span>{getIcon()}</span>
      <span>{Math.round(tolerancePercentage)}%</span>
    </span>
  );
}

