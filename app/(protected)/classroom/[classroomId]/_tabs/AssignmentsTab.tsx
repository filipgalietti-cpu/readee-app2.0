import { createClient } from "@/lib/supabase/server";
import { ClipboardList, Clock } from "lucide-react";
import NewAssignmentButton from "../_components/NewAssignmentButton";
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

export default async function AssignmentsTab({ classroomId }: { classroomId: string }) {
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("classroom_id", classroomId)
    .order("assigned_at", { ascending: false });

  const { count: studentCount } = await supabase
    .from("classroom_memberships")
    .select("id", { count: "exact", head: true })
    .eq("classroom_id", classroomId);

  const list = (assignments ?? []) as Assignment[];

  const submissionsByAssignment = await (async () => {
    if (list.length === 0) return new Map<string, { done: number }>();
    const ids = list.map((a) => a.id);
    const { data } = await supabase
      .from("assignment_submissions")
      .select("assignment_id, completed_at")
      .in("assignment_id", ids)
      .not("completed_at", "is", null);
    const m = new Map<string, { done: number }>();
    (data ?? []).forEach((s: { assignment_id: string }) => {
      const cur = m.get(s.assignment_id) ?? { done: 0 };
      cur.done += 1;
      m.set(s.assignment_id, cur);
    });
    return m;
  })();

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          {list.length} assignment{list.length === 1 ? "" : "s"} ·{" "}
          {studentCount ?? 0} student{studentCount === 1 ? "" : "s"}
        </p>
        <NewAssignmentButton classroomId={classroomId} lessons={LESSON_INDEX} />
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
            <NewAssignmentButton classroomId={classroomId} lessons={LESSON_INDEX} />
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((a) => {
            const done = submissionsByAssignment.get(a.id)?.done ?? 0;
            const total = studentCount ?? 0;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <li
                key={a.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-slate-800 dark:text-slate-400">
                        {a.kind === "readee_lesson" ? "Lesson" : "Custom quiz"}
                      </span>
                      {a.due_at && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          Due {new Date(a.due_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 truncate text-base font-bold text-zinc-900 dark:text-white">
                      {a.title}
                    </h3>
                    {a.note && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-slate-400">
                        {a.note}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                      {done}/{total}
                    </div>
                    <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                      complete
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
