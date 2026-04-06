import { differenceInDays, format, parse, subDays } from 'date-fns';

interface StreakData {
  userId: string;
  /** Calendar day YYYY-MM-DD (from `protein_logs.date`) — not a UTC Date. */
  proteinLogs: Array<{ date: string; proteinGrams: number }>;
  proteinGoal: number;
  workoutSessions: Array<{ completedAt: Date }>;
}

// Pure computation — no Supabase calls. All data is passed in.
export function calculateStreaks(data: StreakData) {
  const { proteinLogs, proteinGoal, workoutSessions } = data;
  
  // PROTEIN STREAK
  const proteinByDate = new Map<string, number>();
  proteinLogs.forEach(log => {
    const dateKey = log.date.slice(0, 10);
    proteinByDate.set(dateKey, (proteinByDate.get(dateKey) || 0) + log.proteinGrams);
  });
  
  let proteinStreak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const dateKey = format(subDays(today, i), 'yyyy-MM-dd');
    if ((proteinByDate.get(dateKey) || 0) >= proteinGoal) {
      proteinStreak++;
    } else {
      break;
    }
  }
  
  // WORKOUT STREAK — consecutive weeks with ≥2 workouts
  const weeksWithWorkouts = new Map<string, number>();
  workoutSessions.forEach(session => {
    const weekKey = getWeekKey(session.completedAt);
    weeksWithWorkouts.set(weekKey, (weeksWithWorkouts.get(weekKey) || 0) + 1);
  });
  
  let workoutStreak = 0;
  let checkWeek = getWeekKey(today);
  for (let i = 0; i < 52; i++) {
    if ((weeksWithWorkouts.get(checkWeek) || 0) >= 2) {
      workoutStreak++;
    } else {
      break;
    }
    checkWeek = getPreviousWeek(checkWeek);
  }
  
  // BEST STREAKS — computed from the same data, no extra DB calls
  const proteinBestStreak = computeBestProteinStreak(proteinByDate, proteinGoal);
  const workoutBestStreak = computeBestWorkoutStreak(weeksWithWorkouts);

  return {
    proteinStreak,
    workoutStreak,
    proteinBestStreak,
    workoutBestStreak,
  };
}

function getWeekKey(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = differenceInDays(date, start);
  const week = Math.ceil((diff + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-${week.toString().padStart(2, '0')}`;
}

function getPreviousWeek(weekKey: string): string {
  const [year, week] = weekKey.split('-').map(Number);
  if (week > 1) return `${year}-${(week - 1).toString().padStart(2, '0')}`;
  return `${year - 1}-52`;
}

function computeBestProteinStreak(
  proteinByDate: Map<string, number>,
  proteinGoal: number
): number {
  const sortedDates = Array.from(proteinByDate.keys()).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let expectedDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const protein = proteinByDate.get(dateStr) || 0;
    const currentDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (protein >= proteinGoal) {
      if (expectedDate === null || differenceInDays(currentDate, expectedDate) === 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
      expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() + 1);
    } else {
      currentStreak = 0;
      expectedDate = null;
    }
  }

  return maxStreak;
}

function computeBestWorkoutStreak(weeksWithWorkouts: Map<string, number>): number {
  const sortedWeeks = Array.from(weeksWithWorkouts.keys()).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let expectedWeek: string | null = null;

  for (const weekKey of sortedWeeks) {
    const count = weeksWithWorkouts.get(weekKey) || 0;
    if (count >= 2) {
      if (expectedWeek === null || weekKey === expectedWeek) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
      const [year, week]: [number, number] = weekKey.split('-').map(Number) as [number, number];
      expectedWeek = week < 52 ? `${year}-${(week + 1).toString().padStart(2, '0')}` : `${year + 1}-01`;
    } else {
      currentStreak = 0;
      expectedWeek = null;
    }
  }

  return maxStreak;
}

