import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Educators — Readee",
  description:
    "Bring the Science of Reading to your classroom with Readee. Structured phonics lessons for K through 4th grade.",
};

export default function TeachersPage() {
  return (
    <div className="max-w-4xl mx-auto pb-16 px-4">
      {/* Hero */}
      <div className="text-center py-16 space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 mx-auto flex items-center justify-center text-4xl">
          🏫
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
          Readee for Educators
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Bring structured, Science of Reading-based phonics instruction to your
          classroom. Readee gives every student a personalized reading path — so
          you can meet them where they are.
        </p>
      </div>

      {/* Why Readee in the Classroom */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Why Readee in the Classroom
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: "🎯",
              title: "Diagnostic Assessment",
              desc: "A quick 10-question quiz places each student at their reading level — no prep needed from you.",
            },
            {
              icon: "📋",
              title: "Personalized Lesson Paths",
              desc: "Every student follows a structured path matched to their level, from K through 4th grade skills.",
            },
            {
              icon: "📊",
              title: "Progress Tracking",
              desc: "See which students are progressing, who needs extra help, and what skills they've mastered.",
            },
            {
              icon: "🔬",
              title: "Research-Based",
              desc: "Built on systematic phonics, phonemic awareness, fluency, vocabulary, and comprehension — the five pillars of reading.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-white border border-indigo-100 p-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{item.icon}</span>
                <h3 className="font-semibold text-zinc-900 text-sm">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          How It Works for Teachers
        </h2>
        <div className="space-y-5">
          {[
            {
              step: 1,
              title: "Set Up Your Classroom",
              desc: "Create student profiles in minutes. Each student gets their own reading path based on their assessment results.",
            },
            {
              step: 2,
              title: "Students Work Independently",
              desc: "Lessons are self-guided with three parts: Learn, Practice, and Read. Students can work at their own pace during reading time or centers.",
            },
            {
              step: 3,
              title: "Track and Support",
              desc: "Use the dashboard to monitor progress across your class. Identify students who need additional support and celebrate milestones.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Note */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Classroom Pricing
        </h2>
        <p className="text-zinc-600 leading-relaxed">
          We&apos;re building classroom and school-level pricing now. If
          you&apos;re interested in bringing Readee to your school, reach out and
          we&apos;ll work with you on setup and pricing.
        </p>
        <a
          href="mailto:hello@readee.app"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold text-sm hover:from-indigo-700 hover:to-violet-600 transition-all shadow-sm"
        >
          Contact Us at hello@readee.app
        </a>
      </section>

      {/* CTA */}
      <div className="text-center py-8 space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Try Readee Yourself First
        </h2>
        <p className="text-zinc-500">
          Create a free account to explore the assessment, lessons, and progress
          tracking.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
