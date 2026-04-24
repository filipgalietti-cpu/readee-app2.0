import Link from "next/link";
import { ArrowLeft, Users, Sparkles, Play } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const GRADES = ["K", "1st", "2nd", "3rd", "4th"] as const;

export default async function CommunityLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ grade?: string }>;
}) {
  await requireProfile();
  const { grade } = await searchParams;
  const activeGrade = grade && (GRADES as readonly string[]).includes(grade) ? grade : null;

  const admin = supabaseAdmin();
  let q = admin
    .from("community_passages")
    .select(
      "id, title, image_url, grade_level, topic, phonics_pattern, play_count, created_at",
    )
    .eq("status", "approved")
    .order("play_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);
  if (activeGrade) q = q.eq("grade_level", activeGrade);
  const { data: rows } = await q;

  const items = (rows ?? []) as {
    id: string;
    title: string;
    image_url: string | null;
    grade_level: string;
    topic: string;
    phonics_pattern: string | null;
    play_count: number;
    created_at: string;
  }[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/practice-hub"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Practice Hub
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            <Users className="h-4 w-4" />
            Community library
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Passages from Readee families
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-slate-400">
            Sanitized, kid-safe passages that other Readee parents generated
            with Readee.ai and chose to share. Reviewed by our team before
            going live.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <GradeChip href="/practice-hub/community" label="All" active={!activeGrade} />
        {GRADES.map((g) => (
          <GradeChip
            key={g}
            href={`/practice-hub/community?grade=${g}`}
            label={g === "K" ? "Kindergarten" : g}
            active={activeGrade === g}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <Sparkles className="mx-auto h-10 w-10 text-violet-500" />
          <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">
            No community passages yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
            When other parents share their Ask Readee passages, approved
            content will land here.
          </p>
          <Link
            href="/dashboard/ask-readee"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            <Sparkles className="h-4 w-4" />
            Make and share your own
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
            >
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt=""
                  className="h-32 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-500 dark:from-violet-950/30 dark:to-indigo-950/30">
                  <Sparkles className="h-10 w-10" />
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  {item.grade_level}
                </span>
                {item.phonics_pattern && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {item.phonics_pattern}
                  </span>
                )}
              </div>
              <h3 className="mt-2 line-clamp-2 font-bold text-zinc-900 dark:text-white">
                {item.title}
              </h3>
              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  {item.play_count} {item.play_count === 1 ? "read" : "reads"}
                </span>
                <Link
                  href={`/practice-hub/community/${item.id}`}
                  className="font-semibold text-violet-600 hover:underline dark:text-violet-300"
                >
                  Open →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GradeChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      }`}
    >
      {label}
    </Link>
  );
}
