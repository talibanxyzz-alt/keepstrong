'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { 
  Activity, 
  ArrowRight, 
  Target, 
  Dumbbell, 
  TrendingUp, 
  Check, 
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Do I need to be on a GLP-1 medication to use this?',
      answer: 'No! While our program is optimized for people taking GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound), anyone looking to lose fat while preserving muscle can benefit from our science-backed approach.',
    },
    {
      question: 'Will this really help me keep my muscle?',
      answer: 'Yes. Research shows that adequate protein intake (1.2-1.6g per kg of body weight) combined with resistance training can preserve up to 90% of muscle mass during weight loss. Our program ensures you hit these targets consistently.',
    },
    {
      question: 'I\'ve never worked out before. Is this for me?',
      answer: 'Absolutely! We have beginner-friendly workout programs that start with basic movements and gradually progress. All exercises include instructions, and you can start with bodyweight or light weights.',
    },
    {
      question: 'How much time do I need per day?',
      answer: 'Protein tracking takes 2-3 minutes per meal (30 seconds with quick-add). Workouts are 30-45 minutes, 3x per week. That\'s it. You can maintain muscle without living in the gym.',
    },
    {
      question: 'What if I miss days or fall off track?',
      answer: 'Life happens! Our app makes it easy to get back on track. You can view your weekly average, so missing a day doesn\'t derail your progress. Consistency over perfection is what matters.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, absolutely. Cancel your subscription anytime from your settings page. No questions asked, no fees. We also offer a 7-day money-back guarantee if you\'re not satisfied.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="border-b border-line/60 bg-surface/80 backdrop-blur-sm fixed w-full z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <Logo size={32} showText={false} />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="hidden sm:inline-block text-sm font-medium text-slate hover:text-primary transition"
              >
                Pricing
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate hover:text-primary transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Before/After Image */}
            <div className="order-2 lg:order-1">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/hero-transformation.jpg"
                  alt="Fitness transformation result"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface/90 backdrop-blur rounded-xl p-4 shadow-lg">
                        <p className="text-xs font-semibold text-slate mb-1">Before</p>
                        <p className="text-lg font-bold text-charcoal">185 lbs</p>
                      </div>
                      <div className="bg-success/90 backdrop-blur rounded-xl p-4 shadow-lg">
                        <p className="text-xs font-semibold text-white mb-1">After</p>
                        <p className="text-lg font-bold text-white">155 lbs</p>
                        <p className="text-xs font-bold text-white">95% Muscle</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white text-center">Sarah J. - 6 months on Ozempic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal mb-6 leading-tight">
                Don't Lose <span className="text-primary">Muscle</span> on Ozempic
              </h1>
              <p className="text-xl md:text-2xl text-slate mb-8 leading-relaxed">
                Science-backed program to stay strong while you lose weight
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl hover:bg-primary/90 hover:scale-105 transition-all mb-6"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-slate flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                Join <span className="font-bold text-charcoal">2,847 people</span> preserving muscle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-surface to-cloud">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12 bg-surface rounded-2xl p-8 shadow-lg">
            <p className="text-2xl md:text-3xl text-charcoal italic mb-4">
              "I lost 40 pounds on Wegovy, but I was shocked to learn that <span className="font-bold text-warning">15 pounds was muscle</span>. I wish I knew about KeepStrong sooner."
            </p>
            <p className="text-slate font-semibold">— Jennifer M., Wegovy user</p>
          </div>

          <div className="mb-8">
            <p className="text-6xl md:text-7xl font-bold text-charcoal mb-4 font-mono">
              40-60<span className="text-warning">%</span>
            </p>
            <p className="text-xl md:text-2xl text-slate">
              of weight loss on GLP-1 medications can be muscle, not fat
            </p>
          </div>

          <Link
            href="#solution"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-8 py-4 text-lg font-semibold text-primary hover:bg-primary hover:text-white transition-all"
          >
            Learn How to Prevent This
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-16 md:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              The Solution is Simple
            </h2>
            <p className="text-xl text-slate">
              Three science-backed strategies to preserve muscle while losing fat
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border-2 border-line/60 bg-gradient-to-b from-surface to-cloud overflow-hidden hover:shadow-xl transition-all flex flex-col">
              <div className="relative h-52 flex-shrink-0 overflow-hidden group">
                <Image
                  src="/images/healthy-meal.jpg"
                  alt="Healthy protein meal"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                  <Target className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal mb-4">Track Protein</h3>
                <p className="text-slate leading-relaxed">
                  Hit your daily protein target (1.4g per kg) to signal your body to preserve muscle. Our quick-add makes logging meals effortless.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border-2 border-line/60 bg-gradient-to-b from-surface to-cloud overflow-hidden hover:shadow-xl transition-all flex flex-col">
              <div className="relative h-52 flex-shrink-0 overflow-hidden group">
                <Image
                  src="/images/workout-gym.jpg"
                  alt="Person working out at gym"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal mb-4">Train Smart</h3>
                <p className="text-slate leading-relaxed">
                  Follow proven workout programs 3x per week. Resistance training tells your body: "Keep the muscle, lose the fat."
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border-2 border-line/60 bg-gradient-to-b from-surface to-cloud overflow-hidden hover:shadow-xl transition-all flex flex-col">
              <div className="relative h-52 flex-shrink-0 overflow-hidden group">
                <Image
                  src="/images/progress-chart.jpg"
                  alt="Progress tracking chart"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10">
                  <TrendingUp className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal mb-4">Monitor Progress</h3>
                <p className="text-slate leading-relaxed">
                  Track weight, strength, and photos to see the difference. Watch the scale go down while your strength goes up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-cloud">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate">
              Get started in under 5 minutes
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
                1
              </div>
              <div className="flex-1 bg-surface rounded-xl p-6 shadow-md">
                <h3 className="text-2xl font-bold text-charcoal mb-2">Enter Your Stats</h3>
                <p className="text-slate">
                  Tell us your weight, height, and which GLP-1 medication you're on. We'll calculate your personalized protein target.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
                2
              </div>
              <div className="flex-1 bg-surface rounded-xl p-6 shadow-md">
                <h3 className="text-2xl font-bold text-charcoal mb-2">Track Daily Protein</h3>
                <p className="text-slate">
                  Log your meals with our quick-add buttons (30 seconds per meal). See your progress bar fill up as you hit your target.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
                3
              </div>
              <div className="flex-1 bg-surface rounded-xl p-6 shadow-md">
                <h3 className="text-2xl font-bold text-charcoal mb-2">Follow Workout Program</h3>
                <p className="text-slate">
                  Complete 3 workouts per week (30-45 min each). Track your sets, reps, and weights. Watch your strength increase.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-3xl font-bold text-charcoal">That's it. <span className="text-primary">Simple.</span></p>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Real Results from Real People
            </h2>
            <p className="text-xl text-slate">
              See how KeepStrong users preserved muscle while losing weight
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="bg-cloud rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src="/images/transformation-1.jpg"
                  alt="Michael R."
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <span className="bg-surface/90 text-charcoal text-xs font-bold px-2.5 py-1 rounded-full">- 35 lbs</span>
                  <span className="bg-success text-white text-xs font-bold px-2.5 py-1 rounded-full">92% muscle kept</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-sm text-slate italic flex-1">
                  "I was terrified of losing muscle. KeepStrong gave me a plan I could actually follow. 4 months later — down 35 lbs, stronger than before."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">M</div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Michael R.</p>
                    <p className="text-xs text-slate">Ozempic • 4 months</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-cloud rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src="/images/transformation-2.jpg"
                  alt="Lisa K."
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <span className="bg-surface/90 text-charcoal text-xs font-bold px-2.5 py-1 rounded-full">- 42 lbs</span>
                  <span className="bg-success text-white text-xs font-bold px-2.5 py-1 rounded-full">89% muscle kept</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-sm text-slate italic flex-1">
                  "The protein tracking is so quick — 30 seconds per meal. Combined with the workouts, I look and feel completely different at 42 lbs lighter."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white text-xs font-bold flex-shrink-0">L</div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Lisa K.</p>
                    <p className="text-xs text-slate">Wegovy • 5 months</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-cloud rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src="/images/transformation-3.jpg"
                  alt="David T."
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <span className="bg-surface/90 text-charcoal text-xs font-bold px-2.5 py-1 rounded-full">- 28 lbs</span>
                  <span className="bg-success text-white text-xs font-bold px-2.5 py-1 rounded-full">95% muscle kept</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-sm text-slate italic flex-1">
                  "Never worked out before starting Mounjaro. The beginner program was perfect. My doctor was impressed by my bloodwork — muscle mass nearly identical."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center text-white text-xs font-bold flex-shrink-0">D</div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">David T.</p>
                    <p className="text-xs text-slate">Mounjaro • 3 months</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-cloud rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src="/images/transformation-4.jpg"
                  alt="Amanda S."
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                  <span className="bg-surface/90 text-charcoal text-xs font-bold px-2.5 py-1 rounded-full">- 50 lbs</span>
                  <span className="bg-success text-white text-xs font-bold px-2.5 py-1 rounded-full">88% muscle kept</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-sm text-slate italic flex-1">
                  "The dose-day calendar is genius. On hard side-effect days I just did the protein — no pressure. Six months in and I'm the strongest I've ever been."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Amanda S.</p>
                    <p className="text-xs text-slate">Zepbound • 6 months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-cloud to-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Simple Pricing
            </h2>
            <p className="text-xl text-slate">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="bg-surface rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-primary/20">
            <div className="text-center mb-8">
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                MOST POPULAR
              </div>
              <h3 className="text-3xl font-bold text-charcoal mb-2">Core Plan</h3>
              <div className="mb-4">
                <span className="text-6xl font-bold text-charcoal font-mono">$19</span>
                <span className="text-2xl text-slate">/month</span>
              </div>
              <p className="text-slate">7-day free trial • Cancel anytime</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 text-success flex-shrink-0" />
                <span className="text-slate">Unlimited protein tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 text-success flex-shrink-0" />
                <span className="text-slate">All 3 workout programs (Beginner to Advanced)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 text-success flex-shrink-0" />
                <span className="text-slate">Progress photos & weight tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 text-success flex-shrink-0" />
                <span className="text-slate">Advanced analytics & weekly reports</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 text-success flex-shrink-0" />
                <span className="text-slate">Export your data anytime</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 text-success flex-shrink-0" />
                <span className="text-slate">Priority support</span>
              </li>
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full text-center rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white hover:bg-primary/90 hover:scale-105 transition-all shadow-lg"
            >
              Start Free Trial
            </Link>

            <p className="text-center text-sm text-slate mt-6">
              No credit card required for trial
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-cloud rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-cloud transition"
                >
                  <span className="text-lg font-semibold text-charcoal pr-4">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="h-6 w-6 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-slate flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-sky-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Stay Strong While You Lose Weight
          </h2>
          <p className="text-xl md:text-2xl text-sky-100 mb-8">
            Join 2,847 people preserving muscle on their GLP-1 journey
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-surface px-10 py-5 text-xl font-bold text-primary hover:scale-105 transition-all shadow-2xl"
          >
            Start Free Trial
            <ArrowRight className="h-6 w-6" />
          </Link>
          <p className="text-sky-100 mt-6">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4">
                <Logo size={32} showText={false} />
              </div>
              <p className="text-slate mb-4">
                Science-backed muscle preservation program for people on GLP-1 medications.
              </p>
              <p className="text-sm text-slate">
                © 2026 KeepStrong. Your data is private and secure.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-charcoal mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/pricing" className="text-slate hover:text-primary transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-slate hover:text-primary transition">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-slate hover:text-primary transition">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-charcoal mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate hover:text-primary transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate hover:text-primary transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate hover:text-primary transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

