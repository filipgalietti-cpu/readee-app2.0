import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="-mx-6 -mt-8">
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
                Every child can become a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                  confident reader
                </span>
              </h1>
              <p className="text-lg text-zinc-600 leading-relaxed">
                Readee uses the Science of Reading to build a personalized lesson
                path for your child. Systematic phonics, engaging practice, and
                real stories — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-2">
                <Link
                  href="/signup"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 rounded-2xl border border-zinc-200 text-zinc-700 font-semibold text-lg hover:bg-zinc-50 transition-all"
                >
                  Learn More
                </Link>
              </div>
              <p className="text-sm text-zinc-400">
                No credit card required. Free plan available.
              </p>
            </div>

            {/* Dashboard Mockup */}
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    B
                  </div>
                  <div>
                    <div className="text-white font-bold">Bobby</div>
                    <div className="text-indigo-200 text-sm">Pre-K Level</div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-500">
                    Reading Level
                  </span>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                    Pre-K
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-zinc-500">Progress</span>
                    <span className="text-zinc-700 font-medium">
                      Just getting started!
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100">
                    <div className="w-1/12 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                  </div>
                </div>
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-center">
                  <div className="text-sm font-semibold text-indigo-900 mb-1">
                    Start Reading Assessment
                  </div>
                  <div className="text-xs text-indigo-600">
                    Take a quick quiz to find Bobby&apos;s reading level
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-8 bg-zinc-50/50 border-y border-zinc-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "Pre-K – 3rd", label: "Grade levels supported" },
              { value: "10 min", label: "Average lesson time" },
              { value: "3 skills", label: "Per lesson" },
              { value: "Free", label: "Plan available" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl md:text-2xl font-bold text-indigo-700">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 text-center tracking-tight mb-12">
            How Readee Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: "🎯",
                title: "Take the Assessment",
                desc: "A quick 10-question quiz finds your child\u2019s reading level \u2014 from Pre-K to 3rd grade.",
              },
              {
                step: "2",
                icon: "📚",
                title: "Follow the Lesson Path",
                desc: "Personalized lessons with three sections: Learn new skills, Practice with questions, and Read real stories.",
              },
              {
                step: "3",
                icon: "📈",
                title: "Watch Them Grow",
                desc: "Track XP, completed lessons, and reading level progress. Celebrate every milestone together.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 mx-auto flex items-center justify-center text-3xl shadow-sm">
                  {item.icon}
                </div>
                <h3 className="font-bold text-zinc-900">{item.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Science of Reading */}
      <section className="px-6 py-16 bg-zinc-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight mb-4">
              Built on the Science of Reading
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-6">
              Research shows that systematic, explicit instruction in phonics and
              phonemic awareness is the most effective way to teach children to
              read. Readee puts this research into practice with structured
              lessons that build real reading skills — not just guessing from
              pictures.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "Systematic Phonics",
                "Phonemic Awareness",
                "Fluency",
                "Vocabulary",
                "Comprehension",
              ].map((pillar) => (
                <span
                  key={pillar}
                  className="px-4 py-2 rounded-full bg-white border border-indigo-200 text-sm font-medium text-indigo-700"
                >
                  {pillar}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 text-center tracking-tight mb-12">
            Built for Young Readers
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🎒", label: "Pre-K to 3rd Grade" },
              { icon: "💪", label: "Struggling Readers" },
              { icon: "📖", label: "Extra Practice" },
              { icon: "🏠", label: "Homeschool Families" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-zinc-200 bg-white p-5 text-center"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-semibold text-zinc-700">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16 bg-zinc-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-zinc-500 mt-2">
              Start free, upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free tier */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Free</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-zinc-900">$0</span>
                  <span className="text-zinc-500 text-sm ml-1">forever</span>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Diagnostic reading assessment",
                  "First 2 lessons per level",
                  "1 child profile",
                  "Basic progress tracking",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-zinc-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl border-2 border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Readee+ tier */}
            <div className="rounded-2xl border-2 border-indigo-300 bg-white p-8 space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-xs font-bold">
                  Most Popular
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Readee+</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-zinc-900">
                    $9.99
                  </span>
                  <span className="text-zinc-500 text-sm ml-1">/month</span>
                </div>
                <div className="mt-1">
                  <span className="text-sm text-indigo-600 font-semibold">
                    or $99/year
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                    Best Value — Save $20
                  </span>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Full lesson library (25+ lessons)",
                  "Unlimited assessments",
                  "Up to 5 child profiles",
                  "Detailed parent reports",
                  "Audio narration (coming soon)",
                  "Cancel anytime",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-zinc-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 text-center tracking-tight mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "What ages is Readee for?",
                a: "Readee is designed for children ages 4\u20139, from Pre-K through 3rd grade. Our lessons follow a research-based progression that meets kids wherever they are in their reading journey.",
              },
              {
                q: "How does the reading assessment work?",
                a: "Your child takes a quick 10-question quiz that covers letter recognition, phonics, and reading comprehension. Based on the results, Readee places them at the right level and builds a personalized lesson path.",
              },
              {
                q: "Do I need to set up an account?",
                a: "Yes, setup takes 2 minutes. You\u2019ll answer a few questions about your child, they\u2019ll take a quick reading quiz, and we\u2019ll build their personalized lesson path.",
              },
              {
                q: "Is Readee really free?",
                a: "Yes! The free plan includes the diagnostic assessment, the first 2 lessons at every level, and basic progress tracking. Upgrade to Readee+ for the full lesson library, detailed reports, and more.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-zinc-200 bg-white p-6"
              >
                <h3 className="font-bold text-zinc-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Early Access */}
      <section className="px-6 py-16 bg-gradient-to-br from-indigo-600 to-violet-600">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Join Our Early Access
          </h2>
          <p className="text-indigo-200">
            Be among the first families to try Readee. Sign up for early access
            and get a free diagnostic reading assessment.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg"
            >
              Join Waitlist
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
