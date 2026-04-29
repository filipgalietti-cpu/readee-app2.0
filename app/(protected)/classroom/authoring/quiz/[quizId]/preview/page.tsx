import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import PreviewRunner from "./_components/PreviewRunner";

export const dynamic = "force-dynamic";

/**
 * Teacher-only preview of a custom quiz. Renders the same student
 * runner experience but doesn't save anything to the DB on completion.
 * Lets teachers QA a wizard-built quiz before assigning to a class.
 */
export default async function CustomQuizPreviewPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();
  const { data: quiz } = await supabase
    .from("custom_quizzes")
    .select("id, title, description")
    .eq("id", quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quiz) notFound();

  const { data: junction } = await supabase
    .from("custom_quiz_questions")
    .select("position, custom_questions(id, kind, prompt, choices, correct, hint, image_url, audio_url)")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  const questions = (junction ?? []).map((j: any) => {
    const q = j.custom_questions;
    return {
      id: q.id as string,
      kind: q.kind as "multiple_choice" | "true_false" | "fill_in_blank" | "matching_pairs",
      prompt: q.prompt as string,
      choices: (q.choices ?? null) as string[] | null,
      correct: q.correct,
      hint: (q.hint ?? null) as string | null,
      imageUrl: (q.image_url ?? null) as string | null,
      audioUrl: (q.audio_url ?? null) as string | null,
    };
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/classroom/authoring/quiz/${quizId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to editor
      </Link>

      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
        <Eye className="h-4 w-4" />
        Teacher preview
      </div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {(quiz as any).title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
        This is what students see. Nothing is saved — your responses
        won&apos;t be recorded.
      </p>

      {questions.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            This quiz has no questions yet.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <PreviewRunner
            quizId={quizId}
            questions={questions}
            quizTitle={(quiz as any).title ?? ""}
            quizDescription={((quiz as any).description ?? "") as string}
          />
        </div>
      )}
    </div>
  );
}
