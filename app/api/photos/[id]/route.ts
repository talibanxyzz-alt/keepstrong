import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { data: photo, error: fetchError } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  // Extract the storage path from a signed URL
  const urlToPath = (url: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/\/object\/sign\/progress-photos\/(.+?)\?/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const paths = [
    urlToPath(photo.front_url),
    urlToPath(photo.side_url),
    urlToPath(photo.back_url),
    urlToPath(photo.flex_url),
    urlToPath(photo.photo_url),
  ].filter((p): p is string => !!p);

  const uniquePaths = [...new Set(paths)];
  if (uniquePaths.length > 0) {
    // Best-effort — don't block delete if storage removal fails
    await supabase.storage.from('progress-photos').remove(uniquePaths);
  }

  const { error: deleteError } = await supabase
    .from('progress_photos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
