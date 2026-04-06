/**
 * Expo push tokens from getExpoPushTokenAsync() look like:
 * ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 */
const EXPO_PUSH_TOKEN_RE = /^ExponentPushToken\[[^\]]+\]$/;

export function isLikelyExpoPushToken(token: string): boolean {
  const t = token.trim();
  if (t.length < 22 || t.length > 512) return false;
  if (/[\n\r\0]/.test(t)) return false;
  return EXPO_PUSH_TOKEN_RE.test(t);
}
