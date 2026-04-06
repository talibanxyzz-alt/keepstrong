'use client';

import { useEffect } from 'react';
import { Achievement } from '@/lib/utils/achievements';
import confetti from 'canvas-confetti';

interface AchievementUnlockedProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementUnlocked({ achievement, onClose }: AchievementUnlockedProps) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Auto-close after 5 seconds
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center animate-scale-in">
        <div className="text-6xl mb-4">{achievement.icon}</div>
        
        <div className="text-sm uppercase tracking-wide text-success font-semibold mb-2">
          Achievement Unlocked!
        </div>
        
        <h3 className="text-2xl font-bold mb-2">
          {achievement.name}
        </h3>
        
        <p className="text-slate mb-6">
          {achievement.description}
        </p>
        
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

// Add to app layout to show globally
// Store unlocked achievements in database
// Only show once per achievement

