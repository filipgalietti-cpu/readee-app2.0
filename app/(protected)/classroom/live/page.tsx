import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Zap,
  Users,
  Clock,
  ArrowRight,
  GraduationCap,
  PlayCircle,
} from "lucide-react";

type Session = {
  id: string;
  classroom_id: string;
  title: string;
  session_code: string;
  status: "lobby" | "running" | "ended";
  current_question_idx: number;
  question_ids: string[];
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

type Classroom = { id: string; name: string };

function friendlyDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Hub for live (real-time, in-class) quizzes. Surfaces in-progress
 * sessions a teacher can resume + a list of classrooms to launch from.
 * Past sessions show summary stats so you can spot-check how a class
 * did right after the bell.
 */
export default async function LiveHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: classroomRows } = await supabase
    .from("classrooms")
    .select("id, name")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: true });
  const classrooms = (classroomRows ?? []) as Classroom[];

  const { data: sessionRows } = await supabase
    .from("live_quiz_sessions")
    .select(
      "id, classroom_id, title, session_code, status, current_question_idx, question_ids, started_at, ended_at, created_at",
    )
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const sessions = (sessionRows ?? []) as Session[];

  const active = sessions.filter((s) => s.status !== "ended");
  const ended = sessions.filter((s) => s.status === "ended").slice(0, 5);

  // Participant + answer counts for the active sessions so we can show
  // "X kids in lobby" / "Y answers in" at a glance.
  const activeIds = active.map((s) => s.id);
  const { data: participantRows } =
    activeIds.length === 0
      ? { data: [] }
      : await supabase
          .from("live_quiz_participants")
          .select("session_id")
          .in("session_id", activeIds);
  const participantsBySession = new Map<string, number>();
  for (const p of (participantRows ?? []) as { session_id: string }[]) {
    participantsBySession.set(
      p.session_id,
      (participantsBySession.get(p.session_id) ?? 0) + 1,
    );
  }

  const classroomNameById = new Map(classrooms.map((c) => [c.id, c.name]));

  if (classrooms.length === 0) {
    return <EmptyLiveHub />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <Zap className="h-3.5 w-3.5" />
          Live quiz
        </div>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          Run a real-time quiz with your class
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Project the join code, students enter on their devices, you advance
          the questions. Resume an in-progress session or launch a new one.
        </p>
      </header>

      {active.length > 0 && (
        <section className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-5 dark:border-violet-900/40 dark:bg-violet-950/20">
          <div className="mb-3 flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
              In progress
            </h2>
          </div>
          <ul className="space-y-2">
            {active.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900/40"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                    {classroomNameById.get(s.classroom_id) ?? "Classroom"} ·
                    started {friendlyDate(s.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden text-right sm:block">
                    <div className="font-mono text-base font-bold tracking-widest text-violet-700 dark:text-violet-300">
                      {s.session_code}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-400">
                      Join code
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="flex items-center gap-1 text-sm font-bold text-zinc-700 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5" />
                      {participantsBySession.get(s.id) ?? 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-400">
                      In room
                    </div>
                  </div>
                  <Link
                    href={`/classroom/live/${s.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-700"
                  >
                    Resume
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
            Launch a new session
          </h2>
        </div>
        <p className="mb-3 text-sm text-zinc-500 dark:text-slate-400">
          Open a classroom and use the <span className="font-semibold">Start live quiz</span>{" "}
          button to pick a standard or custom quiz to run.
        </p>
        <ul className="divide-y divide-zinc-100 dark:divide-slate-800">
          {classrooms.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                {c.name}
              </div>
              <Link
                href={`/classroom/${c.id}`}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                Open
                <ArrowRight className="h-3 w-3" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {ended.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Recently ended
            </h2>
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-slate-800">
            {ended.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                    {classroomNameById.get(s.classroom_id) ?? "Classroom"} ·{" "}
                    {(s.question_ids ?? []).length} question
                    {(s.question_ids ?? []).length === 1 ? "" : "s"} ·{" "}
                    {s.ended_at ? friendlyDate(s.ended_at) : friendlyDate(s.created_at)}
                  </div>
                </div>
                <Link
                  href={`/classroom/live/${s.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
                >
                  See results
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function EmptyLiveHub() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        <Zap className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-zinc-900 dark:text-white">
        No classrooms yet
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
        Live quiz needs at least one classroom with students enrolled. Start a
        classroom and invite kids before kicking off your first session.
      </p>
      <Link
        href="/classroom"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Go to classrooms
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
