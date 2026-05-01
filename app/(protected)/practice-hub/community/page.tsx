import Link from "next/link";
import { ArrowLeft, Users, Sparkles, Play, Search, Eye } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const GRADES = ["K", "1st", "2nd", "3rd", "4th"] as const;
const SORTS = [
  { id: "popular", label: "Most read" },
  { id: "newest", label: "Newest" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

export default async function CommunityLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    grade?: string;
    topic?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  await requireProfile();
  const { grade, topic, q, sort: sortParam } = await searchParams;
  const activeGrade =
    grade && (GRADES as readonly string[]).includes(grade) ? grade : null;
  const activeTopic = topic && topic.trim().length > 0 ? topic.trim() : null;
  const activeQuery = q && q.trim().length > 0 ? q.trim() : null;
  const sort: SortId =
    sortParam === "newest" ? "newest" : "popular";

  const admin = supabaseAdmin();

  let query = admin
    .from("community_passages")
    .select(
      "id, slug, title, image_url, grade_level, topic, phonics_pattern, view_count, play_count, display_byline, created_at",
    )
    .eq("status", "approved");

  if (activeGrade) query = query.eq("grade_level", activeGrade);
  if (activeTopic)
    query = query.ilike("topic", `%${activeTopic.replace(/[%_]/g, "")}%`);
  if (activeQuery) {
    const safe = activeQuery.replace(/[%_]/g, "");
    query = query.or(
      `title.ilike.%${safe}%,topic.ilike.%${safe}%,passage_text.ilike.%${safe}%`,
    );
  }
  if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query
      .order("view_count", { ascending: false })
      .order("play_count", { ascending: false })
      .order("created_at", { ascending: false });
  }
  query = query.limit(60);

  const { data: rows } = await query;
  const items = (rows ?? []) as {
    id: string;
    slug: string | null;
    title: string;
    image_url: string | null;
    grade_level: string;
    topic: string;
    phonics_pattern: string | null;
    view_count: number;
    play_count: number;
    display_byline: string | null;
    created_at: string;
  }[];

  // Build the topic chip strip from the current result set so chips
  // stay relevant to whatever else is filtered.
  const topicCounts = new Map<string, number>();
  for (const r of items) {
    const t = (r.topic ?? "").toLowerCase().trim();
    if (!t) continue;
    const word =
      t.split(/\s+/).find((w) => w.length >= 5) ?? t.slice(0, 24);
    topicCounts.set(word, (topicCounts.get(word) ?? 0) + 1);
  }
  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  function buildHref(overrides: Record<string, string | null>): string {
    const params = new URLSearchParams();
    const entries: Record<string, string | null> = {
      grade: activeGrade,
      topic: activeTopic,
      q: activeQuery,
      sort,
      ...overrides,
    };
    for (const [k, v] of Object.entries(entries)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/practice-hub/community?${qs}` : "/practice-hub/community";
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/practice-hub"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Practice Hub
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-300">
            <Users className="h-4 w-4" />
            Community library
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Passages from Readee families
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-slate-400">
            Sanitized, kid-safe passages other Readee parents made and shared.
            Reviewed by our team before going live.
          </p>
        </div>
        <Link
          href="/dashboard/ask-readee"
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          <Sparkles className="h-4 w-4" />
          Make &amp; share
        </Link>
      </div>

      {/* Search */}
      <form
        action="/practice-hub/community"
        className="mt-6 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
      >
        <Search className="h-4 w-4 flex-shrink-0 text-zinc-400" />
        <input
          name="q"
          defaultValue={activeQuery ?? ""}
          placeholder="Search topic, title, or passage…"
          className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
        />
        {activeGrade && <input type="hidden" name="grade" value={activeGrade} />}
        {activeTopic && <input type="hidden" name="topic" value={activeTopic} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
        {activeQuery && (
          <Link
            href={buildHref({ q: null })}
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700"
          >
            Clear
          </Link>
        )}
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          Search
        </button>
      </form>

      {/* Grade chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Grade
        </span>
        <Chip href={buildHref({ grade: null })} active={!activeGrade}>
          All
        </Chip>
        {GRADES.map((g) => (
          <Chip
            key={g}
            href={buildHref({ grade: g })}
            active={activeGrade === g}
          >
            {g === "K" ? "Kindergarten" : g}
          </Chip>
        ))}
      </div>

      {/* Topic chips */}
      {topTopics.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Topic
          </span>
          <Chip href={buildHref({ topic: null })} active={!activeTopic}>
            All topics
          </Chip>
          {topTopics.map((t) => (
            <Chip
              key={t}
              href={buildHref({ topic: t })}
              active={activeTopic?.toLowerCase() === t}
            >
              {t}
            </Chip>
          ))}
        </div>
      )}

      {/* Sort */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Sort
        </span>
        {SORTS.map((s) => (
          <Chip
            key={s.id}
            href={buildHref({ sort: s.id })}
            active={sort === s.id}
          >
            {s.label}
          </Chip>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <Sparkles className="mx-auto h-10 w-10 text-violet-500" />
          <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-white">
            No matches
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-slate-400">
            Try clearing a filter, or be the first to share a passage about
            this topic.
          </p>
          <Link
            href="/dashboard/ask-readee"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            <Sparkles className="h-4 w-4" />
            Make &amp; share
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            // Public read URL when slug exists; fall back to the
            // logged-in detail view for any pre-slug rows.
            const href = item.slug
              ? `/community/${item.slug}`
              : `/practice-hub/community/${item.id}`;
            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
              >
                <Link href={href} className="block">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt=""
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-500 dark:from-violet-950/30 dark:to-indigo-950/30">
                      <Sparkles className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
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
                    {item.display_byline && (
                      <div className="mt-1 text-[11px] text-zinc-500 dark:text-slate-400">
                        Shared by{" "}
                        <span className="font-semibold text-zinc-700 dark:text-slate-300">
                          {item.display_byline}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.view_count.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        {item.play_count.toLocaleString()}
                      </span>
                      <span className="ml-auto font-semibold text-violet-600 dark:text-violet-300">
                        Open →
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "border border-zinc-200 bg-white text-zinc-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      }`}
    >
      {children}
    </Link>
  );
}
