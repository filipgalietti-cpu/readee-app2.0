import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Eye,
  Search,
  ArrowRight,
  CircleHelp,
} from "lucide-react";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 600;

const GRADE_MAP: Record<string, { key: string; label: string }> = {
  k: { key: "K", label: "Kindergarten" },
  kindergarten: { key: "K", label: "Kindergarten" },
  "1st": { key: "1st", label: "1st Grade" },
  "2nd": { key: "2nd", label: "2nd Grade" },
  "3rd": { key: "3rd", label: "3rd Grade" },
  "4th": { key: "4th", label: "4th Grade" },
};

function resolveGrade(slug: string) {
  return GRADE_MAP[slug.toLowerCase()] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ grade: string }>;
}): Promise<Metadata> {
  const { grade } = await params;
  const g = resolveGrade(grade);
  if (!g) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  return {
    title: `${g.label} Reading Passages — Readee Community`,
    description: `Free ${g.label.toLowerCase()} reading passages with comprehension questions, audio, and illustrations. Made and shared by Readee families.`,
    alternates: { canonical: `/community/grade/${grade.toLowerCase()}` },
    openGraph: {
      title: `${g.label} reading passages — Readee Community`,
      description: `Kid-safe ${g.label.toLowerCase()} reading passages from real Readee families.`,
      type: "website",
      url: `/community/grade/${grade.toLowerCase()}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CommunityGradePage({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string }>;
  searchParams: Promise<{ topic?: string; sort?: string }>;
}) {
  const { grade } = await params;
  const g = resolveGrade(grade);
  if (!g) notFound();

  const { topic, sort } = await searchParams;
  const activeTopic = topic && topic.trim().length > 0 ? topic.trim() : null;
  const order: "popular" | "newest" =
    sort === "newest" ? "newest" : "popular";

  const admin = supabaseAdmin();
  let q = admin
    .from("community_passages")
    .select(
      "id, slug, title, image_url, grade_level, topic, view_count, display_byline, created_at",
    )
    .eq("status", "approved")
    .eq("grade_level", g.key)
    .not("slug", "is", null);
  if (activeTopic) {
    const safe = activeTopic.replace(/[%_]/g, "");
    q = q.ilike("topic", `%${safe}%`);
  }
  if (order === "newest") {
    q = q.order("created_at", { ascending: false });
  } else {
    q = q
      .order("view_count", { ascending: false })
      .order("created_at", { ascending: false });
  }
  q = q.limit(120);
  const { data: rows } = await q;
  const items = (rows ?? []) as {
    id: string;
    slug: string | null;
    title: string;
    image_url: string | null;
    grade_level: string;
    topic: string;
    view_count: number;
    display_byline: string | null;
    created_at: string;
  }[];

  // Top topic chips, derived from this grade's catalog so they're
  // always relevant. Top 12 by frequency.
  const topicCounts = new Map<string, number>();
  for (const r of items) {
    const t = (r.topic ?? "").toLowerCase().trim();
    if (!t) continue;
    const word =
      t
        .split(/\s+/)
        .find((w) => w.length >= 5) ?? t.slice(0, 24);
    topicCounts.set(word, (topicCounts.get(word) ?? 0) + 1);
  }
  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);

  function buildHref(overrides: Record<string, string | null>) {
    const params = new URLSearchParams();
    const entries: Record<string, string | null> = {
      topic: activeTopic,
      sort: order,
      ...overrides,
    };
    for (const [k, v] of Object.entries(entries)) {
      if (v && !(k === "sort" && v === "popular")) params.set(k, v);
    }
    const qs = params.toString();
    return qs
      ? `/community/grade/${grade.toLowerCase()}?${qs}`
      : `/community/grade/${grade.toLowerCase()}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/community"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/readee-logo.png"
              alt="Readee"
              className="h-auto w-[140px] sm:w-[160px]"
            />
            <span className="hidden text-sm font-medium text-violet-500 sm:inline">
              <span className="font-bold">Unlock</span> Reading
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/contact-us"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-indigo-500 transition-colors hover:bg-indigo-50 hover:text-indigo-700 sm:px-3"
              aria-label="Help"
            >
              <CircleHelp className="h-5 w-5" />
              <span className="hidden text-sm font-semibold sm:inline">Help</span>
            </Link>
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-zinc-600 hover:text-violet-700 sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700 sm:text-sm"
            >
              Try Readee free
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All grades
        </Link>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          {g.label} reading passages
        </h1>
        <p className="mt-2 max-w-2xl text-base text-zinc-600">
          Free, kid-safe passages for {g.label.toLowerCase()} readers — each
          with comprehension questions, read-aloud audio, and an illustration.
          Made and shared by Readee families.
        </p>
        <div className="mt-2 text-sm text-zinc-500">
          {items.length.toLocaleString()}{" "}
          {items.length === 1 ? "passage" : "passages"}
          {activeTopic && (
            <>
              {" "}
              about <span className="font-semibold">{activeTopic}</span>
            </>
          )}
        </div>

        {/* Search */}
        <form
          action={`/community/grade/${grade.toLowerCase()}`}
          method="get"
          className="mt-6 flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm"
        >
          <Search className="h-4 w-4 flex-shrink-0 text-zinc-400" />
          <input
            name="topic"
            defaultValue={activeTopic ?? ""}
            placeholder={`Search ${g.label.toLowerCase()} topics…`}
            className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          {activeTopic && (
            <Link
              href={buildHref({ topic: null })}
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700"
            >
              Clear
            </Link>
          )}
          {order && order !== "popular" && (
            <input type="hidden" name="sort" value={order} />
          )}
          <button
            type="submit"
            className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
          >
            Search
          </button>
        </form>

        {/* Topic chips */}
        {topTopics.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Topic
            </span>
            <Chip href={buildHref({ topic: null })} active={!activeTopic}>
              All
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
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Sort
          </span>
          <Chip href={buildHref({ sort: "popular" })} active={order === "popular"}>
            Most read
          </Chip>
          <Chip href={buildHref({ sort: "newest" })} active={order === "newest"}>
            Newest
          </Chip>
        </div>

        {items.length === 0 ? (
          activeTopic ? (
            <p className="mt-6 text-sm text-zinc-500">
              No {g.label.toLowerCase()} passages match &ldquo;{activeTopic}&rdquo; yet.{" "}
              <Link
                href={`/community/grade/${grade.toLowerCase()}`}
                className="font-semibold text-violet-700 hover:underline"
              >
                Clear filter
              </Link>
            </p>
          ) : null
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                      className="h-36 w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-400">
                      <Sparkles className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                      <span className="rounded-full bg-violet-100 px-1.5 py-0.5">
                        {p.grade_level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Eye className="h-3 w-3" />
                        {p.view_count.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 text-base font-bold text-zinc-900 group-hover:text-violet-700">
                      {p.title}
                    </h3>
                    {p.display_byline && (
                      <div className="mt-1 text-[11px] text-zinc-500">
                        by{" "}
                        <span className="font-semibold text-zinc-700">
                          {p.display_byline}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-6 text-center sm:p-8">
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 sm:text-2xl">
            Want a {g.label.toLowerCase()} passage about something specific?
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Make your own with Readee.ai — pick the topic, get a level-locked
            passage with audio in under a minute.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
          >
            Try Readee free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
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
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
        active
          ? "bg-violet-600 text-white"
          : "border border-zinc-200 bg-white text-zinc-600 hover:border-violet-300 hover:text-violet-700"
      }`}
    >
      {children}
    </Link>
  );
}
