import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardPen } from "lucide-react";
import { getStudentSession } from "@/lib/auth/student-session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import StudentCustomQuizRunner from "./_components/StudentCustomQuizRunner";

export const dynamic = "force-dynamic";

export default async function StudentQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await getStudentSession();
  if (!session) redirect("/class");

  const sp = await searchParams;
  const quizId = sp.id;
  if (!quizId) notFound();

  const admin = supabaseAdmin();

  // Verify the quiz is assigned to this student's classroom.
  const { data: assignmentRow } = await admin
    .from("assignments")
    .select("id, title, pass_threshold")
    .eq("classroom_id", session.classroomId)
    .eq("kind", "custom_quiz")
    .eq("source_id", quizId)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assignmentRow) notFound();

  const { data: quiz } = await admin
    .from("custom_quizzes")
    .select("id, title, description")
    .eq("id", quizId)
    .maybeSingle();
  if (!quiz) notFound();

  const { data: junction } = await admin
    .from("custom_quiz_questions")
    .select("position, custom_questions(id, kind, prompt, choices, correct, hint, image_url, audio_url)")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  const questions = (junction ?? []).map((j: any) => {
    const q = j.custom_questions;
    return {
      id: q.id as string,
      kind: q.kind as "multiple_choice" | "true_false" | "fill_in_blank",
      prompt: q.prompt as string,
      choices: (q.choices ?? null) as string[] | null,
      correct: q.correct,
      hint: (q.hint ?? null) as string | null,
      imageUrl: (q.image_url ?? null) as string | null,
      audioUrl: (q.audio_url ?? null) as string | null,
    };
  });

  const q = quiz as any;
  const passThreshold = (assignmentRow as any)?.pass_threshold as number | null | undefined;

  return (
    <div>
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="mt-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          <ClipboardPen className="h-3 w-3" />
          Custom quiz
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {q.title}
        </h1>
      </div>

      {q.description && (
        <article className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <div
            className="whitespace-pre-line text-[18px] leading-[1.7] text-zinc-900 dark:text-slate-100"
            style={{ fontFamily: 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif' }}
          >
            {q.description}
          </div>
        </article>
      )}

      {questions.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            This quiz has no questions yet.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <StudentCustomQuizRunner
            quizId={quizId}
            questions={questions}
            passThreshold={passThreshold ?? null}
          />
        </div>
      )}
    </div>
  );
}
