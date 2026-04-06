import { createClient } from '@/lib/supabase/server';
import {
  PROGRESS_PHOTOS_BUCKET,
  progressPhotoPathFromUrl,
} from '@/lib/progress-photo-urls';
import type { Database } from '@/types/database.types';
import PhotosClient from './PhotosClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Progress Photos | KeepStrong',
  description: 'Track your transformation with progress photos',
};

type PhotoRow = Database['public']['Tables']['progress_photos']['Row'];

async function refreshSignedUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string | null
): Promise<string | null> {
  if (!url) return null;
  const path = progressPhotoPathFromUrl(url);
  if (!path) return url;
  const { data, error } = await supabase.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return url;
  return data.signedUrl;
}

async function withFreshPhotoUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photo: PhotoRow
): Promise<PhotoRow> {
  const [photo_url, front_url, side_url, back_url, flex_url] = await Promise.all([
    refreshSignedUrl(supabase, photo.photo_url),
    refreshSignedUrl(supabase, photo.front_url),
    refreshSignedUrl(supabase, photo.side_url),
    refreshSignedUrl(supabase, photo.back_url),
    refreshSignedUrl(supabase, photo.flex_url),
  ]);
  return {
    ...photo,
    photo_url: photo_url ?? photo.photo_url,
    front_url,
    side_url,
    back_url,
    flex_url,
  };
}

export default async function PhotosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: photos } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', user.id)
    .order('taken_at', { ascending: false });

  const rows = photos ?? [];
  const refreshed = await Promise.all(
    rows.map((p) => withFreshPhotoUrls(supabase, p as PhotoRow))
  );

  return <PhotosClient photos={refreshed} userId={user.id} />;
}

