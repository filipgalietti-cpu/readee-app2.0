import { createClient } from "@/lib/supabase/server";
import { BarChart3, TrendingDown, Activity, Users2, BookOpen, Target } from "lucide-react";
import lessons from "@/app/data/sample-lessons.json";

type LessonRef = { standardId: string; title: string; domain: string };
const STANDARD_TITLE = new Map<string, string>(
  (lessons as LessonRef[]).map((l) => [l.standardId, l.title]),
);

type ChildLite = { id: string; first_name: string };

function friendlyDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function InsightsTab({ classroomId }: { classroomId: string }) {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("child_id, children(id, first_name)")
    .eq("classroom_id", classroomId);

  const roster: ChildLite[] = (memberships ?? []).map((m) => {
    const raw = m as unknown as { children: ChildLite };
    return raw.children;
  });
  const childIds = roster.map((c) => c.id);
  const childById = new Map(roster.map((c) => [c.id, c.first_name]));
  const totalStudents = roster.length;

  if (totalStudents === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
          <BarChart3 className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
          No insights yet
        </h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
          Insights appear here once students join and start practicing.
        </p>
      </div>
    );
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: practice30 } = await supabase
    .from("practice_results")
    .select("child_id, standard_id, questions_attempted, questions_correct, completed_at")
    .in("child_id", childIds)
    .gte("completed_at", thirtyDaysAgo);

  const practiceRows = (practice30 ?? []) as Array<{
    child_id: string;
    standard_id: string;
    questions_attempted: number;
    questions_correct: number;
    completed_at: string;
  }>;

  let totalAttempted = 0;
  let totalCorrect = 0;
  let activeLastWeek = 0;
  const byStandard = new Map<string, { attempted: number; correct: number }>();
  const activeChildren = new Set<string>();

  for (const r of practiceRows) {
    totalAttempted += r.questions_attempted;
    totalCorrect += r.questions_correct;
    if (r.completed_at >= sevenDaysAgo) activeChildren.add(r.child_id);

    const cur = byStandard.get(r.standard_id) ?? { attempted: 0, correct: 0 };
    cur.attempted += r.questions_attempted;
    cur.correct += r.questions_correct;
    byStandard.set(r.standard_id, cur);
  }
  activeLastWeek = activeChildren.size;

  const classMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;

  const mostMissed = Array.from(byStandard.entries())
    .filter(([, v]) => v.attempted >= 5)
    .map(([standardId, v]) => ({
      standardId,
      title: STANDARD_TITLE.get(standardId) ?? standardId,
      attempted: v.attempted,
      correct: v.correct,
      accuracy: Math.round((v.correct / v.attempted) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const { data: recentSubs } = await supabase
    .from("assignment_submissions")
    .select("child_id, completed_at, score_percent, assignments!inner(title, classroom_id)")
    .in("child_id", childIds)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(10);

  const recentActivity = (recentSubs ?? [])
    .filter((s: any) => s.assignments?.classroom_id === classroomId)
    .map((s: any) => ({
      firstName: childById.get(s.child_id) ?? "Student",
      title: s.assignments.title,
      scorePercent: s.score_percent == null ? null : Math.round(Number(s.score_percent)),
      completedAt: s.completed_at,
    }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Users2}
          label="Active this week"
          value={`${activeLastWeek}/${totalStudents}`}
          hint="students who practiced"
        />
        <SummaryCard
          icon={Target}
          label="Class mastery (30d)"
          value={classMastery === null ? "—" : `${classMastery}%`}
          hint="correct answers overall"
        />
        <SummaryCard
          icon={BookOpen}
          label="Questions answered"
          value={totalAttempted.toLocaleString()}
          hint="across the class, last 30 days"
        />
        <SummaryCard
          icon={Activity}
          label="Students enrolled"
          value={totalStudents.toString()}
          hint="in this classroom"
        />
      </div>

      {/* Most-missed standards */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
            Hardest standards (30d)
          </h3>
        </div>
        {mostMissed.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
            Not enough data yet — standards with at least 5 attempts show up here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
            {mostMissed.map((m) => (
              <li key={m.standardId} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {m.title}
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 dark:text-slate-400">
                    {m.standardId}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div
                    className={`font-mono text-sm font-bold ${
                      m.accuracy < 60
                        ? "text-red-600 dark:text-red-400"
                        : m.accuracy < 75
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-zinc-700 dark:text-slate-300"
                    }`}
                  >
                    {m.accuracy}%
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-slate-500">
                    {m.correct}/{m.attempted}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent completions */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
            Recent completions
          </h3>
        </div>
        {recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
            No assignments completed yet. Completions show up here as students finish.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-slate-800">
            {recentActivity.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {r.firstName}{" "}
                    <span className="font-normal text-zinc-500 dark:text-slate-400">
                      finished
                    </span>{" "}
                    {r.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 dark:text-slate-500">
                    {friendlyDate(r.completedAt)}
                  </div>
                </div>
                {r.scorePercent !== null && (
                  <div className="flex-shrink-0 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-300">
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
      <div className="mt-1 text-[11px] text-zinc-400 dark:text-slate-500">{hint}</div>
    </div>
  );
}
