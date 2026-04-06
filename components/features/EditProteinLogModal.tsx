"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { roundProteinGrams } from "@/lib/utils/localDate";

interface ProteinLog {
  id: string;
  food_name: string;
  protein_grams: number;
  meal_type: string;
}

interface EditProteinLogModalProps {
  logEntry: ProteinLog | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProteinLogModal({
  logEntry,
  isOpen,
  onClose,
  onUpdate,
}: EditProteinLogModalProps) {
  const [foodName, setFoodName] = useState("");
  const [proteinGrams, setProteinGrams] = useState("");
  const [mealType, setMealType] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  // Pre-fill form when logEntry changes
  useEffect(() => {
    if (logEntry) {
      setFoodName(logEntry.food_name);
      setProteinGrams(logEntry.protein_grams.toString());
      setMealType(logEntry.meal_type);
      setError("");
    }
  }, [logEntry]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const proteinNum = parseFloat(proteinGrams);
    if (!foodName.trim()) {
      setError("Food name is required");
      return;
    }
    if (!proteinGrams || isNaN(proteinNum) || proteinNum <= 0) {
      setError("Please enter a valid protein amount");
      return;
    }
    if (!mealType) {
      setError("Please select a meal type");
      return;
    }

    if (!logEntry) return;

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from("protein_logs")
        .update({
          food_name: foodName.trim(),
          protein_grams: roundProteinGrams(proteinNum),
          meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        })
        .eq("id", logEntry.id);

      if (updateError) {
        toast.error(`Failed to update: ${updateError.message}`);
        setIsSubmitting(false);
        return;
      }

      toast.success(`Updated ${foodName} successfully`);
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !logEntry) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id="edit-modal-title" className="text-xl font-bold text-charcoal">
            Edit Food Entry
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate transition-colors hover:bg-cloud focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-danger-muted p-3 text-sm text-danger" role="alert">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="edit-food-name"
              className="mb-1 block text-sm font-medium text-charcoal"
            >
              Food Name
            </label>
            <input
              id="edit-food-name"
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full rounded-md border border-line-strong px-3 py-2 text-charcoal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
              placeholder="e.g., Grilled Chicken"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="edit-protein-grams"
              className="mb-1 block text-sm font-medium text-charcoal"
            >
              Protein (grams)
            </label>
            <input
              id="edit-protein-grams"
              type="number"
              step="0.1"
              value={proteinGrams}
              onChange={(e) => setProteinGrams(e.target.value)}
              className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
              placeholder="e.g., 30"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="edit-meal-type"
              className="mb-1 block text-sm font-medium text-charcoal"
            >
              Meal Type
            </label>
            <select
              id="edit-meal-type"
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-line-strong px-4 py-2 font-medium text-charcoal transition-colors hover:bg-cloud focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

