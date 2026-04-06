/**
 * Creates a test account, signs in, then hits every protected page
 * and reports status codes + any error output.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uvsrptflpaqrzddhnhwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2c3JwdGZscGFxcnpkZGhuaHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzM1NjYsImV4cCI6MjA4ODc0OTU2Nn0.9kA-RM527sStQW8744ELWDvdK20aQMB1B4X6SIns_xk';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2c3JwdGZscGFxcnpkZGhuaHd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE3MzU2NiwiZXhwIjoyMDg4NzQ5NTY2fQ.nR0Nwswe0bGA_VgO_Pf5Cj-xkQMUM1nEkY064olBmaw';
const BASE_URL = 'http://localhost:3001';

const TEST_EMAIL = 'test-audit@keepstrong.dev';
const TEST_PASSWORD = 'TestPass123!';

const PROJECT_REF = 'uvsrptflpaqrzddhnhwz';

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
