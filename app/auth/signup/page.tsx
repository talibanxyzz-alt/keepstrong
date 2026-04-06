'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { signupAction, type SignupActionState } from './actions';

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'At least one number', test: (p: string) => /\d/.test(p) },
];

const initialSignupState: SignupActionState = { error: null, info: null };

function SignupSubmitButton({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || !canSubmit}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating account…
        </>
      ) : (
        'Create account'
      )}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signupAction, initialSignupState);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);

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
            Create your account
          </h1>
          <p className="mb-8 text-center text-sm text-slate">
            Start tracking protein and preserving muscle — free forever
          </p>

          <form action={formAction} className="space-y-4">
            {gdprAccepted ? <input type="hidden" name="gdpr_consent" value="on" /> : null}
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
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-charcoal"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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

              {password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {PASSWORD_REQUIREMENTS.map((req) => (
                    <li
                      key={req.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        req.test(password) ? 'text-success' : 'text-slate/60'
                      }`}
                    >
                      <Check className="h-3 w-3 flex-shrink-0" />
                      {req.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="gdpr-consent"
                checked={gdprAccepted}
                onChange={(e) => setGdprAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-primary accent-black focus:ring-2 focus:ring-primary/20"
              />
              <label htmlFor="gdpr-consent" className="text-sm leading-relaxed text-gray-600">
                I agree to the{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 underline hover:text-black"
                >
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 underline hover:text-black"
                >
                  Terms of Service
                </a>
                , and I consent to KeepStrong storing my fitness and health data to provide the
                app&apos;s features.
              </label>
            </div>

            {state.error && (
              <p className="rounded-lg bg-danger-muted px-4 py-3 text-sm text-danger">
                {state.error}
              </p>
            )}

            {state.info && (
              <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-charcoal">
                {state.info}
              </p>
            )}

            <SignupSubmitButton canSubmit={gdprAccepted} />
          </form>

          <p className="mt-6 text-center text-sm text-slate">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
