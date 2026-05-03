import Link from "next/link";
import {
  Sparkles,
  Eye,
  ArrowRight,
  BookOpen,
  Heart,
  Shield,
  Flame,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Readee Community Library — kid-safe reading passages",
  description:
    "Free reading passages for K-4 kids, made by Readee. Comprehension questions, read-aloud audio, and illustrations included. Browse by grade.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Readee Community — kid-safe reading passages",
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
    "from-violet-500 to-indigo-600",
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

export default async function CommunityLanding() {
  const admin = supabaseAdmin();

  // Trending — top 8 by recent view momentum.
  const { data: trendingRows } = await admin
    .from("community_passages")
    .select(
      "id, slug, title, image_url, grade_level, topic, view_count, display_byline, created_at",
    )
    .eq("status", "approved")
    .not("slug", "is", null)
    .order("view_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);
  const trending = (trendingRows ?? []) as Card[];

  // Feed — newest first, 12 entries with passage preview text.
  const { data: feedRows } = await admin
    .from("community_passages")
    .select(
      "id, slug, title, image_url, grade_level, topic, view_count, display_byline, created_at, passage_text",
    )
    .eq("status", "approved")
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(12);
  const feed = (feedRows ?? []) as Card[];

  // Per-grade counts for the tab bar.
  const gradeData = await Promise.all(
    GRADES.map(async (g) => {
      const { count } = await admin
        .from("community_passages")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("grade_level", g.key)
        .not("slug", "is", null);
      return { ...g, count: count ?? 0 };
    }),
  );
  const totalPassages = gradeData.reduce((acc, g) => acc + g.count, 0);

  // Recent contributors — distinct bylines from the last 50 approved
  // entries so the "people behind it" strip shows variety.
  const { data: bylineRows } = await admin
    .from("community_passages")
    .select("display_byline, created_at")
    .eq("status", "approved")
    .not("display_byline", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);
  const seenBylines = new Set<string>();
  const contributors: string[] = [];
  for (const r of (bylineRows ?? []) as { display_byline: string }[]) {
    if (!seenBylines.has(r.display_byline)) {
      seenBylines.add(r.display_byline);
      contributors.push(r.display_byline);
    }
    if (contributors.length >= 6) break;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-base font-extrabold text-zinc-900"
          >
            <Sparkles className="h-5 w-5 text-violet-600" />
            Readee
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-600 hover:text-violet-700"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
            >
              Try Readee free
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Compact intro */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
              Community library
            </h1>
            <p className="text-xs font-semibold text-zinc-500">
              {totalPassages.toLocaleString()} kid-safe reading passages ·
              free · reviewed
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
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              Trending now
            </div>
            <div className="mt-2 -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              <ul className="flex gap-3" style={{ width: "max-content" }}>
                {trending.map((p) => (
                  <li key={p.id} className="w-44 flex-shrink-0">
                    <Link
                      href={`/community/${p.slug}`}
                      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:shadow-md"
                    >
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-violet-200 to-indigo-300 text-white">
                          <Sparkles className="h-10 w-10" />
                        </div>
                      )}
                      <div className="p-2.5">
                        <div className="line-clamp-2 text-[13px] font-bold leading-tight text-zinc-900 group-hover:text-violet-700">
                          {p.title}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500">
                          <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-violet-700">
                            {p.grade_level}
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <Eye className="h-2.5 w-2.5" />
                            {p.view_count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Contributors strip — "people behind the library" */}
        {contributors.length > 0 && (
          <section className="mt-5 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="flex -space-x-2">
              {contributors.slice(0, 5).map((c) => (
                <div
                  key={c}
                  title={c}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${avatarTone(c)} text-xs font-extrabold text-white ring-2 ring-white`}
                >
                  {bylineInitial(c)}
                </div>
              ))}
            </div>
            <div className="text-xs text-zinc-600">
              <span className="font-bold text-zinc-900">
                {contributors.length} contributors
              </span>{" "}
              keeping the library fresh.{" "}
              <Link href="/signup" className="font-semibold text-violet-700 hover:underline">
                Add yours →
              </Link>
            </div>
          </section>
        )}

        {/* Feed — vertical, social-media style */}
        <section className="mt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Latest in the community
            </h2>
            <Link
              href="/community/all"
              className="text-[11px] font-semibold text-violet-700 hover:underline"
            >
              See all →
            </Link>
          </div>

          {feed.length === 0 ? (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-violet-400" />
              <p className="mt-3 text-sm text-zinc-500">
                Library is brand new. Come back soon.
              </p>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {feed.map((p) => (
                <FeedPost key={p.id} post={p} />
              ))}
            </ul>
          )}
        </section>

        {/* Trust strip — replaces the old "How it works" wall */}
        <section className="mt-8 grid gap-2 sm:grid-cols-3">
          <Trust
            icon={<Shield className="h-4 w-4 text-emerald-600" />}
            label="Reviewed before publishing"
          />
          <Trust
            icon={<Heart className="h-4 w-4 text-rose-500" />}
            label="Free for every family"
          />
          <Trust
            icon={<BookOpen className="h-4 w-4 text-violet-600" />}
            label="K-4 reading specialist designed"
          />
        </section>

        {/* Final CTA */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-100 via-indigo-50 to-violet-100 p-6 text-center shadow-sm sm:p-8">
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
            Want to make your own?
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
            Build a passage for your kid in 3 taps.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-700">
            Pick a topic, pick a mode, Readee builds it. Pass our quality
            check and your passage shows up here.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-base font-bold text-white shadow hover:bg-violet-700"
            >
              Try Readee free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-base font-bold text-zinc-700 hover:border-violet-300"
            >
              How it works
            </Link>
          </div>
        </section>

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
  const preview = (post.passage_text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return (
    <li className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/community/${post.slug}`} className="block">
        {/* Author row */}
        <div className="flex items-center gap-2.5 px-4 pt-3.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-sm font-extrabold text-white`}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-zinc-900">{byline}</div>
            <div className="text-[11px] text-zinc-500">
              shared {ago}
              <span className="mx-1">·</span>
              <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                {post.grade_level}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="px-4 pt-2">
          <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-violet-700 sm:text-lg">
            {post.title}
          </h3>
          {preview && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
              {preview}…
            </p>
          )}
        </div>

        {/* Image */}
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt={post.title}
            className="mt-3 aspect-[3/2] w-full object-cover"
          />
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-3 text-zinc-500">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Eye className="h-3.5 w-3.5" />
              {post.view_count.toLocaleString()}{" "}
              <span className="text-zinc-400">reads</span>
            </span>
          </div>
          <span className="text-[11px] font-bold text-violet-700">
            Read passage →
          </span>
        </div>
      </Link>
    </li>
  );
}
