"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Target,
  Map as MapIcon,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  buildPathForChild,
  advanceLearningPath,
} from "@/lib/ai/path-actions";

type PathItem = {
  position: number;
  kind: "lesson" | "practice";
  standard_id: string;
  lesson_id?: string;
  title: string;
  reason: string;
};

type Path = {
  child_id: string;
  grade_level: string;
  reading_level: string | null;
  items: PathItem[];
  next_index: number;
  updated_at: string;
};

/**
 * LearningPathCard — surfaces the AI-built personalized learning path
 * for a child. Used on the parent dashboard, the teacher per-student
 * page, and (optionally) the kid mode home.
 *
 * Variants:
 *   "kid" — minimal, focuses on next item with a big Start button.
 *   "parent" / "teacher" — full sequence visible, with rebuild/edit affordances.
 */
export default function LearningPathCard({
  childId,
  childFirstName,
  variant = "parent",
}: {
  childId: string;
  childFirstName: string | null;
  variant?: "kid" | "parent" | "teacher";
}) {
  const router = useRouter();
  const [path, setPath] = useState<Path | null>(null);
  const [loading, setLoading] = useState(true);
  const [building, startBuild] = useTransition();
  const [advancing, startAdvance] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function load(): Promise<Path | null> {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("learning_paths")
      .select(
        "child_id, grade_level, reading_level, items, next_index, updated_at",
      )
      .eq("child_id", childId)
      .maybeSingle();
    const p = (data as Path | null) ?? null;
    setPath(p);
    setLoading(false);
    return p;
  }

  // Path is derived from the placement test — no manual rebuild
  // affordance. Auto-build when (a) no path exists yet, or (b) the
  // most recent assessment is newer than the path (kid retook the
  // exam).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = supabaseBrowser();
      const p = await load();
      if (cancelled) return;
      const { data: latest } = await supabase
        .from("assessments")
        .select("completed_at")
        .eq("child_id", childId)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const assessmentAt = latest?.completed_at
        ? new Date(latest.completed_at).getTime()
        : null;
      const pathAt = p?.updated_at ? new Date(p.updated_at).getTime() : null;
      const stale = assessmentAt != null && (pathAt == null || assessmentAt > pathAt);
      if (!p || stale) {
        autoBuild();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  function autoBuild() {
    setErr(null);
    startBuild(async () => {
      const res = await buildPathForChild({ childId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      await load();
      router.refresh();
    });
  }

  function markDone() {
    startAdvance(async () => {
      const res = await advanceLearningPath({ childId });
      if (res.ok) {
        await load();
        router.refresh();
      }
    });
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="h-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-slate-800/40" />
      </div>
    );
  }

  // No path yet — the placement test triggers an auto-build, so the
  // expected case here is that it's mid-build. Render a quiet
  // building state instead of a "click to build" CTA.
  if (!path) {
    if (err) {
      return (
        <div className="overflow-hidden rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              {err}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 dark:border-violet-900/40 dark:from-violet-950/20 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
              Personalized path
            </div>
            <h3 className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
              Reading {childFirstName ? `${childFirstName}'s` : "the"} placement test…
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
              Readee.ai is picking the lessons + practice that address what
              they need most. This usually takes 10–15 seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Has a path — render it.
  const items = Array.isArray(path.items) ? path.items : [];
  const completed = path.next_index;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const next = items[completed] ?? null;
  const upcoming = items.slice(completed, completed + (variant === "kid" ? 1 : 5));

  return (
    <div className="overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:border-violet-900/40 dark:from-violet-950/20 dark:via-slate-900 dark:to-indigo-950/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <MapIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
              {childFirstName ? `${childFirstName}'s` : "Your"} Readee path
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white">
              {completed} of {total} done
              {path.reading_level ? (
                <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-slate-800 dark:text-slate-400">
                  {path.reading_level}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {building && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-700"
            title="Updating path from the latest placement test"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Updating
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mx-5 mt-3 h-2 overflow-hidden rounded-full bg-white/80 dark:bg-slate-800/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Up next */}
      {next ? (
        <div className="mx-5 mt-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Up next
          </div>
          <div className="mt-1 flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
              {next.kind === "lesson" ? (
                <BookOpen className="h-4 w-4" />
              ) : (
                <Target className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-zinc-900 dark:text-white">
                {next.title}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-slate-400">
                <span className="font-mono">{next.standard_id}</span> ·{" "}
                {next.kind === "lesson" ? "Lesson" : "Practice"}
              </div>
              {next.reason && (
                <p className="mt-1 text-xs italic text-zinc-600 dark:text-slate-400">
                  &ldquo;{next.reason}&rdquo;
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            {variant !== "kid" && (
              <button
                type="button"
                onClick={markDone}
                disabled={advancing}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"
              >
                Mark done
              </button>
            )}
            <Link
              href={
                next.kind === "lesson"
                  ? `/lesson/${next.standard_id}`
                  : `/practice?standard=${next.standard_id}&child=${childId}`
              }
              className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              Start
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-5 mt-4 rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-slate-900">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
          <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
            Path complete!
          </p>
          <p className="text-xs text-zinc-500 dark:text-slate-400">
            Retake the placement test and your next path will reflect what
            {childFirstName ? ` ${childFirstName}` : " they"} can do now.
          </p>
        </div>
      )}

      {/* The rest of the path (parent / teacher only) */}
      {variant !== "kid" && upcoming.length > 1 && (
        <details className="mx-5 mt-3 mb-5 rounded-2xl bg-white/60 p-3 text-xs dark:bg-slate-900/40">
          <summary className="cursor-pointer font-bold text-zinc-600 dark:text-slate-300">
            Show full path ({total - completed} ahead)
          </summary>
          <ol className="mt-3 space-y-1.5">
            {items.map((it, i) => {
              const done = i < completed;
              const isNext = i === completed;
              return (
                <li
                  key={i}
                  className={`flex items-start gap-2 rounded-lg px-2 py-1.5 ${
                    isNext
                      ? "bg-violet-50 ring-1 ring-violet-200 dark:bg-violet-950/30 dark:ring-violet-900/40"
                      : ""
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-300" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-zinc-500">
                        {it.standard_id}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-slate-800 dark:text-slate-400">
                        {it.kind}
                      </span>
                    </div>
                    <div className="truncate text-[11px] text-zinc-700 dark:text-slate-300">
                      {it.title}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </details>
      )}

      {err && (
        <div className="mx-5 mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          {err}
        </div>
      )}

      <div className="mx-5 mb-5 mt-3 text-[10px] text-zinc-400 dark:text-slate-500">
        Built with Readee.ai · {new Date(path.updated_at).toLocaleDateString()}
      </div>
    </div>
  );
}
