'use client';

import { useState } from 'react';
import { Clock, X } from 'lucide-react';
import QuickAddButton from './QuickAddButton';
import { dismissMealAlert, getQuickAddSuggestions } from '@/lib/utils/meal-timing';

interface MealTimingAlertProps {
  userId: string;
  hoursSinceLastMeal: number;
  onDismiss?: () => void;
}

export default function MealTimingAlert({ 
  userId, 
  hoursSinceLastMeal,
  onDismiss 
}: MealTimingAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  
  const suggestions = getQuickAddSuggestions();

  const handleDismiss = () => {
    dismissMealAlert(userId);
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleMealAdded = () => {
    // Hide alert when meal is added
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-warning/10 border border-warning/25 rounded-lg p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-warning/60 hover:text-warning transition-colors"
        aria-label="Dismiss alert"
      >
        <X size={18} />
      </button>
      
      <div className="flex items-start gap-3">
        <Clock className="text-warning mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1 pr-6">
          <p className="font-medium text-charcoal">
            Time for a protein snack?
          </p>
          <p className="text-sm text-slate mt-1">
            It&apos;s been <strong>{Math.round(hoursSinceLastMeal)} hours</strong> since your last meal.
            Your body needs regular protein to preserve muscle on GLP-1 medications.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {suggestions.map((suggestion) => (
              <QuickAddButton
                key={suggestion.food}
                food={suggestion.food}
                protein={suggestion.protein}
                userId={userId}
                onSuccess={handleMealAdded}
              />
            ))}
          </div>
          
          <button 
            onClick={handleDismiss}
            className="text-xs text-warning hover:text-warning/90 mt-2 underline"
          >
            Dismiss for 2 hours
          </button>
        </div>
      </div>
    </div>
  );
}

