import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardPen, Trophy } from "lucide-react";
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

  const { data: assignmentRow } = await admin
    .from("assignments")
    .select("id, title, pass_threshold, attempts_allowed, assigned_child_ids")
    .eq("classroom_id", session.classroomId)
    .eq("kind", "custom_quiz")
    .eq("source_id", quizId)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // The kid's home language drives the in-reader L1 toggle. NULL
  // means English-only / unknown, no toggle shown.
  const { data: childRow } = await admin
    .from("children")
    .select("home_language")
    .eq("id", session.childId)
    .maybeSingle();
  const homeLanguage = ((childRow as any)?.home_language ?? null) as string | null;

  if (!assignmentRow) notFound();
  const targetedIds = (assignmentRow as any).assigned_child_ids as string[] | null;
  if (targetedIds && targetedIds.length > 0 && !targetedIds.includes(session.childId)) {
    notFound();
  }

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
  const passThreshold = (assignmentRow as any)?.pass_threshold as number | null | undefined;
  const attemptsAllowed = (assignmentRow as any)?.attempts_allowed as number | null | undefined;

  // Existing submission, drives "already completed" gate, save & resume,
  // attempts cap.
  const { data: submissionRow } = await admin
    .from("assignment_submissions")
    .select("completed_at, score_percent, carrots_earned, progress_state")
    .eq("assignment_id", (assignmentRow as any).id)
    .eq("child_id", session.childId)
    .maybeSingle();

  const submission = submissionRow as
    | {
        completed_at: string | null;
        score_percent: number | null;
        carrots_earned: number | null;
        progress_state: {
          idx?: number;
          answers?: any[];
          correct?: number;
          updatedAt?: string;
        } | null;
      }
    | null;

  const hasCompleted = !!submission?.completed_at;
  const noAttemptsLeft =
    hasCompleted &&
    typeof attemptsAllowed === "number" &&
    attemptsAllowed > 0 &&
    // We only count one prior attempt today (no per-attempt history table
    // yet), so attempts_allowed=1 is the only meaningful cap. Higher
    // numbers fall through to "let them retry."
    attemptsAllowed === 1;

  // Passage hero: image + audio are stamped on q[0] by the build pipeline.
  const passageImage = questions[0]?.imageUrl ?? null;
  const passageAudio = questions[0]?.audioUrl ?? null;

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

      {questions.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            Your teacher hasn&apos;t added questions yet.
          </p>
        </div>
      ) : noAttemptsLeft ? (
        <AlreadyDone submission={submission} />
      ) : (
        <div className="mt-6">
          <StudentCustomQuizRunner
            quizId={quizId}
            questions={questions}
            passageTitle={q.title}
            passageBody={(q.description ?? "") as string}
            passageImage={passageImage}
            passageAudio={passageAudio}
            passThreshold={passThreshold ?? null}
            previouslyCompleted={hasCompleted}
            previousScore={submission?.score_percent ?? null}
            savedProgress={submission?.progress_state ?? null}
            homeLanguage={homeLanguage}
          />
        </div>
      )}
    </div>
  );
}

function AlreadyDone({
  submission,
}: {
  submission: {
    completed_at: string | null;
    score_percent: number | null;
    carrots_earned: number | null;
  } | null;
}) {
  const score = submission?.score_percent ?? 0;
  const carrots = submission?.carrots_earned ?? 0;
  return (
    <div className="mt-6 rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center dark:border-green-900/40 dark:from-green-950/30 dark:to-emerald-950/30">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
        <Trophy className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white">
        You already finished this one!
      </h2>
      <div className="mt-2 font-mono text-3xl font-black text-indigo-700 dark:text-indigo-300">
        {score}%
      </div>
      <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-slate-400">
        +{carrots} carrots earned
      </p>
      <Link
        href="/student"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        Back home
      </Link>
    </div>
  );
}
