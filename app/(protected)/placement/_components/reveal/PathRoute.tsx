"use client";

import Image from "next/image";
import { REVIEWER_PHOTO } from "./copy";

import { motion } from "framer-motion";
import { Glyph, type GlyphName } from "@/app/_components/Glyph";
import type { PlanMilestone, PlanStep, PlanStepKind } from "@/lib/placement/types";
import { subtleT, useReduced } from "./motion";

export type PathRouteProps = {
  steps: PlanStep[];
  milestones: PlanMilestone[];
  lessons: number;
  weeks: number;
  minutesPerDay: number;
  reviewedBy: string;
  /** Nodes with index below this are lit. The card raises it 0.3 s at a time. */
  litCount: number;
  childName?: string;
  /** "Science of reading", "Common Core aligned", ... shown beside the reviewer. */
  trustChips?: string[];
};

const NODE: Record<PlanStepKind, { lit: string; icon: GlyphName }> = {
  start: { lit: "bg-emerald-500 text-white", icon: "book-open" },
  skipped: { lit: "bg-zinc-200 text-zinc-500", icon: "skip-forward" },
  target: { lit: "bg-amber-500 text-white", icon: "target" },
  luna: { lit: "bg-violet-500 text-white", icon: "mic" },
  end: { lit: "bg-violet-600 text-white", icon: "flag" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2027-04-26" to "Apr 26, 2027", read as a calendar date (no timezone shift). */
export function milestoneDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/**
 * The route. On a phone the milestone flags sit beside their nodes and the
 * count lines follow underneath; at desktop width (container >= 672 px) the
 * route takes the left three fifths and the milestones, count and reviewer
 * move into a column on the right.
 */
export function PathRoute({ steps, milestones, lessons, weeks, minutesPerDay, reviewedBy, trustChips = [], litCount }: PathRouteProps) {
  const reduced = useReduced();
  // Milestone flags sit beside the last nodes of the route, in order: the
  // final milestone belongs to the end node, the one before it to the node
  // before that.
  const flagOffset = steps.length - milestones.length;
  const t = reduced ? { duration: 0 } : subtleT();

  return (
    <div className="@2xl:grid @2xl:grid-cols-5 @2xl:gap-8">
      <ol className="relative @2xl:col-span-3">
        {steps.map((step, i) => {
          const lit = i < litCount;
          const nextLit = i + 1 < litCount;
          const node = NODE[step.kind];
          const flag = i >= flagOffset ? milestones[i - flagOffset] : null;
          const last = i === steps.length - 1;
          return (
            <li key={`${step.kind}-${i}`} className={`relative flex gap-3 @2xl:gap-4 ${last ? "" : "pb-2.5 @2xl:pb-3"}`}>
              {!last && (
                <motion.span
                  aria-hidden
                  className={`absolute bottom-0 left-4 top-8 w-px @2xl:left-5 @2xl:top-10 ${nextLit ? "bg-violet-300" : "bg-zinc-200"}`}
                  initial={false}
                  animate={{ opacity: nextLit ? 1 : 0.6 }}
                  transition={t}
                />
              )}
              <motion.span
                aria-hidden
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full @2xl:h-10 @2xl:w-10 ${
                  lit ? node.lit : "border-2 border-zinc-200 bg-white text-zinc-300"
                }`}
                initial={false}
                animate={{ scale: lit ? 1 : 0.85, opacity: lit ? 1 : 0.7 }}
                transition={t}
              >
                <Glyph name={node.icon} size={18} />
              </motion.span>
              <motion.div className="min-w-0 flex-1 @2xl:pt-1" initial={false} animate={{ opacity: lit ? 1 : 0.45 }} transition={t}>
                <div className="flex items-start gap-2">
                  <p className={`font-semibold @2xl:text-lg ${step.kind === "skipped" ? "text-zinc-400 line-through" : "text-zinc-900"}`}>{step.title}</p>
                  {flag && (
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 @2xl:hidden">
                      <Glyph name="calendar-days" size={12} />
                      {flag.month}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 @2xl:text-base">{step.kind === "skipped" ? `Skipped: ${step.reason}` : step.reason}</p>
              </motion.div>
            </li>
          );
        })}
      </ol>
      {trustChips.length > 0 && (
        <ul className="mt-1 hidden flex-wrap gap-2 @2xl:col-span-3 @2xl:flex" data-trust-chips>
          {trustChips.map((c) => (
            <li key={c} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
              <Glyph name="check" size={12} />
              {c}
            </li>
          ))}
        </ul>
      )}

      <div className="@2xl:col-span-2 @2xl:col-start-4 @2xl:row-start-1 @2xl:row-span-2 @2xl:flex @2xl:flex-col @2xl:justify-between @2xl:border-l @2xl:border-zinc-200 @2xl:pl-8">
        {milestones.length > 0 && (
          <ul className="hidden space-y-2 @2xl:block">
            {milestones.map((m) => (
              <li key={m.date} className="flex items-center gap-3 rounded-2xl bg-amber-50 px-3 py-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Glyph name="flag" size={18} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900">{m.label}</p>
                  <p className="text-sm text-zinc-500">
                    {m.month} · {milestoneDate(m.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <dl className="mt-3 grid grid-cols-3 gap-2 @2xl:mt-4 @2xl:gap-2">
          {[
            [String(lessons), "lessons"],
            [`${weeks}`, "weeks"],
            [`${minutesPerDay}`, "minutes a day"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-violet-50 px-2 py-1.5 text-center @2xl:py-2">
              <dt className="text-2xl font-semibold text-violet-800">{v}</dt>
              <dd className="text-xs text-violet-600 @2xl:text-sm">{l}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 hidden items-center gap-3 @2xl:flex @2xl:gap-4">
          <Image
            src={REVIEWER_PHOTO}
            alt="Jennifer Klingerman"
            width={96}
            height={96}
            className="h-12 w-12 shrink-0 rounded-full object-cover shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)] @2xl:h-20 @2xl:w-20"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-zinc-900 @2xl:text-base">Reviewed by {reviewedBy.split(",")[0]}</p>
            <p className="text-xs text-zinc-500 @2xl:text-sm">{reviewedBy.includes(",") ? reviewedBy.split(",").slice(1).join(",").trim() : "Certified Reading Specialist"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
