import Link from "next/link";
import {
  Sparkles,
  Users,
  Eye,
  ArrowRight,
  BookOpen,
  Heart,
  Shield,
} from "lucide-react";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Readee Community Library — kid-safe reading passages from real families",
  description:
    "Free reading passages for K-4 kids, made and shared by other Readee parents. Comprehension questions, read-aloud audio, and illustrations included. Browse by grade.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Readee Community — passages from real families",
    description:
      "Free K-4 reading passages with audio, illustrations, and comprehension questions. Made and shared by parents.",
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
};

export default async function CommunityLanding() {
  const admin = supabaseAdmin();

  // Top 6 by view count for the "trending" strip.
  const { data: topRows } = await admin
    .from("community_passages")
    .select(
      "id, slug, title, image_url, grade_level, topic, view_count, display_byline, created_at",
    )
    .eq("status", "approved")
    .not("slug", "is", null)
    .order("view_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);
  const topPicks = (topRows ?? []) as Card[];

  // 8 newest for the recent additions feed.
  const { data: recentRows } = await admin
    .from("community_passages")
    .select(
      "id, slug, title, image_url, grade_level, topic, view_count, display_byline, created_at",
    )
    .eq("status", "approved")
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(8);
  const recent = (recentRows ?? []) as Card[];

  // Per-grade counts + a sample image each, for the browse cards.
  const gradeData = await Promise.all(
    GRADES.map(async (g) => {
      const [{ count }, { data: sample }] = await Promise.all([
        admin
          .from("community_passages")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved")
          .eq("grade_level", g.key)
          .not("slug", "is", null),
        admin
          .from("community_passages")
          .select("image_url")
          .eq("status", "approved")
          .eq("grade_level", g.key)
          .not("image_url", "is", null)
          .order("view_count", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return {
        ...g,
        count: count ?? 0,
        cover: ((sample as any)?.image_url as string | null) ?? null,
      };
    }),
  );

  // Hero stat — total approved passages.
  const totalPassages = gradeData.reduce((acc, g) => acc + g.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      {/* Top bar */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-900"
          >
            <Sparkles className="h-4 w-4 text-violet-600" />
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
              className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
            >
              Try Readee free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
          <Users className="h-3.5 w-3.5" />
          Community library
        </div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          Reading passages from
          <br className="hidden sm:inline" /> real Readee families.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-600">
          Free, kid-safe passages for K-4 readers — each with comprehension
          questions, read-aloud audio, and an illustration. Made and shared by
          other parents using Readee. Reviewed before publishing.
        </p>
        {totalPassages > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-zinc-600">
            <Stat
              icon={<BookOpen className="h-4 w-4 text-violet-600" />}
              value={totalPassages.toLocaleString()}
              label="passages"
            />
            <Stat
              icon={<Heart className="h-4 w-4 text-rose-500" />}
              value={`${recent.length > 0 ? "Updated daily" : "Free forever"}`}
              label=""
            />
            <Stat
              icon={<Shield className="h-4 w-4 text-emerald-600" />}
              value="Reviewed before publishing"
              label=""
            />
          </div>
        )}
      </section>

      {/* Trending strip */}
      {topPicks.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <SectionHeader
            eyebrow="Most read"
            title="What kids are reading right now"
          />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topPicks.map((p) => (
              <PassageCard key={p.id} passage={p} />
            ))}
          </ul>
        </section>
      )}

      {/* Browse by grade */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <SectionHeader eyebrow="Browse" title="By grade" />
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {gradeData.map((g) => (
            <li key={g.key}>
              <Link
                href={`/community/grade/${g.key.toLowerCase()}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
              >
                <div className="aspect-[5/3] w-full overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100">
                  {g.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.cover}
                      alt={`${g.label} reading passage cover`}
                      className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-violet-400">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-between p-3">
                  <div>
                    <div className="text-base font-extrabold text-zinc-900 group-hover:text-violet-700">
                      {g.label}
                    </div>
                    <div className="text-[11px] font-semibold text-zinc-500">
                      {g.count.toLocaleString()}{" "}
                      {g.count === 1 ? "passage" : "passages"}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-violet-500" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Recent additions */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-12">
          <SectionHeader
            eyebrow="Just added"
            title="Recently shared"
            cta={{ href: "/community/all", label: "See all →" }}
          />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p) => (
              <PassageCard key={p.id} passage={p} compact />
            ))}
          </ul>
        </section>
      )}

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <SectionHeader eyebrow="How it works" title="Simple, kid-safe, free" />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Step
            n={1}
            title="A parent makes a passage"
            body="Using Readee.ai — type a topic, and the AI writes a passage at the kid's reading level with questions and audio."
          />
          <Step
            n={2}
            title="They share it with the community"
            body="Names get anonymized, audio is regenerated from the clean text, and our AI runs quality checks before submission."
          />
          <Step
            n={3}
            title="A reviewer approves it"
            body="A human admin reads each piece before it goes live. Trusted contributors auto-publish after their first 5 approved shares."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-100 via-indigo-50 to-violet-100 p-8 text-center shadow-sm sm:p-12">
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
            Want to make your own?
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
            Make a reading passage for your kid in 3 taps.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-700">
            Type a topic, pick a mode (Quick Read · Bedtime Story · Phonics
            Drill · Fun Facts), and Readee builds a level-locked passage with
            questions and audio in under a minute.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
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
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-zinc-500">
          © Readee Learning LLC ·{" "}
          <Link href="/privacy-policy" className="hover:text-violet-700">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms-of-service" className="hover:text-violet-700">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      <span className="font-extrabold text-zinc-900">{value}</span>
      {label && <span className="text-zinc-500">{label}</span>}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">
          {title}
        </h2>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="text-sm font-semibold text-violet-700 hover:underline"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-extrabold text-white">
        {n}
      </div>
      <h3 className="mt-3 text-base font-extrabold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600">{body}</p>
    </div>
  );
}

function PassageCard({
  passage,
  compact = false,
}: {
  passage: Card;
  compact?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/community/${passage.slug}`}
        className="group block h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
      >
        {passage.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={passage.image_url}
            alt={passage.title}
            className={`w-full object-cover transition group-hover:scale-[1.02] ${
              compact ? "h-28" : "h-36"
            }`}
          />
        ) : (
          <div
            className={`flex w-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-400 ${
              compact ? "h-28" : "h-36"
            }`}
          >
            <Sparkles className="h-10 w-10" />
          </div>
        )}
        <div className={compact ? "p-3" : "p-4"}>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">
            <span className="rounded-full bg-violet-100 px-1.5 py-0.5">
              {passage.grade_level}
            </span>
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <Eye className="h-3 w-3" />
              {passage.view_count.toLocaleString()}
            </span>
          </div>
          <h3
            className={`mt-1.5 line-clamp-2 font-bold text-zinc-900 group-hover:text-violet-700 ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {passage.title}
          </h3>
          {passage.display_byline && (
            <div className="mt-1 text-[11px] text-zinc-500">
              by{" "}
              <span className="font-semibold text-zinc-700">
                {passage.display_byline}
              </span>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
