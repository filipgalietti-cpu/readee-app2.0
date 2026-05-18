import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Volume2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import InteractiveChoices from "./_InteractiveChoices";

/**
 * Single practice-question showcase — image, prompt, 4 choices
 * with the correct one pre-celebrated green + carrot reward chip.
 * Designed for Screen Studio capture so the recording catches the
 * "answer the question and get the win" beat without needing a
 * scripted interaction.
 */
export const dynamic = "force-static";

type Q = {
  id: string;
  grade: string;
  standard_id: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  image_url: string | null;
  audio_url: string | null;
};

const GRADE_LABEL: Record<string, string> = {
  K: "Kindergarten",
  "1": "1st Grade",
  "2": "2nd Grade",
  "3": "3rd Grade",
  "4": "4th Grade",
};

async function loadQuestion(id: string): Promise<Q | null> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data, error } = await sb
    .from("questions_db")
    .select("id, grade, standard_id, prompt, choices, correct, hint, image_url, audio_url")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Q;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `${id} · Readee Practice` };
}

export default async function ShowcaseQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const q = await loadQuestion(id);
  if (!q) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50/50 via-white to-emerald-50/40">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Back */}
        <Link
          href="/showcase/practice"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All practice
        </Link>

        {/* Standard badge */}
        <div className="mt-8 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            {GRADE_LABEL[q.grade] ?? q.grade}
          </span>
          <span className="text-zinc-300">·</span>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {q.standard_id}
          </span>
        </div>

        {/* Image — capped so the prompt + choices fit on one screen
            without scrolling. Source illustrations are 1024×1024 and
            full-width was eating ~half the viewport. */}
        {q.image_url && (
          <div className="mx-auto mt-6 max-w-sm overflow-hidden rounded-3xl bg-zinc-100 shadow-xl ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={q.image_url} alt="" className="w-full" />
          </div>
        )}

        {/* Prompt */}
        <h1 className="mt-10 font-display text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
          {q.prompt}
        </h1>

        {/* Audio */}
        {q.audio_url && (
          <div className="mt-6 flex items-center justify-center">
            <audio
              controls
              preload="none"
              src={q.audio_url}
              className="w-full max-w-md"
            />
          </div>
        )}

        {/* Interactive choices — click to answer, get feedback */}
        <div className="mt-10">
          <InteractiveChoices choices={q.choices} correct={q.correct} />
        </div>

        {/* Hint */}
        {q.hint && (
          <div className="mt-10 rounded-2xl bg-amber-50 px-5 py-4 ring-1 ring-amber-100">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Hint
            </div>
            <p className="mt-1 text-sm leading-relaxed text-amber-900">{q.hint}</p>
          </div>
        )}

      </div>
    </main>
  );
}
