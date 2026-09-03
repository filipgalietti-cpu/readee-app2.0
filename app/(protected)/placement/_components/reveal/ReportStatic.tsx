"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { PlacementResult } from "@/lib/placement/types";
import { Glyph } from "@/app/_components/Glyph";
import { PercentileBar } from "./PercentileBar";
import { SkillBar } from "./SkillBar";
import { PathRoute } from "./PathRoute";
import { GradeLadder } from "./GradeLadder";
import { BandChip } from "./BandChip";
import { TrialTimeline } from "./TrialTimeline";
import { GrowthChart } from "./GrowthChart";
import { buildRevealCopy } from "./copy";

export type ReportStaticProps = {
  result: PlacementResult;
  /** When absent the ask links to /upgrade. */
  onStartPlan?: () => void;
};

const PRINT_CSS = `
@media print {
  .reveal-print-hide { display: none !important; }
  .reveal-report { box-shadow: none !important; border: 0 !important; }
}
`;

function Section({ title, children, centered = false }: { title: string; children: React.ReactNode; centered?: boolean }) {
  return (
    <section className="border-t border-zinc-200 pt-6 @2xl:pt-8">
      <h2 className={`text-lg font-semibold text-zinc-900 @2xl:text-xl ${centered ? "text-center" : ""}`}>{title}</h2>
      <div className="mt-3 @2xl:mt-4">{children}</div>
    </section>
  );
}

const PRIMARY =
  "inline-flex rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)] hover:from-violet-700 hover:to-violet-600";

/** The same content as the reveal, in one printable column (720 px wide at desktop). */
export function ReportStatic({ result, onStartPlan }: ReportStaticProps) {
  const copy = useMemo(() => buildRevealCopy(result), [result]);
  const n = copy.number;
  const p = copy.placement;

  return (
    <div className="reveal-report bg-white text-zinc-900 @container">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8 @2xl:space-y-8 @2xl:py-12">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 @2xl:text-3xl">{copy.childName}&apos;s reading placement</h1>
            <p className="mt-1 text-sm text-zinc-500 @2xl:text-base">
              {copy.dateLong} · Enrolled in {copy.enrolledLabel} · {copy.minutesLine}
            </p>
          </div>
          <div className="reveal-print-hide flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-violet-700 shadow-sm ring-1 ring-zinc-200"
            >
              <Glyph name="home" size={16} />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-violet-700 shadow-sm ring-1 ring-zinc-200"
            >
              <Glyph name="printer" size={16} />
              Print
            </button>
          </div>
        </header>

        <Section title="Strengths">
          <ul className="grid gap-3 @2xl:grid-cols-2">
            {copy.strengthTiles.map((tile) => (
              <li key={tile.text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Glyph name="check" size={14} />
                </span>
                <div>
                  <p className="text-base font-semibold text-zinc-800">{tile.text}</p>
                  {tile.evidence && <p className="text-sm text-zinc-500">{tile.evidence}</p>}
                </div>
              </li>
            ))}
          </ul>
          {copy.extraMoment && <p className="mt-3 text-sm text-zinc-500">{copy.extraMoment}</p>}
          <ul className="mt-4 flex flex-wrap gap-4">
            {copy.measured.map((m) => (
              <li key={m.label} className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Glyph name={m.icon} size={14} />
                </span>
                {m.label}
              </li>
            ))}
          </ul>
        </Section>

        {n && (
          <Section title={n.title}>
            <p className="text-sm text-zinc-500">{n.subtitle}</p>
            <div className="mt-3 flex items-end gap-8">
              <div>
                <div className="text-5xl font-semibold leading-none text-violet-700 tabular-nums @2xl:text-7xl">{n.wcpm}</div>
                <div className="mt-1 text-sm text-zinc-500">words per minute</div>
              </div>
              {n.benchmark !== null && (
                <div className="ml-auto text-right">
                  <div className="text-2xl font-semibold leading-none text-zinc-400 tabular-nums @2xl:text-4xl">{n.benchmark}</div>
                  <div className="mt-1 text-sm text-zinc-500">{n.benchmarkLabel}</div>
                </div>
              )}
            </div>
            {n.percentile !== null && (
              <div className="mt-5">
                <PercentileBar percentile={n.percentile} childName={copy.childName} animate instant />
              </div>
            )}
            <p className="mt-4 text-base leading-6 text-zinc-700">{n.sentence}</p>
            <p className="mt-1 text-xs text-zinc-400">{n.source}</p>
          </Section>
        )}

        <Section title="Placement">
          <div className="flex flex-wrap items-center gap-2">
            <BandChip band={p.band} />
            <span aria-hidden className="text-zinc-400">
              ·
            </span>
            <span className="text-base font-semibold text-zinc-900">{p.category}</span>
          </div>
          <p className="mt-3 text-base leading-6 text-zinc-800">{p.support}</p>
          {p.reassurance && <p className="mt-3 border-l-2 border-violet-200 pl-4 text-sm leading-6 text-zinc-500">{p.reassurance}</p>}
          <div className="mt-5">
            <GradeLadder enrolled={p.enrolled} placed={p.placed} childName={copy.childName} bandName={p.band} categoryText={p.categoryText} animate instant />
          </div>
        </Section>

        <Section title="Three skills">
          <div className="grid gap-5 @2xl:grid-cols-3 @2xl:gap-6">
            {copy.skills.map((s) => (
              <SkillBar key={s.id} icon={s.icon} label={s.label} value={s.value} fillPct={s.fillPct} meaning={s.meaning} animate instant />
            ))}
          </div>
        </Section>

        <Section title={`${copy.childName}'s Custom Reading Journey`}>
          <p className="mb-3 text-sm text-zinc-500">{copy.path.craftedLine}</p>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 @2xl:p-6">
            <PathRoute
              steps={copy.path.steps}
              milestones={copy.path.milestones}
              lessons={copy.path.lessons}
              weeks={copy.path.weeks}
              minutesPerDay={copy.path.minutesPerDay}
              reviewedBy={copy.path.reviewedBy}
              litCount={copy.path.steps.length}
              childName={copy.childName}
            />
          </div>
        </Section>

        <Section title="The plan">
          <p className="text-base font-semibold text-zinc-900 @2xl:text-lg">{copy.plan.dose}</p>
          {copy.plan.growth && (
            <div className="mt-3 rounded-2xl border border-zinc-200 p-3">
              <GrowthChart {...copy.plan.growth} reduced height={200} />
            </div>
          )}
          <ul className="mt-3 space-y-2">
            {copy.plan.milestones.map((m) => (
              <li key={m.date} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Glyph name="flag" size={14} />
                </span>
                <span className="text-base text-zinc-800">{m.label}</span>
                <span className="ml-auto text-sm text-zinc-500">{m.month}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-5 text-base font-semibold text-zinc-900">{copy.plan.tipsHeading}</h3>
          <ol className="mt-2 space-y-2">
            {copy.plan.tips.map((tip) => (
              <li key={tip.text} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Glyph name={tip.icon} size={14} />
                </span>
                <span className="text-base leading-6 text-zinc-700">{tip.text}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-zinc-400">{copy.plan.projection}</p>
        </Section>

        <Section title={copy.ask.headline} centered>
          <p className="text-center text-base font-semibold text-zinc-800">{copy.ask.subhead}</p>
          <p className="mt-1 text-center text-base text-zinc-600">{copy.ask.line}</p>
          <div className="reveal-print-hide mt-4 flex flex-col items-center text-center">
            <div className="mx-auto w-full max-w-xl">
              <TrialTimeline steps={copy.ask.timeline} horizontal />
            </div>
            <p className="mt-2 text-xs text-zinc-500">Cancel anytime in one tap.</p>
            <div className="mt-4">
              {onStartPlan ? (
                <button type="button" onClick={onStartPlan} className={PRIMARY}>
                  {copy.ask.button}
                </button>
              ) : (
                <Link href="/upgrade?reason=placement" className={PRIMARY}>
                  {copy.ask.button}
                </Link>
              )}
            </div>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Glyph name="shield-check" size={16} />
            <span>
              Content created and reviewed by <span className="font-semibold text-zinc-800">{copy.ask.reviewer.name}</span>,
              <br />
              {copy.ask.reviewer.role}
            </span>
          </p>
        </Section>
      </div>
    </div>
  );
}
