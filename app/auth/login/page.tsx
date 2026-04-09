'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import {
  loginAction,
  resendSignupConfirmationAction,
  type LoginActionState,
  type ResendConfirmationState,
} from './actions';

const initialLoginState: LoginActionState = { error: null };
const initialResendState: ResendConfirmationState = { ok: null, error: null };

function LoginSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in…
        </>
      ) : (
        'Sign in'
      )}
    </button>
  );
}

function ResendSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cloud/80 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending…
        </span>
      ) : (
        'Resend confirmation link'
      )}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialLoginState);
  const [resendState, resendAction] = useActionState(
    resendSignupConfirmationAction,
    initialResendState
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Logo size={40} textClassName="text-xl font-bold text-charcoal" />
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
          <h1 className="mb-2 text-center text-2xl font-bold text-charcoal">
            Welcome back
          </h1>
          <p className="mb-8 text-center text-sm text-slate">
            Sign in to continue your journey
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left text-xs leading-relaxed text-slate">
              <p className="font-semibold text-charcoal">Testing on your phone?</p>
              <p className="mt-1">
                Use your computer&apos;s <span className="font-medium text-charcoal">Wi‑Fi IP</span> (e.g.{' '}
                <code className="rounded bg-cloud px-1 py-0.5 font-mono text-[11px]">http://192.168.x.x:3000</code>
                ), not <code className="font-mono text-[11px]">localhost</code> — on the phone, localhost is the phone
                itself.
              </p>
              <p className="mt-2">
                In Supabase → Authentication → URL Configuration, add that same URL (and{' '}
                <code className="font-mono text-[11px]">…/auth/callback</code>) under Redirect URLs if you use email
                links or OAuth.
              </p>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-charcoal"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-charcoal placeholder:text-slate/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-charcoal"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 pr-11 text-charcoal placeholder:text-slate/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/60 hover:text-slate"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {state.error && (
              <div className="rounded-lg bg-danger-muted px-4 py-3 text-sm text-danger">
                <p>{state.error}</p>
                {(state.error.toLowerCase().includes('invalid login') ||
                  state.error.toLowerCase().includes('invalid credentials')) && (
                  <p className="mt-2 border-t border-danger/20 pt-2 text-xs leading-relaxed text-charcoal/85">
                    If you <strong>just signed up</strong>, open the <strong>confirmation link</strong> in your email
                    first, then sign in with the same password. Check spam or promotions folders.
                  </p>
                )}
              </div>
            )}

            <LoginSubmitButton />
          </form>

          <form action={resendAction} className="mt-8 space-y-3 border-t border-line/80 pt-6">
            <p className="text-sm font-medium text-charcoal">Didn&apos;t get the confirmation email?</p>
            <p className="text-xs leading-relaxed text-slate">
              Enter the same email you used at sign up. We&apos;ll send another link (check spam).
            </p>
            <input
              name="resend_email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-charcoal placeholder:text-slate/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <ResendSubmitButton />
            {resendState.ok ? (
              <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-charcoal" role="status">
                {resendState.ok}
              </p>
            ) : null}
            {resendState.error ? (
              <p className="rounded-lg bg-danger-muted px-3 py-2 text-sm text-danger">{resendState.error}</p>
            ) : null}
          </form>

          <p className="mt-6 text-center text-sm text-slate">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
