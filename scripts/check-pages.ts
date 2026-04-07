/**
 * Creates a test account, signs in, then hits every protected page
 * and reports status codes + any error output.
 *
 * Loads secrets from `.env.local` — never commit keys into this file.
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.CHECK_PAGES_BASE_URL ?? 'http://localhost:3001';

const TEST_EMAIL = 'test-audit@keepstrong.dev';
const TEST_PASSWORD = 'TestPass123!';

function projectRefFromSupabaseUrl(url: string): string {
  const host = new URL(url).hostname;
  const m = /^([^.]+)\.supabase\.co$/i.exec(host);
  if (!m) throw new Error(`Could not parse project ref from ${url}`);
  return m[1];
}

const PAGES = [
  '/dashboard',
  '/workouts',
  '/workouts/programs',
  '/workouts/history',
  '/workouts/active',
  '/progress',
  '/photos',
  '/dose-calendar',
  '/achievements',
  '/settings',
  '/pricing',
];

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    console.error(
      'Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local).'
    );
    process.exit(1);
  }

  const PROJECT_REF = projectRefFromSupabaseUrl(SUPABASE_URL);

  // 1. Create test user via admin API (bypasses email confirmation)
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Creating test user...');
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (createErr && !createErr.message.includes('already been registered')) {
    console.error('Failed to create user:', createErr.message);
    process.exit(1);
  }

  const userId = created?.user?.id;
  if (userId) {
    // Seed a minimal profile so onboarding doesn't redirect
    await admin.from('profiles').upsert({
      id: userId,
      full_name: 'Test User',
      weight_kg: 80,
      height_cm: 175,
      protein_target_g: 140,
      onboarding_completed: true,
      plan: 'free',
    });
    console.log('Profile seeded for user:', userId);
  }

  // 2. Sign in with the regular anon client to get a session
  console.log('Signing in...');
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signInErr || !signIn.session) {
    console.error('Sign-in failed:', signInErr?.message);
    process.exit(1);
  }

  const { access_token, refresh_token } = signIn.session;
  console.log('Signed in successfully.\n');

  // 3. Build the cookie string that @supabase/ssr expects
  // The cookie is chunked: sb-{ref}-auth-token.0, sb-{ref}-auth-token.1, ...
  // For a simple check we can set the access token directly via the auth header
  // instead — but Next.js SSR reads cookies, not headers.
  // Easiest approach: set the full session JSON as the cookie value.
  const sessionJson = JSON.stringify({
    access_token,
    refresh_token,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: signIn.session.expires_at,
    user: signIn.session.user,
  });

  // @supabase/ssr chunks cookies > 3180 chars
  const CHUNK_SIZE = 3180;
  const chunks: string[] = [];
  for (let i = 0; i < sessionJson.length; i += CHUNK_SIZE) {
    chunks.push(sessionJson.slice(i, i + CHUNK_SIZE));
  }

  const cookieHeader = chunks.length === 1
    ? `sb-${PROJECT_REF}-auth-token=${encodeURIComponent(chunks[0])}`
    : chunks.map((c, i) => `sb-${PROJECT_REF}-auth-token.${i}=${encodeURIComponent(c)}`).join('; ');

  // 4. Hit every page
  console.log('Checking pages:\n');
  const results: { path: string; status: number; note: string }[] = [];

  for (const path of PAGES) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Cookie: cookieHeader },
      redirect: 'manual',
    });

    let note = '';
    if (res.status === 307 || res.status === 302) {
      note = `→ ${res.headers.get('location')}`;
    } else if (res.status === 500) {
      note = 'SERVER ERROR';
    } else if (res.status === 200) {
      const text = await res.text();
      if (text.includes('Application error') || text.includes('An error occurred')) {
        note = 'RUNTIME ERROR in page';
      } else if (text.includes('__NEXT_DATA__')) {
        note = 'OK';
      } else {
        note = 'OK';
      }
    }

    results.push({ path, status: res.status, note });
    console.log(`  ${res.status}  ${path.padEnd(30)} ${note}`);
  }

  console.log('\nDone.');
}

main().catch(console.error);
