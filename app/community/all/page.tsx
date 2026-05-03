import Link from "next/link";
import { ArrowLeft, Sparkles, Eye, Search } from "lucide-react";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export const metadata: Metadata = {
  title: "All Community Reading Passages — Readee",
  description:
    "Browse every approved K-4 reading passage in the Readee community library. Free, kid-safe, with audio and comprehension questions.",
  alternates: { canonical: "/community/all" },
  robots: { index: true, follow: true },
};

export default async function CommunityAllPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const query = q && q.trim().length > 0 ? q.trim() : null;
  const order: "popular" | "newest" =
    sort === "popular" ? "popular" : "newest";

  const admin = supabaseAdmin();
  let qb = admin
    .from("community_passages")
    .select(
      "id, slug, title, image_url, grade_level, topic, view_count, display_byline, created_at",
    )
    .eq("status", "approved")
    .not("slug", "is", null);
  if (query) {
    const safe = query.replace(/[%_]/g, "");
    qb = qb.or(
      `title.ilike.%${safe}%,topic.ilike.%${safe}%,passage_text.ilike.%${safe}%`,
    );
  }
  qb =
    order === "newest"
      ? qb.order("created_at", { ascending: false })
      : qb
          .order("view_count", { ascending: false })
          .order("created_at", { ascending: false });
  qb = qb.limit(120);

  const { data: rows } = await qb;
  const items = (rows ?? []) as {
    id: string;
    slug: string | null;
    title: string;
    image_url: string | null;
    grade_level: string;
    view_count: number;
    display_byline: string | null;
  }[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-900"
          >
            <Sparkles className="h-4 w-4 text-violet-600" />
            Readee Community
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            Try Readee free
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Community library
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          All community passages
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {items.length.toLocaleString()}{" "}
          {items.length === 1 ? "passage" : "passages"}
          {query && (
            <>
              {" "}
              matching <span className="font-semibold">&ldquo;{query}&rdquo;</span>
            </>
          )}
        </p>

        <form
          action="/community/all"
          method="get"
          className="mt-5 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm"
        >
          <Search className="h-4 w-4 flex-shrink-0 text-zinc-400" />
          <input
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search title, topic, or passage…"
            className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          {query && (
            <Link
              href={`/community/all${order !== "newest" ? `?sort=${order}` : ""}`}
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700"
            >
              Clear
            </Link>
          )}
          <input type="hidden" name="sort" value={order} />
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-700"
          >
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Sort
          </span>
          <SortChip
            href={`/community/all${query ? `?q=${encodeURIComponent(query)}` : ""}`}
            active={order === "newest"}
          >
            Newest
          </SortChip>
          <SortChip
            href={`/community/all?sort=popular${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            active={order === "popular"}
          >
            Most read
          </SortChip>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-violet-400" />
            <p className="mt-3 text-sm text-zinc-500">
              {query ? "Nothing matches that search yet." : "No passages yet."}
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/community/${p.slug}`}
                  className="group block h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-400">
                      <Sparkles className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                      <span className="rounded-full bg-violet-100 px-1.5 py-0.5">
                        {p.grade_level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Eye className="h-3 w-3" />
                        {p.view_count.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-bold text-zinc-900 group-hover:text-violet-700">
                      {p.title}
                    </h3>
                    {p.display_byline && (
                      <div className="mt-0.5 text-[11px] text-zinc-500">
                        by {p.display_byline}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SortChip({
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
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
        active
          ? "bg-violet-600 text-white"
          : "border border-zinc-200 bg-white text-zinc-600 hover:border-violet-300"
      }`}
    >
      {children}
    </Link>
  );
}
