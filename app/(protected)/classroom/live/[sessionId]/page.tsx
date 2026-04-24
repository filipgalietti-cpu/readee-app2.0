import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";
import LiveQuizHost from "./_components/LiveQuizHost";

export const dynamic = "force-dynamic";

type QRef = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
  audioUrl: string | null;
};

function resolveReadeeQuestions(standardId: string, questionIds: string[]): QRef[] {
  for (const bank of [kJson, g1Json, g2Json, g3Json, g4Json] as any[]) {
    const match = bank.standards?.find((s: any) => s.standard_id === standardId);
    if (!match) continue;
    const want = new Set(questionIds);
    const out: QRef[] = [];
    for (const q of match.questions ?? []) {
      if (q.type !== "multiple_choice") continue;
      if (questionIds.length > 0 && !want.has(q.id)) continue;
      if (!Array.isArray(q.choices) || q.choices.length < 2) continue;
      const correct = Array.isArray(q.correct) ? q.correct[0] : q.correct;
      if (typeof correct !== "string") continue;
      out.push({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices,
        correct,
        audioUrl: typeof q.audio_url === "string" ? q.audio_url : null,
      });
    }
    // Preserve the teacher's ordering if question_ids was specified.
    if (questionIds.length > 0) {
      const byId = new Map(out.map((q) => [q.id, q]));
      return questionIds
        .map((id) => byId.get(id))
        .filter((x): x is QRef => !!x);
    }
    return out;
  }
  return [];
}

export default async function LiveQuizHostPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("live_quiz_sessions")
    .select(
      "id, classroom_id, title, session_code, status, current_question_idx, question_ids, source_kind, source_id",
    )
    .eq("id", sessionId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!session) notFound();
  const s = session as any;

  // Resolve the actual question payload (MCQ only in v1). Custom quiz
  // support lives alongside — if source_kind === 'custom_quiz', pull
  // from custom_quizzes + custom_questions.
  let questions: QRef[] = [];
  if (s.source_kind === "readee_lesson") {
    questions = resolveReadeeQuestions(s.source_id, s.question_ids ?? []);
  } else if (s.source_kind === "custom_quiz") {
    const { data: cqs } = await supabase
      .from("custom_quiz_questions")
      .select("position, custom_questions(id, prompt, choices, correct, kind)")
      .eq("quiz_id", s.source_id)
      .order("position", { ascending: true });
    for (const row of (cqs ?? []) as any[]) {
      const q = row.custom_questions;
      if (q?.kind !== "multiple_choice") continue;
      if (!Array.isArray(q.choices) || q.choices.length < 2) continue;
      const correct = typeof q.correct === "string" ? q.correct : String(q.correct ?? "");
      questions.push({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices,
        correct,
        audioUrl: null,
      });
    }
  }

  if (questions.length === 0) {
    redirect(`/classroom/${s.classroom_id}?tab=assignments&liveError=no_questions`);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href={`/classroom/${s.classroom_id}?tab=assignments`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to classroom
      </Link>
      <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
        <Zap className="h-4 w-4" />
        Live quiz · host view
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {s.title}
      </h1>

      <div className="mt-8">
        <LiveQuizHost
          sessionId={sessionId}
          classroomId={s.classroom_id}
          sessionCode={s.session_code}
          initialStatus={s.status}
          initialIdx={s.current_question_idx}
          questions={questions}
        />
      </div>
    </div>
  );
}
