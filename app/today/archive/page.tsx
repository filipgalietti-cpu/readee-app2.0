import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Calendar } from "lucide-react";
import ArchiveCalendar from "./_components/ArchiveCalendar";

// Static + ISR. The previous `dynamic = "force-dynamic"` was overriding
// the 30-min revalidate and re-fetching from Supabase on every hit
// (the bottleneck). Removing it lets Next cache the rendered HTML and
// only rebuild every 1800s — first visit warms the cache, subsequent
// visits are instant.
export const revalidate = 1800;

type Row = {
  date: string;
  slug: string;
  theme: string;
  passage_title: string;
  image_url: string | null;
};

export const metadata = {
  title: "The Readee Daily — Archive",
  description:
    "Browse every Readee Daily on a month-grid calendar — one new reading passage every morning, all yours to read together.",
};

/**
 * /today/archive — public archive of every past Readee Daily.
 *
 * Server fetches the last year of dailies; the client component
 * renders a month-grid calendar (one cell per day, click to read).
 * Previously this was a long-scroll month list — fine for ~20 entries,
 * unwieldy past that. Calendar makes cadence + missed days legible at
 * a glance.
 */
export default async function DailyArchivePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  // 120-day window — calendar shows one month at a time and the prev/
  // next nav steps only through months that have entries, so 4 months
  // of history is ~3 months of nav range. Previously we pulled 365
  // days for no benefit (kid never sees year-old content from this
  // surface).
  const { data: rows } = await supabase
    .from("daily_questions")
    .select("date, slug, theme, passage_title, image_url")
    .lte("date", today)
    .eq("published_state", "live")
    .order("date", { ascending: false })
    .limit(120);
  const list = (rows ?? []) as Row[];

  // Stats for the hero strip — total, unique themes, span of dates.
  const themes = new Set(list.map((r) => r.theme).filter(Boolean));
  const oldestDate = list[list.length - 1]?.date ?? null;

  return (
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          href="/today"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Today&apos;s Readee
        </Link>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          The Daily Readee
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Every passage we&apos;ve published, on a calendar. Tap a day to
          read it — each one takes about 5 minutes with a kid.
        </p>

        {list.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <Stat label="Passages" value={list.length.toLocaleString()} />
            <Stat label="Themes" value={themes.size.toLocaleString()} />
            <Stat
              label="Since"
              value={
                oldestDate
                  ? new Date(oldestDate + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )
                  : "—"
              }
            />
          </div>
        )}

        {list.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-3 text-sm text-zinc-500">
              No dailies published yet. Come back tomorrow morning.
            </p>
          </div>
        ) : (
          <ArchiveCalendar entries={list} todayDate={today} />
        )}

        {/* Footer — minimal, matches the rest of the page. Single
            parent CTA, no colored card, no gradient. The calendar
            above is the product; this is just the closing nudge. */}
        <div className="mt-20 border-t border-zinc-100 pt-10 text-center">
          <p className="text-sm text-zinc-500">
            New passage every weekday morning.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </div>
      <div className="text-base font-extrabold text-zinc-900">{value}</div>
    </div>
  );
}
