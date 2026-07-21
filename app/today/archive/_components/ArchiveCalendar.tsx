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
 * Month-grid calendar view of the Daily archive. Each cell is a day —
 * cells with a published daily are clickable + show thumbnail + theme;
 * empty days are faded. Replaces the old long-scroll month list which
 * grew unwieldy past ~50 entries and didn't give parents a sense of
 * cadence (which days got skipped, what's coming next, etc.).
 */
export default function ArchiveCalendar({
  entries,
  todayDate,
}: {
  entries: Entry[];
  todayDate: string;
}) {
  // Index entries by YYYY-MM-DD for O(1) day-cell lookup.
  const byDate = useMemo(() => {
    const m = new Map<string, Entry>();
    for (const e of entries) m.set(e.date, e);
    return m;
  }, [entries]);

  // All months that have at least one entry, sorted newest first.
  // The kid/parent navigates between these — no point arrowing into
  // empty months that will never have content.
  const monthsWithEntries = useMemo(() => {
    const months = new Set<string>();
    for (const e of entries) months.add(e.date.slice(0, 7));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  // Default to today's month if it has entries, otherwise the most
  // recent month with content (likely also today's, but a safer choice
  // for archives with gaps).
  const todayMonth = todayDate.slice(0, 7);
  const initialMonth = monthsWithEntries.includes(todayMonth)
    ? todayMonth
    : monthsWithEntries[0] ?? todayMonth;
  const [activeMonth, setActiveMonth] = useState<string>(initialMonth);

  // Chronological (oldest → newest) for the month-jump pills.
  const monthTabs = useMemo(
    () => [...monthsWithEntries].reverse(),
    [monthsWithEntries],
  );

  const currentIdx = monthsWithEntries.indexOf(activeMonth);
  const hasPrev = currentIdx >= 0 && currentIdx < monthsWithEntries.length - 1;
  const hasNext = currentIdx > 0;

  function goPrev() {
    if (!hasPrev) return;
    setActiveMonth(monthsWithEntries[currentIdx + 1]);
  }
  function goNext() {
    if (!hasNext) return;
    setActiveMonth(monthsWithEntries[currentIdx - 1]);
  }

  const grid = useMemo(() => buildMonthGrid(activeMonth), [activeMonth]);

  const monthEntryCount = useMemo(
    () => entries.filter((e) => e.date.startsWith(activeMonth)).length,
    [entries, activeMonth],
  );

  return (
    <div className="mt-8">
      {/* Month nav header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            {monthLabel(activeMonth)}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {monthEntryCount} {monthEntryCount === 1 ? "passage" : "passages"} this month
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Month-jump pills (oldest → newest) — quick access to any
              month that has entries, matching the archive design. */}
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
            onClick={goPrev}
            disabled={!hasPrev}
            aria-label="Previous month"
            className="ml-0.5 rounded-full border border-zinc-200 bg-white p-2 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            aria-label="Next month"
            className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Weekday header — Sun..Sat to match US calendar convention. */}
      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid — each row is a week; cells in `padding` weeks at
          the start/end are rendered as empty spacers. */}
      <div className="grid grid-cols-7 gap-2">
        {grid.map((cell, i) => {
          if (!cell) return <div key={`pad-${i}`} className="aspect-square" />;
          const entry = byDate.get(cell.date);
          const isToday = cell.date === todayDate;
          const isFuture = cell.date > todayDate;
          return (
            <DayCell
              key={cell.date}
              dayNum={cell.day}
              entry={entry ?? null}
              isToday={isToday}
              isFuture={isFuture}
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
  const dayPill = (
    <span
      className={`absolute left-2 top-2 z-10 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
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

  // Future days — quiet placeholder, no interaction.
  if (isFuture) {
    return (
      <div className="relative aspect-square rounded-xl border border-dashed border-zinc-100 bg-zinc-50/40">
        {dayPill}
      </div>
    );
  }

  // Empty cell (past day with no daily) — faded, non-interactive.
  if (!entry) {
    return (
      <div className="relative aspect-square rounded-xl border border-zinc-100 bg-white">
        {dayPill}
      </div>
    );
  }

  // Cell with a daily — clickable, image thumbnail fills the cell.
  return (
    <Link
      href={`/today/${entry.slug}`}
      className={`group relative block aspect-square overflow-hidden rounded-xl border bg-zinc-100 transition hover:-translate-y-0.5 hover:shadow-md ${
        isToday ? "border-violet-500 ring-2 ring-violet-300" : "border-zinc-200 hover:border-zinc-300"
      }`}
      title={entry.passage_title}
    >
      {dayPill}
      {entry.image_url ? (
        // Next/Image generates a srcset down to ~200px wide so the
        // cell isn't downloading a 1024px PNG it renders at 140px.
        // `sizes` tells the optimizer the on-screen footprint so it
        // can pick the smallest matching variant per viewport.
        <Image
          src={entry.image_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 140px, (min-width: 640px) 18vw, 14vw"
          className="object-cover transition group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400">
          <ImageIcon className="h-6 w-6" />
        </div>
      )}
      {/* Bottom gradient + theme label so the day pill stays legible
          against busy thumbnails and the theme is glance-readable. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent p-1.5">
        <div className="truncate text-[9px] font-bold uppercase tracking-widest text-white/90">
          {entry.theme}
        </div>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

type Cell = { date: string; day: number } | null;

/**
 * Build a 6-week grid for a month, padded with nulls at the start
 * (to align the 1st with its weekday column) and at the end (to
 * round out the last partial row). Returns a flat 42-cell array
 * (Sun→Sat × 6 rows) so the consumer can map it directly.
 */
function buildMonthGrid(yyyymm: string): Cell[] {
  const [y, m] = yyyymm.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const startWeekday = first.getDay(); // 0 = Sun
  const cells: Cell[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    cells.push({ date: `${y}-${mm}-${dd}`, day: d });
  }
  while (cells.length < 42) cells.push(null);
  return cells;
}

function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function shortMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}
