"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ImageIcon, X } from "lucide-react";

type Entry = {
  date: string;
  slug: string;
  theme: string;
  passage_title: string;
  image_url: string | null;
};

const ALL_THEMES_SENTINEL = "__all__";

export default function ArchiveBrowser({
  entries,
  todayDate,
}: {
  entries: Entry[];
  todayDate: string;
}) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string>(ALL_THEMES_SENTINEL);

  // Top themes by frequency for the chip strip — keeps the strip
  // useful even when the catalog has dozens of niche themes.
  const themeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      const t = (e.theme ?? "").trim();
      if (!t) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (theme !== ALL_THEMES_SENTINEL && e.theme !== theme) return false;
      if (q.length === 0) return true;
      const hay =
        `${e.passage_title} ${e.theme} ${e.date}`.toLowerCase();
      return hay.includes(q);
    });
  }, [entries, query, theme]);

  // Group by year → month so multi-year archives don't all share one
  // visual rhythm. Years get a big section header; months are sub-sections.
  const grouped = useMemo(() => {
    const byYearMonth = new Map<string, Map<string, Entry[]>>();
    for (const e of filtered) {
      const year = e.date.slice(0, 4);
      const month = e.date.slice(0, 7);
      if (!byYearMonth.has(year)) byYearMonth.set(year, new Map());
      const yearMap = byYearMonth.get(year)!;
      if (!yearMap.has(month)) yearMap.set(month, []);
      yearMap.get(month)!.push(e);
    }
    // Sort years descending; months descending within year.
    return Array.from(byYearMonth.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([year, months]) => ({
        year,
        months: Array.from(months.entries()).sort((a, b) =>
          b[0].localeCompare(a[0]),
        ),
      }));
  }, [filtered]);

  // For the sticky month-jump rail at the top.
  const allMonths = useMemo(() => {
    const months = new Set<string>();
    for (const e of entries) months.add(e.date.slice(0, 7));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  function monthLabel(yyyymm: string, opts?: { short?: boolean }): string {
    const [y, m] = yyyymm.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("en-US", {
      month: opts?.short ? "short" : "long",
      year: opts?.short ? undefined : "numeric",
    });
  }

  const noResults = filtered.length === 0;

  return (
    <div className="mt-8">
      {/* Search + theme chips */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 flex-shrink-0 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, theme, or date…"
            className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {themeOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Theme
            </span>
            <Chip
              active={theme === ALL_THEMES_SENTINEL}
              onClick={() => setTheme(ALL_THEMES_SENTINEL)}
            >
              All ({entries.length})
            </Chip>
            {themeOptions.map(([t, n]) => (
              <Chip
                key={t}
                active={theme === t}
                onClick={() => setTheme(t)}
              >
                {t} <span className="opacity-60">· {n}</span>
              </Chip>
            ))}
          </div>
        )}

        {/* Sticky month rail — always visible, click to jump. */}
        {allMonths.length > 1 && (
          <div className="sticky top-2 z-10 -mx-1 flex flex-wrap items-center gap-1.5 rounded-full border border-zinc-200 bg-white/90 px-2 py-1.5 shadow-sm backdrop-blur">
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Jump to
            </span>
            {allMonths.slice(0, 18).map((m) => (
              <a
                key={m}
                href={`#month-${m}`}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 hover:bg-violet-50 hover:text-violet-700"
              >
                {monthLabel(m, { short: true })}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Result count */}
      {(query || theme !== ALL_THEMES_SENTINEL) && (
        <div className="mt-4 text-xs text-zinc-500">
          {filtered.length} {filtered.length === 1 ? "match" : "matches"}
          {query && (
            <>
              {" "}for &ldquo;<span className="font-semibold">{query}</span>&rdquo;
            </>
          )}
          {theme !== ALL_THEMES_SENTINEL && (
            <>
              {" "}in <span className="font-semibold">{theme}</span>
            </>
          )}
        </div>
      )}

      {noResults ? (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-500">
            Nothing matches that filter. Try clearing it.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTheme(ALL_THEMES_SENTINEL);
            }}
            className="mt-3 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 hover:border-violet-300"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {grouped.map(({ year, months }, yearIdx) => (
            <section key={year}>
              {/* Year divider — only render when there's more than one year */}
              {grouped.length > 1 && (
                <div className="mb-6 flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
                    {year}
                  </h2>
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-[11px] font-semibold text-zinc-400">
                    {months.reduce((acc, [, e]) => acc + e.length, 0)} passages
                  </span>
                </div>
              )}
              {months.map(([month, items], idx) => (
                <section
                  key={month}
                  id={`month-${month}`}
                  className={
                    yearIdx === 0 && idx === 0 ? "scroll-mt-28" : "mt-10 scroll-mt-28"
                  }
                >
                  <div className="mb-3 flex items-baseline justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-700">
                      {monthLabel(month)}
                    </h3>
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {items.length} {items.length === 1 ? "passage" : "passages"}
                    </span>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((r) => (
                      <ArchiveCard key={r.slug} entry={r} isToday={r.date === todayDate} />
                    ))}
                  </ul>
                </section>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
        active
          ? "bg-violet-600 text-white shadow-sm"
          : "border border-zinc-200 bg-white text-zinc-600 hover:border-violet-300 hover:text-violet-700"
      }`}
    >
      {children}
    </button>
  );
}

function ArchiveCard({ entry, isToday }: { entry: Entry; isToday: boolean }) {
  const day = new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <li>
      <Link
        href={`/today/${entry.slug}`}
        className={`group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
          isToday
            ? "border-violet-400 ring-2 ring-violet-200"
            : "border-zinc-200 hover:border-indigo-300"
        }`}
      >
        {entry.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.image_url}
            alt=""
            className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400">
            <ImageIcon className="h-10 w-10" />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
            <span>{day}</span>
            {isToday && (
              <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] text-white">
                Today
              </span>
            )}
            <span className="text-zinc-300">·</span>
            <span className="truncate text-zinc-500">{entry.theme}</span>
          </div>
          <div className="mt-1.5 line-clamp-2 text-sm font-bold text-zinc-900 group-hover:text-indigo-700">
            {entry.passage_title}
          </div>
        </div>
      </Link>
    </li>
  );
}
