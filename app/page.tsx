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
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
            Every child can become a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
              confident reader
            </span>
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Readee uses the Science of Reading to build a personalized lesson
            path for your child. Systematic phonics, engaging practice, and real
            stories — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 rounded-2xl border border-zinc-200 text-zinc-700 font-semibold text-lg hover:bg-zinc-50 transition-all"
            >
              Learn More
            </Link>
          </div>
          <p className="text-sm text-zinc-400">
            No credit card required. Try Readee free for 7 days.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-zinc-50/50">
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
                desc: "A quick 10-question quiz finds your child's reading level — from Pre-K to 3rd grade.",
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
      <section className="px-6 py-16">
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
                Get Started
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
                  "Full lesson library (all levels)",
                  "Unlimited assessments",
                  "Up to 5 child profiles",
                  "Detailed parent reports",
                  "Audio narration",
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

      {/* Who It's For */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 text-center tracking-tight mb-12">
            Built for Young Readers
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: "🎒",
                label: "Pre-K to 3rd Grade",
              },
              {
                icon: "💪",
                label: "Struggling Readers",
              },
              {
                icon: "📖",
                label: "Extra Practice",
              },
              {
                icon: "🏠",
                label: "Homeschool Families",
              },
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

      {/* Bottom CTA */}
      <section className="px-6 py-16 bg-gradient-to-br from-indigo-600 to-violet-600">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Ready to help your child read with confidence?
          </h2>
          <p className="text-indigo-200">
            Start with a free assessment and see their personalized reading path
            in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
