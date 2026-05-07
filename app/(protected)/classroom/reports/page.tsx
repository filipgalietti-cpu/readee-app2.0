import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  BarChart3,
  TrendingDown,
  Activity,
  Users2,
  BookOpen,
  Target,
  AlertCircle,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import lessons from "@/app/data/sample-lessons.json";
import { daysAgoIso } from "@/lib/utils/dates";

type LessonRef = { standardId: string; title: string; domain: string };
const STANDARD_TITLE = new Map<string, string>(
  (lessons as LessonRef[]).map((l) => [l.standardId, l.title]),
);

type ChildLite = { id: string; first_name: string };
type Classroom = { id: string; name: string };
type PracticeRow = {
  child_id: string;
  standard_id: string;
  questions_attempted: number;
  questions_correct: number;
  completed_at: string;
};

function friendlyDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Cross-classroom reports for the logged-in teacher.
 *
 * The per-classroom Insights tab answers "how is this class doing?".
 * Reports answers the bigger question: "who needs my attention this
 * week, across everything I teach?". Aggregates classes, then per-class
 * snapshots + struggling readers + hardest standards + recent activity.
 */
export default async function ReportsPage() {
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

  if (classrooms.length === 0) {
    return <EmptyReports />;
  }

  const classroomIds = classrooms.map((c) => c.id);

  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("classroom_id, child_id, children(id, first_name)")
    .in("classroom_id", classroomIds);

  const childById = new Map<string, string>();
  const classroomChildren = new Map<string, string[]>();
  for (const m of (memberships ?? []) as any[]) {
    const child = m.children as ChildLite | null;
    if (!child) continue;
    childById.set(child.id, child.first_name);
    const arr = classroomChildren.get(m.classroom_id) ?? [];
    arr.push(child.id);
    classroomChildren.set(m.classroom_id, arr);
  }

  const allChildIds = Array.from(childById.keys());
  const totalStudents = allChildIds.length;

  const thirtyDaysAgo = daysAgoIso(30);
  const sevenDaysAgo = daysAgoIso(7);

  const { data: practice30 } =
    allChildIds.length === 0
      ? { data: [] as PracticeRow[] }
      : await supabase
          .from("practice_results")
          .select(
            "child_id, standard_id, questions_attempted, questions_correct, completed_at",
          )
          .in("child_id", allChildIds)
          .gte("completed_at", thirtyDaysAgo);
  const rows = (practice30 ?? []) as PracticeRow[];

  let totalAttempted = 0;
  let totalCorrect = 0;
  const activeChildren = new Set<string>();
  const byStandard = new Map<string, { attempted: number; correct: number }>();
  const byChild = new Map<
    string,
    { attempted: number; correct: number; lastActivity: string | null }
  >();

  for (const r of rows) {
    totalAttempted += r.questions_attempted;
    totalCorrect += r.questions_correct;
    if (r.completed_at >= sevenDaysAgo) activeChildren.add(r.child_id);

    const c = byChild.get(r.child_id) ?? {
      attempted: 0,
      correct: 0,
      lastActivity: null,
    };
    c.attempted += r.questions_attempted;
    c.correct += r.questions_correct;
    if (!c.lastActivity || r.completed_at > c.lastActivity) {
      c.lastActivity = r.completed_at;
    }
    byChild.set(r.child_id, c);

    if (r.standard_id.startsWith("custom:")) continue;
    const s = byStandard.get(r.standard_id) ?? { attempted: 0, correct: 0 };
    s.attempted += r.questions_attempted;
    s.correct += r.questions_correct;
    byStandard.set(r.standard_id, s);
  }

  const classMastery =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

  const hardestStandards = Array.from(byStandard.entries())
    .filter(([, v]) => v.attempted >= 5)
    .map(([standardId, v]) => ({
      standardId,
      title: STANDARD_TITLE.get(standardId) ?? standardId,
      attempted: v.attempted,
      correct: v.correct,
      accuracy: Math.round((v.correct / v.attempted) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 6);

  // A "struggling reader" is anyone with at least 10 attempts and <60%
  // accuracy in the last 30 days, OR a kid enrolled but inactive for
  // 7+ days. Inactive matters more than accuracy at low volumes.
  const struggling = allChildIds
    .map((cid) => {
      const stat = byChild.get(cid);
      const firstName = childById.get(cid) ?? "Student";
      const accuracy =
        stat && stat.attempted > 0
          ? Math.round((stat.correct / stat.attempted) * 100)
          : null;
      const isInactive =
        !stat?.lastActivity || stat.lastActivity < sevenDaysAgo;
      const isLowAccuracy =
        stat != null && stat.attempted >= 10 && (accuracy ?? 100) < 60;
      return {
        childId: cid,
        firstName,
        accuracy,
        attempted: stat?.attempted ?? 0,
        lastActivity: stat?.lastActivity ?? null,
        isInactive,
        isLowAccuracy,
      };
    })
    .filter((s) => s.isInactive || s.isLowAccuracy)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))
    .slice(0, 8);

  const { data: recentSubs } = await supabase
    .from("assignment_submissions")
    .select(
      "child_id, completed_at, score_percent, assignments!inner(title, classroom_id)",
    )
    .in("child_id", allChildIds.length === 0 ? ["__none__"] : allChildIds)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(12);

  const classroomNameById = new Map(classrooms.map((c) => [c.id, c.name]));
  const recentActivity = (recentSubs ?? [])
    .filter((s: any) => classroomNameById.has(s.assignments?.classroom_id))
    .map((s: any) => ({
      firstName: childById.get(s.child_id) ?? "Student",
      title: s.assignments.title,
      classroomName:
        classroomNameById.get(s.assignments.classroom_id) ?? "",
      scorePercent:
        s.score_percent == null ? null : Math.round(Number(s.score_percent)),
      completedAt: s.completed_at,
    }))
    .slice(0, 10);

  // Per-classroom snapshot: enrolled / active-7d / mastery-30d
  const perClassroom = classrooms.map((c) => {
    const kidIds = classroomChildren.get(c.id) ?? [];
    let attempted = 0;
    let correct = 0;
    const active = new Set<string>();
    for (const r of rows) {
      if (!kidIds.includes(r.child_id)) continue;
      attempted += r.questions_attempted;
      correct += r.questions_correct;
      if (r.completed_at >= sevenDaysAgo) active.add(r.child_id);
    }
    return {
      id: c.id,
      name: c.name,
      enrolled: kidIds.length,
      active7d: active.size,
      mastery: attempted > 0 ? Math.round((correct / attempted) * 100) : null,
      attempted,
    };
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <BarChart3 className="h-3.5 w-3.5" />
          Reports
        </div>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          How your students are doing
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Cross-classroom view. Last 30 days unless noted.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Users2}
          label="Active this week"
          value={`${activeChildren.size}/${totalStudents}`}
          hint="students who practiced"
        />
        <SummaryCard
          icon={Target}
          label="Class mastery"
          value={classMastery === null ? "—" : `${classMastery}%`}
          hint="correct answers, all classes"
        />
        <SummaryCard
          icon={BookOpen}
          label="Questions answered"
          value={totalAttempted.toLocaleString()}
          hint="across the roster"
        />
        <SummaryCard
          icon={GraduationCap}
          label="Classrooms"
          value={classrooms.length.toString()}
          hint={`${totalStudents} students enrolled`}
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
            By classroom
          </h3>
        </div>
        <ul className="divide-y divide-zinc-100 dark:divide-slate-800">
          {perClassroom.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                  {c.name}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                  {c.enrolled} enrolled · {c.active7d} active this week ·{" "}
                  {c.attempted.toLocaleString()} questions answered
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div
                    className={`font-mono text-sm font-bold ${
                      c.mastery === null
                        ? "text-zinc-400"
                        : c.mastery < 60
                          ? "text-red-600"
                          : c.mastery < 75
                            ? "text-amber-600"
                            : "text-emerald-600"
                    }`}
                  >
                    {c.mastery === null ? "—" : `${c.mastery}%`}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-400">
                    mastery
                  </div>
                </div>
                <Link
                  href={`/classroom/${c.id}?tab=insights`}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300"
                >
                  Open
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Needs your attention
            </h3>
          </div>
          {struggling.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
              Everyone's been active this week and hitting their accuracy bar.
              Nothing to flag.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
              {struggling.map((s) => (
                <li key={s.childId}>
                  <Link
                    href={`/classroom/reports/student/${s.childId}`}
                    className="flex items-center justify-between gap-3 py-3 transition hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                        {s.firstName}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                        {s.isInactive
                          ? s.lastActivity
                            ? `Last active ${friendlyDate(s.lastActivity)}`
                            : "Never practiced"
                          : `${s.attempted} attempts, ${s.accuracy}% accuracy`}
                      </div>
                    </div>
                    {s.isLowAccuracy && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">
                        Low accuracy
                      </span>
                    )}
                    {!s.isLowAccuracy && s.isInactive && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                        Inactive
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Hardest standards
            </h3>
          </div>
          {hardestStandards.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
              Not enough data yet — standards with 5+ attempts show up here.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
              {hardestStandards.map((m) => (
                <li
                  key={m.standardId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {m.title}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500 dark:text-slate-400">
                      {m.standardId}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono text-sm font-bold ${
                        m.accuracy < 60
                          ? "text-red-600"
                          : m.accuracy < 75
                            ? "text-amber-600"
                            : "text-zinc-700 dark:text-slate-300"
                      }`}
                    >
                      {m.accuracy}%
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-slate-500">
                      {m.correct}/{m.attempted}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
            Recent completions
          </h3>
        </div>
        {recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
            No assignments completed yet. Completions across all your classes show up here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
            {recentActivity.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {r.firstName}{" "}
                    <span className="font-normal text-zinc-500 dark:text-slate-400">
                      finished
                    </span>{" "}
                    {r.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-slate-500">
                    {r.classroomName} · {friendlyDate(r.completedAt)}
                  </div>
                </div>
                {r.scorePercent !== null && (
                  <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-300">
                    {r.scorePercent}%
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users2;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-zinc-400 dark:text-slate-500">
        {hint}
      </div>
    </div>
  );
}

function EmptyReports() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
        <BarChart3 className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-zinc-900 dark:text-white">
        No classrooms yet
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
        Reports show how every student across all your classrooms is doing.
        Start a classroom to begin collecting data.
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
