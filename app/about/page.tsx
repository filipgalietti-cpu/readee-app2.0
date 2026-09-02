import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdvisoryBoardSection from "@/app/_components/AdvisoryBoardSection";

export const metadata: Metadata = {
  title: "About",
  description:
    "Readee is built by Jennifer Klingerman, a certified reading specialist who still teaches 3rd grade, and Filip Galietti.",
};

/**
 * /about — rebuilt Sep 2026.
 *
 * What came out: five identical icon-in-a-rounded-box section headers (two of
 * them using the same Sparkles), four card grids stacked one after another,
 * and per-card gradients that existed nowhere else in the product. Six of the
 * twenty "AI-generated UI" tells, on one page.
 *
 * That chrome was sitting on top of the least copyable thing Readee has: a
 * certified reading specialist who is still in a classroom. Every comparable
 * in the category leads with named founder credentials, so this page now does
 * too, with her face at the top and the story as prose rather than chopped
 * into gradient cards.
 */
export default async function About() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      {/* ── Jennifer first. She is the reason to trust this. ── */}
      <section className="py-14 sm:py-20">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
          <Image
            src="/images/jennifer.jpg"
            alt="Jennifer Klingerman"
            width={168}
            height={168}
            className="h-40 w-40 flex-shrink-0 rounded-3xl object-cover shadow-[0_10px_40px_-12px_rgba(49,46,129,0.18)]"
            priority
          />
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-violet-600">
              Made by a reading teacher
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
              Jennifer wrote every lesson in Readee.
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-zinc-600">
              Jennifer Klingerman is a certified reading specialist with a
              Master&apos;s in Reading, and she still teaches 3rd grade. She saw
              children falling behind year after year and knew a better approach
              was possible.
            </p>
            <p className="mt-3 text-[17px] leading-relaxed text-zinc-600">
              She built Readee with Filip Galietti, who handles the engineering.
              Two people. No content team, no licensing deal, no textbook
              publisher.
            </p>
          </div>
        </div>
      </section>

      {/* ── The method, as prose. Three steps is a real sequence. ── */}
      <section className="border-t border-zinc-200 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          How a Readee lesson works
        </h2>
        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-zinc-600">
          Every child starts with an adaptive placement test across five reading
          skills, so we meet them where they actually are rather than where their
          grade says they should be. From there each lesson runs the same three
          beats.
        </p>
        <ol className="mt-8 space-y-6">
          {[
            {
              n: 1,
              title: "Lesson",
              body: "Teacher-led instruction with hours of recorded educator dialogue, read aloud line by line. Real teaching, on screen.",
            },
            {
              n: 2,
              title: "Practice",
              body: "Standards-aligned questions with immediate feedback. Wrong answers get an explanation, not just a red X.",
            },
            {
              n: 3,
              title: "Excel",
              body: "Mastery activities that push a step past the lesson. Prove it, own it, move on.",
            },
          ].map((s) => (
            <li key={s.n} className="flex gap-5">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-600 font-extrabold text-white">
                {s.n}
              </span>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{s.title}</h3>
                <p className="mt-1 text-[16px] leading-relaxed text-zinc-600">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── The quality claim, with the numbers inline rather than in a grid ── */}
      <section className="border-t border-zinc-200 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          Nothing reaches a child unchecked
        </h2>
        <p className="mt-3 text-[17px] leading-relaxed text-zinc-600">
          Readee is not a textbook. Jennifer writes the pedagogy, an automated
          production line scales it, and a quality pipeline audits the output
          around the clock. Every passage, question, image and audio file passes{" "}
          <strong className="font-semibold text-zinc-900">
            12 automated checks
          </strong>{" "}
          before it ships, including fact-checking against Wikipedia, a
          reading-level audit for the target grade, and a pedagogy review.
          Anything that fails is rewritten or quarantined. Nothing is quietly
          shipped.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {[
            { v: "911+", k: "practice questions" },
            { v: "200+", k: "interactive lessons" },
            { v: "12", k: "checks on every piece" },
            { v: "Daily", k: "fresh reading" },
          ].map((s) => (
            <div key={s.k}>
              <dt className="text-3xl font-extrabold tracking-tight text-violet-600">
                {s.v}
              </dt>
              <dd className="mt-1 text-sm leading-snug text-zinc-500">{s.k}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Who it is for ── */}
      <section className="border-t border-zinc-200 py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          Who Readee is for
        </h2>
        <div className="mt-6 space-y-5">
          {[
            {
              title: "Early readers, kindergarten through 4th grade",
              body: "The years when reading is actually built, from letter sounds to reading independently.",
            },
            {
              title: "Children who learn differently",
              body: "Structured, systematic lessons with audio on every piece of text. Predictable pacing, short sessions, no flashing rewards competing with the words. Many families come to us after a flashier app overwhelmed their reader.",
            },
            {
              title: "Families who want more than grade level",
              body: "Whether a child needs to catch up or wants to get ahead, the placement test starts them at the right place either way.",
            },
          ].map((x) => (
            <div key={x.title}>
              <h3 className="text-[17px] font-bold text-zinc-900">{x.title}</h3>
              <p className="mt-1 text-[16px] leading-relaxed text-zinc-600">
                {x.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <AdvisoryBoardSection />

      {/* ── CTA ── */}
      <section className="border-t border-zinc-200 py-12 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
          {user ? "Ready to continue?" : "See where your child is reading"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-zinc-600">
          {user
            ? "Head back to the dashboard for the next lesson."
            : "The placement test takes about five minutes and it is free."}
        </p>
        <Link
          href={user ? "/dashboard" : "/signup"}
          className="mt-7 inline-flex items-center justify-center rounded-2xl bg-violet-600 px-8 py-4 text-lg font-extrabold text-white shadow-[0_4px_0_0_#4c1d95] transition hover:bg-violet-500 active:translate-y-[3px] active:shadow-[0_1px_0_0_#4c1d95]"
        >
          {user ? "Go to dashboard" : "Start the free placement test"}
        </Link>
      </section>
    </div>
  );
}
