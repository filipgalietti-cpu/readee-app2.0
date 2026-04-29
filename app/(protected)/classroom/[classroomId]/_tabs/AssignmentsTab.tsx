import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { ClipboardList, Clock, CheckCircle2, CircleDashed, Target, ListChecks, ExternalLink, Eye } from "lucide-react";
import NewAssignmentButton from "../_components/NewAssignmentButton";
import AssignmentActions from "../_components/AssignmentActions";
import StartLiveQuizButton from "../_components/StartLiveQuizButton";
import type { Assignment } from "@/lib/db/types";
import lessons from "@/app/data/sample-lessons.json";

type LessonRef = {
  standardId: string;
  grade: string;
  title: string;
  domain: string;
};

const LESSON_INDEX: LessonRef[] = (lessons as LessonRef[]).map((l) => ({
  standardId: l.standardId,
  grade: l.grade,
  title: l.title,
  domain: l.domain,
}));

type StudentStatus = "done" | "pending";

type StudentCell = {
  childId: string;
  firstName: string;
  status: StudentStatus;
  scorePercent: number | null;
};

function dueLabel(dueAt: string | null): { text: string; tone: string } | null {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diff = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)}d`, tone: "text-red-600 dark:text-red-400" };
  if (diff === 0) return { text: "Due today", tone: "text-amber-700 dark:text-amber-300" };
  if (diff === 1) return { text: "Due tomorrow", tone: "text-amber-700 dark:text-amber-300" };
  if (diff <= 7) return { text: `Due in ${diff}d`, tone: "text-zinc-600 dark:text-slate-400" };
  return {
    text: `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    tone: "text-zinc-500 dark:text-slate-400",
  };
}

export default async function AssignmentsTab({ classroomId }: { classroomId: string }) {
  const profile = await requireProfile();
  const supabase = await createClient();

  // Load teacher's own custom quizzes so the New Assignment button can
  // offer them as an assignment source.
  const { data: customQuizzesRaw } = await supabase
    .from("custom_quizzes")
    .select("id, title, description, grade_level")
    .eq("teacher_id", profile.id)
    .order("updated_at", { ascending: false });
  const customQuizIds = ((customQuizzesRaw ?? []) as any[]).map((q) => q.id);
  const { data: customQuizCounts } = customQuizIds.length
    ? await supabase
        .from("custom_quiz_questions")
        .select("quiz_id")
        .in("quiz_id", customQuizIds)
    : { data: [] as any[] };
  const countByQuiz = new Map<string, number>();
  (customQuizCounts ?? []).forEach((r: any) => {
    countByQuiz.set(r.quiz_id, (countByQuiz.get(r.quiz_id) ?? 0) + 1);
  });
  const customQuizzes = ((customQuizzesRaw ?? []) as any[]).map((q) => ({
    id: q.id as string,
    title: q.title as string,
    description: (q.description ?? null) as string | null,
    grade_level: (q.grade_level ?? null) as string | null,
    question_count: countByQuiz.get(q.id) ?? 0,
  }));

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("classroom_id", classroomId)
    .order("assigned_at", { ascending: false });

  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("child_id, children(id, first_name)")
    .eq("classroom_id", classroomId);

  const roster = (memberships ?? []).map((m) => {
    const raw = m as unknown as { child_id: string; children: { id: string; first_name: string } };
    return { id: raw.children.id, firstName: raw.children.first_name };
  });

  const list = (assignments ?? []) as Assignment[];
  const total = roster.length;

  const submissionsByAssignment = new Map<
    string,
    Map<string, { completed_at: string | null; score_percent: number | null }>
  >();
  if (list.length > 0) {
    const ids = list.map((a) => a.id);
    const { data: subs } = await supabase
      .from("assignment_submissions")
      .select("assignment_id, child_id, completed_at, score_percent")
      .in("assignment_id", ids);

    (subs ?? []).forEach((s: any) => {
      if (!submissionsByAssignment.has(s.assignment_id)) {
        submissionsByAssignment.set(s.assignment_id, new Map());
      }
      submissionsByAssignment.get(s.assignment_id)!.set(s.child_id, {
        completed_at: s.completed_at,
        score_percent: s.score_percent == null ? null : Number(s.score_percent),
      });
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          {list.length} assignment{list.length === 1 ? "" : "s"} ·{" "}
          {total} student{total === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <StartLiveQuizButton
            classroomId={classroomId}
            customQuizzes={customQuizzes.map((q) => ({
              id: q.id,
              title: q.title,
              question_count: q.question_count,
            }))}
          />
          <NewAssignmentButton classroomId={classroomId} lessons={LESSON_INDEX} customQuizzes={customQuizzes} />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
            <ClipboardList className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
            No assignments yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
            Assign any of Readee&apos;s 200+ lessons to your class — kids see it
            pinned at the top of their home.
          </p>
          <div className="mt-6">
            <NewAssignmentButton classroomId={classroomId} lessons={LESSON_INDEX} customQuizzes={customQuizzes} />
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((a) => {
            const subMap = submissionsByAssignment.get(a.id) ?? new Map();
            const cells: StudentCell[] = roster.map((r) => {
              const sub = subMap.get(r.id);
              const done = !!sub?.completed_at;
              return {
                childId: r.id,
                firstName: r.firstName,
                status: done ? "done" : "pending",
                scorePercent: sub?.score_percent ?? null,
              };
            });

            const doneCount = cells.filter((c) => c.status === "done").length;
            const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
            const scores = cells
              .filter((c) => c.status === "done" && c.scorePercent !== null)
              .map((c) => c.scorePercent as number);
            const avgScore = scores.length
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : null;

            const due = dueLabel(a.due_at);
            const isAllDone = total > 0 && doneCount === total;

            return (
              <li
                key={a.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-slate-800 dark:text-slate-400">
                        {a.kind === "readee_lesson" ? "Lesson" : "Custom quiz"}
                      </span>
                      {isAllDone ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                          <CheckCircle2 className="h-3 w-3" />
                          All done
                        </span>
                      ) : due ? (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${due.tone}`}>
                          <Clock className="h-3 w-3" />
                          {due.text}
                        </span>
                      ) : null}
                    </div>
                    {(() => {
                      const target =
                        a.kind === "custom_quiz"
                          ? `/classroom/authoring/quiz/${a.source_id}`
                          : a.kind === "readee_lesson"
                          ? `/classroom/library?standard=${encodeURIComponent(a.source_id)}`
                          : null;
                      const previewTarget =
                        a.kind === "custom_quiz"
                          ? `/classroom/authoring/quiz/${a.source_id}/preview`
                          : null;
                      return (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {target ? (
                            <Link
                              href={target}
                              className="group inline-flex max-w-full items-center gap-1.5 truncate text-base font-bold text-zinc-900 transition hover:text-indigo-700 dark:text-white dark:hover:text-indigo-300"
                            >
                              <span className="truncate">{a.title}</span>
                              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-0 transition group-hover:opacity-100" />
                            </Link>
                          ) : (
                            <h3 className="truncate text-base font-bold text-zinc-900 dark:text-white">
                              {a.title}
                            </h3>
                          )}
                          {previewTarget && (
                            <Link
                              href={previewTarget}
                              className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-900/40 dark:bg-slate-900 dark:text-indigo-300"
                              title="Preview as student"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Link>
                          )}
                        </div>
                      );
                    })()}
                    {a.note && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-slate-400">
                        {a.note}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-slate-400">
                      {(a as any).pass_threshold != null && (
                        <span className="inline-flex items-center gap-1">
                          <Target className="h-3 w-3 text-indigo-600" />
                          {Number((a as any).pass_threshold)}% to pass
                        </span>
                      )}
                      {Array.isArray((a as any).question_ids) && (a as any).question_ids.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <ListChecks className="h-3 w-3 text-indigo-600" />
                          {(a as any).question_ids.length} specific questions
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-start gap-3">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                        {doneCount}/{total}
                      </div>
                      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                        complete
                      </div>
                      {avgScore !== null && (
                        <div className="mt-1 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                          Avg {avgScore}%
                        </div>
                      )}
                    </div>
                    <AssignmentActions
                      assignmentId={a.id}
                      initialTitle={a.title}
                      initialNote={a.note}
                      initialDueAt={a.due_at}
                    />
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {cells.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cells.map((c) => (
                      <span
                        key={c.childId}
                        title={
                          c.status === "done"
                            ? `${c.firstName} · ${c.scorePercent ?? "—"}%`
                            : `${c.firstName} · not started`
                        }
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          c.status === "done"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                            : "bg-zinc-100 text-zinc-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {c.status === "done" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <CircleDashed className="h-3 w-3" />
                        )}
                        {c.firstName}
                        {c.status === "done" && c.scorePercent !== null && (
                          <span className="font-mono text-[10px] opacity-70">{c.scorePercent}%</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
