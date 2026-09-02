"use client";

import { motion } from "framer-motion";
import { BAND_LABEL, type PlacedBand } from "@/lib/placement/ladder";
import { BandChip } from "./BandChip";
import { MARKER_S, useReduced } from "./motion";

export type GradeLadderProps = {
  enrolled: PlacedBand;
  placed: PlacedBand;
  childName: string;
  /** "Growing Reader" */
  bandName: string;
  /** "two grade levels below" / "on grade level" / "one grade level above" */
  categoryText: string;
  /** When true the marker slides from the enrolled step to the placed step over 0.8 s. */
  animate: boolean;
  /** Render at the placed step with no slide (the printable report). */
  instant?: boolean;
};

const BANDS: PlacedBand[] = [0, 1, 2, 3, 4];
const gradeLabel = (b: PlacedBand): string => (b === 0 ? "Kindergarten" : `${BAND_LABEL[b]} grade`);

function stepClass(b: PlacedBand, enrolled: PlacedBand, placed: PlacedBand): string {
  const lo = Math.min(enrolled, placed);
  const hi = Math.max(enrolled, placed);
  if (b === placed) return "bg-violet-600 text-white";
  if (b === enrolled) return "border-2 border-violet-500 bg-white text-violet-700";
  if (b > lo && b < hi) return "bg-violet-100 text-violet-600";
  return "bg-zinc-100 text-zinc-400";
}

/**
 * Five steps, K to 4th. Vertical on a phone (4th at the top), horizontal at
 * desktop width. The enrolled step is outlined, the placed step is filled and
 * carries the child's name and band, the steps between are tinted, and the
 * gap is bracketed with the category text. Never red.
 */
export function GradeLadder({ enrolled, placed, childName, bandName, categoryText, animate, instant = false }: GradeLadderProps) {
  const reduced = useReduced();
  const jump = instant || reduced;
  const t = { duration: jump ? 0 : MARKER_S, ease: "easeOut" as const };
  const target = animate ? placed : enrolled;
  const lo = Math.min(enrolled, placed);
  const hi = Math.max(enrolled, placed);
  const gap = hi - lo;

  // Phone: rows run 4th (top) to K (bottom); row index = 4 - band, each row 56 px (h-14).
  const rowTop = (b: PlacedBand) => `${(4 - b) * 20}%`;
  const rowCenter = (b: PlacedBand) => `${(4 - b) * 20 + 10}%`;
  // Desktop: five equal columns; the centre of a band's column.
  const colCenter = (b: PlacedBand) => `${b * 20 + 10}%`;

  const marker = (
    <>
      <span className="text-sm font-semibold text-violet-700 @2xl:text-base">{childName}</span>
      <BandChip band={bandName} />
    </>
  );

  return (
    <div>
      {/* Phone: vertical ladder */}
      <div className="relative h-70 @2xl:hidden">
        <span aria-hidden className="absolute left-5 top-7 bottom-7 w-0.5 -translate-x-1/2 bg-zinc-200" />
        <ol className="relative">
          {[...BANDS].reverse().map((b) => (
            <li key={b} className="flex h-14 items-center gap-3">
              <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${stepClass(b, enrolled, placed)}`}>
                {BAND_LABEL[b]}
              </span>
              {b !== placed && (
                <span className={`text-sm ${b === enrolled ? "font-semibold text-zinc-900" : "text-zinc-400"}`}>
                  {gradeLabel(b)}
                  {b === enrolled && <span className="ml-2 text-xs font-semibold text-violet-600">enrolled</span>}
                </span>
              )}
            </li>
          ))}
        </ol>
        <motion.div
          className="absolute left-13 flex flex-col items-start gap-1.5"
          style={{ y: "-50%" }}
          initial={{ top: rowCenter(enrolled) }}
          animate={{ top: rowCenter(target) }}
          transition={t}
        >
          {marker}
        </motion.div>
        <div
          className="absolute right-0 flex w-28 items-center gap-2"
          style={gap > 0 ? { top: rowCenter(hi as PlacedBand), height: `${gap * 20}%` } : { top: rowTop(placed), height: "20%" }}
        >
          {gap > 0 && (
            <span aria-hidden className="relative h-full w-3 shrink-0">
              <span className="absolute left-1/2 top-1.5 bottom-1.5 w-0.5 -translate-x-1/2 rounded-full bg-violet-400" />
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-violet-400" />
              <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-violet-400" />
            </span>
          )}
          <p className="text-xs font-semibold leading-4 text-violet-700">{categoryText}</p>
        </div>
      </div>

      {/* Desktop: horizontal ladder */}
      <div className="relative hidden pt-20 pb-16 @2xl:block">
        <div className="relative grid grid-cols-5">
          <span aria-hidden className="absolute top-5 h-0.5 -translate-y-1/2 bg-zinc-200" style={{ left: "10%", right: "10%" }} />
          {BANDS.map((b) => (
            <div key={b} className="relative flex flex-col items-center gap-2">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${stepClass(b, enrolled, placed)}`}>
                {BAND_LABEL[b]}
              </span>
              <span className={`text-sm ${b === enrolled || b === placed ? "font-semibold text-zinc-900" : "text-zinc-400"}`}>{gradeLabel(b)}</span>
              {b === enrolled && <span className="-mt-1 text-xs font-semibold text-violet-600">enrolled</span>}
            </div>
          ))}
        </div>
        <motion.div
          className="absolute top-0 flex items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 shadow-[0_4px_14px_-4px_rgba(49,46,129,0.20)] ring-1 ring-violet-200"
          style={{ x: "-50%" }}
          initial={{ left: colCenter(enrolled) }}
          animate={{ left: colCenter(target) }}
          transition={t}
        >
          {marker}
        </motion.div>
        <div className="absolute bottom-0" style={gap > 0 ? { left: colCenter(lo as PlacedBand), width: `${gap * 20}%` } : { left: colCenter(placed), width: "20%", transform: "translateX(-50%)" }}>
          {gap > 0 && (
            <div aria-hidden className="relative h-3">
              <span className="absolute left-1.5 right-1.5 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-violet-400" />
              <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-violet-400" />
              <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-violet-400" />
            </div>
          )}
          <p className="mt-2 text-center text-base font-semibold text-violet-700">{categoryText}</p>
        </div>
      </div>
    </div>
  );
}
