import Link from "next/link";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import TrendingCarousel from "./_components/TrendingCarousel";
import { CoverFallback } from "@/app/_components/EmptyState";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";
import LibraryCta from "./_components/LibraryCta";
import { PUBLIC_KIND_FILTER } from "./_lib/public-filter";
import { trackError } from "@/lib/observability/track";

// Cached, deliberately. `force-dynamic` used to sit here and silently override
// the revalidate below, so every visit and every crawler re-queried the
// database and every one of those was a chance to show an error page instead of
// the library (Sentry aff62aa0, a parent eight minutes into their first
// account). /today/[slug] hit the same trap and already carries the same note.
// The window is short so moderation still bites quickly: a passage pulled from
// the shelf disappears within it.
export const revalidate = 180;

/**
 * The public Free Reading Library (was "Community library").
 *
 * Sep 17 2026, Filip: the community framing was conflating three things
 * (the daily reading, Readee's own passages, and kids' Story Studio
 * stories), and the page converted nobody. Now: Readee-made passages only
 * on the public shelf (see _lib/public-filter.ts), one ask everywhere (the
 * free assessment, via LibraryCta), and a signup gate on the second story
 * (GatedPassage). The URL stays /community because ChatGPT already cites it.
 */
export const metadata: Metadata = {
  title: "Free Reading Library - K-4 reading passages with audio · Readee",
  description:
    "Free reading passages for kindergarten through 4th grade, made by Readee. Every one has read-aloud audio, an illustration and comprehension questions. Browse by grade.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Readee Free Reading Library - K-4 reading passages",
    description:
      "Free K-4 reading passages with audio, illustrations, and comprehension questions.",
    type: "website",
    url: "/community",
  },
  robots: { index: true, follow: true },
};

const GRADES = [
  { key: "K", label: "Kindergarten", short: "K" },
  { key: "1st", label: "1st Grade", short: "1st" },
  { key: "2nd", label: "2nd Grade", short: "2nd" },
  { key: "3rd", label: "3rd Grade", short: "3rd" },
  { key: "4th", label: "4th Grade", short: "4th" },
] as const;

type Card = {
  id: string;
  slug: string | null;
  title: string;
  image_url: string | null;
  grade_level: string;
  topic: string;
  view_count: number;
  display_byline: string | null;
  display_org: string | null;
  display_state: string | null;
  created_at: string;
  passage_text?: string | null;
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

function bylineInitial(byline: string | null | undefined): string {
  if (!byline) return "R";
  // "Featured by Readee" → "R", "Erin S." → "E"
  const first = byline.split(/\s+/).find((p) => /[A-Za-z]/.test(p)) ?? "R";
  return first[0].toUpperCase();
}

function avatarTone(byline: string | null | undefined): string {
  // Stable tone bucket from byline so the same author always gets the
  // same avatar color. 6 brand-aligned tones.
  const tones = [
    "from-violet-600 to-violet-500",
    "from-rose-400 to-pink-500",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-sky-400 to-blue-500",
    "from-fuchsia-400 to-purple-500",
  ];
  const seed = (byline ?? "Readee")
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return tones[seed % tones.length];
}

/** Derive a kid-friendly "genre" bubble from the passage's topic + title.
 *  Maps to one of the Ask Readee modes plus a couple extras. Returns a
 *  label and a Tailwind class tuple so the bubble color is stable per
 *  genre (so the eye learns the category palette). */
function deriveGenre(topic: string, title: string): { label: string; cls: string } {
  const t = `${topic} ${title}`.toLowerCase();
  if (/bedtime|sleepy|cozy|tuck|night|moon|dream/.test(t))
    return { label: "Bedtime", cls: "bg-indigo-600" };
  if (
    /\b(fact|facts|how|why|history|space|science|earth|biology|invented|discover|tradition|culture|biography)\b/.test(
      t,
    )
  )
    return { label: "Fun Facts", cls: "bg-amber-500" };
  if (/phonic|rhym|digraph|vowel team|sounds?|spell|sight word|blend/.test(t))
    return { label: "Phonics", cls: "bg-rose-500" };
  if (/adventure|mystery|brave|magic|dragon|hero|quest|knight|pirate/.test(t))
    return { label: "Adventure", cls: "bg-emerald-500" };
  if (/story|tale|character|friends?|family|once upon|fable/.test(t))
    return { label: "Story", cls: "bg-sky-500" };
  return { label: "Reading", cls: "bg-violet-600" };
}

/**
 * Everything the shelf needs, in three round trips instead of seven, and never
 * throwing.
 *
 * ‼️ WHY THIS IS WRAPPED. Sentry aff62aa0, 18 Sep 2026: a parent who had signed
 * up eight minutes earlier and added a child opened this page, got
 * "Something went wrong", and never started the assessment. The error was a
 * bare `TypeError: network error` with nothing of ours in the stack.
 *
 * The queries already tolerated a query-level error, because each one
 * destructures `data` and ignores `error`. What they did not tolerate was the
 * fetch itself failing, which rejects rather than returning an error, and an
 * unhandled rejection in a server component takes the whole route to the error
 * boundary. This is a public acquisition page, the one ChatGPT cites, and it
 * must not show an error page because a database call blinked.
 *
 * It was also seven live queries per visit with no caching at all, on an
 * indexable page, so every bot hit paid the same cost and had the same seven
 * chances to fail. The five per-grade counts are now one read of 32 rows
 * tallied here, and the page is cached again (see the note at the top), so on
 * most visits this function does not run.
 */
type Library = {
  trending: Card[];
  feed: Card[];
  gradeData: { key: string; label: string; short: string; count: number }[];
  totalPassages: number;
  degraded: boolean;
};

async function loadLibrary(): Promise<Library> {
  const empty: Library = {
    trending: [],
    feed: [],
    gradeData: GRADES.map((g) => ({ ...g, count: 0 })),
    totalPassages: 0,
    degraded: true,
  };
  try {
    const admin = supabaseAdmin();
    const [trendingRes, feedRes, gradeRes] = await Promise.all([
      // Trending — top 8 by recent view momentum.
      admin
        .from("community_passages")
        .select(
          "id, slug, title, image_url, grade_level, topic, view_count, display_byline, display_org, display_state, created_at",
        )
        .eq("status", "approved")
        .or(PUBLIC_KIND_FILTER)
        .not("slug", "is", null)
        .order("view_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8),
      // Feed — newest first, 12 entries with passage preview text.
      admin
        .from("community_passages")
        .select(
          "id, slug, title, image_url, grade_level, topic, view_count, display_byline, display_org, display_state, created_at, passage_text",
        )
        .eq("status", "approved")
        .or(PUBLIC_KIND_FILTER)
        .not("slug", "is", null)
        .order("created_at", { ascending: false })
        .limit(12),
      // One read for the tab bar, tallied below.
      admin
        .from("community_passages")
        .select("grade_level")
        .eq("status", "approved")
        .or(PUBLIC_KIND_FILTER)
        .not("slug", "is", null),
    ]);

    const tally = new Map<string, number>();
    for (const row of (gradeRes.data ?? []) as { grade_level: string | null }[]) {
      if (row.grade_level) tally.set(row.grade_level, (tally.get(row.grade_level) ?? 0) + 1);
    }
    const gradeData = GRADES.map((g) => ({ ...g, count: tally.get(g.key) ?? 0 }));
    return {
      trending: (trendingRes.data ?? []) as Card[],
      feed: (feedRes.data ?? []) as Card[],
      gradeData,
      totalPassages: gradeData.reduce((acc, g) => acc + g.count, 0),
      degraded: false,
    };
  } catch (error) {
    // Deliberately not rethrown. An empty shelf with the assessment call to
    // action still converts; an error page never does.
    trackError(error, { route: "/community" });
    return empty;
  }
}

export default async function CommunityLanding() {
  const { trending, feed, gradeData, totalPassages } = await loadLibrary();

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar — matches the app's NavAuth shell. */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/readee-logo.png"
              alt="Readee"
              className="h-auto w-[140px] sm:w-[160px]"
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/contact-us"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-indigo-500 transition-colors hover:bg-indigo-50 hover:text-indigo-700 sm:px-3"
              aria-label="Help"
            >
              <Glyph name="circle-help" size={20} />
              <span className="hidden text-sm font-semibold sm:inline">Help</span>
            </Link>
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-zinc-600 hover:text-violet-700 sm:inline"
            >
              Sign in
            </Link>
            <LibraryCta placement="library-header" compact />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Compact intro */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 text-white shadow-md">
            <Glyph name="book-open" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
              Free reading library
            </h1>
            <p className="text-xs font-semibold text-zinc-500">
              {totalPassages.toLocaleString()} K-4 reading passages · made by
              Readee · free
            </p>
          </div>
        </div>

        {/* Grade tabs */}
        <div className="mt-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex items-center gap-2">
            <Tab href="/community" active label="All" count={totalPassages} />
            {gradeData.map((g) => (
              <Tab
                key={g.key}
                href={`/community/grade/${g.key.toLowerCase()}`}
                label={g.short === "K" ? "Kindergarten" : `${g.short} Grade`}
                count={g.count}
                active={false}
              />
            ))}
          </div>
        </div>

        {/* Trending stories strip — horizontal scroll */}
        {trending.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <FluentIcon name="fire" size={14} />
              Trending now
            </div>
            <div className="mt-2">
              <TrendingCarousel
                items={trending.map((p) => ({
                  id: p.id,
                  slug: p.slug,
                  title: p.title,
                  image_url: p.image_url,
                  grade_level: p.grade_level,
                  topic: p.topic,
                  view_count: p.view_count,
                  display_byline: p.display_byline,
                  display_state: p.display_state,
                  genre: deriveGenre(p.topic, p.title),
                }))}
              />
            </div>
          </section>
        )}

        {/* Feed — image-dominant shop tiles (Fortnite-store style) */}
        {feed.length > 0 && (
          <section className="mt-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                Latest passages
              </h2>
              <Link
                href="/community/all"
                className="text-[11px] font-semibold text-violet-700 hover:underline"
              >
                See all →
              </Link>
            </div>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {feed.map((p) => (
                <FeedPost key={p.id} post={p} />
              ))}
            </ul>
          </section>
        )}

        {/* Trust strip — replaces the old "How it works" wall */}
        <section className="mt-8 grid gap-2 sm:grid-cols-3">
          <Trust
            icon={<Glyph name="shield" size={16} className="text-emerald-600" />}
            label="Reviewed before publishing"
          />
          <Trust
            icon={<Glyph name="heart" size={16} className="text-rose-500" />}
            label="Free for every family"
          />
          <Trust
            icon={<Glyph name="book-open" size={16} className="text-violet-600" />}
            label="K-4 reading specialist designed"
          />
        </section>

        {/* Final CTA — the assessment, same as everywhere else in the library. */}
        <div className="mt-8">
          <LibraryCta placement="library-home" />
        </div>

        <footer className="mt-10 pb-8 text-center text-xs text-zinc-400">
          © Readee Learning LLC ·{" "}
          <Link href="/privacy-policy" className="hover:text-violet-700">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms-of-service" className="hover:text-violet-700">
            Terms
          </Link>
        </footer>
      </div>
    </div>
  );
}

function Tab({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
        active
          ? "bg-violet-600 text-white shadow-sm"
          : "border border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:text-violet-700"
      }`}
    >
      {label}{" "}
      <span
        className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
          active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {count.toLocaleString()}
      </span>
    </Link>
  );
}

function Trust({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function FeedPost({ post }: { post: Card }) {
  const byline = post.display_byline ?? "Featured by Readee";
  const initial = bylineInitial(byline);
  const tone = avatarTone(byline);
  const ago = timeAgo(post.created_at);
  const genre = deriveGenre(post.topic, post.title);

  return (
    <li>
      <Link
        href={`/community/${post.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-md ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        {/* Artwork fills the whole card */}
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 text-white">
            <CoverFallback size={48} />
          </div>
        )}

        {/* Subtle top overlay so bubbles read on bright art */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />

        {/* Top-row floating bubbles — genre + grade */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm ${genre.cls}`}
          >
            {genre.label}
          </span>
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-zinc-900 shadow-sm">
            {post.grade_level}
          </span>
        </div>

        {/* Bottom gradient overlay with title + author + reads */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-4 pt-16">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-[11px] font-extrabold text-white ring-2 ring-white/40`}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1 text-[11px] font-semibold text-white/90">
              <span className="truncate font-bold">{byline}</span>
              {(post.display_org || post.display_state) && (
                <>
                  <span className="mx-1 text-white/50">·</span>
                  <span className="text-white/80">
                    {post.display_org}
                    {post.display_org && post.display_state ? ", " : ""}
                    {post.display_state}
                  </span>
                </>
              )}
              <span className="mx-1 text-white/50">·</span>
              <span className="text-white/70">{ago}</span>
            </div>
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-extrabold leading-tight text-white sm:text-lg">
            {post.title}
          </h3>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/85">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Glyph name="eye" size={12} />
              {post.view_count.toLocaleString()} reads
            </span>
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white">
              Read →
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
