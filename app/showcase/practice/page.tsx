import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

/**
 * Screen-recording showcase for practice problems. Mirrors
 * /showcase/stories — public, no chrome, designed to be pointed
 * at by Screen Studio.
 *
 * Curated set of 15 questions (3 per grade K-4) — picked for
 * visual strength: image + audio, canonical (not AI-regen), mid
 * length prompts. The list is hardcoded so the recording is
 * deterministic and we never accidentally show a quarantined or
 * weak question on the marketing reel.
 */
export const dynamic = "force-static";

export const metadata = {
  title: "Practice · Readee",
  robots: { index: false, follow: false },
};

const FEATURED_IDS = [
  // K
  "RL.K.5-Q5",
  "RL.K.9-Q3",
  "RI.K.9-Q5",
  // 1st
  "RL.1.2-Q3",
  "RL.1.3-Q5",
  "RI.1.8-Q1",
  // 2nd
  "RL.2.10-Q1",
  "RL.2.10-Q2",
  "RI.2.8-Q5",
  // 3rd
  "RL.3.2-Q3",
  "RL.3.3-Q3",
  "RI.3.10-Q2",
  // 4th
  "RL.4.1-Q2",
  "RL.4.2-Q4",
  "RL.4.3-Q3",
];

const GRADE_LABEL: Record<string, string> = {
  K: "Kindergarten",
  "1": "1st Grade",
  "2": "2nd Grade",
  "3": "3rd Grade",
  "4": "4th Grade",
};

const GRADE_ORDER = ["K", "1", "2", "3", "4"];

type Q = {
  id: string;
  grade: string;
  standard_id: string;
  prompt: string;
  choices: string[];
  correct: string;
  image_url: string | null;
};

async function loadQuestions(): Promise<Q[]> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = await sb
    .from("questions_db")
    .select("id, grade, standard_id, prompt, choices, correct, image_url")
    .in("id", FEATURED_IDS);
  if (error || !data) return [];
  // Preserve the featured-id order so the grid lays out by grade.
  const byId = new Map(data.map((r: any) => [r.id, r as Q]));
  return FEATURED_IDS.map((id) => byId.get(id)).filter((q): q is Q => Boolean(q));
}

export default async function PracticeShowcase() {
  const questions = await loadQuestions();
  const byGrade = new Map<string, Q[]>();
  for (const q of questions) {
    const arr = byGrade.get(q.grade) ?? [];
    arr.push(q);
    byGrade.set(q.grade, arr);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50/50 via-white to-emerald-50/40">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            911 practice questions · K — 4th · Common Core
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            Practice that <span className="text-emerald-600">clicks.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Standards-aligned questions for every K-4 reading skill. Bright
            illustrations, audio for every prompt, instant feedback.
          </p>
        </div>

        {/* Grade sections */}
        <div className="mt-20 space-y-20">
          {GRADE_ORDER.map((grade) => {
            const items = byGrade.get(grade) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={grade}>
                <div className="mb-8 flex items-baseline justify-between">
                  <h2 className="font-display text-3xl font-extrabold text-zinc-900">
                    {GRADE_LABEL[grade]}
                  </h2>
                  <span className="text-sm font-semibold text-zinc-400">
                    {items.length} sample questions
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((q) => (
                    <Link
                      key={q.id}
                      href={`/showcase/practice/${q.id}`}
                      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-zinc-100 transition duration-500 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {q.image_url && (
                        <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={q.image_url}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                          {q.standard_id}
                        </div>
                        <p className="mt-2 line-clamp-3 text-base font-extrabold leading-snug text-zinc-900">
                          {q.prompt}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-400">
                            {q.choices.length} choices
                          </span>
                          <span className="font-bold text-emerald-600 transition group-hover:text-emerald-800">
                            Try it →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

      </div>
    </main>
  );
}
