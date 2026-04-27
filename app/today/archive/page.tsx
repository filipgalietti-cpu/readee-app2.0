import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, ArrowLeft, Calendar, ImageIcon } from "lucide-react";

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
    "Browse every Readee Daily — a new reading passage for kids every morning, indexed by date.",
};

/**
 * /today/archive — public, anonymous-friendly browse view of every
 * past Readee Daily. Grouped by month (newest first), each card links
 * into /today/[slug]. Skips QC failures the same way the discovery
 * surfaces do.
 */
export default async function DailyArchivePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: rows } = await supabase
    .from("daily_questions")
    .select("date, slug, theme, passage_title, image_url")
    .lte("date", today)
    .neq("qc_overall", "fail")
    .order("date", { ascending: false })
    .limit(365);
  const list = (rows ?? []) as Row[];

  // Group by YYYY-MM for month buckets.
  const byMonth = new Map<string, Row[]>();
  for (const r of list) {
    const key = r.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(r);
  }
  const months = Array.from(byMonth.entries());

  function monthLabel(yyyymm: string): string {
    const [y, m] = yyyymm.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  return (
    <article className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          href="/today"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Today's Readee
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
          12th? It's here. Each one took 5 minutes to read with a kid,
          and they're all yours.
        </p>

        {months.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-3 text-sm text-zinc-500">
              No dailies published yet. Come back tomorrow morning.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {months.map(([month, entries]) => (
              <section key={month}>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
                  {monthLabel(month)}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((r) => {
                    const day = new Date(r.date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { weekday: "short", month: "short", day: "numeric" },
                    );
                    return (
                      <li key={r.slug}>
                        <Link
                          href={`/today/${r.slug}`}
                          className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                        >
                          {r.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.image_url}
                              alt=""
                              className="h-36 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-400">
                              <ImageIcon className="h-10 w-10" />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                              {day} · {r.theme}
                            </div>
                            <div className="mt-1.5 line-clamp-2 text-sm font-bold text-zinc-900 group-hover:text-indigo-700">
                              {r.passage_title}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
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
              I'm a teacher
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
