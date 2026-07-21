"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

type Entry = {
  date: string;
  slug: string;
  theme: string;
  passage_title: string;
  image_url: string | null;
};

/**
 * In-app Daily Readee archive — the newspaper calendar, sized to fill the
 * content area with NO page scroll (the parent page pins it with `fixed`).
 * The day grid uses `grid-auto-rows: 1fr` so the weeks share the remaining
 * height and every cell shrinks to fit one screen. Month-jump pills + prev/
 * next step through months that actually have entries.
 */
export default function DailyArchive({
  entries,
  todayDate,
}: {
  entries: Entry[];
  todayDate: string;
}) {
  const byDate = useMemo(() => {
    const m = new Map<string, Entry>();
    for (const e of entries) m.set(e.date, e);
    return m;
  }, [entries]);

  const monthsWithEntries = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) s.add(e.date.slice(0, 7));
    return Array.from(s).sort((a, b) => b.localeCompare(a)); // newest first
  }, [entries]);

  const todayMonth = todayDate.slice(0, 7);
  const initialMonth = monthsWithEntries.includes(todayMonth)
    ? todayMonth
    : monthsWithEntries[0] ?? todayMonth;
  const [activeMonth, setActiveMonth] = useState(initialMonth);

  const monthTabs = useMemo(() => [...monthsWithEntries].reverse(), [monthsWithEntries]);
  const idx = monthsWithEntries.indexOf(activeMonth);
  const hasPrev = idx >= 0 && idx < monthsWithEntries.length - 1;
  const hasNext = idx > 0;
  const grid = useMemo(() => buildMonthGrid(activeMonth), [activeMonth]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Month nav */}
      <div className="mt-3 flex flex-none items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-zinc-900 sm:text-[22px]">
          {monthLabel(activeMonth)}
        </h2>
        <div className="flex items-center gap-1.5">
          {monthTabs.map((mm) => {
            const active = mm === activeMonth;
            return (
              <button
                key={mm}
                type="button"
                onClick={() => setActiveMonth(mm)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                  active
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {shortMonth(mm)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => hasPrev && setActiveMonth(monthsWithEntries[idx + 1])}
            disabled={!hasPrev}
            aria-label="Previous month"
            className="ml-0.5 grid h-[34px] w-[34px] place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => hasNext && setActiveMonth(monthsWithEntries[idx - 1])}
            disabled={!hasNext}
            aria-label="Next month"
            className="grid h-[34px] w-[34px] place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="mt-3 grid flex-none grid-cols-7 gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid — fills the remaining height; rows share it via 1fr. */}
      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-2 pb-1"
        style={{ gridAutoRows: "minmax(0, 1fr)" }}
      >
        {grid.map((cell, i) => {
          if (!cell) return <div key={`pad-${i}`} />;
          const entry = byDate.get(cell.date) ?? null;
          return (
            <DayCell
              key={cell.date}
              dayNum={cell.day}
              entry={entry}
              isToday={cell.date === todayDate}
              isFuture={cell.date > todayDate}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayCell({
  dayNum,
  entry,
  isToday,
  isFuture,
}: {
  dayNum: number;
  entry: Entry | null;
  isToday: boolean;
  isFuture: boolean;
}) {
  const pill = (
    <span
      className={`absolute left-1.5 top-1.5 z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
        isToday
          ? "bg-violet-600 text-white"
          : entry
          ? "bg-white/90 text-zinc-700 shadow-sm"
          : "text-zinc-400"
      }`}
    >
      {dayNum}
    </span>
  );

  if (isFuture) {
    return (
      <div className="relative h-full rounded-xl border border-dashed border-zinc-100 bg-zinc-50/40">
        {pill}
      </div>
    );
  }
  if (!entry) {
    return <div className="relative h-full rounded-xl border border-zinc-100 bg-white">{pill}</div>;
  }
  return (
    <Link
      href={`/today/${entry.slug}`}
      title={entry.passage_title}
      className={`group relative block h-full overflow-hidden rounded-xl border bg-zinc-100 transition hover:-translate-y-0.5 hover:shadow-md ${
        isToday ? "border-violet-500 ring-2 ring-violet-300" : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      {pill}
      {entry.image_url ? (
        <Image
          src={entry.image_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 130px, 14vw"
          className="object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400">
          <ImageIcon className="h-5 w-5" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-1.5 pb-1 pt-3.5">
        <div className="truncate text-[9px] font-bold uppercase tracking-widest text-white/90">
          {entry.theme}
        </div>
      </div>
    </Link>
  );
}

// ── helpers ─────────────────────────────────────────────────────────
type Cell = { date: string; day: number } | null;

/** Start-padded month grid (no trailing pad) so the grid has exactly the
 *  5 or 6 weeks it needs — every row then shares the fill height evenly. */
function buildMonthGrid(yyyymm: string): Cell[] {
  const [y, m] = yyyymm.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const startWeekday = new Date(y, m - 1, 1).getDay();
  const cells: Cell[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d });
  }
  return cells;
}

function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function shortMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}
