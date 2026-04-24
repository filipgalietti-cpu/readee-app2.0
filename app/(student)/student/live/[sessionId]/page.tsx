import { notFound, redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth/student-session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";
import LiveQuizPlayer from "./_components/LiveQuizPlayer";

export const dynamic = "force-dynamic";

type QRef = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
};

function resolveReadeeQuestions(standardId: string, questionIds: string[]): QRef[] {
  for (const bank of [kJson, g1Json, g2Json, g3Json, g4Json] as any[]) {
    const match = bank.standards?.find((s: any) => s.standard_id === standardId);
    if (!match) continue;
    const want = new Set(questionIds);
    const byId = new Map<string, QRef>();
    for (const q of match.questions ?? []) {
      if (q.type !== "multiple_choice") continue;
      if (!Array.isArray(q.choices) || q.choices.length < 2) continue;
      const correct = Array.isArray(q.correct) ? q.correct[0] : q.correct;
      if (typeof correct !== "string") continue;
      if (questionIds.length > 0 && !want.has(q.id)) continue;
      byId.set(q.id, { id: q.id, prompt: q.prompt, choices: q.choices, correct });
    }
    if (questionIds.length > 0) {
      return questionIds.map((id) => byId.get(id)).filter((x): x is QRef => !!x);
    }
    return Array.from(byId.values());
  }
  return [];
}

export default async function StudentLivePlayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getStudentSession();
  if (!session) redirect("/class");

  const admin = supabaseAdmin();
  const { data: row } = await admin
    .from("live_quiz_sessions")
    .select("id, classroom_id, title, source_kind, source_id, question_ids")
    .eq("id", sessionId)
    .maybeSingle();
  if (!row) notFound();
  const s = row as any;
  if (s.classroom_id !== session.classroomId) notFound();

  // Ensure participant row exists (URL share can let a student land here
  // without having hit /join). Idempotent via the unique constraint.
  await admin
    .from("live_quiz_participants")
    .upsert(
      { session_id: sessionId, child_id: session.childId, left_at: null },
      { onConflict: "session_id,child_id" },
    );

  let questions: QRef[] = [];
  if (s.source_kind === "readee_lesson") {
    questions = resolveReadeeQuestions(s.source_id, s.question_ids ?? []);
  } else if (s.source_kind === "custom_quiz") {
    const { data: cqs } = await admin
      .from("custom_quiz_questions")
      .select("position, custom_questions(id, prompt, choices, correct, kind)")
      .eq("quiz_id", s.source_id)
      .order("position", { ascending: true });
    for (const r of (cqs ?? []) as any[]) {
      const q = r.custom_questions;
      if (q?.kind !== "multiple_choice") continue;
      if (!Array.isArray(q.choices) || q.choices.length < 2) continue;
      const correct = typeof q.correct === "string" ? q.correct : String(q.correct ?? "");
      questions.push({ id: q.id, prompt: q.prompt, choices: q.choices, correct });
    }
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-sm text-zinc-500">This quiz has no playable questions.</p>
      </div>
    );
  }

  return (
    <LiveQuizPlayer
      sessionId={sessionId}
      title={s.title}
      questions={questions}
    />
  );
}
