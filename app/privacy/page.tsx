import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Privacy Policy | KeepStrong" };

const LAST_UPDATED = "March 30, 2025";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cloud px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate hover:text-charcoal"
        >
          <ChevronLeft className="h-4 w-4" /> Home
        </Link>

        <div className="max-w-none rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="mb-2 text-2xl font-bold text-charcoal sm:text-3xl">Privacy Policy</h1>
          <p className="mb-6 text-sm text-slate">Last updated: {LAST_UPDATED}</p>

          <nav
            aria-label="Table of contents"
            className="mb-8 rounded-lg border border-line bg-cloud/50 p-4 text-sm"
          >
            <p className="mb-2 font-semibold text-charcoal">Table of contents</p>
            <ul className="space-y-1 text-primary">
              <li>
                <a href="#what-we-collect" className="hover:underline">
                  What we collect
                </a>
              </li>
              <li>
                <a href="#how-its-stored" className="hover:underline">
                  How it&apos;s stored
                </a>
              </li>
              <li>
                <a href="#who-has-access" className="hover:underline">
                  Who has access
                </a>
              </li>
              <li>
                <a href="#your-rights" className="hover:underline">
                  Your rights
                </a>
              </li>
              <li>
                <a href="#data-retention" className="hover:underline">
                  Data retention
                </a>
              </li>
              <li>
                <a href="#cookies" className="hover:underline">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#gdpr" className="hover:underline">
                  GDPR (European users)
                </a>
              </li>
              <li>
                <a href="#ccpa" className="hover:underline">
                  CCPA (California users)
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-gray max-w-none text-charcoal prose-headings:text-charcoal prose-p:text-slate prose-li:text-slate prose-a:text-primary">
            <h2 id="what-we-collect" className="scroll-mt-24 text-xl font-semibold">
              What we collect
            </h2>
            <p>
              We collect the information you provide and the data generated when you use KeepStrong.
              This includes your <strong>name</strong> and <strong>email address</strong>; the{" "}
              <strong>date you complete onboarding</strong>; your <strong>daily protein target</strong>;{" "}
              <strong>weight logs</strong>; <strong>protein logs</strong> (foods and amounts);{" "}
              <strong>workout session history</strong> and <strong>exercise sets</strong>;{" "}
              <strong>progress photos</strong> you upload; <strong>GLP-1 medication name</strong> and{" "}
              <strong>dose frequency</strong> (and related schedule fields you choose to enter); and your{" "}
              <strong>subscription plan and status</strong> when you use paid features.
            </p>

            <h2 id="how-its-stored" className="scroll-mt-24 mt-10 text-xl font-semibold">
              How it&apos;s stored
            </h2>
            <p>
              All application data is stored in <strong>Supabase</strong> (PostgreSQL), hosted on{" "}
              <strong>AWS</strong> infrastructure. Data is <strong>encrypted in transit</strong> (TLS) and{" "}
              <strong>encrypted at rest</strong> as provided by our infrastructure and database providers.{" "}
              <strong>Progress photos</strong> are stored in <strong>private</strong> Supabase Storage buckets.
              They are not made publicly accessible; access in the app uses time-limited signed URLs for the
              authenticated account owner.
            </p>

            <h2 id="who-has-access" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Who has access
            </h2>
            <p>
              Only <strong>you</strong> can access your personal health and fitness data through your account.
              We <strong>do not sell, rent, or share</strong> personal data with third parties for marketing.
              We use trusted service providers (&quot;processors&quot;) who handle data only as needed to run
              the service:
            </p>
            <ul>
              <li>
                <strong>Supabase</strong> — database and file storage.
              </li>
              <li>
                <strong>Stripe</strong> — payment processing; we never see or store your full card details.
              </li>
              <li>
                <strong>Resend</strong> — delivering transactional and product emails.
              </li>
              <li>
                <strong>Sentry</strong> — error monitoring; we configure the SDK to reduce personally
                identifiable information before transmission.
              </li>
              <li>
                <strong>Vercel</strong> — hosting and privacy-oriented analytics.
              </li>
            </ul>

            <h2 id="your-rights" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Your rights
            </h2>
            <p>
              You can <strong>export</strong> your data as a CSV from{" "}
              <Link href="/settings" className="font-medium underline hover:no-underline">
                Settings
              </Link>
              . You can <strong>delete your account</strong> and associated data from{" "}
              <Link href="/settings" className="font-medium underline hover:no-underline">
                Settings
              </Link>{" "}
              (Danger Zone). Deletion is processed within <strong>30 days</strong>. You can update profile
              information in Settings at any time. To request a copy of your data or ask questions, email{" "}
              <a href="mailto:privacy@keepstrong.app" className="font-medium underline">
                privacy@keepstrong.app
              </a>
              .
            </p>

            <h2 id="data-retention" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Data retention
            </h2>
            <p>
              We retain your data while your account is <strong>active</strong>. When you delete your account,
              personal data is permanently removed within <strong>30 days</strong>, except where the law
              requires longer retention. We may retain <strong>anonymized, non-identifiable</strong> usage data
              for product analytics.
            </p>

            <h2 id="cookies" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Cookies
            </h2>
            <p>
              We use <strong>session cookies</strong> (and similar technologies) that are necessary for
              authentication. <strong>Vercel Analytics</strong> is privacy-first: it does not fingerprint users,
              does not set tracking cookies for advertising, and is designed to be compatible with common
              privacy expectations including GDPR.
            </p>

            <h2 id="gdpr" className="scroll-mt-24 mt-10 text-xl font-semibold">
              GDPR (European users)
            </h2>
            <p>
              Where the GDPR applies, our lawful basis for processing your data includes your{" "}
              <strong>explicit consent</strong> (for example, when you accept our policies and use health-related
              features). You have the right to <strong>access</strong>, <strong>correct</strong>,{" "}
              <strong>delete</strong>, and <strong>port</strong> your data. You may withdraw consent by deleting
              your account where processing is based on consent. You have the right to lodge a complaint with
              your local <strong>supervisory authority</strong>.
            </p>

            <h2 id="ccpa" className="scroll-mt-24 mt-10 text-xl font-semibold">
              CCPA (California users)
            </h2>
            <p>
              We do <strong>not sell</strong> personal information. California residents have the right to know
              what data we collect and to request deletion, subject to applicable exceptions.
            </p>

            <h2 id="contact" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Contact
            </h2>
            <p>
              Email:{" "}
              <a href="mailto:privacy@keepstrong.app" className="font-medium underline">
                privacy@keepstrong.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
