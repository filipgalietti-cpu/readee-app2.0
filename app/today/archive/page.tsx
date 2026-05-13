import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, ArrowLeft, Calendar } from "lucide-react";
import ArchiveBrowser from "./_components/ArchiveBrowser";

export const dynamic = "force-dynamic";
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
    "Browse every Readee Daily — a new reading passage for kids every morning, indexed by date, searchable, and grouped by month.",
};

/**
 * /today/archive — public, anonymous-friendly browse view of every
 * past Readee Daily. Server fetches the full set; the client browser
 * handles filter / theme chips / search / month jump-links so it's
 * snappy regardless of how big the archive grows.
 */
export default async function DailyArchivePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: rows } = await supabase
    .from("daily_questions")
    .select("date, slug, theme, passage_title, image_url")
    .lte("date", today)
    .eq("published_state", "live")
    .order("date", { ascending: false })
    .limit(365);
  const list = (rows ?? []) as Row[];

  // First entry in the desc-sorted list is today (or the most recent).
  const todaysEntry = list.find((r) => r.date === today) ?? null;

  // Stats for the hero strip — total, unique themes, span of dates.
  const themes = new Set(list.map((r) => r.theme).filter(Boolean));
  const oldestDate = list[list.length - 1]?.date ?? null;

  return (
    <article className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          href="/today"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Today&apos;s Readee
        </Link>

        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
          <Sparkles className="h-3 w-3" />
          Daily archive
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          Every Readee Daily, ever.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Browse passages from previous days. Curious what was on April
          12th? It&apos;s here. Each one takes about 5 minutes to read with
          a kid, and they&apos;re all yours.
        </p>

        {list.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm shadow-sm">
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

        {todaysEntry && (
          <Link
            href={`/today/${todaysEntry.slug}`}
            className="group mt-5 flex items-center gap-4 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
          >
            {todaysEntry.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={todaysEntry.image_url}
                alt=""
                className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-violet-200/60">
                <Sparkles className="h-7 w-7 text-violet-500" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
                Today&apos;s Daily · {todaysEntry.theme}
              </div>
              <div className="mt-0.5 truncate text-base font-bold text-zinc-900 group-hover:text-indigo-700">
                {todaysEntry.passage_title}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-violet-700">
                Read now →
              </div>
            </div>
          </Link>
        )}

        {list.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-3 text-sm text-zinc-500">
              No dailies published yet. Come back tomorrow morning.
            </p>
          </div>
        ) : (
          <ArchiveBrowser entries={list} todayDate={today} />
        )}

        <div className="mt-16 rounded-3xl border border-indigo-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">
            One new passage every morning.
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Designed by a certified reading specialist. Free to try.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              href="/signup"
              className="rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Try Readee free
            </Link>
            <Link
              href="/signup?as=teacher"
              className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-700 transition hover:border-violet-300"
            >
              I&apos;m a teacher
            </Link>
          </div>
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
