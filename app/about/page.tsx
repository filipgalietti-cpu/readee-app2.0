import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Readee",
  description:
    "Learn how Readee uses the Science of Reading to help your child become a confident reader.",
};

export default function About() {
  return (
    <div className="max-w-4xl mx-auto pb-16 px-4">
      {/* Hero */}
      <div className="text-center py-16 space-y-4">
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
          How Readee Helps Your Child Read
        </h1>
        <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Readee uses the Science of Reading — the most researched, proven
          approach to teaching kids how to read — to build a personalized
          learning path that actually works.
        </p>
      </div>

      {/* What Makes Readee Different */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          What Makes Readee Different
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: "🎯",
              title: "Meets Them Where They Are",
              desc: "A diagnostic assessment finds your child's exact reading level so every lesson is just right — never too easy, never too hard.",
            },
            {
              icon: "🧩",
              title: "Structured & Sequential",
              desc: "Skills build on each other in a logical order. No skipping ahead, no gaps — just steady, confident progress.",
            },
            {
              icon: "📈",
              title: "Real, Measurable Growth",
              desc: "Track XP, completed lessons, and mastered skills. You'll always know exactly where your child stands.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-white border border-indigo-100 p-5"
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-zinc-900 text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The Science of Reading */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Built on the Science of Reading
          </h2>
          <p className="text-zinc-500 mt-1 text-sm">
            Decades of research show how children actually learn to read.
            Every Readee lesson weaves these five pillars together.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: "🔤",
              title: "Systematic Phonics",
              desc: "Learning the sounds letters make and how to blend them into words — the foundation of reading.",
            },
            {
              icon: "👂",
              title: "Phonemic Awareness",
              desc: "Hearing and playing with the individual sounds in words, like rhyming and segmenting.",
            },
            {
              icon: "📖",
              title: "Fluency",
              desc: "Reading smoothly and with expression so kids can focus on understanding, not just decoding.",
            },
            {
              icon: "💬",
              title: "Vocabulary",
              desc: "Building a rich word bank so new words in stories feel familiar and meaningful.",
            },
            {
              icon: "🧠",
              title: "Comprehension",
              desc: "Understanding what they read — finding main ideas, making connections, and thinking critically.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4"
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

      {/* How Each Lesson Works */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          How Each Lesson Works
        </h2>
        <div className="space-y-5">
          {[
            {
              step: 1,
              title: "Learn",
              desc: "Your child is introduced to a new skill — like a letter sound, a blending pattern, or a sight word — with clear, simple instruction.",
            },
            {
              step: 2,
              title: "Practice",
              desc: "Interactive questions reinforce the new skill. Immediate feedback helps your child correct mistakes and build confidence.",
            },
            {
              step: 3,
              title: "Read",
              desc: "A short story puts the skill into context. Comprehension checks make sure your child understands what they've read.",
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
        <p className="text-sm text-zinc-500 leading-relaxed">
          Each lesson takes about 10 minutes — perfect for building a daily
          reading habit without screen fatigue.
        </p>
      </section>

      {/* Who It's For */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Designed for Ages 4–9
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: "🎒",
              title: "Pre-K through 3rd Grade",
              desc: "Covers the critical years when reading skills are built — from letter sounds to independent reading.",
            },
            {
              icon: "💪",
              title: "Kids Who Struggle with Reading",
              desc: "Structured, systematic lessons that meet them where they are and build confidence step by step.",
            },
            {
              icon: "📚",
              title: "Kids Who Need Extra Practice",
              desc: "A supplement to school that reinforces skills with engaging, bite-sized lessons at home.",
            },
            {
              icon: "🏠",
              title: "Homeschool Families",
              desc: "A complete reading curriculum your child can follow with your guidance.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-zinc-900 text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — Back to Dashboard */}
      <div className="text-center py-8 space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Ready to continue?
        </h2>
        <p className="text-zinc-500">
          Head back to the dashboard to start your child&apos;s next lesson.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
