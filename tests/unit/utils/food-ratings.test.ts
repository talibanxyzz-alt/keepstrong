import { describe, it, expect } from 'vitest';
import {
  getToleranceLevel,
  getToleranceColor,
  getToleranceIcon,
  getToleranceLabel,
  formatTolerancePercentage,
  getVoteDistributionText,
  type FoodRating,
  type ToleranceLevel,
} from '@/lib/utils/food-ratings';

describe('getToleranceLevel', () => {
  it('returns excellent at and above 80%', () => {
    expect(getToleranceLevel(80)).toBe('excellent');
    expect(getToleranceLevel(100)).toBe('excellent');
    expect(getToleranceLevel(95)).toBe('excellent');
  });

  it('returns good between 60% and 79%', () => {
    expect(getToleranceLevel(60)).toBe('good');
    expect(getToleranceLevel(79)).toBe('good');
    expect(getToleranceLevel(65)).toBe('good');
  });

  it('returns moderate between 40% and 59%', () => {
    expect(getToleranceLevel(40)).toBe('moderate');
    expect(getToleranceLevel(59)).toBe('moderate');
  });

  it('returns poor between 20% and 39%', () => {
    expect(getToleranceLevel(20)).toBe('poor');
    expect(getToleranceLevel(39)).toBe('poor');
  });

  it('returns avoid below 20%', () => {
    expect(getToleranceLevel(19)).toBe('avoid');
    expect(getToleranceLevel(0)).toBe('avoid');
  });

  it('handles exact boundary values correctly', () => {
    expect(getToleranceLevel(79)).toBe('good');   // just below excellent
    expect(getToleranceLevel(59)).toBe('moderate'); // just below good
    expect(getToleranceLevel(39)).toBe('poor');    // just below moderate
    expect(getToleranceLevel(19)).toBe('avoid');   // just below poor
  });
});

describe('getToleranceColor', () => {
  const levels: ToleranceLevel[] = ['excellent', 'good', 'moderate', 'poor', 'avoid'];

  it('returns a non-empty string for every level', () => {
    for (const level of levels) {
      expect(getToleranceColor(level).length).toBeGreaterThan(0);
    }
  });

  it('returns distinct colors for each level', () => {
    const colors = levels.map(getToleranceColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(levels.length);
  });
});

describe('getToleranceIcon', () => {
  it('returns double thumbs up for excellent', () => {
    expect(getToleranceIcon('excellent')).toBe('👍👍');
  });

  it('returns thumbs up for good', () => {
    expect(getToleranceIcon('good')).toBe('👍');
  });

  it('returns shrug for moderate', () => {
    expect(getToleranceIcon('moderate')).toBe('🤷');
  });

  it('returns thumbs down for poor', () => {
    expect(getToleranceIcon('poor')).toBe('👎');
  });

  it('returns no-entry for avoid', () => {
    expect(getToleranceIcon('avoid')).toBe('🚫');
  });
});

describe('getToleranceLabel', () => {
  it('returns human-readable labels', () => {
    expect(getToleranceLabel('excellent')).toBe('Excellent Tolerance');
    expect(getToleranceLabel('good')).toBe('Good Tolerance');
    expect(getToleranceLabel('moderate')).toBe('Moderate Tolerance');
    expect(getToleranceLabel('poor')).toBe('Poor Tolerance');
    expect(getToleranceLabel('avoid')).toBe('Avoid');
  });
});

describe('formatTolerancePercentage', () => {
  it('formats whole numbers', () => {
    expect(formatTolerancePercentage(80)).toBe('80%');
    expect(formatTolerancePercentage(0)).toBe('0%');
    expect(formatTolerancePercentage(100)).toBe('100%');
  });

  it('rounds decimals', () => {
    expect(formatTolerancePercentage(79.4)).toBe('79%');
    expect(formatTolerancePercentage(79.5)).toBe('80%');
    expect(formatTolerancePercentage(33.33)).toBe('33%');
  });
});

describe('getVoteDistributionText', () => {
  it('formats vote counts correctly', () => {
    const rating: FoodRating = {
      food_name: 'Chicken',
      total_votes: 10,
      upvotes: 8,
      downvotes: 2,
      tolerance_percentage: 80,
      last_voted_at: '2024-01-01',
    };
    const text = getVoteDistributionText(rating);
    expect(text).toContain('8');
    expect(text).toContain('2');
    expect(text).toContain('10');
  });

  it('handles zero votes', () => {
    const rating: FoodRating = {
      food_name: 'Unknown',
      total_votes: 0,
      upvotes: 0,
      downvotes: 0,
      tolerance_percentage: 0,
      last_voted_at: '2024-01-01',
    };
    const text = getVoteDistributionText(rating);
    expect(text).toContain('0');
  });
});
