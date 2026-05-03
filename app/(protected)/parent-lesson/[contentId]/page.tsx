import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Sparkles, Volume2, Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";

export const dynamic = "force-dynamic";

type Question = {
  prompt: string;
  choices?: string[];
  correct?: string;
  hint?: string;
  audioUrl?: string | null;
};

type Content = {
  id: string;
  parent_id: string;
  child_id: string;
  kind: "passage" | "practice_set";
  title: string | null;
  topic: string;
  grade_level: string | null;
  passage_text: string | null;
  image_url: string | null;
  audio_url: string | null;
  questions: Question[] | null;
  qc_status: string | null;
};

export default async function ParentLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ contentId: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const profile = await requireProfile();
  const { contentId } = await params;
  const { from } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("child_ai_content")
    .select(
      "id, parent_id, child_id, kind, title, topic, grade_level, passage_text, image_url, audio_url, questions, qc_status",
    )
    .eq("id", contentId)
    .eq("parent_id", profile.id)
    .maybeSingle();
  const content = (data as Content | null) ?? null;
  if (!content) notFound();

  // Fire-and-forget — bump last_played_at + play_count so the
  // library card reflects momentum. Errors don't fail the page.
  void supabase
    .from("child_ai_content")
    .update({
      last_played_at: new Date().toISOString(),
    })
    .eq("id", contentId)
    .eq("parent_id", profile.id)
    .then(() => {});

  // Quarantined content shouldn't be served. The deliverability gate
  // policy is parent-side too — if QC flagged this, send them home.
  if (content.qc_status === "quarantined" || content.qc_status === "retired") {
    redirect("/dashboard/ask-readee?reason=quarantined");
  }

  // Pull child first name for the header.
  const { data: childRow } = await supabase
    .from("children")
    .select("first_name")
    .eq("id", content.child_id)
    .maybeSingle();
  const childName = (childRow as { first_name: string } | null)?.first_name ?? "your child";

  const backHref =
    from === "ask-readee" ? "/dashboard/ask-readee" : "/dashboard";
  const backLabel = from === "ask-readee" ? "Ask Readee" : "Dashboard";

  const questions = (content.questions ?? []) as Question[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
        <Sparkles className="h-3.5 w-3.5" />
        Made for {childName} · {content.grade_level ?? "All levels"}
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {content.title ?? content.topic}
      </h1>

      {content.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.image_url}
          alt={content.title ?? content.topic}
          className="mt-5 max-h-80 w-full rounded-2xl object-contain shadow-sm"
        />
      )}

      {content.passage_text && (
        <article className="mt-6 whitespace-pre-line rounded-2xl border border-zinc-200 bg-white p-6 text-base leading-relaxed text-zinc-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
          {content.passage_text}
        </article>
      )}

      {content.audio_url && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-900/40 dark:bg-violet-950/20">
          <Volume2 className="h-4 w-4 flex-shrink-0 text-violet-600 dark:text-violet-300" />
          <audio controls src={content.audio_url} className="flex-1" />
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Comprehension questions
          </div>
          <ol className="mt-3 space-y-3">
            {questions.map((q, i) => (
              <li
                key={i}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="font-semibold text-zinc-900 dark:text-white">
                  Q{i + 1}. {q.prompt}
                </div>
                {Array.isArray(q.choices) && q.choices.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {q.choices.map((c, j) => {
                      const isCorrect = c === q.correct;
                      return (
                        <li
                          key={`${j}-${c}`}
                          className={
                            isCorrect
                              ? "rounded-lg bg-emerald-50 px-2 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                              : "px-2 py-1 text-zinc-600 dark:text-slate-400"
                          }
                        >
                          {String.fromCharCode(65 + j)}. {c}
                          {isCorrect && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                              Correct
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {q.audioUrl && (
                  <div className="mt-2 flex items-center gap-2 rounded-xl bg-violet-50/60 p-2 text-xs">
                    <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-violet-600" />
                    <audio controls src={q.audioUrl} className="flex-1 h-8" />
                  </div>
                )}
                {q.hint && (
                  <p className="mt-2 inline-flex items-start gap-1 text-[11px] text-zinc-500 dark:text-slate-400">
                    <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                    Hint: {q.hint}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 text-sm dark:border-violet-900/40 dark:from-violet-950/20 dark:to-indigo-950/20">
        <div>
          <div className="font-bold text-zinc-900 dark:text-white">
            Make another for {childName}
          </div>
          <div className="text-xs text-zinc-500 dark:text-slate-400">
            Pick a mode and Readee builds it in 3 taps.
          </div>
        </div>
        <Link
          href="/dashboard/ask-readee"
          className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700"
        >
          Ask Readee →
        </Link>
      </div>
    </div>
  );
}
