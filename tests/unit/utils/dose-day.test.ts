import { describe, it, expect } from 'vitest';
import {
  getDaysSinceDose,
  getDoseImpactLevel,
  getAdjustedProteinGoal,
  getDoseDayMessage,
} from '@/lib/utils/dose-day';

describe('getDaysSinceDose', () => {
  it('returns 0 when today is dose day', () => {
    expect(getDaysSinceDose({ doseDay: 3, todayDayOfWeek: 3 })).toBe(0);
  });

  it('returns 1 the day after dose', () => {
    expect(getDaysSinceDose({ doseDay: 3, todayDayOfWeek: 4 })).toBe(1);
  });

  it('returns 6 the day before dose (week wraparound)', () => {
    expect(getDaysSinceDose({ doseDay: 3, todayDayOfWeek: 2 })).toBe(6);
  });

  it('handles Sunday (0) to Saturday (6) wraparound', () => {
    // Dose on Saturday (6), today is Sunday (0) → 1 day later
    expect(getDaysSinceDose({ doseDay: 6, todayDayOfWeek: 0 })).toBe(1);
  });

  it('handles dose on Sunday, today is Saturday', () => {
    // Dose on Sunday (0), today is Saturday (6) → 6 days later
    expect(getDaysSinceDose({ doseDay: 0, todayDayOfWeek: 6 })).toBe(6);
  });

  it('returns correct days across the full week', () => {
    // Dose on Monday (1)
    expect(getDaysSinceDose({ doseDay: 1, todayDayOfWeek: 1 })).toBe(0);
    expect(getDaysSinceDose({ doseDay: 1, todayDayOfWeek: 2 })).toBe(1);
    expect(getDaysSinceDose({ doseDay: 1, todayDayOfWeek: 3 })).toBe(2);
    expect(getDaysSinceDose({ doseDay: 1, todayDayOfWeek: 4 })).toBe(3);
    expect(getDaysSinceDose({ doseDay: 1, todayDayOfWeek: 5 })).toBe(4);
    expect(getDaysSinceDose({ doseDay: 1, todayDayOfWeek: 6 })).toBe(5);
    expect(getDaysSinceDose({ doseDay: 1, todayDayOfWeek: 0 })).toBe(6);
  });
});

describe('getDoseImpactLevel', () => {
  it('returns high on dose day (0)', () => {
    expect(getDoseImpactLevel(0)).toBe('high');
  });

  it('returns high the day after dose (1)', () => {
    expect(getDoseImpactLevel(1)).toBe('high');
  });

  it('returns medium 2 days after dose', () => {
    expect(getDoseImpactLevel(2)).toBe('medium');
  });

  it('returns none for days 3-6', () => {
    expect(getDoseImpactLevel(3)).toBe('none');
    expect(getDoseImpactLevel(4)).toBe('none');
    expect(getDoseImpactLevel(5)).toBe('none');
    expect(getDoseImpactLevel(6)).toBe('none');
  });
});

describe('getAdjustedProteinGoal', () => {
  it('reduces to 80% on dose day', () => {
    expect(getAdjustedProteinGoal(100, 0)).toBe(80);
  });

  it('reduces to 80% the day after dose', () => {
    expect(getAdjustedProteinGoal(100, 1)).toBe(80);
  });

  it('reduces to 90% two days after dose', () => {
    expect(getAdjustedProteinGoal(100, 2)).toBe(90);
  });

  it('keeps 100% from day 3 onward', () => {
    expect(getAdjustedProteinGoal(100, 3)).toBe(100);
    expect(getAdjustedProteinGoal(100, 6)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    // 150 * 0.80 = 120 exactly
    expect(getAdjustedProteinGoal(150, 0)).toBe(120);
    // 155 * 0.90 = 139.5 → 140
    expect(getAdjustedProteinGoal(155, 2)).toBe(140);
  });
});

describe('getDoseDayMessage', () => {
  it('returns dose day title on day 0', () => {
    const msg = getDoseDayMessage(0);
    expect(msg.title).toContain('Dose Day');
    expect(msg.color).toBe('amber');
  });

  it('returns day after dose title on day 1', () => {
    const msg = getDoseDayMessage(1);
    expect(msg.title).toContain('Day After Dose');
    expect(msg.color).toBe('amber');
  });

  it('returns recovery day on day 2', () => {
    const msg = getDoseDayMessage(2);
    expect(msg.title).toBe('⚡ Recovery Day');
    expect(msg.color).toBe('blue');
  });

  it('returns good day from day 3 onward', () => {
    const msg = getDoseDayMessage(3);
    expect(msg.title).toBe('✨ Good Day');
    expect(msg.color).toBe('emerald');
  });

  it('all messages include a non-empty message string', () => {
    [0, 1, 2, 3, 6].forEach(days => {
      expect(getDoseDayMessage(days).message.length).toBeGreaterThan(0);
    });
  });
});
