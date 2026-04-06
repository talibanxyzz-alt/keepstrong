export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'protein' | 'workout' | 'progress' | 'milestone';
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // PROTEIN ACHIEVEMENTS
  {
    id: 'protein_3_day',
    name: 'Getting Started',
    description: 'Hit your protein goal 3 days in a row',
    icon: '🌟',
    category: 'protein',
  },
  {
    id: 'protein_7_day',
    name: 'Consistent',
    description: 'Hit your protein goal 7 days in a row',
    icon: '🔥',
    category: 'protein',
  },
  {
    id: 'protein_30_day',
    name: 'Dedicated',
    description: 'Hit your protein goal 30 days in a row',
    icon: '💪',
    category: 'protein',
  },
  {
    id: 'protein_100_day',
    name: 'Legendary',
    description: 'Hit your protein goal 100 days in a row',
    icon: '👑',
    category: 'protein',
  },
  
  // WORKOUT ACHIEVEMENTS
  {
    id: 'workout_first',
    name: 'First Rep',
    description: 'Complete your first workout',
    icon: '💪',
    category: 'workout',
  },
  {
    id: 'workout_10',
    name: 'Building Momentum',
    description: 'Complete 10 workouts',
    icon: '⚡',
    category: 'workout',
  },
  {
    id: 'workout_50',
    name: 'Dedicated Lifter',
    description: 'Complete 50 workouts',
    icon: '🏋️',
    category: 'workout',
  },
  {
    id: 'workout_4_week',
    name: 'Consistent Lifter',
    description: 'Complete 2+ workouts per week for 4 weeks straight',
    icon: '🔥',
    category: 'workout',
  },
  
  // PROGRESS ACHIEVEMENTS
  {
    id: 'photo_first',
    name: 'Progress Tracker',
    description: 'Upload your first progress photo',
    icon: '📸',
    category: 'progress',
  },
  {
    id: 'weight_logged',
    name: 'Self Aware',
    description: 'Log your weight 10 times',
    icon: '⚖️',
    category: 'progress',
  },
  {
    id: 'strength_gain',
    name: 'Getting Stronger',
    description: 'Increase your lift by 10% on any exercise',
    icon: '📈',
    category: 'progress',
  },
  
  // MILESTONE ACHIEVEMENTS
  {
    id: 'week_perfect',
    name: 'Perfect Week',
    description: 'Hit protein goal AND complete all workouts in one week',
    icon: '✨',
    category: 'milestone',
  },
  {
    id: 'month_active',
    name: 'Monthly Active',
    description: 'Use the app for 30 days straight',
    icon: '📅',
    category: 'milestone',
  },
];

export function checkAchievements(stats: {
  proteinStreak: number;
  workoutCount: number;
  workoutStreak: number;
  photoCount: number;
  weightLogCount: number;
  strengthGains: number;
}): Achievement[] {
  const unlocked: Achievement[] = [];
  
  // Check each achievement - filter out undefined values
  const achievement3Day = ACHIEVEMENTS.find(a => a.id === 'protein_3_day');
  if (stats.proteinStreak >= 3 && achievement3Day) unlocked.push(achievement3Day);
  
  const achievement7Day = ACHIEVEMENTS.find(a => a.id === 'protein_7_day');
  if (stats.proteinStreak >= 7 && achievement7Day) unlocked.push(achievement7Day);
  
  const achievement30Day = ACHIEVEMENTS.find(a => a.id === 'protein_30_day');
  if (stats.proteinStreak >= 30 && achievement30Day) unlocked.push(achievement30Day);
  
  const achievement100Day = ACHIEVEMENTS.find(a => a.id === 'protein_100_day');
  if (stats.proteinStreak >= 100 && achievement100Day) unlocked.push(achievement100Day);
  
  const workoutFirst = ACHIEVEMENTS.find(a => a.id === 'workout_first');
  if (stats.workoutCount >= 1 && workoutFirst) unlocked.push(workoutFirst);
  
  const workout10 = ACHIEVEMENTS.find(a => a.id === 'workout_10');
  if (stats.workoutCount >= 10 && workout10) unlocked.push(workout10);
  
  const workout50 = ACHIEVEMENTS.find(a => a.id === 'workout_50');
  if (stats.workoutCount >= 50 && workout50) unlocked.push(workout50);
  
  const workout4Week = ACHIEVEMENTS.find(a => a.id === 'workout_4_week');
  if (stats.workoutStreak >= 4 && workout4Week) unlocked.push(workout4Week);
  
  const photoFirst = ACHIEVEMENTS.find(a => a.id === 'photo_first');
  if (stats.photoCount >= 1 && photoFirst) unlocked.push(photoFirst);
  
  const weightLogged = ACHIEVEMENTS.find(a => a.id === 'weight_logged');
  if (stats.weightLogCount >= 10 && weightLogged) unlocked.push(weightLogged);
  
  const strengthGain = ACHIEVEMENTS.find(a => a.id === 'strength_gain');
  if (stats.strengthGains >= 10 && strengthGain) unlocked.push(strengthGain);
  
  return unlocked;
}

