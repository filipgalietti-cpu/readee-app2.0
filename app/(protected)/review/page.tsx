import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Brain, ArrowRight, Check, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import { getAllStandards, slugifyStandard } from "@/lib/data/standards";

export const dynamic = "force-dynamic";

/**
 * Today's SRS review — standards whose next_due has elapsed. Ordered
 * most-overdue-first, capped at DAILY_REVIEW_CAP so kids aren't staring
 * down 40 standards. Extra items stay queued for tomorrow.
 */
const DAILY_REVIEW_CAP = 15;

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const profile = await requireProfile();
  const { child: childParam } = await searchParams;

  const supabase = await createClient();

  // Resolve the active child — either from ?child= param or first one.
  const { data: kids } = await supabase
    .from("children")
    .select("id, first_name, reading_level")
    .eq("parent_id", profile.id)
    .order("created_at", { ascending: true });
  const children = (kids ?? []) as {
    id: string;
    first_name: string;
    reading_level: string | null;
  }[];

  if (children.length === 0) {
    redirect("/dashboard");
  }
  const active =
    (childParam && children.find((c) => c.id === childParam)) ||
    children[0];

  // Standards due today.
  const { data: dueRows } = await supabase
    .from("child_skill_memory")
    .select("standard_id, interval_days, consecutive_correct, total_correct, total_attempted, next_due, last_practiced_at")
    .eq("child_id", active.id)
    .lte("next_due", new Date().toISOString())
    .order("next_due", { ascending: true })
    .limit(DAILY_REVIEW_CAP);

  // Standards the child has NEVER practiced — useful to mix in after
  // the due queue is empty.
  const { data: allSeenRows } = await supabase
    .from("child_skill_memory")
    .select("standard_id")
    .eq("child_id", active.id);
  const seen = new Set((allSeenRows ?? []).map((r: any) => r.standard_id));

  const dueStandards = (dueRows ?? []) as any[];

  const standardsMap = new Map(getAllStandards().map((s) => [s.standard_id, s]));
  const due = dueStandards
    .map((r: any) => {
      const std = standardsMap.get(r.standard_id);
      if (!std) return null;
      return {
        standard: std,
        overdueHours: Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(r.next_due).getTime()) / (60 * 60 * 1000),
          ),
        ),
        streak: r.consecutive_correct as number,
        accuracy:
          r.total_attempted > 0
            ? Math.round((r.total_correct / r.total_attempted) * 100)
            : null,
        interval: r.interval_days as number,
      };
    })
    .filter(Boolean) as {
    standard: ReturnType<typeof getAllStandards>[number];
    overdueHours: number;
    streak: number;
    accuracy: number | null;
    interval: number;
  }[];

  // Total mastered = standards with consecutive_correct >= 3 and
  // next_due > now(). Surfaced as a small progress footer.
  const { count: masteredCount } = await supabase
    .from("child_skill_memory")
    .select("id", { count: "exact", head: true })
    .eq("child_id", active.id)
    .gte("consecutive_correct", 3);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            <Brain className="h-4 w-4" />
            Today&apos;s review
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {active.first_name}&apos;s review queue
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            Skills Readee thinks it&apos;s time to revisit — ordered by
            what&apos;s been waiting longest. 10-15 minutes a day keeps the
            curve fresh.
          </p>
        </div>

        {children.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {children.map((c) => (
              <Link
                key={c.id}
                href={`/review?child=${c.id}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  active.id === c.id
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {c.first_name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {due.length === 0 ? (
        <div className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-12 text-center shadow-sm ring-1 ring-emerald-100 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/30 dark:ring-emerald-900/40">
          <CalendarClock className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
            No reviews due today
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-slate-400">
            {active.first_name} is caught up.{" "}
            {seen.size > 0
              ? `${seen.size} standards are in the review system${
                  (masteredCount ?? 0) > 0
                    ? ` — ${masteredCount} fully mastered.`
                    : "."
                }`
              : "Once they practice some standards, reviews will surface here."}
          </p>
          <Link
            href={`/practice-hub?child=${active.id}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Practice more
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ol className="mt-6 space-y-3">
          {due.map((item, i) => (
            <li key={item.standard.standard_id}>
              <Link
                href={`/practice?standard=${item.standard.standard_id}&child=${active.id}&source=review`}
                className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <span className="font-mono text-xs font-extrabold">{i + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {item.standard.standard_id}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-slate-400">
                      {item.standard.gradeLabel}
                    </span>
                    {item.streak >= 3 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <Check className="h-2.5 w-2.5" /> streak {item.streak}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-slate-400">
                    {item.standard.standard_description}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400">
                    <span>
                      {item.overdueHours >= 24
                        ? `${Math.floor(item.overdueHours / 24)}d overdue`
                        : item.overdueHours > 0
                        ? `${item.overdueHours}h overdue`
                        : "due now"}
                    </span>
                    {item.accuracy !== null && (
                      <span>{item.accuracy}% accuracy so far</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-400" />
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 text-xs text-zinc-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        <strong>How review works:</strong> Readee uses spaced repetition —
        skills your child gets right show up less often over time; skills
        they struggle with come back sooner. 10-15 minutes a day keeps the
        whole reading journey fresh.{" "}
        <Link
          href={`/standards`}
          className="font-semibold text-indigo-700 underline hover:text-indigo-800 dark:text-indigo-300"
        >
          Browse all standards
        </Link>
        .
      </div>
    </div>
  );
}
