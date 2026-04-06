'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export type SignupActionState = { error: string | null; info: string | null };

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Enter your email and password.', info: null };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.', info: null };
  }

  if (!/\d/.test(password)) {
    return { error: 'Password must include at least one number.', info: null };
  }

  const gdpr = formData.get('gdpr_consent');
  if (gdpr !== 'on') {
    return {
      error:
        'Please accept the Privacy Policy and Terms, and consent to storing your fitness and health data.',
      info: null,
    };
  }

  const supabase = await createClient();
  const origin = await requestOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, info: null };
  }

  if (data.user) {
    const admin = createAdminClient();
    const consentAt = new Date().toISOString();
    const { error: profileUpdateError } = await admin
      .from('profiles')
      .update({
        gdpr_consent: true,
        gdpr_consent_at: consentAt,
      })
      .eq('id', data.user.id);

    if (profileUpdateError) {
      return {
        error:
          'Account was created but we could not save your consent preferences. Please contact support.',
        info: null,
      };
    }
  }

  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/onboarding');
  }

  return {
    error: null,
    info: 'Check your email for a confirmation link before signing in.',
  };
}
