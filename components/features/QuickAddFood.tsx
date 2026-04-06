"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Filter } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FoodToleranceRatingCompact } from "./FoodToleranceRating";
import { localDateString, roundProteinGrams } from "@/lib/utils/localDate";

interface QuickFood {
  name: string;
  protein: number;
  icon: string;
}

const quickFoods: QuickFood[] = [
  { name: "Chicken Breast (grilled)", protein: 30, icon: "🍗" },
  { name: "Scrambled Eggs", protein: 12, icon: "🥚" },
  { name: "Greek Yogurt", protein: 15, icon: "🥛" },
  { name: "Protein Shake", protein: 25, icon: "🥤" },
  { name: "Salmon", protein: 25, icon: "🐟" },
  { name: "Protein Bar", protein: 20, icon: "🍫" },
];

interface FoodRating {
  food_name: string;
  total_votes: number;
  upvotes: number;
  downvotes: number;
  tolerance_percentage: number;
  user_vote: boolean | null;
}

const getMealTypeFromTime = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 15 && hour < 20) return "dinner";
  return "snack";
};

interface QuickAddFoodProps {
  onSuccess?: () => void;
  onMealLogged?: (foodName: string, proteinLogId: string, loggedAt: Date) => void;
}

export default function QuickAddFood({ onSuccess, onMealLogged }: QuickAddFoodProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFood, setCustomFood] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [mealType, setMealType] = useState(getMealTypeFromTime());
  const [error, setError] = useState("");
  
  // Food ratings state
  const [foodRatings, setFoodRatings] = useState<Record<string, FoodRating>>({});
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [showWellToleratedOnly, setShowWellToleratedOnly] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Fetch food ratings on mount
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const foodNames = quickFoods.map(f => f.name).join(',');
        const response = await fetch(`/api/foods/ratings?names=${encodeURIComponent(foodNames)}`);
        
        if (!response.ok) {
          console.error('Failed to fetch food ratings');
          return;
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setFoodRatings(result.data);
        }
      } catch (error) {
        console.error('Error fetching food ratings:', error);
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchRatings();
  }, []);

  const handleQuickAdd = async (food: QuickFood) => {
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to add food");
        setIsSubmitting(false);
        return;
      }

      const today = localDateString();
      const mealTypeAuto = getMealTypeFromTime();
      const loggedAt = new Date();

      const { data: insertedData, error: insertError } = await supabase
        .from("protein_logs")
        .insert({
          user_id: user.id,
          date: today,
          food_name: food.name,
          protein_grams: roundProteinGrams(food.protein),
          meal_type: mealTypeAuto as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          logged_at: loggedAt.toISOString(),
        })
        .select('id')
        .single();

      if (insertError || !insertedData) {
        toast.error(`Failed to add ${food.name}: ${insertError?.message || 'Unknown error'}`);
        setIsSubmitting(false);
        return;
      }

      toast.success(`Added ${food.name} (${food.protein}g protein)`);
      
      // Refresh the page data
      router.refresh();
      
      // Trigger post-meal rating prompt with protein log ID
      if (onMealLogged) {
        onMealLogged(food.name, insertedData.id, loggedAt);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const proteinNum = parseFloat(customProtein);
    if (!customFood.trim()) {
      setError("Food name is required");
      return;
    }
    if (!customProtein || isNaN(proteinNum) || proteinNum <= 0) {
      setError("Please enter a valid protein amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to add food");
        setIsSubmitting(false);
        return;
      }

      const today = localDateString();
      const loggedAt = new Date();

      const { data: insertedData, error: insertError } = await supabase
        .from("protein_logs")
        .insert({
          user_id: user.id,
          date: today,
          food_name: customFood,
          protein_grams: roundProteinGrams(proteinNum),
          meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          logged_at: loggedAt.toISOString(),
        })
        .select('id')
        .single();

      if (insertError || !insertedData) {
        toast.error(`Failed to add food: ${insertError?.message || 'Unknown error'}`);
        setIsSubmitting(false);
        return;
      }

      toast.success(`Added ${customFood} (${proteinNum}g protein)`);
      
      // Trigger post-meal rating prompt with protein log ID
      if (onMealLogged) {
        onMealLogged(customFood, insertedData.id, loggedAt);
      }
      
      // Reset form and close modal
      setCustomFood("");
      setCustomProtein("");
      setMealType(getMealTypeFromTime());
      setIsModalOpen(false);
      
      // Refresh the page data
      router.refresh();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter foods based on tolerance rating
  const filteredFoods = showWellToleratedOnly
    ? quickFoods.filter(food => {
        const rating = foodRatings[food.name];
        // Show if rating is 75%+ or if no rating yet (to allow discovery)
        return !rating || rating.tolerance_percentage >= 75;
      })
    : quickFoods;

  return (
    <>
      {/* Filter Toggle */}
      {!loadingRatings && Object.keys(foodRatings).length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-surface p-3">
          <Filter className="h-4 w-4 text-slate" />
          <input
            type="checkbox"
            id="well-tolerated-only"
            checked={showWellToleratedOnly}
            onChange={(e) => setShowWellToleratedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-line-strong text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
          />
          <label
            htmlFor="well-tolerated-only"
            className="cursor-pointer text-sm text-charcoal select-none"
          >
            Show only well-tolerated foods (75%+)
          </label>
          {showWellToleratedOnly && (
            <span className="ml-auto text-xs text-slate">
              {filteredFoods.length} of {quickFoods.length} foods
            </span>
          )}
        </div>
      )}

      {/* Quick Add Buttons Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {filteredFoods.map((food) => {
          const rating = foodRatings[food.name];
          
          return (
            <button
              key={food.name}
              onClick={() => handleQuickAdd(food)}
              disabled={isSubmitting}
              className="flex flex-col items-center gap-2 rounded-lg border border-line bg-surface p-4 text-center transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-3xl">{food.icon}</span>
              <div className="w-full">
                <p className="text-sm font-medium text-charcoal">{food.name}</p>
                <p className="font-mono text-xs text-primary font-semibold">
                  {food.protein}g protein
                </p>
                
                {/* Food Tolerance Rating */}
                {!loadingRatings && rating && rating.total_votes >= 3 && (
                  <div className="mt-2 flex justify-center">
                    <FoodToleranceRatingCompact
                      foodName={food.name}
                      currentUserVote={rating.user_vote}
                      tolerancePercentage={rating.tolerance_percentage}
                      totalVotes={rating.total_votes}
                      upvotes={rating.upvotes}
                      downvotes={rating.downvotes}
                      onVoteChange={() => {
                        // Refetch ratings after vote
                        const foodNames = quickFoods.map(f => f.name).join(',');
                        fetch(`/api/foods/ratings?names=${encodeURIComponent(foodNames)}`)
                          .then(res => res.json())
                          .then(result => {
                            if (result.success && result.data) {
                              setFoodRatings(result.data);
                            }
                          })
                          .catch(console.error);
                      }}
                    />
                  </div>
                )}
                
                {/* Loading state for ratings */}
                {loadingRatings && (
                  <div className="mt-2 flex justify-center">
                    <div className="h-4 w-16 animate-pulse rounded bg-line" />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {/* Custom Food Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isSubmitting}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong bg-cloud p-4 text-center transition-all hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-3xl">➕</span>
          <p className="text-sm font-medium text-slate">Custom Food</p>
        </button>
      </div>

      {/* Custom Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-charcoal">Add Custom Food</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-slate transition-colors hover:bg-cloud"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-danger-muted p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="foodName"
                  className="mb-1 block text-sm font-medium text-charcoal"
                >
                  Food Name
                </label>
                <input
                  id="foodName"
                  type="text"
                  value={customFood}
                  onChange={(e) => setCustomFood(e.target.value)}
                  className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  placeholder="e.g., Grilled Chicken"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="proteinGrams"
                  className="mb-1 block text-sm font-medium text-charcoal"
                >
                  Protein (grams)
                </label>
                <input
                  id="proteinGrams"
                  type="number"
                  step="0.1"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  placeholder="e.g., 30"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="mealType"
                  className="mb-1 block text-sm font-medium text-charcoal"
                >
                  Meal Type
                </label>
                <select
                  id="mealType"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  disabled={isSubmitting}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-md border border-line-strong px-4 py-2 font-medium text-charcoal transition-colors hover:bg-cloud"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Food"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

