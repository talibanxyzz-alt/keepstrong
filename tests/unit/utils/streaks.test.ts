import { describe, it, expect, afterEach } from 'vitest';
import { format } from 'date-fns';
import { calculateStreaks } from '@/lib/utils/streaks';

function makeDate(daysAgo: number): Date {
  const d = new Date('2024-06-15T12:00:00Z'); // fixed "today"
  d.setDate(d.getDate() - daysAgo);
  return d;
}

/** Local calendar key matching streak logic (same as DB `date`). */
function makeDateStr(daysAgo: number): string {
  return format(makeDate(daysAgo), 'yyyy-MM-dd');
}

// Pin "today" to 2024-06-15 for all streak tests
const TODAY = new Date('2024-06-15T12:00:00Z');

afterEach(() => {
  vi.useRealTimers();
});

function setup(daysAgo: number[] = [], goal = 100) {
  vi.setSystemTime(TODAY);
  return {
    userId: 'test',
    proteinGoal: goal,
    proteinLogs: daysAgo.map(d => ({ date: makeDateStr(d), proteinGrams: goal })),
    workoutSessions: [],
  };
}

describe('calculateStreaks — empty data', () => {
  it('returns all zeros for no logs', () => {
    vi.setSystemTime(TODAY);
    const result = calculateStreaks({
      userId: 'test',
      proteinGoal: 100,
      proteinLogs: [],
      workoutSessions: [],
    });
    expect(result.proteinStreak).toBe(0);
    expect(result.workoutStreak).toBe(0);
    expect(result.proteinBestStreak).toBe(0);
    expect(result.workoutBestStreak).toBe(0);
  });
});

describe('calculateStreaks — protein streak', () => {
  it('counts a single day streak when today is logged', () => {
    const data = setup([0]); // logged today
    const result = calculateStreaks(data);
    expect(result.proteinStreak).toBe(1);
  });

  it('counts consecutive days from today', () => {
    const data = setup([0, 1, 2]); // today, yesterday, day before
    const result = calculateStreaks(data);
    expect(result.proteinStreak).toBe(3);
  });

  it('breaks streak on a missing day', () => {
    const data = setup([0, 1, 3]); // gap on day 2
    const result = calculateStreaks(data);
    expect(result.proteinStreak).toBe(2);
  });

  it('returns 0 when most recent log is 2+ days ago', () => {
    const data = setup([2, 3, 4]); // no log yesterday or today
    const result = calculateStreaks(data);
    expect(result.proteinStreak).toBe(0);
  });

  it('accumulates protein from multiple logs on same day', () => {
    vi.setSystemTime(TODAY);
    const data = {
      userId: 'test',
      proteinGoal: 100,
      proteinLogs: [
        { date: makeDateStr(0), proteinGrams: 60 },
        { date: makeDateStr(0), proteinGrams: 50 }, // same day, total = 110 >= 100
        { date: makeDateStr(1), proteinGrams: 100 },
      ],
      workoutSessions: [],
    };
    const result = calculateStreaks(data);
    expect(result.proteinStreak).toBe(2);
  });

  it('does not count day where protein is below goal', () => {
    vi.setSystemTime(TODAY);
    const data = {
      userId: 'test',
      proteinGoal: 100,
      proteinLogs: [
        { date: makeDateStr(0), proteinGrams: 99 }, // just under goal
      ],
      workoutSessions: [],
    };
    const result = calculateStreaks(data);
    expect(result.proteinStreak).toBe(0);
  });
});

describe('calculateStreaks — best protein streak', () => {
  it('tracks best streak from historical data', () => {
    // A run of 5 days in the past, and a current streak of 2
    const data = setup([0, 1, 10, 11, 12, 13, 14]);
    const result = calculateStreaks(data);
    expect(result.proteinBestStreak).toBe(5);
    expect(result.proteinStreak).toBe(2);
  });

  it('best streak equals current streak when only one run exists', () => {
    const data = setup([0, 1, 2]);
    const result = calculateStreaks(data);
    expect(result.proteinBestStreak).toBe(3);
    expect(result.proteinStreak).toBe(3);
  });
});

describe('calculateStreaks — workout streak', () => {
  it('counts a week with 2+ workouts', () => {
    vi.setSystemTime(TODAY);
    // Two workouts this week
    const data = {
      userId: 'test',
      proteinGoal: 100,
      proteinLogs: [],
      workoutSessions: [
        { completedAt: makeDate(0) },
        { completedAt: makeDate(1) },
      ],
    };
    const result = calculateStreaks(data);
    expect(result.workoutStreak).toBe(1);
  });

  it('returns 0 when fewer than 2 workouts this week', () => {
    vi.setSystemTime(TODAY);
    const data = {
      userId: 'test',
      proteinGoal: 100,
      proteinLogs: [],
      workoutSessions: [{ completedAt: makeDate(0) }], // only 1 workout
    };
    const result = calculateStreaks(data);
    expect(result.workoutStreak).toBe(0);
  });

  it('counts best workout streak from history', () => {
    vi.setSystemTime(TODAY);
    // 2 workouts per week for weeks 2 and 3 ago, but not last week or this week
    const data = {
      userId: 'test',
      proteinGoal: 100,
      proteinLogs: [],
      workoutSessions: [
        { completedAt: makeDate(10) },
        { completedAt: makeDate(11) },
        { completedAt: makeDate(17) },
        { completedAt: makeDate(18) },
      ],
    };
    const result = calculateStreaks(data);
    expect(result.workoutBestStreak).toBeGreaterThanOrEqual(1);
    expect(result.workoutStreak).toBe(0);
  });
});
