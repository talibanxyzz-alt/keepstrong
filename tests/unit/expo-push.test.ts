import { describe, expect, it } from 'vitest';
import { isLikelyExpoPushToken } from '@/lib/expo-push';

describe('isLikelyExpoPushToken', () => {
  it('accepts standard Expo token shape', () => {
    expect(isLikelyExpoPushToken('ExponentPushToken[abc123]')).toBe(true);
  });

  it('rejects garbage and injection-ish input', () => {
    expect(isLikelyExpoPushToken('')).toBe(false);
    expect(isLikelyExpoPushToken('ExponentPushToken[]')).toBe(false);
    expect(isLikelyExpoPushToken('ExponentPushToken[unclosed')).toBe(false);
    expect(isLikelyExpoPushToken('fcmtoken-here')).toBe(false);
    expect(isLikelyExpoPushToken('ExponentPushToken[x]\nDROP')).toBe(false);
  });
});
