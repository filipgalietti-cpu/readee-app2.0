import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flame, Carrot, BookOpen, Target, Printer, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import kJson from "@/app/data/kindergarten-standards-questions.json";
import g1Json from "@/app/data/1st-grade-standards-questions.json";
import g2Json from "@/app/data/2nd-grade-standards-questions.json";
import g3Json from "@/app/data/3rd-grade-standards-questions.json";
import g4Json from "@/app/data/4th-grade-standards-questions.json";
import PrintButton from "./_components/PrintButton";
import ConferenceNotesButton from "./_components/ConferenceNotesButton";
import LearningPathCard from "@/app/_components/LearningPathCard";

export const dynamic = "force-dynamic";

type StandardMeta = {
  standard_id: string;
  standard_description: string;
  domain: string;
};

const STANDARD_META = new Map<string, StandardMeta>();
for (const bank of [kJson, g1Json, g2Json, g3Json, g4Json] as any[]) {
  for (const s of bank.standards ?? []) {
    STANDARD_META.set(s.standard_id, {
      standard_id: s.standard_id,
      standard_description: s.standard_description,
      domain: s.domain,
    });
  }
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string; childId: string }>;
}) {
  const { classroomId, childId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  // Teacher ownership gate.
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, name, teacher_id, join_code")
    .eq("id", classroomId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!classroom) notFound();

  const { data: membership } = await supabase
    .from("classroom_memberships")
    .select("child_id")
    .eq("classroom_id", classroomId)
    .eq("child_id", childId)
    .maybeSingle();
  if (!membership) notFound();

  const { data: child } = await supabase
    .from("children")
    .select("id, first_name, grade, carrots, streak_days, last_lesson_at, owner_type")
    .eq("id", childId)
    .maybeSingle();
  if (!child) notFound();

  const [{ data: practice }, { data: assignments }, { data: submissions }] = await Promise.all([
    supabase
      .from("practice_results")
      .select("standard_id, questions_attempted, questions_correct, carrots_earned, completed_at")
      .eq("child_id", childId)
      .order("completed_at", { ascending: false })
      .limit(500),
    supabase
      .from("assignments")
      .select("id, title, source_id, due_at, kind")
      .eq("classroom_id", classroomId)
      .order("due_at", { ascending: true, nullsFirst: false }),
    supabase
      .from("assignment_submissions")
      .select("assignment_id, completed_at, score_percent")
      .eq("child_id", childId),
  ]);

  const practiceRows = (practice ?? []) as {
    standard_id: string;
    questions_attempted: number;
    questions_correct: number;
    carrots_earned: number;
    completed_at: string;
  }[];

  const assignmentsList = (assignments ?? []) as {
    id: string;
    title: string;
    source_id: string;
    due_at: string | null;
    kind: string;
  }[];
  const subById = new Map(
    ((submissions ?? []) as any[]).map((s) => [s.assignment_id as string, s]),
  );

  // Resolve custom quiz IDs referenced in practice_results (custom:<quizId>)
  // to their human titles so the activity feed and any custom section render
  // as "Friday phonics check" instead of "custom:abc-123".
  const customQuizIds = Array.from(
    new Set(
      practiceRows
        .filter((p) => p.standard_id.startsWith("custom:"))
        .map((p) => p.standard_id.slice("custom:".length))
        .filter(Boolean),
    ),
  );
  const { data: customQuizRows } = customQuizIds.length
    ? await supabase
        .from("custom_quizzes")
        .select("id, title")
        .in("id", customQuizIds)
    : { data: [] as any[] };
  const customQuizTitleById = new Map<string, string>(
    ((customQuizRows ?? []) as any[]).map((q) => [q.id, q.title]),
  );

  // Aggregate by standard — CCSS rows only. Custom quizzes go in their own
  // bucket below so they don't skew the mastery heatmap.
  const byStandard = new Map<string, { attempted: number; correct: number; lastAt: string | null }>();
  const byCustomQuiz = new Map<string, { attempted: number; correct: number; lastAt: string | null }>();
  let totalAttempted = 0;
  let totalCorrect = 0;
  let totalCarrotsEarned = 0;
  const recent7dIds = new Set<string>();
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 86_400_000).toISOString();

  for (const p of practiceRows) {
    totalAttempted += p.questions_attempted;
    totalCorrect += p.questions_correct;
    totalCarrotsEarned += p.carrots_earned || 0;
    if (p.completed_at >= sevenDaysAgoIso && !p.standard_id.startsWith("custom:")) {
      recent7dIds.add(p.standard_id);
    }

    if (p.standard_id.startsWith("custom:")) {
      const quizId = p.standard_id.slice("custom:".length);
      const cur = byCustomQuiz.get(quizId) ?? { attempted: 0, correct: 0, lastAt: null };
      cur.attempted += p.questions_attempted;
      cur.correct += p.questions_correct;
      if (!cur.lastAt || p.completed_at > cur.lastAt) cur.lastAt = p.completed_at;
      byCustomQuiz.set(quizId, cur);
      continue;
    }

    const cur = byStandard.get(p.standard_id) ?? { attempted: 0, correct: 0, lastAt: null };
    cur.attempted += p.questions_attempted;
    cur.correct += p.questions_correct;
    if (!cur.lastAt || p.completed_at > cur.lastAt) cur.lastAt = p.completed_at;
    byStandard.set(p.standard_id, cur);
  }

  const customQuizRowsFormatted = Array.from(byCustomQuiz.entries())
    .map(([quizId, v]) => ({
      quizId,
      title: customQuizTitleById.get(quizId) ?? "Deleted quiz",
      attempted: v.attempted,
      correct: v.correct,
      accuracy: v.attempted > 0 ? Math.round((v.correct / v.attempted) * 100) : 0,
      lastAt: v.lastAt,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const standardRows = Array.from(byStandard.entries())
    .map(([sid, v]) => {
      const meta = STANDARD_META.get(sid);
      const accuracy = v.attempted > 0 ? Math.round((v.correct / v.attempted) * 100) : 0;
      return {
        standardId: sid,
        title: meta?.standard_description ?? sid,
        domain: meta?.domain ?? "Other",
        attempted: v.attempted,
        correct: v.correct,
        accuracy,
        lastAt: v.lastAt,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  const overallMastery = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;
  const daysSinceLast = (child as any).last_lesson_at
    ? Math.floor((Date.now() - new Date((child as any).last_lesson_at).getTime()) / 86_400_000)
    : null;

  const recentActivity = practiceRows.slice(0, 10);
  const c = child as any;
  const cls = classroom as any;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 print:py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/classroom/${classroomId}?tab=students`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to roster
        </Link>
        <div className="flex items-center gap-2">
          <ConferenceNotesButton
            childId={c.id}
            childFirstName={c.first_name ?? null}
          />
          <PrintButton />
        </div>
      </div>

      {/* Header block — also used for the print layout */}
      <header className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40 print:border-black print:bg-white print:text-black">
        <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 print:text-black dark:text-indigo-300">
          Student progress report
        </div>
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white print:text-black">
              {c.first_name}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400 print:text-black">
              {cls.name}
              {c.grade ? ` · ${c.grade}` : ""}
            </p>
          </div>
          <div className="text-xs text-zinc-400 print:text-black">
            Generated{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* Personalized AI learning path */}
      <div className="mt-6 print:hidden">
        <LearningPathCard
          childId={c.id}
          childFirstName={c.first_name ?? null}
          variant="teacher"
        />
      </div>

      {/* Summary grid */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
        <SummaryCard
          icon={Target}
          label="Mastery"
          value={overallMastery === null ? "—" : `${overallMastery}%`}
          hint="across all practice"
        />
        <SummaryCard
          icon={BookOpen}
          label="Standards"
          value={standardRows.length.toString()}
          hint="attempted so far"
        />
        <SummaryCard
          icon={Flame}
          label="Streak"
          value={`${c.streak_days ?? 0}d`}
          hint="day streak"
        />
        <SummaryCard
          icon={Carrot}
          label="Carrots earned"
          value={(totalCarrotsEarned || c.carrots || 0).toLocaleString()}
          hint="from practice"
        />
      </section>

      {/* Activity status */}
      <section className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40 print:border-black">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
          <Calendar className="h-3.5 w-3.5" />
          Last active
        </div>
        <div className="mt-1 text-zinc-800 dark:text-slate-200 print:text-black">
          {c.last_lesson_at
            ? `${new Date(c.last_lesson_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })} · ${daysSinceLast} day${daysSinceLast === 1 ? "" : "s"} ago`
            : "Hasn't started yet"}
          {recent7dIds.size > 0 && (
            <span className="ml-2 text-xs text-zinc-500">
              ({recent7dIds.size} standard{recent7dIds.size === 1 ? "" : "s"} touched in the last 7 days)
            </span>
          )}
        </div>
      </section>

      {/* Standards mastery */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400 print:text-black">
          Standards mastery
        </h2>
        {standardRows.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
            No practice data yet.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 dark:border-slate-800 print:border-black">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-[11px] uppercase tracking-wider text-zinc-500 dark:bg-slate-900/60 dark:text-slate-400 print:bg-white print:text-black">
                <tr>
                  <th className="px-4 py-2 font-semibold">Standard</th>
                  <th className="px-4 py-2 font-semibold">Domain</th>
                  <th className="px-4 py-2 text-right font-semibold">Correct</th>
                  <th className="px-4 py-2 text-right font-semibold">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {standardRows.map((r) => (
                  <tr key={r.standardId}>
                    <td className="px-4 py-2">
                      <div className="font-semibold text-zinc-900 dark:text-white print:text-black">
                        {r.title}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-400">{r.standardId}</div>
                    </td>
                    <td className="px-4 py-2 text-zinc-600 dark:text-slate-400 print:text-black">
                      {r.domain}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-zinc-700 dark:text-slate-300 print:text-black">
                      {r.correct}/{r.attempted}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-mono font-bold ${
                        r.accuracy < 60
                          ? "text-red-600"
                          : r.accuracy < 75
                          ? "text-amber-600"
                          : "text-green-600"
                      } print:text-black`}
                    >
                      {r.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Assignments */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400 print:text-black">
          Assignments
        </h2>
        {assignmentsList.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
            No assignments in this class yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {assignmentsList.map((a) => {
              const sub = subById.get(a.id);
              const isDone = !!sub?.completed_at;
              const score = sub?.score_percent != null ? Math.round(Number(sub.score_percent)) : null;
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/40 print:border-black"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-zinc-900 dark:text-white print:text-black">
                      {a.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 dark:text-slate-500 print:text-black">
                      {a.due_at
                        ? `Due ${new Date(a.due_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}`
                        : "No due date"}{" "}
                      · {a.source_id}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {isDone ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700 dark:bg-green-950/40 dark:text-green-300 print:bg-white print:text-black">
                        {score === null ? "Done" : `Done · ${score}%`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-500 dark:bg-slate-800 dark:text-slate-400 print:bg-white print:text-black">
                        Not started
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Custom quizzes — separate from CCSS mastery */}
      {customQuizRowsFormatted.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400 print:text-black">
            Custom quizzes
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 dark:border-slate-800 print:border-black">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-[11px] uppercase tracking-wider text-zinc-500 dark:bg-slate-900/60 dark:text-slate-400 print:bg-white print:text-black">
                <tr>
                  <th className="px-4 py-2 font-semibold">Quiz</th>
                  <th className="px-4 py-2 text-right font-semibold">Correct</th>
                  <th className="px-4 py-2 text-right font-semibold">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-slate-800">
                {customQuizRowsFormatted.map((r) => (
                  <tr key={r.quizId}>
                    <td className="px-4 py-2 font-semibold text-zinc-900 dark:text-white print:text-black">
                      {r.title}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-zinc-700 dark:text-slate-300 print:text-black">
                      {r.correct}/{r.attempted}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-mono font-bold ${
                        r.accuracy < 60
                          ? "text-red-600"
                          : r.accuracy < 75
                          ? "text-amber-600"
                          : "text-green-600"
                      } print:text-black`}
                    >
                      {r.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section className="mt-6 print:break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400 print:text-black">
          Recent practice
        </h2>
        {recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
            No practice sessions recorded yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {recentActivity.map((p, i) => {
              const isCustom = p.standard_id.startsWith("custom:");
              const customId = isCustom ? p.standard_id.slice("custom:".length) : null;
              const meta = isCustom ? null : STANDARD_META.get(p.standard_id);
              const label = isCustom
                ? customQuizTitleById.get(customId!) ?? "Deleted quiz"
                : meta?.standard_description ?? p.standard_id;
              const ref = isCustom ? "Custom quiz" : p.standard_id;
              const accuracy = p.questions_attempted > 0 ? Math.round((p.questions_correct / p.questions_attempted) * 100) : 0;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-slate-900/40 print:bg-white print:border print:border-black"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-zinc-900 dark:text-white print:text-black">
                      {label}
                    </div>
                    <div className="text-[11px] text-zinc-400 print:text-black">
                      {new Date(p.completed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {ref}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right font-mono text-xs">
                    <div
                      className={`font-bold ${
                        accuracy < 60 ? "text-red-600" : accuracy < 75 ? "text-amber-600" : "text-green-600"
                      } print:text-black`}
                    >
                      {accuracy}%
                    </div>
                    <div className="text-[10px] text-zinc-400 print:text-black">
                      {p.questions_correct}/{p.questions_attempted}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-10 text-center text-[11px] text-zinc-400 print:text-black">
        Readee Learning LLC · readee.app · K-4 reading instruction aligned to Common Core + Science of Reading
      </div>
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40 print:border-black">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400 print:text-black">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-zinc-900 dark:text-white print:text-black">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-zinc-400 dark:text-slate-500 print:text-black">{hint}</div>
    </div>
  );
}
