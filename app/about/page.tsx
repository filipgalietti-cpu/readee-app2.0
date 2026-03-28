import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, PenLine, Trophy, Users, Heart, GraduationCap, Sparkles, School } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet the team behind Readee — built by a reading specialist and developer to help every child become a confident reader.",
};

export default async function About() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4">
      {/* ── Hero ── */}
      <div className="text-center py-16 space-y-5">
        <div className="w-24 h-24 mx-auto mb-2">
          <img
            src="/readee-logo.png"
            alt="Readee"
            width={612}
            height={408}
            className="w-full h-auto"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">
          Unlock Reading with{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            Readee
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-500 max-w-xl mx-auto leading-relaxed font-medium">
          Built by Educators, for Education.
        </p>
      </div>

      {/* ── Our Story ── */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-8 sm:p-10 space-y-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Our Story
          </h2>
        </div>
        <div className="space-y-4 text-[15px] text-zinc-700 leading-relaxed">
          <p>
            Readee was founded by <strong>Filip Galietti</strong> and{" "}
            <strong>Jennifer Klingerman</strong>, a certified reading specialist
            and 3rd grade teacher. Jennifer saw firsthand how kids were falling
            behind in reading — and knew a better approach was possible.
          </p>
          <p>
            Together, we set out to build an app that brings real teaching
            methodology to the screen. Not flashy gimmicks or mindless
            screen time — but structured, science-backed lessons that actually
            move the needle.
          </p>
          <p className="text-indigo-700 font-semibold">
            We&apos;re a small team of two with a big passion for reading.
          </p>
        </div>
      </section>

      {/* ── Our Approach ── */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10 space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Our Approach
            </h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              Three steps, one confident reader.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              step: 1,
              icon: BookOpen,
              title: "Lesson",
              color: "from-indigo-600 to-indigo-500",
              desc: "Teacher-led instruction with hours of recorded educator dialogue. Real teaching, on screen.",
            },
            {
              step: 2,
              icon: PenLine,
              title: "Practice",
              color: "from-violet-600 to-violet-500",
              desc: "Guided practice problems to reinforce what was learned. Immediate feedback builds confidence.",
            },
            {
              step: 3,
              icon: Trophy,
              title: "Excel",
              color: "from-purple-600 to-purple-500",
              desc: "Mastery activities that push kids to the next level. Prove it, own it, move on.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 text-center space-y-3"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mx-auto shadow-md`}
              >
                <item.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Step {item.step}
                </span>
                <h3 className="font-bold text-zinc-900 text-lg">{item.title}</h3>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-4">
          <p className="text-sm text-indigo-800 leading-relaxed text-center">
            Every student starts with a <strong>diagnostic assessment</strong> so
            we meet them where they are, then moves through Lesson &rarr; Practice
            &rarr; Excel at their own pace.
          </p>
        </div>
      </section>

      {/* ── Who Readee Is For ── */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10 space-y-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Who Readee Is For
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: GraduationCap,
              title: "Early Readers",
              subtitle: "Pre-K through 4th Grade",
              desc: "Covering the critical years when reading skills are built — from letter sounds to independent reading.",
            },
            {
              icon: Heart,
              title: "Learning Differences",
              subtitle: "Dyslexia & Reading Disabilities",
              desc: "Structured, systematic lessons designed to support children who learn differently.",
            },
            {
              icon: Trophy,
              title: "Families Who Want More",
              subtitle: "At or Above Grade Level",
              desc: "Whether your child needs to catch up or get ahead, Readee can get them there.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <item.icon
                  className="w-5 h-5 text-indigo-500"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="font-semibold text-zinc-900">{item.title}</h3>
              <p className="text-xs font-medium text-indigo-500">
                {item.subtitle}
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4">
          <p className="text-sm text-zinc-600 leading-relaxed text-center">
            Our program is grounded in the{" "}
            <strong className="text-zinc-900">Science of Reading</strong> and
            aligned to{" "}
            <strong className="text-zinc-900">
              Common Core ELA standards
            </strong>
            .
          </p>
        </div>
      </section>

      {/* ── Coming Soon: Readee Classroom ── */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 p-8 sm:p-10 mb-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
          <School className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Readee Classroom — Coming Soon
        </h2>
        <p className="text-indigo-100 max-w-lg mx-auto leading-relaxed">
          Bringing Readee to schools and classrooms everywhere. Teacher
          dashboards, student progress tracking, and structured phonics
          instruction — built for the way classrooms actually work.
        </p>
        <Link
          href="/teachers"
          className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-md"
        >
          Learn More for Educators
        </Link>
      </section>

      {/* ── CTA ── */}
      {user ? (
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
      ) : (
        <div className="text-center py-8 space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-zinc-500">
            Create a free account and see where your child&apos;s reading
            journey begins.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
          >
            Sign Up for Free
          </Link>
        </div>
      )}
    </div>
  );
}
