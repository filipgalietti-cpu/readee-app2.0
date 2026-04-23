import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardPen, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import QuizBuilder from "./_components/QuizBuilder";

export const dynamic = "force-dynamic";

export default async function QuizBuilderPage({
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
    .select("id, title, description, grade_level")
    .eq("id", quizId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!quiz) notFound();

  const { data: junction } = await supabase
    .from("custom_quiz_questions")
    .select("position, question_id, custom_questions(id, kind, prompt, choices, correct, hint)")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  type Junction = {
    position: number;
    question_id: string;
    custom_questions: {
      id: string;
      kind: "multiple_choice" | "true_false" | "fill_in_blank";
      prompt: string;
      choices: string[] | null;
      correct: any;
      hint: string | null;
    };
  };

  const questions = (junction ?? []).map((j: any) => {
    const q = j.custom_questions;
    return {
      id: q.id as string,
      position: j.position as number,
      kind: q.kind as "multiple_choice" | "true_false" | "fill_in_blank",
      prompt: q.prompt as string,
      choices: (q.choices ?? null) as string[] | null,
      correct: q.correct,
      hint: (q.hint ?? null) as string | null,
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
      <div className="mt-3">
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
