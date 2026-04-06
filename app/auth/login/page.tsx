'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { loginAction, type LoginActionState } from './actions';

const initialLoginState: LoginActionState = { error: null };

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

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialLoginState);
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
              <p className="rounded-lg bg-danger-muted px-4 py-3 text-sm text-danger">
                {state.error}
              </p>
            )}

            <LoginSubmitButton />
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
