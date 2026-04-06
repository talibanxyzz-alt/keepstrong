interface DoseInfo {
  doseDay: number; // 0-6 (Sunday-Saturday)
  todayDayOfWeek: number; // Today's day (0-6)
}

export function getDaysSinceDose({ doseDay, todayDayOfWeek }: DoseInfo): number {
  let diff = todayDayOfWeek - doseDay;
  
  // Handle week wraparound
  if (diff < 0) {
    diff += 7;
  }
  
  return diff;
}

export function getDoseImpactLevel(daysSinceDose: number): 'high' | 'medium' | 'low' | 'none' {
  if (daysSinceDose === 0) return 'high';      // Dose day
  if (daysSinceDose === 1) return 'high';      // Day after dose
  if (daysSinceDose === 2) return 'medium';    // 2 days after
  return 'none';                                // Rest of week
}

export function getAdjustedProteinGoal(baseGoal: number, daysSinceDose: number): number {
  const impact = getDoseImpactLevel(daysSinceDose);
  
  switch (impact) {
    case 'high':
      return Math.round(baseGoal * 0.80); // 80% of goal
    case 'medium':
      return Math.round(baseGoal * 0.90); // 90% of goal
    default:
      return baseGoal; // 100% of goal
  }
}

export function getDoseDayMessage(daysSinceDose: number): {
  title: string;
  message: string;
  color: string;
} {
  const impact = getDoseImpactLevel(daysSinceDose);
  
  switch (impact) {
    case 'high':
      return {
        title: daysSinceDose === 0 ? '💉 Dose Day' : '💉 Day After Dose',
        message: 'You might feel off today. Lower protein goal (80%) and lighter workouts are totally okay!',
        color: 'amber',
      };
    case 'medium':
      return {
        title: '⚡ Recovery Day',
        message: 'Still recovering from dose. Lower protein goal (90%) if needed.',
        color: 'blue',
      };
    default:
      return {
        title: '✨ Good Day',
        message: 'This is typically when you feel best. Make it count!',
        color: 'emerald',
      };
  }
}

