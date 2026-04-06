import { createAdminClient, createClient } from '@/lib/supabase/server';
import {
  PROGRESS_PHOTOS_BUCKET,
  progressPhotoPathFromUrl,
} from '@/lib/progress-photo-urls';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

type AdminClient = SupabaseClient<Database>;

async function removeAllInStoragePrefix(admin: AdminClient, prefix: string): Promise<void> {
  const { data: items, error } = await admin.storage
    .from(PROGRESS_PHOTOS_BUCKET)
    .list(prefix, { limit: 1000 });

  if (error || !items?.length) {
    return;
  }

  for (const item of items) {
    const fullPath = `${prefix}/${item.name}`;
    const { data: nested, error: nestedErr } = await admin.storage
      .from(PROGRESS_PHOTOS_BUCKET)
      .list(fullPath, { limit: 1000 });

    if (!nestedErr && nested && nested.length > 0) {
      await removeAllInStoragePrefix(admin, fullPath);
    }

    const { error: rmErr } = await admin.storage.from(PROGRESS_PHOTOS_BUCKET).remove([fullPath]);
    if (rmErr) {
      logger.error('Storage remove failed for path', fullPath, rmErr);
    }
  }
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleteLimit = await enforceRateLimit('account-delete', `u:${user.id}`, 10, '1 h');
  if (!deleteLimit.ok) return deleteLimit.response;

  const userId = user.id;
  const admin = createAdminClient();

  try {
    const { data: photoRows, error: photosErr } = await admin
      .from('progress_photos')
      .select('photo_url, front_url, side_url, back_url, flex_url')
      .eq('user_id', userId);

    if (photosErr) {
      return NextResponse.json({ error: 'Could not load photo records' }, { status: 500 });
    }

    const pathSet = new Set<string>();
    const urlKeys = ['photo_url', 'front_url', 'side_url', 'back_url', 'flex_url'] as const;
    for (const row of photoRows ?? []) {
      for (const key of urlKeys) {
        const raw = row[key];
        if (typeof raw === 'string') {
          const p = progressPhotoPathFromUrl(raw);
          if (p) pathSet.add(p);
        }
      }
    }

    if (pathSet.size > 0) {
      const { error: removeKnownErr } = await admin.storage
        .from(PROGRESS_PHOTOS_BUCKET)
        .remove([...pathSet]);
      if (removeKnownErr) {
        logger.error('Could not remove known photo paths', removeKnownErr);
      }
    }

    await removeAllInStoragePrefix(admin, userId);

    const { error: profileDelErr } = await admin.from('profiles').delete().eq('id', userId);
    if (profileDelErr) {
      logger.error('Profile delete failed', profileDelErr);
      return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    }

    const { error: authDelErr } = await admin.auth.admin.deleteUser(userId);
    if (authDelErr) {
      logger.error('Auth user delete failed', authDelErr);
      return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Account deletion error', err);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
