import { createClient } from "@/lib/supabase/server";
import { UserRound, Flame, Carrot, BookOpen, AlertTriangle, Sparkles } from "lucide-react";

type RosterRow = {
  child_id: string;
  first_name: string;
  grade: string | null;
  carrots: number;
  streak_days: number;
  last_lesson_at: string | null;
  lessons_this_week: number;
  mastery_pct: number | null;
};

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function statusFor(row: RosterRow): { label: string; tone: string; Icon: typeof Sparkles } {
  const inactiveDays = daysSince(row.last_lesson_at);
  if (inactiveDays === null || inactiveDays > 5) {
    return { label: "Inactive", tone: "bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-slate-400", Icon: AlertTriangle };
  }
  if (row.mastery_pct !== null && row.mastery_pct >= 85 && row.lessons_this_week >= 3) {
    return { label: "Excelling", tone: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300", Icon: Sparkles };
  }
  if (row.mastery_pct !== null && row.mastery_pct < 60) {
    return { label: "Falling behind", tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", Icon: AlertTriangle };
  }
  return { label: "On track", tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300", Icon: Sparkles };
}

async function loadRoster(classroomId: string): Promise<RosterRow[]> {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("classroom_memberships")
    .select("child_id, children(id, first_name, grade, carrots, streak_days, last_lesson_at)")
    .eq("classroom_id", classroomId);

  const childIds = (memberships ?? [])
    .map((m) => (m as { child_id: string }).child_id);
  if (childIds.length === 0) return [];

  const oneWeekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

  // Practice mastery (rolling 7d) per child
  const { data: practice } = await supabase
    .from("practice_results")
    .select("child_id, questions_attempted, questions_correct, completed_at")
    .in("child_id", childIds)
    .gte("completed_at", oneWeekAgo);

  // Lessons completed this week per child
  const { data: lessons } = await supabase
    .from("lessons_progress")
    .select("child_id, completed_at")
    .in("child_id", childIds)
    .gte("completed_at", oneWeekAgo);

  const lessonCount = new Map<string, number>();
  (lessons ?? []).forEach((l: { child_id: string }) =>
    lessonCount.set(l.child_id, (lessonCount.get(l.child_id) ?? 0) + 1),
  );

  const mastery = new Map<string, { attempted: number; correct: number }>();
  (practice ?? []).forEach((p: { child_id: string; questions_attempted: number; questions_correct: number }) => {
    const cur = mastery.get(p.child_id) ?? { attempted: 0, correct: 0 };
    cur.attempted += p.questions_attempted;
    cur.correct += p.questions_correct;
    mastery.set(p.child_id, cur);
  });

  return (memberships ?? []).map((m) => {
    const raw = m as unknown as {
      child_id: string;
      children: {
        id: string;
        first_name: string;
        grade: string | null;
        carrots: number;
        streak_days: number;
        last_lesson_at: string | null;
      };
    };
    const c = raw.children;
    const mt = mastery.get(c.id);
    return {
      child_id: c.id,
      first_name: c.first_name,
      grade: c.grade,
      carrots: c.carrots ?? 0,
      streak_days: c.streak_days ?? 0,
      last_lesson_at: c.last_lesson_at,
      lessons_this_week: lessonCount.get(c.id) ?? 0,
      mastery_pct: mt && mt.attempted > 0 ? Math.round((mt.correct / mt.attempted) * 100) : null,
    };
  });
}

export default async function StudentsTab({ classroomId }: { classroomId: string }) {
  const roster = await loadRoster(classroomId);

  if (roster.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-zinc-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
          <UserRound className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-zinc-900 dark:text-white">
          No students yet
        </h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
          Share the join code above with parents. Students show up here as they
          join.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900/40">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-slate-800 dark:bg-slate-900/60">
          <tr className="text-xs uppercase tracking-wider text-zinc-500 dark:text-slate-400">
            <th className="px-5 py-3 font-semibold">Student</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 text-right font-semibold">Mastery (7d)</th>
            <th className="px-5 py-3 text-right font-semibold">Lessons this week</th>
            <th className="px-5 py-3 text-right font-semibold">Streak</th>
            <th className="px-5 py-3 text-right font-semibold">Carrots</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((r) => {
            const { label, tone, Icon } = statusFor(r);
            return (
              <tr
                key={r.child_id}
                className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 dark:border-slate-800 dark:hover:bg-slate-900/60"
              >
                <td className="px-5 py-3">
                  <div className="font-semibold text-zinc-900 dark:text-white">
                    {r.first_name}
                  </div>
                  {r.grade && (
                    <div className="text-xs text-zinc-500 dark:text-slate-400">
                      {r.grade}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                  {r.mastery_pct === null ? "—" : `${r.mastery_pct}%`}
                </td>
                <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                    {r.lessons_this_week}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-rose-400" />
                    {r.streak_days}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono text-zinc-700 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Carrot className="h-3.5 w-3.5 text-orange-500" />
                    {r.carrots}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
