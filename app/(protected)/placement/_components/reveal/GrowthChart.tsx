"use client";

/**
 * Projected reading-speed line for the plan card: today's words-per-minute
 * rising to each dated milestone from the plan (which comes from published
 * growth slopes in lib/placement/norms.ts). Straight segments on purpose:
 * that is the shape the growth research supports. One series, so no legend;
 * the benchmark each milestone reaches is drawn as a dashed reference line.
 */

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { motion } from "framer-motion";
import type { PlanMilestone } from "@/lib/placement/types";

export type GrowthData = {
  currentWcpm: number;
  /** ISO date the placement was taken. */
  startDate: string;
  /** Milestones that carry a wcpm value. */
  milestones: PlanMilestone[];
};

type Props = GrowthData & {
  reduced?: boolean;
  /** Seconds before the line starts drawing. */
  delay?: number;
  height?: number;
  className?: string;
};

const PAD = { left: 40, right: 24, top: 26, bottom: 30 };
/** Adjacent x labels closer than this (px) drop the earlier one to a second row. */
const LABEL_MIN_GAP = 84;
const DRAW_SECONDS = 1.4;

function niceStep(span: number): number {
  const raw = span / 3;
  for (const s of [10, 20, 25, 50, 100]) if (s >= raw) return s;
  return 100;
}

export function GrowthChart({ currentWcpm, startDate, milestones, reduced = false, delay = 0, height = 220, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  /** Index of the point under the pointer (nearest by x), or null. */
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dated = milestones
    .filter((m): m is PlanMilestone & { wcpm: number } => typeof m.wcpm === "number")
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!dated.length) return null;

  const points = [
    { t: new Date(startDate).getTime(), v: currentWcpm, when: "Today", name: "Today" },
    ...dated.map((m) => ({ t: new Date(m.date).getTime(), v: m.wcpm, when: m.month, name: m.label })),
  ];

  const t0 = points[0].t;
  const span = Math.max(1, points[points.length - 1].t - t0);
  const vMin = Math.max(0, Math.floor((Math.min(...points.map((p) => p.v)) - 15) / 10) * 10);
  const vMax = Math.ceil((Math.max(...points.map((p) => p.v)) + 12) / 10) * 10;
  const step = niceStep(vMax - vMin);
  const ticks: number[] = [];
  for (let v = Math.ceil(vMin / step) * step; v <= vMax; v += step) ticks.push(v);

  const w = width || 600;
  const plotW = w - PAD.left - PAD.right;
  const xs = points.map((p) => PAD.left + ((p.t - t0) / span) * plotW);
  // Middle labels that would run into the next one move down a row.
  const secondRow = xs.map((px, i) => i > 0 && i < xs.length - 1 && xs[i + 1] - px < LABEL_MIN_GAP);
  const padBottom = secondRow.some(Boolean) ? PAD.bottom + 14 : PAD.bottom;
  const plotH = height - PAD.top - padBottom;
  const x = (t: number) => PAD.left + ((t - t0) / span) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - vMin) / (vMax - vMin)) * plotH;
  const baseline = PAD.top + plotH;

  const xy = points.map((p) => ({ ...p, x: x(p.t), y: y(p.v) }));
  const line = xy.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${xy[xy.length - 1].x.toFixed(1)} ${baseline} L${xy[0].x.toFixed(1)} ${baseline} Z`;

  const pick = (e: ReactPointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    let best = 0;
    xy.forEach((p, i) => {
      if (Math.abs(p.x - px) < Math.abs(xy[best].x - px)) best = i;
    });
    setActive(best);
  };
  const hot = active === null ? null : xy[active];
  const gain = hot && active ? hot.v - xy[0].v : 0;
  // Tooltip sits above the plot near the point, flipped inward at the edges.
  const tipLeft = hot ? Math.min(Math.max(hot.x, 96), w - 96) : 0;

  const drawIn = (frac: number) =>
    reduced ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: delay + DRAW_SECONDS * frac, duration: 0.25 } };

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {hot && (
        <div
          className="pointer-events-none absolute z-10 w-48 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)]"
          style={{ left: tipLeft, top: Math.max(0, hot.y - 84) }}
          role="status"
        >
          <p className="text-sm font-semibold tabular-nums text-zinc-900">{hot.v} words a minute</p>
          <p className="text-xs text-zinc-600">{hot.name}</p>
          <p className="text-xs text-zinc-500">{active ? `${hot.when} · +${gain} from today` : "From today's placement"}</p>
        </div>
      )}
      {width > 0 && (
        <svg
          width={w}
          height={height}
          viewBox={`0 0 ${w} ${height}`}
          role="img"
          aria-label="Projected words a minute over the plan"
          className="block touch-none overflow-visible"
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={() => setActive(null)}
        >
          {/* Grid and y labels */}
          {ticks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={w - PAD.right} y1={y(v)} y2={y(v)} className="stroke-zinc-200" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="fill-zinc-400 text-[11px] tabular-nums">
                {v}
              </text>
            </g>
          ))}

          {/* Benchmark each milestone reaches */}
          {xy.slice(1).map((p) => (
            <g key={`bar-${p.t}`}>
              <line x1={PAD.left} x2={p.x} y1={p.y} y2={p.y} className="stroke-zinc-300" strokeWidth={1} strokeDasharray="4 4" />
              <text x={PAD.left + 6} y={p.y - 6} className="fill-zinc-500 text-[11px]">
                {p.name}
              </text>
            </g>
          ))}

          {/* Series */}
          <motion.path d={area} className="fill-violet-50" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + DRAW_SECONDS, duration: 0.4 }} />
          <motion.path
            d={line}
            fill="none"
            className="stroke-violet-600"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay, duration: DRAW_SECONDS, ease: "easeOut" }}
          />

          {hot && <line x1={hot.x} x2={hot.x} y1={PAD.top} y2={baseline} className="stroke-violet-300" strokeWidth={1} strokeDasharray="3 3" />}

          {/* Markers, direct labels, x labels */}
          {xy.map((p, i) => {
            const last = i === xy.length - 1;
            const anchor = i === 0 ? "start" : last ? "end" : "middle";
            const labelX = i === 0 ? p.x + 10 : last ? p.x - 10 : p.x;
            return (
              <motion.g key={p.t} {...drawIn(i / (xy.length - 1))}>
                <circle cx={p.x} cy={p.y} r={16} fill="transparent">
                  <title>{`${p.name}: ${p.v} words a minute`}</title>
                </circle>
                <circle cx={p.x} cy={p.y} r={active === i ? 7 : 5} className="fill-violet-600 stroke-white transition-[r]" strokeWidth={2} />
                <text x={labelX} y={p.y - (i === 0 ? 10 : 10)} textAnchor={anchor} className="fill-zinc-900 text-[13px] font-semibold tabular-nums">
                  {p.v}
                </text>
                <text x={p.x} y={baseline + (secondRow[i] ? 32 : 18)} textAnchor={anchor} className="fill-zinc-500 text-[12px]">
                  {p.when}
                </text>
              </motion.g>
            );
          })}
          <line x1={PAD.left} x2={w - PAD.right} y1={baseline} y2={baseline} className="stroke-zinc-200" strokeWidth={1} />
        </svg>
      )}
    </div>
  );
}
