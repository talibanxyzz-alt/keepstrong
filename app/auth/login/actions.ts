'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getRequestOrigin } from '@/lib/auth/request-origin';
import { createClient } from '@/lib/supabase/server';

export type LoginActionState = { error: string | null };

export type ResendConfirmationState = { ok: string | null; error: string | null };

/** Resend signup confirmation email (same redirect as signUp). */
export async function resendSignupConfirmationAction(
  _prev: ResendConfirmationState,
  formData: FormData
): Promise<ResendConfirmationState> {
  const email = String(formData.get('resend_email') ?? '').trim();
  if (!email) {
    return { ok: null, error: 'Enter the email you used to sign up.' };
  }

  const supabase = await createClient();
  const origin = await getRequestOrigin();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { ok: null, error: error.message };
  }

  return {
    ok: 'If that email is registered and not confirmed yet, we sent a new link. Check spam — it can take a minute.',
    error: null,
  };
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
