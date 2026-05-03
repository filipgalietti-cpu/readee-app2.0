import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  Lightbulb,
  Eye,
  Clock,
  ListChecks,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import LessonRunnerLauncher from "./_components/LessonRunnerLauncher";

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

  // Bump last_played_at fire-and-forget.
  void supabase
    .from("child_ai_content")
    .update({ last_played_at: new Date().toISOString() })
    .eq("id", contentId)
    .eq("parent_id", profile.id)
    .then(() => {});

  const backHref =
    from === "ask-readee" ? "/dashboard/ask-readee" : "/dashboard";
  const backLabel = from === "ask-readee" ? "Ask Readee" : "Dashboard";

  const questions = (content.questions ?? []) as Question[];
  const wordCount = (content.passage_text ?? "").trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 90));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* Hero card — dominates the page. The reading IS the product;
          everything else is parent meta. */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="grid gap-0 sm:grid-cols-5">
          {content.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.image_url}
              alt={content.title ?? content.topic}
              className="h-48 w-full object-cover sm:col-span-2 sm:h-full"
            />
          )}
          <div
            className={`p-6 ${
              content.image_url ? "sm:col-span-3" : "sm:col-span-5"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              Made for {childName}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              {content.title ?? content.topic}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-zinc-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{readMinutes} min read
              </span>
              {questions.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="h-3 w-3" />
                  {questions.length} questions
                </span>
              )}
              {content.audio_url && (
                <span className="inline-flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  Read-aloud included
                </span>
              )}
              {content.grade_level && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  {content.grade_level}
                </span>
              )}
            </div>

            <LessonRunnerLauncher
              content={content}
              childName={childName}
              ctaLabel={`Read with ${childName} →`}
            />

            <p className="mt-2 text-[11px] text-zinc-500">
              Hand the device to your kid — Readee guides them through
              the passage and questions.
            </p>
          </div>
        </div>
      </section>

      {/* Parent preview — collapsed by default. Open if you want to
          spot-check the questions and answers before handing over. */}
      <details className="group mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-zinc-700 dark:text-slate-200">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-zinc-400" />
            Parent preview — passage + answer key
          </span>
          <span className="text-[11px] font-normal text-zinc-400 group-open:hidden">
            Show
          </span>
          <span className="hidden text-[11px] font-normal text-zinc-400 group-open:inline">
            Hide
          </span>
        </summary>

        <div className="mt-4 space-y-5">
          {content.passage_text && (
            <article className="whitespace-pre-line rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 text-sm leading-relaxed text-zinc-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
              {content.passage_text}
            </article>
          )}

          {content.audio_url && (
            <div className="flex items-center gap-2 rounded-xl bg-violet-50/60 p-2.5 text-xs">
              <Volume2 className="h-3.5 w-3.5 flex-shrink-0 text-violet-600" />
              <audio controls src={content.audio_url} className="flex-1 h-8" />
            </div>
          )}

          {questions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Answer key
              </div>
              <ol className="mt-2 space-y-2">
                {questions.map((q, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40"
                  >
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      Q{i + 1}. {q.prompt}
                    </div>
                    {Array.isArray(q.choices) && q.choices.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 text-xs">
                        {q.choices.map((c, j) => {
                          const isCorrect = c === q.correct;
                          return (
                            <li
                              key={`${j}-${c}`}
                              className={
                                isCorrect
                                  ? "rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                                  : "px-2 py-0.5 text-zinc-600 dark:text-slate-400"
                              }
                            >
                              {String.fromCharCode(65 + j)}. {c}
                              {isCorrect && (
                                <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                                  ✓ Correct
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {q.hint && (
                      <p className="mt-1.5 inline-flex items-start gap-1 text-[11px] text-zinc-500">
                        <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                        Hint: {q.hint}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </details>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 text-sm dark:border-violet-900/40 dark:from-violet-950/20 dark:to-indigo-950/20">
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
