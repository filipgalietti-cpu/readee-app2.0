import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ClipboardPen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth/helpers";
import StudentCustomQuizRunner from "@/app/(student)/student/quiz/_components/StudentCustomQuizRunner";

export const dynamic = "force-dynamic";

/**
 * Parent-side custom quiz player. Mirrors /student/quiz?id= but works
 * for parent-owned children playing under their parent's Supabase
 * session (no class-code login required).
 *
 * Auth gate:
 *   1. Logged-in user must be the child's parent (children.parent_id).
 *   2. The child must be a member of a classroom that has this quiz
 *      assigned (classroom_memberships + assignments).
 */
export default async function ParentCustomQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ child?: string }>;
}) {
  const { quizId } = await params;
  const { child: childId } = await searchParams;
  if (!childId) notFound();

  const profile = await requireProfile();
  const supabase = await createClient();

  // 1) Parent-child ownership
  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, parent_id")
    .eq("id", childId)
    .eq("parent_id", profile.id)
    .maybeSingle();
  if (!child) notFound();

  // 2) Child's classroom must have the quiz assigned. Use admin to
  //    sidestep RLS for the cross-table check, but the parent-id check
  //    above already proves authorization.
  const admin = supabaseAdmin();
  const { data: memberships } = await admin
    .from("classroom_memberships")
    .select("classroom_id")
    .eq("child_id", childId);
  const classroomIds = (memberships ?? []).map((m: any) => m.classroom_id);
  if (classroomIds.length === 0) {
    redirect(`/dashboard?child=${childId}`);
  }

  const { data: assignmentRow } = await admin
    .from("assignments")
    .select("id, title, pass_threshold, classroom_id")
    .in("classroom_id", classroomIds)
    .eq("kind", "custom_quiz")
    .eq("source_id", quizId)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!assignmentRow) notFound();

  // 3) Load the quiz + questions
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
  const passThreshold = (assignmentRow as any)?.pass_threshold as
    | number
    | null
    | undefined;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="mt-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          <ClipboardPen className="h-3 w-3" />
          Custom quiz · {(child as any).first_name}
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {q.title}
        </h1>
        {q.description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">{q.description}</p>
        )}
      </div>

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
            saveEndpoint="/api/parent/custom-quiz-complete"
            childId={childId}
            homeHref={`/dashboard?child=${childId}`}
          />
        </div>
      )}
    </div>
  );
}
