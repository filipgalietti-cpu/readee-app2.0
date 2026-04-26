import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  BarChart3,
  TrendingDown,
  Activity,
  Target,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import lessons from "@/app/data/sample-lessons.json";

type LessonRef = { standardId: string; title: string; domain: string };
const STANDARD_TITLE = new Map<string, string>(
  (lessons as LessonRef[]).map((l) => [l.standardId, l.title]),
);

type PracticeRow = {
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
 * Per-reader drill-down off /classroom/reports.
 *
 * The teacher clicks a struggling reader and lands here: top stats,
 * per-standard mastery sorted by need, last 5 practice attempts, and
 * recent assignment scores. Builds the picture you'd want for a
 * parent-teacher conference in one screen.
 */
export default async function StudentReportPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify the child is in one of this teacher's classrooms (RLS will
  // also enforce, but a clean 404 is friendlier than a Supabase error).
  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, grade, reading_level")
    .eq("id", childId)
    .maybeSingle();
  if (!child) notFound();

  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("classroom_id, classrooms!inner(id, name, teacher_id)")
    .eq("child_id", childId);
  const teacherClassrooms = ((memberships ?? []) as any[]).filter(
    (m) => m.classrooms?.teacher_id === user.id,
  );
  if (teacherClassrooms.length === 0) notFound();

  const classroomNames: string = teacherClassrooms
    .map((m) => m.classrooms.name)
    .join(" · ");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: practice30 } = await supabase
    .from("practice_results")
    .select(
      "standard_id, questions_attempted, questions_correct, completed_at",
    )
    .eq("child_id", childId)
    .gte("completed_at", thirtyDaysAgo)
    .order("completed_at", { ascending: false });
  const rows = (practice30 ?? []) as PracticeRow[];

  let totalAttempted = 0;
  let totalCorrect = 0;
  let lastSession: string | null = null;
  let activeDays = new Set<string>();
  const byStandard = new Map<string, { attempted: number; correct: number }>();

  for (const r of rows) {
    totalAttempted += r.questions_attempted;
    totalCorrect += r.questions_correct;
    if (!lastSession || r.completed_at > lastSession) lastSession = r.completed_at;
    activeDays.add(r.completed_at.slice(0, 10));
    if (r.standard_id.startsWith("custom:")) continue;
    const cur = byStandard.get(r.standard_id) ?? { attempted: 0, correct: 0 };
    cur.attempted += r.questions_attempted;
    cur.correct += r.questions_correct;
    byStandard.set(r.standard_id, cur);
  }

  const accuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;
  const isInactive = !lastSession || lastSession < sevenDaysAgo;

  const standardsRanked = Array.from(byStandard.entries())
    .map(([standardId, v]) => ({
      standardId,
      title: STANDARD_TITLE.get(standardId) ?? standardId,
      attempted: v.attempted,
      correct: v.correct,
      accuracy:
        v.attempted > 0 ? Math.round((v.correct / v.attempted) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const weakest = standardsRanked.filter((s) => s.attempted >= 3).slice(0, 5);
  const strongest = [...standardsRanked]
    .filter((s) => s.attempted >= 3)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  const lastFive = rows.slice(0, 5).map((r) => ({
    standardId: r.standard_id,
    title: r.standard_id.startsWith("custom:")
      ? "Custom quiz"
      : STANDARD_TITLE.get(r.standard_id) ?? r.standard_id,
    attempted: r.questions_attempted,
    correct: r.questions_correct,
    accuracy:
      r.questions_attempted > 0
        ? Math.round((r.questions_correct / r.questions_attempted) * 100)
        : 0,
    completedAt: r.completed_at,
  }));

  const { data: subs } = await supabase
    .from("assignment_submissions")
    .select(
      "completed_at, score_percent, assignments!inner(title, classroom_id)",
    )
    .eq("child_id", childId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(8);

  const teacherClassroomIds = new Set(
    teacherClassrooms.map((m: any) => m.classroom_id),
  );
  const recentAssignments = ((subs ?? []) as any[])
    .filter((s) => teacherClassroomIds.has(s.assignments?.classroom_id))
    .map((s: any) => ({
      title: s.assignments.title,
      score: s.score_percent == null ? null : Math.round(Number(s.score_percent)),
      completedAt: s.completed_at,
    }));

  const c = child as any;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <Link
          href="/classroom/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All reports
        </Link>
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <BarChart3 className="h-3.5 w-3.5" />
          Reader report
        </div>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
          {c.first_name}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-slate-400">
          {classroomNames}
          {c.grade ? ` · ${c.grade}` : ""}
          {c.reading_level ? ` · ${c.reading_level}` : ""}
        </p>
      </div>

      {(isInactive || (accuracy !== null && accuracy < 60 && totalAttempted >= 10)) && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <div className="font-bold">Worth a check-in.</div>
            <div className="mt-0.5 text-xs">
              {isInactive
                ? lastSession
                  ? `${c.first_name} hasn't practiced since ${friendlyDate(lastSession)}.`
                  : `${c.first_name} hasn't practiced yet.`
                : `${c.first_name}'s overall accuracy is ${accuracy}% — below the 60% threshold.`}
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Target}
          label="Accuracy (30d)"
          value={accuracy === null ? "—" : `${accuracy}%`}
          hint={`${totalCorrect.toLocaleString()} of ${totalAttempted.toLocaleString()} correct`}
        />
        <SummaryCard
          icon={Activity}
          label="Active days"
          value={activeDays.size.toString()}
          hint={
            lastSession
              ? `Last session ${friendlyDate(lastSession)}`
              : "No sessions yet"
          }
        />
        <SummaryCard
          icon={GraduationCap}
          label="Standards practiced"
          value={byStandard.size.toString()}
          hint={`${rows.length} sessions in 30d`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Needs work
            </h3>
          </div>
          {weakest.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
              Not enough data yet — standards with 3+ attempts show up here.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
              {weakest.map((s) => (
                <li
                  key={s.standardId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {s.title}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500 dark:text-slate-400">
                      {s.standardId} · {s.correct}/{s.attempted}
                    </div>
                  </div>
                  <div
                    className={`font-mono text-sm font-bold ${
                      s.accuracy < 60
                        ? "text-red-600"
                        : s.accuracy < 75
                          ? "text-amber-600"
                          : "text-zinc-700"
                    }`}
                  >
                    {s.accuracy}%
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Strongest
            </h3>
          </div>
          {strongest.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
              Not enough data yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
              {strongest.map((s) => (
                <li
                  key={s.standardId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                      {s.title}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500 dark:text-slate-400">
                      {s.standardId} · {s.correct}/{s.attempted}
                    </div>
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-600">
                    {s.accuracy}%
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
            Last 5 practice sessions
          </h3>
        </div>
        {lastFive.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
            No practice sessions in the last 30 days.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
            {lastFive.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-slate-500">
                    {friendlyDate(s.completedAt)} · {s.correct}/{s.attempted}
                  </div>
                </div>
                <div
                  className={`font-mono text-sm font-bold ${
                    s.accuracy < 60
                      ? "text-red-600"
                      : s.accuracy < 75
                        ? "text-amber-600"
                        : "text-emerald-600"
                  }`}
                >
                  {s.accuracy}%
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recentAssignments.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Assignments completed
            </h3>
          </div>
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
            {recentAssignments.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-slate-500">
                    {friendlyDate(s.completedAt)}
                  </div>
                </div>
                {s.score !== null && (
                  <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-300">
                    {s.score}%
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Target;
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
