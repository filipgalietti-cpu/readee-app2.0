import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/helpers";
import { isPlatformAdmin } from "@/lib/auth/admin-gate";
import { createClient } from "@/lib/supabase/server";
import { LESSONS } from "@/app/data/lessons-v2";

/**
 * /owner/review — the queue.
 *
 * 183 lessons is too many to hold in your head, so the only job of this page is
 * to answer "what have I not looked at yet" and get out of the way. Ordered the
 * way a child meets the catalogue: grade, then standard.
 */
export const dynamic = "force-dynamic";

export default async function ReviewIndex() {
  const profile = await requireProfile();
  if (!(await isPlatformAdmin(profile.id))) notFound();

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("lesson_reviews")
    .select("lesson_slug, scene_id, verdicts")
    .eq("reviewer_id", profile.id);

  // Two things per lesson: the overall verdict if one exists, and how many
  // scenes carry a judgement (so a half-finished pass is visible as such).
  const overall = new Map<string, string>();
  const touched = new Map<string, number>();
  for (const r of rows ?? []) {
    const slug = r.lesson_slug as string;
    const v = (r.verdicts as Record<string, string>) ?? {};
    if (r.scene_id === "") {
      if (v.overall) overall.set(slug, v.overall);
    } else if (Object.keys(v).length) {
      touched.set(slug, (touched.get(slug) ?? 0) + 1);
    }
  }

  const all = Object.entries(LESSONS)
    .map(([slug, e]) => ({ slug, l: e.lesson }))
    .sort((a, b) => a.l.grade.localeCompare(b.l.grade) || a.l.standard.localeCompare(b.l.standard));

  const done = all.filter((x) => overall.has(x.slug)).length;
  const started = all.filter((x) => !overall.has(x.slug) && touched.has(x.slug)).length;
  const shipped = [...overall.values()].filter((v) => v === "up").length;
  const rework = [...overall.values()].filter((v) => v === "down").length;

  const firstUnreviewed = all.find((x) => !overall.has(x.slug));

  const stat = (n: number, label: string, tone = "") => (
    <div className="flex-1 border-r border-zinc-200 px-4 py-3 last:border-r-0 dark:border-zinc-700">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.13em] text-zinc-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${tone}`}>{n}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 pb-24">
      <header className="border-b-2 border-zinc-900 pb-3 dark:border-zinc-100">
        <h1 className="text-3xl font-bold tracking-tight">Lesson review</h1>
        <p className="mt-1 max-w-[62ch] text-zinc-600 dark:text-zinc-400">
          Play each lesson the way a child gets it, and record how it feels. The panel follows the
          scene you are on.
        </p>
      </header>

      <div className="mt-4 flex flex-wrap overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        {stat(all.length, "Lessons")}
        {stat(done, "Reviewed")}
        {stat(started, "In progress")}
        {stat(shipped, "Ship it", "text-emerald-600")}
        {stat(rework, "Needs work", "text-red-600")}
      </div>

      {firstUnreviewed && (
        <Link
          href={`/owner/review/${firstUnreviewed.slug}`}
          className="mt-4 inline-block rounded-lg bg-violet-600 px-5 py-2.5 font-bold text-white hover:bg-violet-700"
        >
          Review next: {firstUnreviewed.l.title} →
        </Link>
      )}

      <ol className="mt-6 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
        {all.map((x) => {
          const ov = overall.get(x.slug);
          const n = touched.get(x.slug) ?? 0;
          return (
            <li key={x.slug} className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800">
              <Link
                href={`/owner/review/${x.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <span
                  className={`h-2.5 w-2.5 flex-none rounded-full ${
                    ov === "up"
                      ? "bg-emerald-500"
                      : ov === "down"
                        ? "bg-red-500"
                        : n
                          ? "bg-amber-400"
                          : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{x.l.title}</span>
                  <span className="block font-mono text-[11px] text-zinc-400">
                    {x.l.grade} · {x.l.standard} · {x.l.scenes.length} scenes
                  </span>
                </span>
                {n > 0 && !ov && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800">
                    {n} judged
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
