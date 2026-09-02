import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TodayQuestionPlayer from "@/app/today/[slug]/_components/TodayQuestionPlayer";
import ReadAloudButton from "@/app/today/[slug]/_components/ReadAloudButton";
import { CATEGORIES } from "@/lib/discover/categories";
import { FluentIcon } from "@/app/_components/FluentIcon";
import { Glyph } from "@/app/_components/Glyph";

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  category: string;
  slug: string;
  title: string;
  body: string;
  image_url: string | null;
  audio_url: string | null;
  question_prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  extra_questions: any;
  qc_overall: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("discovery_articles")
    .select("title, body, image_url, category")
    .eq("slug", slug)
    .eq("published_state", "live")
    .maybeSingle();
  if (!data) return { title: "Readee Discover" };
  const d = data as any;
  const catLabel = (CATEGORIES as any)[d.category]?.label ?? "Discover";
  const desc = (d.body as string).slice(0, 150);
  return {
    title: `${d.title} - ${catLabel} on Readee`,
    description: desc,
    openGraph: {
      title: `${d.title} - Readee`,
      description: desc,
      images: d.image_url ? [d.image_url] : [],
      type: "article",
    },
  };
}

export default async function DiscoveryDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("discovery_articles")
    .select(
      "id, category, slug, title, body, image_url, audio_url, question_prompt, choices, correct, hint, extra_questions, qc_overall",
    )
    .eq("slug", slug)
    .eq("published_state", "live")
    .maybeSingle();
  if (!data) notFound();
  const a = data as Article;
  const cat = (CATEGORIES as any)[a.category];
  const extras = Array.isArray(a.extra_questions) ? a.extra_questions : [];

  // Same shape the Daily Readee player expects (main question + any bonuses).
  const questions = [
    { prompt: a.question_prompt, choices: a.choices, correct: a.correct, hint: a.hint },
    ...extras.map(
      (q: { prompt: string; choices: string[]; correct: string; hint?: string | null }) => ({
        prompt: q.prompt,
        choices: q.choices,
        correct: q.correct,
        hint: q.hint ?? null,
      }),
    ),
  ];
  const wordCount = a.body.split(/\s+/).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-600"
        >
          <Glyph name="arrow-left" size={14} />
          Discover
        </Link>
        {cat && (
          <>
            <span className="text-zinc-300">·</span>
            <Link
              href={`/discover/${a.category}`}
              className="text-xs font-semibold text-zinc-500 hover:text-violet-600"
            >
              {cat.label}
            </Link>
          </>
        )}
      </div>

      {/* Same layout as Today's Readee: reading on the left, quiz on the right. */}
      <div className="mt-6 grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* LEFT — the reading */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-violet-700">
            <FluentIcon name="sparkles" size={12} />
            {cat?.label ?? a.category}
          </div>

          <h1 className="mt-2 font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-[38px]">
            {a.title}
          </h1>

          {a.image_url && (
            <div className="mt-5 flex justify-center">
              {/* Square (1024²) illustrations — contain, not cover, so the
                  picture is never cropped (matches Today's Readee). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.image_url}
                alt=""
                className="max-h-[460px] w-auto max-w-full rounded-3xl border border-zinc-200 object-contain shadow-sm"
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <FluentIcon name="open-book" size={14} />
            {wordCount} words · {Math.max(1, Math.round(wordCount / 150))} min read
            <ReadAloudButton audioUrl={a.audio_url} />
          </div>

          <div
            className="mt-[18px] flex flex-col gap-[18px] whitespace-pre-line text-[19px] leading-[1.75] text-zinc-900"
            style={{
              fontFamily:
                'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
            }}
          >
            {a.body}
          </div>
        </div>

        {/* RIGHT — the quiz (sticky on desktop, aligned with the illustration) */}
        <div className="lg:sticky lg:top-[76px] lg:mt-[88px]">
          <TodayQuestionPlayer questions={questions} />
        </div>
      </div>
    </div>
  );
}
