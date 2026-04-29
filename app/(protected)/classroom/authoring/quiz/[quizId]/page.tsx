import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardPen, ListChecks, Sparkles, Eye, Volume2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { getAllStandards } from "@/lib/data/standards";
import sampleLessons from "@/app/data/sample-lessons.json";
import QuizBuilder from "./_components/QuizBuilder";
import AssignQuizDialog from "./_components/AssignQuizDialog";
import PassageImageLightbox from "./_components/PassageImageLightbox";

export const dynamic = "force-dynamic";

function gradeKeyToShort(grade: string): string {
  if (grade === "kindergarten") return "K";
  if (grade === "1st-grade") return "1st";
  if (grade === "2nd-grade") return "2nd";
  if (grade === "3rd-grade") return "3rd";
  if (grade === "4th-grade") return "4th";
  return grade;
}

export default async function QuizBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ built?: string; warn?: string }>;
}) {
  const { quizId } = await params;
  const { built, warn } = await searchParams;
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

  // Passage image is stamped on every question by the build-assignment
  // orchestrator; pull the first one's image as the passage hero.
  // Passage audio is on the first question's audio_url (when present).
  const passageImage = questions[0]?.imageUrl ?? null;
  const passageAudio = questions[0]?.audioUrl ?? null;

  // Classrooms the teacher owns + their rosters — feeds the inline
  // assign-to-class flow including the per-student picker.
  const { data: classroomRows } = await supabase
    .from("classrooms")
    .select("id, name")
    .eq("teacher_id", profile.id)
    .order("created_at", { ascending: true });
  const classroomList = (classroomRows ?? []) as { id: string; name: string }[];

  let classrooms: {
    id: string;
    name: string;
    children: { id: string; first_name: string }[];
  }[] = classroomList.map((c) => ({ ...c, children: [] }));

  if (classroomList.length > 0) {
    try {
      const ids = classroomList.map((c) => c.id);
      // Two-step fetch: avoid Supabase relation-inference quirks by
      // pulling memberships first, then children separately. The
      // embedded join `children(id, first_name)` returns either an
      // array or an object depending on the inferred cardinality, and
      // the typed access can throw if RLS surprises us. Keep the page
      // resilient — a roster-fetch failure should never break the
      // builder render; "Specific students" just degrades to disabled.
      const { data: memberships } = await supabase
        .from("classroom_memberships")
        .select("classroom_id, child_id")
        .in("classroom_id", ids);
      const memberRows = (memberships ?? []) as {
        classroom_id: string;
        child_id: string;
      }[];
      const childIds = Array.from(new Set(memberRows.map((m) => m.child_id)));
      const childMap = new Map<string, string>();
      if (childIds.length > 0) {
        const { data: kids } = await supabase
          .from("children")
          .select("id, first_name")
          .in("id", childIds);
        for (const k of (kids ?? []) as { id: string; first_name: string | null }[]) {
          childMap.set(k.id, k.first_name ?? "Student");
        }
      }
      const byClass = new Map<string, { id: string; first_name: string }[]>();
      for (const m of memberRows) {
        const name = childMap.get(m.child_id);
        if (!name) continue;
        const arr = byClass.get(m.classroom_id) ?? [];
        arr.push({ id: m.child_id, first_name: name });
        byClass.set(m.classroom_id, arr);
      }
      classrooms = classroomList.map((c) => ({
        ...c,
        children: (byClass.get(c.id) ?? []).sort((a, b) =>
          a.first_name.localeCompare(b.first_name),
        ),
      }));
    } catch (e) {
      console.error("[quiz/[quizId]/page] roster fetch failed", e);
      // Leave classrooms with empty children — dialog falls back to
      // whole-class only.
    }
  }

  // Standard catalog for the in-modal "AI fill" picker. Same shape the
  // Calibrated Item tool uses so the picker reads identically.
  const titleByStandard = new Map<string, string>();
  for (const l of sampleLessons as { standardId?: string; title?: string }[]) {
    if (l?.standardId && l?.title) {
      titleByStandard.set(l.standardId, l.title);
    }
  }
  const standardOptions = getAllStandards().map((s) => ({
    standardId: s.standard_id,
    title: titleByStandard.get(s.standard_id) ?? s.standard_description,
    standardDescription: s.standard_description,
    domain: s.domain,
    grade: gradeKeyToShort(s.grade),
    gradeLabel: s.gradeLabel,
  }));

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
          <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-slate-400">
            <ListChecks className="h-3 w-3" />
            {questions.length} question{questions.length === 1 ? "" : "s"}
            {q.grade_level ? ` · ${q.grade_level}` : ""}
          </div>
        </div>
        {questions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/classroom/authoring/quiz/${quizId}/preview`}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview as student
            </Link>
            <AssignQuizDialog
              quizId={quizId}
              quizTitle={q.title}
              classrooms={classrooms}
            />
          </div>
        )}
      </div>

      {/* Passage hero — image + audio preview when the wizard generated
          them. Shows above the description so the teacher can verify the
          AI's output before assigning. */}
      {(passageImage || passageAudio || q.description) && (
        <div
          className={`mt-6 grid gap-4 ${
            passageImage ? "sm:grid-cols-[200px_1fr]" : "sm:grid-cols-1"
          }`}
        >
          {passageImage && (
            <PassageImageLightbox src={passageImage} quizId={quizId} />
          )}
          <div className="flex flex-col gap-2">
            {q.description && (
              <article
                className="rounded-2xl border border-zinc-200 bg-white p-4 text-[16px] leading-[1.75] text-zinc-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                style={{
                  // Kid-friendly rounded sans stack. Comic Neue / Comic Sans
                  // are the friendly defaults; Quicksand and Nunito are warm
                  // fallbacks; system sans last.
                  fontFamily:
                    '"Comic Neue", "Comic Sans MS", Quicksand, Nunito, ui-rounded, system-ui, -apple-system, sans-serif',
                  letterSpacing: "0.005em",
                }}
              >
                <div className="whitespace-pre-line">{q.description}</div>
              </article>
            )}
            {passageAudio && (
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <Volume2 className="h-4 w-4 flex-shrink-0 text-violet-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Read-aloud
                </span>
                <audio
                  src={passageAudio}
                  controls
                  preload="none"
                  className="ml-auto max-w-[260px]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {built === "1" && warn && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div>
            <div className="font-bold">Build finished with warnings.</div>
            <div className="mt-0.5 text-xs">{warn}</div>
          </div>
        </div>
      )}

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
            <AssignQuizDialog
              quizId={quizId}
              quizTitle={q.title}
              classrooms={classrooms}
            />
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
          passageImageUrl={passageImage}
          passageAudioUrl={passageAudio}
          standards={standardOptions}
        />
      </div>
    </div>
  );
}
