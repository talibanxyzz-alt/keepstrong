import { createClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uploadLimit = await enforceRateLimit('progress-photo-upload', `u:${user.id}`, 40, '1 h');
  if (!uploadLimit.ok) return uploadLimit.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const frontFile = formData.get('front') as File | null;
  const sideFile = formData.get('side') as File | null;
  const backFile = formData.get('back') as File | null;
  const flexFile = formData.get('flex') as File | null;
  const notes = formData.get('notes') as string | null;
  const takenAt = formData.get('taken_at') as string | null;

  if (!frontFile && !sideFile && !backFile && !flexFile) {
    return NextResponse.json({ error: 'At least one photo is required' }, { status: 400 });
  }

  const timestamp = Date.now();

  async function uploadFile(file: File, angle: string): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user!.id}/${timestamp}_${angle}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(path, bytes, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Short-lived signed URL; gallery refreshes URLs on each page load (private bucket).
    const { data: signed, error: signError } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(path, 3600);

    if (signError || !signed?.signedUrl) throw signError ?? new Error('Failed to create signed URL');

    return signed.signedUrl;
  }

  try {
    const [frontUrl, sideUrl, backUrl, flexUrl] = await Promise.all([
      frontFile ? uploadFile(frontFile, 'front') : Promise.resolve(null),
      sideFile  ? uploadFile(sideFile,  'side')  : Promise.resolve(null),
      backFile  ? uploadFile(backFile,  'back')  : Promise.resolve(null),
      flexFile  ? uploadFile(flexFile,  'flex')  : Promise.resolve(null),
    ]);

    const primaryUrl = frontUrl ?? sideUrl ?? backUrl ?? flexUrl ?? '';

    const { data, error } = await supabase
      .from('progress_photos')
      .insert({
        user_id: user.id,
        photo_url: primaryUrl,
        front_url: frontUrl,
        side_url: sideUrl,
        back_url: backUrl,
        flex_url: flexUrl,
        notes: notes?.trim() || null,
        taken_at: takenAt ? new Date(takenAt).toISOString() : new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, photo: data });
  } catch (err) {
    console.error('Photo upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
