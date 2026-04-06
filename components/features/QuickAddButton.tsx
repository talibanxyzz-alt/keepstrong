'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { localDateString, roundProteinGrams } from '@/lib/utils/localDate';

interface QuickAddButtonProps {
  food: string;
  protein: number;
  userId: string;
  onSuccess?: () => void;
}

export default function QuickAddButton({ food, protein, userId, onSuccess }: QuickAddButtonProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async () => {
    setIsAdding(true);
    
    try {
      const supabase = createClient();
      const today = localDateString();
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('protein_logs')
        .insert({
          user_id: userId,
          food_name: food,
          protein_grams: roundProteinGrams(protein),
          date: today,
          logged_at: now,
        });

      if (error) throw error;

      toast.success(`Added ${food} (${protein}g protein)`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Quick add error:', error);
      toast.error('Failed to add meal');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleQuickAdd}
      disabled={isAdding}
      className="text-sm px-3 py-1.5 rounded-md bg-warning/15 text-charcoal hover:bg-warning/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {isAdding ? 'Adding...' : `${food} (${protein}g)`}
    </button>
  );
}

