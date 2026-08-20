import Link from "next/link";
import { notFound } from "next/navigation";
import ReportButton from "./_components/ReportButton";
import TodayQuestionPlayer from "@/app/today/[slug]/_components/TodayQuestionPlayer";
import ReadAloudButton from "@/app/today/[slug]/_components/ReadAloudButton";
import {
  ArrowLeft,
  Users,
  Sparkles,
  Eye,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 600;

type CommunityPassage = {
  id: string;
  slug: string;
  title: string;
  passage_text: string;
  questions: any;
  image_url: string | null;
  audio_url: string | null;
  grade_level: string;
  topic: string;
  phonics_pattern: string | null;
  display_byline: string | null;
  display_avatar: string | null;
  source_kind: string | null;
  view_count: number;
  status: string;
  created_at: string;
};

async function loadBySlug(slug: string): Promise<CommunityPassage | null> {
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("community_passages")
    .select(
      "id, slug, title, passage_text, questions, image_url, audio_url, grade_level, topic, phonics_pattern, display_byline, display_avatar, source_kind, view_count, status, created_at",
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  return (data as CommunityPassage | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const passage = await loadBySlug(slug);
  if (!passage) {
    return {
      title: "Passage not found · Readee",
      robots: { index: false, follow: false },
    };
  }
  const description =
    passage.passage_text.replace(/\s+/g, " ").trim().slice(0, 155) +
    (passage.passage_text.length > 155 ? "…" : "");
  return {
    title: `${passage.title} - ${passage.grade_level} reading · Readee`,
    description,
    alternates: { canonical: `/community/${passage.slug}` },
    openGraph: {
      title: passage.title,
      description,
      type: "article",
      url: `/community/${passage.slug}`,
      images: passage.image_url ? [{ url: passage.image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: passage.title,
      description,
      images: passage.image_url ? [passage.image_url] : [],
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicCommunityPassagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const passage = await loadBySlug(slug);
  if (!passage) notFound();

  // Fire-and-forget view increment via the SECURITY DEFINER RPC so we
  // can count anon traffic without exposing the table to anon writes.
  await supabaseAdmin().rpc("bump_community_view", { p_slug: slug });

  // Related passages — same grade, top by view count, exclude self.
  const { data: relatedRows } = await supabaseAdmin()
    .from("community_passages")
    .select("id, slug, title, image_url, grade_level, view_count, display_byline")
    .eq("status", "approved")
    .eq("grade_level", passage.grade_level)
    .neq("id", passage.id)
    .not("slug", "is", null)
    .order("view_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);
  const related = (relatedRows ?? []) as {
    id: string;
    slug: string | null;
    title: string;
    image_url: string | null;
    grade_level: string;
    view_count: number;
    display_byline: string | null;
  }[];

  const wordCount = passage.passage_text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 120));

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="mx-auto max-w-[1120px] px-6 py-8 pb-16">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-indigo-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Readee
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700"
          >
            Try Readee free
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT — the reading (Daily Readee layout) */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {passage.display_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={passage.display_avatar}
                  alt=""
                  className="h-7 w-7 flex-none rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-800"
                />
              ) : (
                <Users className="h-4 w-4 text-violet-600 dark:text-violet-300" />
              )}
              <span className="text-sm font-bold text-zinc-700 dark:text-slate-200">
                {passage.display_byline
                  ? `${passage.source_kind === "kid_story" ? "Written by" : "Shared by"} ${passage.display_byline}`
                  : "Shared by a Readee family"}
              </span>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                {passage.grade_level}
              </span>
              {passage.phonics_pattern && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  {passage.phonics_pattern}
                </span>
              )}
            </div>

            <h1 className="mt-2 font-display text-[34px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-white sm:text-[38px]">
              {passage.title}
            </h1>

            {passage.image_url && (
              <div className="mt-5 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={passage.image_url}
                  alt=""
                  className="max-h-[460px] w-auto max-w-full rounded-3xl border border-zinc-200 object-contain shadow-sm dark:border-slate-700"
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {passage.view_count.toLocaleString()} reads
              </span>
              <span>·</span>
              <span>{readMinutes} min read</span>
              {passage.audio_url && <ReadAloudButton audioUrl={passage.audio_url} />}
              <span className="ml-auto">
                <ReportButton slug={passage.slug} />
              </span>
            </div>

            <div
              className="mt-[18px] flex flex-col gap-[18px] whitespace-pre-line text-[19px] leading-[1.75] text-zinc-900 dark:text-slate-100"
              style={{
                fontFamily:
                  'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
              }}
            >
              {passage.passage_text}
            </div>
          </div>

          {/* RIGHT — the quiz, sticky, same player as Daily Readee + Studio */}
          {Array.isArray(passage.questions) && passage.questions.length > 0 && (
            <div className="lg:sticky lg:top-6">
              <TodayQuestionPlayer questions={passage.questions} />
            </div>
          )}
        </div>

        {/* More like this — same grade, top reads */}
        {related.length > 0 && (
          <div className="mt-10">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                More like this
              </h2>
              <Link
                href={`/community/grade/${passage.grade_level.toLowerCase()}`}
                className="text-[11px] font-semibold text-violet-700 hover:underline"
              >
                See all {passage.grade_level} →
              </Link>
            </div>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/community/${r.slug}`}
                    className="group block h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
                  >
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.image_url}
                        alt={r.title}
                        className="h-28 w-full object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-400">
                        <Sparkles className="h-8 w-8" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                        <span className="rounded-full bg-violet-100 px-1.5 py-0.5">
                          {r.grade_level}
                        </span>
                        <span className="inline-flex items-center gap-1 text-zinc-400">
                          <Eye className="h-3 w-3" />
                          {r.view_count.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold text-zinc-900 group-hover:text-violet-700">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Soft sign-up CTA */}
        <div className="mt-10 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-100 via-indigo-50 to-violet-100 p-6 text-center shadow-sm dark:border-violet-900/40 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-violet-950/40">
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
            Want passages like this for your kid?
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Make your own with Readee
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-700 dark:text-slate-300">
            Type any topic. Get a level-locked passage, comprehension
            questions, and read-aloud audio in under a minute. Built by a
            certified reading specialist.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-violet-700"
          >
            Try Readee free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-500">
          Anonymized and reviewed before publishing. © Readee Learning LLC.
        </p>
      </div>
    </div>
  );
}
