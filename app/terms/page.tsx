import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Terms of Service | KeepStrong" };

const LAST_UPDATED = "March 30, 2025";

const MEDICAL_DISCLAIMER =
  "KeepStrong is a lifestyle fitness companion — not a medical device or clinical tool. Protein targets are algorithmic estimates based on general fitness guidelines, not prescriptions. Workout programs are general fitness recommendations. Always consult your physician before beginning a new exercise program or making changes to your GLP-1 medication routine.";

export default function TermsPage() {
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
          <h1 className="mb-2 text-2xl font-bold text-charcoal sm:text-3xl">Terms of Service</h1>
          <p className="mb-6 text-sm text-slate">Last updated: {LAST_UPDATED}</p>

          <nav
            aria-label="Table of contents"
            className="mb-8 rounded-lg border border-line bg-cloud/50 p-4 text-sm"
          >
            <p className="mb-2 font-semibold text-charcoal">Table of contents</p>
            <ul className="space-y-1 text-primary">
              <li>
                <a href="#what-keepstrong-is" className="hover:underline">
                  What KeepStrong is
                </a>
              </li>
              <li>
                <a href="#medical-disclaimer" className="hover:underline">
                  Medical disclaimer
                </a>
              </li>
              <li>
                <a href="#eligibility" className="hover:underline">
                  Eligibility
                </a>
              </li>
              <li>
                <a href="#accounts" className="hover:underline">
                  Accounts and security
                </a>
              </li>
              <li>
                <a href="#subscriptions" className="hover:underline">
                  Subscriptions and billing
                </a>
              </li>
              <li>
                <a href="#prohibited" className="hover:underline">
                  Prohibited use
                </a>
              </li>
              <li>
                <a href="#ip" className="hover:underline">
                  Intellectual property
                </a>
              </li>
              <li>
                <a href="#liability" className="hover:underline">
                  Limitation of liability
                </a>
              </li>
              <li>
                <a href="#governing-law" className="hover:underline">
                  Governing law
                </a>
              </li>
              <li>
                <a href="#contact-legal" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="prose prose-gray max-w-none text-charcoal prose-headings:text-charcoal prose-p:text-slate prose-li:text-slate prose-a:text-primary">
            <h2 id="what-keepstrong-is" className="scroll-mt-24 text-xl font-semibold">
              What KeepStrong is
            </h2>
            <p>
              KeepStrong is a <strong>lifestyle fitness companion</strong> for adults using GLP-1 medications.
              It is <strong>not</strong> a medical device, <strong>not</strong> a clinical tool, and{" "}
              <strong>not</strong> a substitute for professional medical advice.
            </p>

            <h2 id="medical-disclaimer" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Medical disclaimer
            </h2>
            <p>{MEDICAL_DISCLAIMER}</p>

            <h2 id="eligibility" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Eligibility
            </h2>
            <p>
              You must be <strong>18 or older</strong> to use KeepStrong. By using the app, you confirm you are
              under the supervision of a <strong>licensed physician</strong> for your GLP-1 medication use.
            </p>

            <h2 id="accounts" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Accounts and security
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials. Do not share
              your account. Notify us immediately at{" "}
              <a href="mailto:legal@keepstrong.app" className="font-medium underline">
                legal@keepstrong.app
              </a>{" "}
              if you suspect unauthorized access.
            </p>

            <h2 id="subscriptions" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Subscriptions and billing
            </h2>
            <p>
              Subscriptions are billed through <strong>Stripe</strong>. You can cancel or manage your
              subscription at any time from{" "}
              <Link href="/settings" className="font-medium underline hover:no-underline">
                Settings
              </Link>{" "}
              → Manage Subscription (customer portal). Cancellation takes effect at the end of the current
              billing period. We do not offer refunds for partially used billing periods, except where required
              by law.
            </p>

            <h2 id="prohibited" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Prohibited use
            </h2>
            <p>You may not:</p>
            <ul>
              <li>Reverse engineer the app except as permitted by applicable law;</li>
              <li>Share your account or misuse another person&apos;s account;</li>
              <li>Use the app to make clinical medical decisions;</li>
              <li>Use any output from the app to advise others medically;</li>
              <li>Use the service in violation of applicable law.</li>
            </ul>

            <h2 id="ip" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Intellectual property
            </h2>
            <p>
              All content, code, branding, and design in KeepStrong is our intellectual property (or that of
              our licensors). <strong>Your personal data remains yours.</strong>
            </p>

            <h2 id="liability" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Limitation of liability
            </h2>
            <p>
              KeepStrong is <strong>not liable</strong> for health outcomes, medication decisions, or injuries
              arising from use of the app, to the fullest extent permitted by law. Use the app as a fitness
              tracking tool only, in conjunction with professional medical supervision.
            </p>

            <h2 id="governing-law" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Governing law
            </h2>
            <p>
              These Terms are governed by the laws of the <strong>United States</strong>. Disputes will be
              resolved in the jurisdiction of our registered place of business, except where mandatory consumer
              protections in your jurisdiction require otherwise.
            </p>

            <h2 id="contact-legal" className="scroll-mt-24 mt-10 text-xl font-semibold">
              Contact
            </h2>
            <p>
              Email:{" "}
              <a href="mailto:legal@keepstrong.app" className="font-medium underline">
                legal@keepstrong.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
