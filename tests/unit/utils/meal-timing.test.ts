import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatTimeSinceLastMeal, shouldShowMealAlert, isNighttime } from '@/lib/utils/meal-timing';

describe('formatTimeSinceLastMeal', () => {
  it('returns "No meals logged yet" for 0', () => {
    expect(formatTimeSinceLastMeal(0)).toBe('No meals logged yet');
  });

  it('formats fractional hours as minutes', () => {
    expect(formatTimeSinceLastMeal(0.5)).toBe('30 minutes ago');
    expect(formatTimeSinceLastMeal(0.25)).toBe('15 minutes ago');
  });

  it('formats whole hours', () => {
    expect(formatTimeSinceLastMeal(1)).toBe('1 hours ago');
    expect(formatTimeSinceLastMeal(5)).toBe('5 hours ago');
    expect(formatTimeSinceLastMeal(23)).toBe('23 hours ago');
  });

  it('formats exactly 1 day with no remaining hours', () => {
    expect(formatTimeSinceLastMeal(24)).toBe('1 day ago');
  });

  it('formats multiple days with no remaining hours', () => {
    expect(formatTimeSinceLastMeal(48)).toBe('2 days ago');
  });

  it('formats days with remaining hours', () => {
    expect(formatTimeSinceLastMeal(25)).toBe('1 day and 1 hour ago');
    expect(formatTimeSinceLastMeal(26)).toBe('1 day and 2 hours ago');
    expect(formatTimeSinceLastMeal(50)).toBe('2 days and 2 hours ago');
  });
});

describe('shouldShowMealAlert', () => {
  beforeEach(() => {
    // Use fake timers to control system clock
  });

  it('returns false during nighttime (midnight)', () => {
    // 00:00 - nighttime
    const midnight = new Date('2024-01-15T00:00:00');
    vi.setSystemTime(midnight);
    expect(shouldShowMealAlert(8)).toBe(false);
  });

  it('returns false during nighttime (23:00)', () => {
    const lateNight = new Date('2024-01-15T23:00:00');
    vi.setSystemTime(lateNight);
    expect(shouldShowMealAlert(8)).toBe(false);
  });

  it('returns false during early morning (06:59)', () => {
    const earlyMorning = new Date('2024-01-15T06:59:00');
    vi.setSystemTime(earlyMorning);
    expect(shouldShowMealAlert(8)).toBe(false);
  });

  it('returns false during daytime when under threshold', () => {
    const afternoon = new Date('2024-01-15T14:00:00');
    vi.setSystemTime(afternoon);
    expect(shouldShowMealAlert(3)).toBe(false);
  });

  it('returns true during daytime when over default threshold (6h)', () => {
    const afternoon = new Date('2024-01-15T14:00:00');
    vi.setSystemTime(afternoon);
    expect(shouldShowMealAlert(6)).toBe(true);
    expect(shouldShowMealAlert(7)).toBe(true);
  });

  it('respects custom threshold', () => {
    const afternoon = new Date('2024-01-15T14:00:00');
    vi.setSystemTime(afternoon);
    expect(shouldShowMealAlert(4, 4)).toBe(true);
    expect(shouldShowMealAlert(3, 4)).toBe(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});

describe('isNighttime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true at midnight (00:00)', () => {
    vi.setSystemTime(new Date('2024-01-15T00:00:00'));
    expect(isNighttime()).toBe(true);
  });

  it('returns true at 06:00', () => {
    vi.setSystemTime(new Date('2024-01-15T06:00:00'));
    expect(isNighttime()).toBe(true);
  });

  it('returns false at 07:00', () => {
    vi.setSystemTime(new Date('2024-01-15T07:00:00'));
    expect(isNighttime()).toBe(false);
  });

  it('returns false during afternoon (14:00)', () => {
    vi.setSystemTime(new Date('2024-01-15T14:00:00'));
    expect(isNighttime()).toBe(false);
  });

  it('returns false at 22:59', () => {
    vi.setSystemTime(new Date('2024-01-15T22:59:00'));
    expect(isNighttime()).toBe(false);
  });

  it('returns true at 23:00', () => {
    vi.setSystemTime(new Date('2024-01-15T23:00:00'));
    expect(isNighttime()).toBe(true);
  });
});
