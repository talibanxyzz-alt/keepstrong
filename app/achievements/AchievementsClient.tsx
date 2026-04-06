'use client';

import { Award, Trophy, Flame, Dumbbell, Target, Star, TrendingUp, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  achievement_id: string;
  unlocked_at: string | null;
}

interface Streaks {
  protein_streak: number | null;
  workout_streak: number | null;
  best_protein_streak: number | null;
  best_workout_streak: number | null;
}

// Define all possible achievements
const ALL_ACHIEVEMENTS = [
  // Protein Achievements
  {
    id: 'first_protein_log',
    title: 'First Step',
    description: 'Log your first protein meal',
    icon: Target,
    category: 'protein',
    color: 'orange',
  },
  {
    id: 'protein_streak_3',
    title: 'Getting Started',
    description: 'Hit protein goal 3 days in a row',
    icon: Flame,
    category: 'protein',
    color: 'orange',
  },
  {
    id: 'protein_streak_7',
    title: 'Week Warrior',
    description: 'Hit protein goal 7 days in a row',
    icon: Flame,
    category: 'protein',
    color: 'orange',
  },
  {
    id: 'protein_streak_14',
    title: 'Two Week Champion',
    description: 'Hit protein goal 14 days in a row',
    icon: Trophy,
    category: 'protein',
    color: 'orange',
  },
  {
    id: 'protein_streak_30',
    title: 'Month Master',
    description: 'Hit protein goal 30 days in a row',
    icon: Trophy,
    category: 'protein',
    color: 'orange',
  },
  {
    id: 'total_protein_1000',
    title: 'Protein Champion',
    description: 'Log 1000g total protein',
    icon: Award,
    category: 'protein',
    color: 'orange',
  },
  {
    id: 'total_protein_5000',
    title: 'Protein Legend',
    description: 'Log 5000g total protein',
    icon: Star,
    category: 'protein',
    color: 'orange',
  },
  
  // Workout Achievements
  {
    id: 'first_workout',
    title: 'Lifting Journey',
    description: 'Complete your first workout',
    icon: Dumbbell,
    category: 'workout',
    color: 'blue',
  },
  {
    id: 'workout_streak_2',
    title: 'Consistency Begins',
    description: 'Work out 2 weeks in a row',
    icon: TrendingUp,
    category: 'workout',
    color: 'blue',
  },
  {
    id: 'workout_streak_4',
    title: 'Consistent Lifter',
    description: 'Work out 4 weeks in a row',
    icon: Flame,
    category: 'workout',
    color: 'blue',
  },
  {
    id: 'workout_streak_8',
    title: 'Dedicated Athlete',
    description: 'Work out 8 weeks in a row',
    icon: Trophy,
    category: 'workout',
    color: 'blue',
  },
  {
    id: 'workout_streak_12',
    title: 'Strength Builder',
    description: 'Work out 12 weeks in a row',
    icon: Star,
    category: 'workout',
    color: 'blue',
  },
  {
    id: 'total_workouts_50',
    title: 'Century Club',
    description: 'Complete 50 total workouts',
    icon: Award,
    category: 'workout',
    color: 'blue',
  },
  {
    id: 'total_workouts_100',
    title: 'Workout Master',
    description: 'Complete 100 total workouts',
    icon: Zap,
    category: 'workout',
    color: 'blue',
  },
];

export default function AchievementsClient({
  userAchievements,
  streaks,
}: {
  userAchievements: Achievement[];
  streaks: Streaks | null;
}) {
  const unlockedIds = new Set(userAchievements.map((a) => a.achievement_id));

  // Separate by category
  const proteinAchievements = ALL_ACHIEVEMENTS.filter((a) => a.category === 'protein');
  const workoutAchievements = ALL_ACHIEVEMENTS.filter((a) => a.category === 'workout');

  const totalUnlocked = userAchievements.length;
  const totalPossible = ALL_ACHIEVEMENTS.length;
  const progressPercent = Math.round((totalUnlocked / totalPossible) * 100);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal mb-2">Achievements</h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-line rounded-full h-2 overflow-hidden">
            <div
              className="bg-charcoal h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate">
            {totalUnlocked} of {totalPossible} unlocked ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Streaks Section */}
      {streaks && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Protein Streak */}
          <div className="bg-surface rounded-lg p-6 border border-line">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-slate" />
              <h3 className="font-medium text-charcoal">Protein Streak</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-charcoal">
                {streaks.protein_streak ?? 0}
              </span>
              <span className="text-slate">days</span>
            </div>
            <p className="text-sm text-slate">Best: {streaks.best_protein_streak ?? 0} days</p>
          </div>

          {/* Workout Streak */}
          <div className="bg-surface rounded-lg p-6 border border-line">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-4 h-4 text-slate" />
              <h3 className="font-medium text-charcoal">Workout Streak</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-charcoal">
                {streaks.workout_streak ?? 0}
              </span>
              <span className="text-slate">weeks</span>
            </div>
            <p className="text-sm text-slate">Best: {streaks.best_workout_streak ?? 0} weeks</p>
          </div>
        </div>
      )}

      {/* Protein Achievements */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-slate" />
          <h2 className="text-lg font-semibold text-charcoal">Protein Achievements</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proteinAchievements.map((achievement) => {
            const Icon = achievement.icon;
            const isUnlocked = unlockedIds.has(achievement.id);
            const unlockedDate = userAchievements.find(a => a.achievement_id === achievement.id)?.unlocked_at;

            return (
              <div
                key={achievement.id}
                className={`rounded-lg p-5 border ${isUnlocked ? 'bg-surface border-line' : 'bg-cloud border-line opacity-50'}`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 flex items-center justify-center mb-3 ${isUnlocked ? 'text-charcoal' : 'text-slate/60'}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <h3 className="font-medium text-charcoal mb-1">
                  {achievement.title}
                </h3>
                <p className="text-xs text-slate mb-3">{achievement.description}</p>
                
                {/* Status */}
                {isUnlocked ? (
                  <p className="text-xs text-slate">
                    Unlocked {unlockedDate && new Date(unlockedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                ) : (
                  <p className="text-xs text-slate/60">Locked</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workout Achievements */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Dumbbell className="w-4 h-4 text-slate" />
          <h2 className="text-lg font-semibold text-charcoal">Workout Achievements</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workoutAchievements.map((achievement) => {
            const Icon = achievement.icon;
            const isUnlocked = unlockedIds.has(achievement.id);
            const unlockedDate = userAchievements.find(a => a.achievement_id === achievement.id)?.unlocked_at;

            return (
              <div
                key={achievement.id}
                className={`rounded-lg p-5 border ${isUnlocked ? 'bg-surface border-line' : 'bg-cloud border-line opacity-50'}`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 flex items-center justify-center mb-3 ${isUnlocked ? 'text-charcoal' : 'text-slate/60'}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <h3 className="font-medium text-charcoal mb-1">
                  {achievement.title}
                </h3>
                <p className="text-xs text-slate mb-3">{achievement.description}</p>
                
                {/* Status */}
                {isUnlocked ? (
                  <p className="text-xs text-slate">
                    Unlocked {unlockedDate && new Date(unlockedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                ) : (
                  <p className="text-xs text-slate/60">Locked</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State (if no achievements) */}
      {totalUnlocked === 0 && (
        <div className="text-center py-16 bg-surface rounded-lg border border-dashed border-line-strong mt-8">
          <Award className="w-8 h-8 text-slate/50 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-charcoal mb-2">No achievements yet</h3>
          <p className="text-slate text-sm mb-6">
            Start logging protein and working out to unlock your first achievement.
          </p>
          <a
            href="/dashboard"
            className="px-5 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors text-sm font-medium"
          >
            Go to Dashboard
          </a>
        </div>
      )}
    </div>
  );
}

