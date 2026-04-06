/**
 * E2E cleanup helpers.
 *
 * Functions exported:
 *   cleanupTestUser    – deletes all app data AND the auth user
 *   resetTestUserData  – deletes all app data but keeps the auth user
 *
 * Both functions accept an email address OR a Supabase user UUID.
 * The test files pass email strings, so email lookup is handled automatically.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Internal: build the admin Supabase client
// ---------------------------------------------------------------------------

function getAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Cleanup helpers require NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Internal: resolve an email address or UUID to a Supabase user ID
// ---------------------------------------------------------------------------

async function resolveUserId(
  adminClient: SupabaseClient,
  emailOrId: string
): Promise<string | null> {
  // If it looks like a UUID, use it directly
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(emailOrId)) {
    return emailOrId;
  }

  // Otherwise treat as email and look up the user
  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    console.warn(`[cleanup] Could not list users: ${error.message}`);
    return null;
  }

  const user = data.users.find((u) => u.email === emailOrId);
  return user?.id ?? null;
}

// ---------------------------------------------------------------------------
// Internal: delete all app-level rows for a given user ID
// ---------------------------------------------------------------------------

const APP_TABLES = [
  'protein_logs',
  'weight_logs',
  'workout_sessions',
  'food_tolerance_votes',
  'dose_schedules',
  'user_achievements',
  'meal_rating_prompts',
  'profiles',
] as const;

async function deleteAppData(
  adminClient: SupabaseClient,
  userId: string
): Promise<void> {
  for (const table of APP_TABLES) {
    const isProfiles = table === 'profiles';
    const { error } = await adminClient
      .from(table)
      .delete()
      .eq(isProfiles ? 'id' : 'user_id', userId);

    if (error) {
      console.warn(`[cleanup] Could not delete from ${table} for ${userId}: ${error.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// cleanupTestUser
// ---------------------------------------------------------------------------

/**
 * Deletes all application data for the user, then hard-deletes the auth account.
 *
 * Accepts an email address (as used by the test files) or a Supabase UUID.
 */
export async function cleanupTestUser(emailOrId: string): Promise<void> {
  if (!emailOrId) return;

  let adminClient: SupabaseClient;
  try {
    adminClient = getAdminClient();
  } catch {
    // If env vars are absent (e.g. running locally without service key), skip.
    console.warn('[cleanup] Skipping cleanupTestUser — admin client unavailable.');
    return;
  }

  const userId = await resolveUserId(adminClient, emailOrId);
  if (!userId) {
    console.warn(`[cleanup] Could not resolve user for "${emailOrId}" — nothing to clean up.`);
    return;
  }

  // 1. Delete app data
  await deleteAppData(adminClient, userId);

  // 2. Delete the auth user
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
    console.warn(`[cleanup] Could not delete auth user ${userId}: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// resetTestUserData
// ---------------------------------------------------------------------------

/**
 * Deletes all application data for the user but keeps the auth account intact.
 * Useful for tests that need a clean slate without re-creating the login.
 *
 * Accepts an email address or a Supabase UUID.
 */
export async function resetTestUserData(emailOrId: string): Promise<void> {
  if (!emailOrId) return;

  let adminClient: SupabaseClient;
  try {
    adminClient = getAdminClient();
  } catch {
    console.warn('[cleanup] Skipping resetTestUserData — admin client unavailable.');
    return;
  }

  const userId = await resolveUserId(adminClient, emailOrId);
  if (!userId) {
    console.warn(`[cleanup] Could not resolve user for "${emailOrId}" — nothing to reset.`);
    return;
  }

  await deleteAppData(adminClient, userId);
}
