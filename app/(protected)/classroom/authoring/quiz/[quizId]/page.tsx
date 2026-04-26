import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardPen, ListChecks, Sparkles, Eye, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import QuizBuilder from "./_components/QuizBuilder";

export const dynamic = "force-dynamic";

export default async function QuizBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ built?: string }>;
}) {
  const { quizId } = await params;
  const { built } = await searchParams;
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("custom_quizzes")
    .select("id, title, description, grade_level")
    .eq("id", quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quiz) notFound();

  const { data: junction } = await supabase
    .from("custom_quiz_questions")
    .select("position, question_id, custom_questions(id, kind, prompt, choices, correct, hint, image_url, audio_url)")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  const questions = (junction ?? []).map((j: any) => {
    const q = j.custom_questions;
    return {
      id: q.id as string,
      position: j.position as number,
      kind: q.kind as "multiple_choice" | "true_false" | "fill_in_blank" | "matching_pairs",
      prompt: q.prompt as string,
      choices: (q.choices ?? null) as string[] | null,
      correct: q.correct,
      hint: (q.hint ?? null) as string | null,
      imageUrl: (q.image_url ?? null) as string | null,
      audioUrl: (q.audio_url ?? null) as string | null,
    };
  });

  const q = quiz as any;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/classroom/authoring"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        All quizzes
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            <ClipboardPen className="h-4 w-4" />
            Quiz builder
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {q.title}
          </h1>
          {q.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">{q.description}</p>
          )}
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-slate-400">
            <ListChecks className="h-3 w-3" />
            {questions.length} question{questions.length === 1 ? "" : "s"}
            {q.grade_level ? ` · ${q.grade_level}` : ""}
          </div>
        </div>
        {questions.length > 0 && (
          <Link
            href={`/classroom/authoring/quiz/${quizId}/preview`}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview as student
          </Link>
        )}
      </div>

      {built === "1" && (
        <div className="mt-5 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 text-sm text-violet-900 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/30 dark:text-violet-100">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600 dark:text-violet-300" />
            <div>
              <div className="font-bold">Your assignment is ready.</div>
              <div className="mt-0.5 text-xs text-violet-800 dark:text-violet-200">
                Preview it as a student, or assign it to a classroom —
                students can only play it after it&apos;s been assigned.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/classroom/authoring/quiz/${quizId}/preview`}
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Link>
            <Link
              href="/classroom"
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Assign to a class
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8">
        <QuizBuilder
          quizId={quizId}
          initialTitle={q.title}
          initialDescription={q.description ?? ""}
          initialGradeLevel={q.grade_level ?? ""}
          questions={questions}
        />
      </div>
    </div>
  );
}
