import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getStudentSession } from "@/lib/auth/student-session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import StudentLessonRunner from "./_components/StudentLessonRunner";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";
import sampleLessons from "@/app/data/sample-lessons.json";

export const dynamic = "force-dynamic";

type StandardQuestion = {
  id: string;
  type: string;
  prompt: string;
  choices?: string[];
  correct?: string | string[];
  hint?: string;
  audio_url?: string;
};

type Standard = {
  standard_id: string;
  standard_description: string;
  domain: string;
  questions: StandardQuestion[];
};

type LessonStep = {
  sub: string;
  audioFile?: string;
  ttsScript?: string;
  displayText?: string;
  interaction?: string;
};

type LessonSlide = {
  slide: number;
  type?: string;
  steps: LessonStep[];
};

type SampleLesson = {
  standardId: string;
  title: string;
  slides?: LessonSlide[];
};

function findStandard(standardId: string): Standard | null {
  for (const bank of [kJson, g1Json, g2Json, g3Json, g4Json] as any[]) {
    const match = bank.standards?.find((s: Standard) => s.standard_id === standardId);
    if (match) return match;
  }
  return null;
}

function findLesson(standardId: string): SampleLesson | null {
  return (sampleLessons as SampleLesson[]).find((l) => l.standardId === standardId) ?? null;
}

export default async function StudentLearnPage({
  searchParams,
}: {
  searchParams: Promise<{ standard?: string }>;
}) {
  const session = await getStudentSession();
  if (!session) redirect("/class");

  const sp = await searchParams;
  const standardId = sp.standard;
  if (!standardId) notFound();

  const standard = findStandard(standardId);
  if (!standard) notFound();

  const lesson = findLesson(standardId);
  const slides = (lesson?.slides ?? []).filter((s) => (s.steps ?? []).length > 0);

  // Find the most relevant open assignment for this student + standard so
  // we can respect teacher-configured subset + pass threshold.
  const admin = supabaseAdmin();
  const { data: assignmentRow } = await admin
    .from("assignments")
    .select(
      "id, question_ids, pass_threshold, audio_prompt_enabled, audio_choices_enabled, shuffle_questions, shuffle_choices, reveal_correct_immediately",
    )
    .eq("classroom_id", session.classroomId)
    .eq("kind", "readee_lesson")
    .eq("source_id", standardId)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const questionIdsFilter = (assignmentRow as any)?.question_ids as string[] | null | undefined;
  const passThreshold = (assignmentRow as any)?.pass_threshold as number | null | undefined;
  const audioPromptEnabled = (assignmentRow as any)?.audio_prompt_enabled !== false;
  const audioChoicesEnabled = (assignmentRow as any)?.audio_choices_enabled === true;
  const shuffleQuestions = (assignmentRow as any)?.shuffle_questions === true;
  const shuffleChoices = (assignmentRow as any)?.shuffle_choices !== false;
  const revealImmediately = (assignmentRow as any)?.reveal_correct_immediately !== false;

  let mcqs = standard.questions.filter(
    (q) => q.type === "multiple_choice" && Array.isArray(q.choices) && (q.choices?.length ?? 0) >= 2,
  );
  if (Array.isArray(questionIdsFilter) && questionIdsFilter.length > 0) {
    const allow = new Set(questionIdsFilter);
    const filtered = mcqs.filter((q) => allow.has(q.id));
    if (filtered.length > 0) mcqs = filtered;
  }

  // Fisher-Yates shuffle for question order + per-question choice order.
  // Done server-side so each request's render is stable but differs across
  // students (request-bound randomness).
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  if (shuffleQuestions) mcqs = shuffle(mcqs);
  if (shuffleChoices) {
    mcqs = mcqs.map((q) => ({
      ...q,
      choices: Array.isArray(q.choices) ? shuffle(q.choices) : q.choices,
    }));
  }

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
        <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          {standard.domain} · {standardId}
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {lesson?.title ?? standard.standard_description}
        </h1>
      </div>

      <div className="mt-6">
        <StudentLessonRunner
          standardId={standardId}
          lessonTitle={lesson?.title ?? standard.standard_description}
          slides={slides}
          mcqs={mcqs.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            choices: q.choices,
            correct: q.correct,
            hint: q.hint,
            audioUrl: q.audio_url ?? null,
          }))}
          passThreshold={passThreshold ?? null}
          audioPromptEnabled={audioPromptEnabled}
          audioChoicesEnabled={audioChoicesEnabled}
          revealImmediately={revealImmediately}
        />
      </div>
    </div>
  );
}
