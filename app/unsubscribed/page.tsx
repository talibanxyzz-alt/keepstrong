import Link from "next/link";

export const metadata = { title: "Email preferences | KeepStrong" };

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const ok = params.success === "true";
  const err = params.error === "true";

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        {ok && (
          <>
            <h1 className="text-xl font-bold text-charcoal mb-2">You&apos;re unsubscribed</h1>
            <p className="text-sm text-slate leading-relaxed">
              We won&apos;t send you product or marketing emails anymore. You can still use KeepStrong
              as usual.
            </p>
          </>
        )}
        {err && (
          <>
            <h1 className="text-xl font-bold text-charcoal mb-2">Something went wrong</h1>
            <p className="text-sm text-slate">
              We couldn&apos;t update your preferences. Try again from a link in a recent email.
            </p>
          </>
        )}
        {!ok && !err && (
          <>
            <h1 className="text-xl font-bold text-charcoal mb-2">Email preferences</h1>
            <p className="text-sm text-slate">Use the link from your email to confirm changes.</p>
          </>
        )}
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          Back to KeepStrong
        </Link>
      </div>
    </div>
  );
}
