import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, Sparkles, Volume2 } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function CommunityPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;

  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("community_passages")
    .select("id, slug, title, passage_text, questions, image_url, audio_url, grade_level, topic, phonics_pattern, status, view_count, play_count, display_byline")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  if (!row) notFound();
  const passage = row as any;

  // Best-effort view increment.
  await admin
    .from("community_passages")
    .update({ view_count: (passage.view_count ?? 0) + 1 })
    .eq("id", id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/practice-hub/community"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Community library
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
        <Users className="h-4 w-4" />
        {passage.display_byline
          ? `Shared by ${passage.display_byline}`
          : "Shared by a Readee family"}
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
          {passage.grade_level}
        </span>
        {passage.phonics_pattern && (
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            {passage.phonics_pattern}
          </span>
        )}
      </div>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {passage.title}
      </h1>

      {passage.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={passage.image_url}
          alt=""
          className="mt-5 max-h-72 w-full rounded-2xl object-contain"
        />
      )}

      <div className="mt-5 whitespace-pre-line rounded-2xl border border-zinc-200 bg-white p-6 text-base leading-relaxed text-zinc-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
        {passage.passage_text}
      </div>

      {passage.audio_url && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-900/40 dark:bg-violet-950/20">
          <Volume2 className="h-4 w-4 text-violet-600 dark:text-violet-300" />
          <audio controls src={passage.audio_url} className="flex-1" />
        </div>
      )}

      {Array.isArray(passage.questions) && passage.questions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Comprehension questions
          </div>
          <ol className="mt-3 space-y-3">
            {passage.questions.map((q: any, i: number) => (
              <li
                key={i}
                className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="font-semibold text-zinc-900 dark:text-white">
                  Q{i + 1}. {q.prompt}
                </div>
                {Array.isArray(q.choices) && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {q.choices.map((c: string) => (
                      <li
                        key={c}
                        className={
                          c === q.correct
                            ? "rounded-lg bg-green-50 px-2 py-1 font-semibold text-green-800 dark:bg-green-950/30 dark:text-green-300"
                            : "px-2 py-1 text-zinc-600 dark:text-slate-400"
                        }
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
                {q.hint && (
                  <p className="mt-2 text-[11px] text-zinc-500 dark:text-slate-400">
                    Hint: {q.hint}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
