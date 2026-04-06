import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isLikelyExpoPushToken } from '@/lib/expo-push';
import { logger } from '@/lib/logger';
import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type Body = { token?: string | null };

async function getAuthedSupabaseForRequest(
  request: Request
): Promise<{ supabase: SupabaseClient<Database>; userId: string } | { error: Response }> {
  const bearer = request.headers.get('Authorization');
  if (bearer?.startsWith('Bearer ')) {
    const jwt = bearer.slice(7);
    const anon = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { user },
      error: jwtError,
    } = await anon.auth.getUser(jwt);
    if (jwtError || !user) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );
    return { supabase, userId: user.id };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { supabase, userId: user.id };
}

/**
 * Register or clear the Expo push token for the signed-in user (mobile app).
 * POST JSON: { "token": "ExponentPushToken[...]" } to register, { "token": null } to clear.
 * Use cookie session (web) or `Authorization: Bearer <supabase_access_token>` (native Expo).
 *
 * Expo (after Notifications.getExpoPushTokenAsync); base URL = same host as Supabase auth (e.g. NEXT_PUBLIC_APP_URL):
 *   await fetch(`${API_BASE_URL}/api/account/push-token`, {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       Authorization: `Bearer ${session.access_token}`,
 *     },
 *     body: JSON.stringify({ token: expoPushToken }),
 *   });
 */
export async function POST(request: Request) {
  const auth = await getAuthedSupabaseForRequest(request);
  if ('error' in auth) {
    return auth.error;
  }
  const { supabase, userId } = auth;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const raw = body.token;
  if (raw === null || raw === undefined || raw === '') {
    const { data: cleared, error } = await supabase
      .from('profiles')
      .update({ expo_push_token: null })
      .eq('id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      logger.error('push-token clear failed', error);
      return NextResponse.json({ error: 'Failed to clear push token' }, { status: 500 });
    }
    if (!cleared) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, registered: false });
  }

  if (typeof raw !== 'string') {
    return NextResponse.json({ error: 'token must be a string or null' }, { status: 400 });
  }

  if (!isLikelyExpoPushToken(raw)) {
    return NextResponse.json(
      { error: 'Invalid Expo push token format' },
      { status: 400 }
    );
  }

  const token = raw.trim();
  const { data: saved, error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', userId)
    .select('id')
    .maybeSingle();

  if (error) {
    logger.error('push-token save failed', error);
    return NextResponse.json({ error: 'Failed to save push token' }, { status: 500 });
  }
  if (!saved) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, registered: true });
}
