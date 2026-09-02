"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  SKILL_AXES,
  AXIS_LABEL,
  type LearnerModel,
} from "@/lib/adaptive/learner-model";
import { type LunaReport } from "@/lib/luna/report";
import { Glyph, type GlyphName } from "@/app/_components/Glyph";

/* ─── Tiny WCPM-over-time sparkline ────────────────── */
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 132, h = 36, pad = 4;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const xy = (v: number, i: number) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return [x, y] as const;
  };
  const pts = data.map((v, i) => xy(v, i).join(",")).join(" ");
  const [lx, ly] = xy(data[data.length - 1], data.length - 1);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={pts} fill="none" stroke="#8b5cf6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={3} fill="#7c3aed" />
    </svg>
  );
}

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
      className={`rounded-3xl border border-violet-100 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: GlyphName;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
        <Glyph name={Icon} size={16} />
      </span>
      <h2
        className="text-lg font-extrabold tracking-tight text-zinc-900"
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
  luna,
}: {
  name: string;
  childId: string;
  model: LearnerModel;
  luna: LunaReport;
}) {
  const { dimensions, weakStandards, strengths, weakPatterns } = model;
  const hasLuna = luna.sessions > 0;

  return (
    <div className="mx-auto max-w-3xl px-5 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600">
          <Glyph name="bar-chart3" size={16} />
          Learning Report
        </div>
        <h1
          className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900"
          style={HEADING_FONT}
        >
          {name}&apos;s Reading Report
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Where {name} is shining and what we&apos;re working on next.
        </p>
      </div>

      <div className="space-y-5">
        {/* ── 5-axis skill bars ── */}
        <Card>
          <SectionTitle icon="gauge">Reading skills</SectionTitle>
          <div className="space-y-4">
            {SKILL_AXES.map((axis, i) => {
              const dim = dimensions[axis];
              const pct =
                dim.mastery != null ? Math.round(dim.mastery * 100) : null;
              const colors = pct != null ? barColors(pct) : null;
              return (
                <div key={axis}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-700">
                      {AXIS_LABEL[axis]}
                      {dim.source === "seed" && (
                        <span className="ml-1.5 text-[11px] font-medium text-zinc-400">
                          (from placement)
                        </span>
                      )}
                    </span>
                    {pct != null ? (
                      <span
                        className={`text-sm font-bold ${colors!.text}`}
                      >
                        {pct}%
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-400">
                        not enough data yet
                      </span>
                    )}
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                    {pct != null && (
                      <motion.div
                        className={`h-full rounded-full ${colors!.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.5,
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

        {/* ── Reading growth (Luna) ── */}
        <Card>
          <SectionTitle icon="mic">Reading growth</SectionTitle>
          {hasLuna ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-violet-50 p-4 text-center">
                  <div className="text-3xl font-extrabold text-violet-700" style={HEADING_FONT}>
                    {luna.latestWcpm ?? "-"}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-500">Words / min</div>
                  {luna.gainWcpm != null && luna.gainWcpm > 0 && (
                    <div className="mt-1 text-[11px] font-bold text-emerald-600">+{luna.gainWcpm} since start</div>
                  )}
                </div>
                <div className="rounded-2xl bg-violet-50 p-4 text-center">
                  <div className="text-3xl font-extrabold text-violet-700" style={HEADING_FONT}>
                    {luna.accuracy != null ? `${luna.accuracy}%` : "-"}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-500">Accuracy</div>
                </div>
                <div className="rounded-2xl bg-violet-50 p-4 text-center">
                  <div className="text-3xl font-extrabold text-violet-700" style={HEADING_FONT}>
                    {luna.expression != null ? `${luna.expression}%` : "-"}
                  </div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-violet-500"><Glyph name="waves" size={12} />Expression</div>
                </div>
                <div className="rounded-2xl bg-violet-50 p-4 text-center">
                  <div className="text-3xl font-extrabold text-violet-700" style={HEADING_FONT}>
                    {luna.thisWeek}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-500">Reads this week</div>
                </div>
              </div>
              {luna.wcpmSeries.length >= 2 && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-white px-4 py-3">
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">Reading speed over {luna.sessions} sessions</div>
                    <div className="text-sm font-bold text-zinc-800">{luna.firstWcpm} → {luna.latestWcpm} WCPM</div>
                  </div>
                  <Sparkline data={luna.wcpmSeries} />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-violet-50 p-5 text-center">
              <p className="text-sm font-medium text-zinc-600">
                Read a passage out loud with Luna to start measuring {name}&apos;s reading speed, accuracy, and expression.
              </p>
              <Link
                href={`/luna?child=${childId}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700"
              >
                <Glyph name="mic" size={16} />
                Read with Luna
              </Link>
            </div>
          )}
        </Card>

        {/* ── Sound progress (Luna adaptive engine) ── */}
        {(luna.mastered.length > 0 || luna.workingOn.length > 0) && (
          <Card>
            <SectionTitle icon="puzzle">Sound progress</SectionTitle>
            {luna.mastered.length > 0 && (
              <div className="mb-3">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-600">Mastered</div>
                <div className="flex flex-wrap gap-2">
                  {luna.mastered.map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                      <Glyph name="check-circle2" size={14} />{p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {luna.workingOn.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-600">Working on</div>
                <div className="flex flex-wrap gap-2">
                  {luna.workingOn.map((p) => (
                    <span key={p.id} className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── Working on + Strengths ── */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <SectionTitle icon="target">Working on</SectionTitle>
            {weakStandards.length > 0 ? (
              <ul className="space-y-2">
                {weakStandards.slice(0, 5).map((w) => (
                  <li
                    key={w.standard_id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-zinc-800">
                      {w.standard_id}
                    </span>
                    <span className="text-xs font-bold text-amber-600">
                      {Math.round(w.accuracy * 100)}% right
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-violet-50 px-3 py-3 text-sm font-medium text-zinc-600">
                No trouble spots right now - {name} is keeping up beautifully.
                Keep practicing to unlock more insights.
              </p>
            )}
          </Card>

          <Card>
            <SectionTitle icon="trending-up">Strengths</SectionTitle>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.slice(0, 5).map((s) => (
                  <li
                    key={s}
                    className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-zinc-800">
                      {s}
                    </span>
                    <Glyph name="sparkles" size={16} className="text-emerald-500" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-violet-50 px-3 py-3 text-sm font-medium text-zinc-600">
                Every reader has strengths - {name}&apos;s will show up here as
                more practice rolls in.
              </p>
            )}
          </Card>
        </div>

        {/* ── Tricky sounds / patterns ── */}
        {weakPatterns.length > 0 && (
          <Card>
            <SectionTitle icon="puzzle">Tricky sounds &amp; patterns</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {weakPatterns.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-600"
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
