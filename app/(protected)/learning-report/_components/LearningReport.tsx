"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Gauge,
  Target,
  Sparkles,
  Mic,
  Puzzle,
  TrendingUp,
} from "lucide-react";
import {
  SKILL_AXES,
  AXIS_LABEL,
  type LearnerModel,
} from "@/lib/adaptive/learner-model";

/* ─── Color a mastery bar by level ────────────────── */
function barColors(pct: number): { bar: string; text: string } {
  if (pct >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (pct >= 50) return { bar: "bg-amber-500", text: "text-amber-600" };
  return { bar: "bg-rose-500", text: "text-rose-600" };
}

const HEADING_FONT = { fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif" };

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-violet-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-indigo-950/50 dark:text-violet-300">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <h2
        className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white"
        style={HEADING_FONT}
      >
        {children}
      </h2>
    </div>
  );
}

export default function LearningReport({
  name,
  childId,
  model,
}: {
  name: string;
  childId: string;
  model: LearnerModel;
}) {
  const { dimensions, weakStandards, strengths, weakPatterns, fluency } = model;

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          <BarChart3 className="h-4 w-4" />
          Learning Report
        </div>
        <h1
          className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
          style={HEADING_FONT}
        >
          {name}&apos;s Reading Report
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Where {name} is shining and what we&apos;re working on next.
        </p>
      </div>

      <div className="space-y-5">
        {/* ── 5-axis skill bars ── */}
        <Card>
          <SectionTitle icon={Gauge}>Reading skills</SectionTitle>
          <div className="space-y-4">
            {SKILL_AXES.map((axis, i) => {
              const dim = dimensions[axis];
              const pct =
                dim.mastery != null ? Math.round(dim.mastery * 100) : null;
              const colors = pct != null ? barColors(pct) : null;
              return (
                <div key={axis}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-700 dark:text-slate-200">
                      {AXIS_LABEL[axis]}
                      {dim.source === "seed" && (
                        <span className="ml-1.5 text-[11px] font-medium text-zinc-400 dark:text-slate-500">
                          (from placement)
                        </span>
                      )}
                    </span>
                    {pct != null ? (
                      <span
                        className={`text-sm font-bold ${colors!.text} dark:opacity-90`}
                      >
                        {pct}%
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-400 dark:text-slate-500">
                        not enough data yet
                      </span>
                    )}
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                    {pct != null && (
                      <motion.div
                        className={`h-full rounded-full ${colors!.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.7,
                          delay: i * 0.08,
                          ease: "easeOut",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Reading fluency ── */}
        <Card>
          <SectionTitle icon={Mic}>Reading fluency</SectionTitle>
          {fluency && (fluency.wcpm != null || fluency.accuracy != null) ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-violet-50 p-4 text-center dark:bg-indigo-950/40">
                <div
                  className="text-3xl font-extrabold text-violet-700 dark:text-violet-300"
                  style={HEADING_FONT}
                >
                  {fluency.wcpm != null ? Math.round(fluency.wcpm) : "—"}
                </div>
                <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400">
                  Words per minute
                </div>
              </div>
              <div className="rounded-2xl bg-violet-50 p-4 text-center dark:bg-indigo-950/40">
                <div
                  className="text-3xl font-extrabold text-violet-700 dark:text-violet-300"
                  style={HEADING_FONT}
                >
                  {fluency.accuracy != null
                    ? `${Math.round(fluency.accuracy * 100)}%`
                    : "—"}
                </div>
                <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400">
                  Reading accuracy
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-violet-50 p-5 text-center dark:bg-indigo-950/40">
              <p className="text-sm font-medium text-zinc-600 dark:text-slate-300">
                Read a passage out loud with Luna to measure {name}&apos;s
                reading speed.
              </p>
              <Link
                href={`/luna?child=${childId}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
              >
                <Mic className="h-4 w-4" />
                Read with Luna
              </Link>
            </div>
          )}
        </Card>

        {/* ── Working on + Strengths ── */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <SectionTitle icon={Target}>Working on</SectionTitle>
            {weakStandards.length > 0 ? (
              <ul className="space-y-2">
                {weakStandards.slice(0, 5).map((w) => (
                  <li
                    key={w.standard_id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/30"
                  >
                    <span className="text-sm font-semibold text-zinc-800 dark:text-slate-100">
                      {w.standard_id}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {Math.round(w.accuracy * 100)}% right
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-violet-50 px-3 py-3 text-sm font-medium text-zinc-600 dark:bg-indigo-950/40 dark:text-slate-300">
                No trouble spots right now — {name} is keeping up beautifully.
                Keep practicing to unlock more insights.
              </p>
            )}
          </Card>

          <Card>
            <SectionTitle icon={TrendingUp}>Strengths</SectionTitle>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.slice(0, 5).map((s) => (
                  <li
                    key={s}
                    className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30"
                  >
                    <span className="text-sm font-semibold text-zinc-800 dark:text-slate-100">
                      {s}
                    </span>
                    <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-violet-50 px-3 py-3 text-sm font-medium text-zinc-600 dark:bg-indigo-950/40 dark:text-slate-300">
                Every reader has strengths — {name}&apos;s will show up here as
                more practice rolls in.
              </p>
            )}
          </Card>
        </div>

        {/* ── Tricky sounds / patterns ── */}
        {weakPatterns.length > 0 && (
          <Card>
            <SectionTitle icon={Puzzle}>Tricky sounds &amp; patterns</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {weakPatterns.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
