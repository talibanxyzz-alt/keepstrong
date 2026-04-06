import { describe, it, expect } from 'vitest';
import { checkAchievements, ACHIEVEMENTS } from '@/lib/utils/achievements';

const baseStats = {
  proteinStreak: 0,
  workoutCount: 0,
  workoutStreak: 0,
  photoCount: 0,
  weightLogCount: 0,
  strengthGains: 0,
};

describe('ACHIEVEMENTS constant', () => {
  it('contains 13 achievements', () => {
    expect(ACHIEVEMENTS).toHaveLength(13);
  });

  it('all achievements have required fields', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(['protein', 'workout', 'progress', 'milestone']).toContain(a.category);
    }
  });

  it('all achievement ids are unique', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('checkAchievements — new user', () => {
  it('returns no achievements for zero stats', () => {
    expect(checkAchievements(baseStats)).toHaveLength(0);
  });
});

describe('checkAchievements — protein streak', () => {
  it('unlocks protein_3_day at streak 3', () => {
    const result = checkAchievements({ ...baseStats, proteinStreak: 3 });
    expect(result.map(a => a.id)).toContain('protein_3_day');
  });

  it('does not unlock protein_3_day at streak 2', () => {
    const result = checkAchievements({ ...baseStats, proteinStreak: 2 });
    expect(result.map(a => a.id)).not.toContain('protein_3_day');
  });

  it('unlocks all protein achievements at streak 100', () => {
    const result = checkAchievements({ ...baseStats, proteinStreak: 100 });
    const ids = result.map(a => a.id);
    expect(ids).toContain('protein_3_day');
    expect(ids).toContain('protein_7_day');
    expect(ids).toContain('protein_30_day');
    expect(ids).toContain('protein_100_day');
  });

  it('unlocks only up to streak 29 (not 30-day)', () => {
    const result = checkAchievements({ ...baseStats, proteinStreak: 29 });
    const ids = result.map(a => a.id);
    expect(ids).toContain('protein_7_day');
    expect(ids).not.toContain('protein_30_day');
  });
});

describe('checkAchievements — workouts', () => {
  it('unlocks workout_first at count 1', () => {
    const result = checkAchievements({ ...baseStats, workoutCount: 1 });
    expect(result.map(a => a.id)).toContain('workout_first');
  });

  it('does not unlock workout_10 at count 9', () => {
    const result = checkAchievements({ ...baseStats, workoutCount: 9 });
    expect(result.map(a => a.id)).not.toContain('workout_10');
  });

  it('unlocks workout_10 at exactly 10', () => {
    const result = checkAchievements({ ...baseStats, workoutCount: 10 });
    expect(result.map(a => a.id)).toContain('workout_10');
  });

  it('unlocks workout_50 at exactly 50', () => {
    const result = checkAchievements({ ...baseStats, workoutCount: 50 });
    expect(result.map(a => a.id)).toContain('workout_50');
  });

  it('does not unlock workout_50 at count 49', () => {
    const result = checkAchievements({ ...baseStats, workoutCount: 49 });
    expect(result.map(a => a.id)).not.toContain('workout_50');
  });

  it('unlocks workout_4_week at streak 4', () => {
    const result = checkAchievements({ ...baseStats, workoutStreak: 4 });
    expect(result.map(a => a.id)).toContain('workout_4_week');
  });
});

describe('checkAchievements — progress', () => {
  it('unlocks photo_first at 1 photo', () => {
    const result = checkAchievements({ ...baseStats, photoCount: 1 });
    expect(result.map(a => a.id)).toContain('photo_first');
  });

  it('unlocks weight_logged at exactly 10 weight logs', () => {
    const result = checkAchievements({ ...baseStats, weightLogCount: 10 });
    expect(result.map(a => a.id)).toContain('weight_logged');
  });

  it('does not unlock weight_logged at 9 logs', () => {
    const result = checkAchievements({ ...baseStats, weightLogCount: 9 });
    expect(result.map(a => a.id)).not.toContain('weight_logged');
  });

  it('unlocks strength_gain at 10% gain', () => {
    const result = checkAchievements({ ...baseStats, strengthGains: 10 });
    expect(result.map(a => a.id)).toContain('strength_gain');
  });
});

describe('checkAchievements — multiple simultaneous unlocks', () => {
  it('can unlock many achievements at once', () => {
    const result = checkAchievements({
      proteinStreak: 100,
      workoutCount: 50,
      workoutStreak: 4,
      photoCount: 5,
      weightLogCount: 15,
      strengthGains: 20,
    });
    expect(result.length).toBeGreaterThan(5);
  });

  it('returns Achievement objects with all required fields', () => {
    const result = checkAchievements({ ...baseStats, proteinStreak: 7 });
    for (const achievement of result) {
      expect(achievement.id).toBeTruthy();
      expect(achievement.name).toBeTruthy();
      expect(achievement.icon).toBeTruthy();
    }
  });
});
