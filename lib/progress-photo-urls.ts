export const PROGRESS_PHOTOS_BUCKET = 'progress-photos';

/**
 * Extract storage object path from a Supabase signed or public object URL.
 */
export function progressPhotoPathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const signMatch = url.match(/\/object\/sign\/progress-photos\/(.+?)\?/);
  if (signMatch) return decodeURIComponent(signMatch[1]);
  const pubMatch = url.match(/\/object\/public\/progress-photos\/(.+?)(?:\?|$)/);
  if (pubMatch) return decodeURIComponent(pubMatch[1]);
  return null;
}
