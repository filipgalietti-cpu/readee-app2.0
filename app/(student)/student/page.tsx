import Link from "next/link";
import { GraduationCap, Clock, CheckCircle2, BookOpen } from "lucide-react";
import { getStudentSession } from "@/lib/auth/student-session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Assignment = {
  id: string;
  kind: "readee_lesson" | "custom_quiz";
  source_id: string;
  title: string;
  note: string | null;
  due_at: string | null;
};

function dueLabel(dueAt: string | null): { text: string; tone: string } | null {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);
  const diff = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return { text: "Past due", tone: "text-red-600" };
  if (diff === 0) return { text: "Due today", tone: "text-amber-700" };
  if (diff === 1) return { text: "Due tomorrow", tone: "text-amber-700" };
  if (diff <= 7) return { text: `Due in ${diff}d`, tone: "text-zinc-600" };
  return {
    text: `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    tone: "text-zinc-500",
  };
}

function assignmentHref(a: Assignment): string {
  if (a.kind === "readee_lesson") {
    return `/student/learn?standard=${encodeURIComponent(a.source_id)}`;
  }
  return `/student`;
}

export default async function StudentHome() {
  const session = await getStudentSession();
  if (!session) redirect("/class");

  const admin = supabaseAdmin();

  const [{ data: assignmentsRaw }, { data: completedRaw }, { data: childRaw }] =
    await Promise.all([
      admin
        .from("assignments")
        .select("id, kind, source_id, title, note, due_at")
        .eq("classroom_id", session.classroomId)
        .order("due_at", { ascending: true, nullsFirst: false }),
      admin
        .from("assignment_submissions")
        .select("assignment_id")
        .eq("child_id", session.childId)
        .not("completed_at", "is", null),
      admin
        .from("children")
        .select("first_name")
        .eq("id", session.childId)
        .maybeSingle(),
    ]);

  const completed = new Set(
    (completedRaw ?? []).map((r: any) => r.assignment_id as string),
  );
  const all = (assignmentsRaw ?? []) as Assignment[];
  const open = all.filter((a) => !completed.has(a.id));
  const done = all.filter((a) => completed.has(a.id));

  const firstName = (childRaw as any)?.first_name ?? "Reader";

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Hi, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Here&apos;s what your teacher set up for you.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-amber-600" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
            From your teacher
          </h2>
        </div>

        {open.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <BookOpen className="mx-auto h-10 w-10 text-zinc-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-zinc-700 dark:text-slate-300">
              All caught up!
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
              Nothing new from your teacher right now.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {open.map((a) => {
              const due = dueLabel(a.due_at);
              return (
                <li key={a.id}>
                  <Link
                    href={assignmentHref(a)}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
                  >
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-base font-extrabold text-zinc-900 dark:text-white">
                        {a.title}
                      </div>
                      {a.note && (
                        <div className="mt-0.5 truncate text-xs text-zinc-500 dark:text-slate-400">
                          {a.note}
                        </div>
                      )}
                      {due && (
                        <div className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${due.tone}`}>
                          <Clock className="h-3 w-3" />
                          {due.text}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
                      Start
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-300">
              Finished
            </h2>
          </div>
          <ul className="space-y-2">
            {done.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/60 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/20"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div className="text-sm font-semibold text-green-800 dark:text-green-200">
                  {a.title}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
