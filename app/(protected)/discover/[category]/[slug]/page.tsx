import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import DiscoveryQuestions from "./_components/DiscoveryQuestions";
import { CATEGORIES } from "@/lib/discover/categories";

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

  return (
    <article className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Discover
        </Link>
        {cat && (
          <>
            <span className="text-zinc-300 dark:text-slate-600">·</span>
            <Link
              href={`/discover/${a.category}`}
              className="text-xs font-semibold text-zinc-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
            >
              {cat.label}
            </Link>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
        <Sparkles className="h-3 w-3" />
        {cat?.label ?? a.category}
      </div>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        {a.title}
      </h1>

      {a.image_url && (
        // aspect-square reserves space before the image loads so the rest
        // of the article doesn't pop down when the image resolves. Imagen
        // 4.0 renders 1:1 by default.
        <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <Image
            src={a.image_url}
            alt=""
            fill
            priority
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
        <BookOpen className="h-3.5 w-3.5" />
        {a.body.split(/\s+/).length} words ·{" "}
        {Math.max(1, Math.round(a.body.split(/\s+/).length / 150))} min read
      </div>

      <p
        className="mt-4 whitespace-pre-line text-lg leading-relaxed text-zinc-900 dark:text-slate-100"
        style={{
          fontFamily:
            'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
        }}
      >
        {a.body}
      </p>

      <DiscoveryQuestions
        audioUrl={a.audio_url}
        mainQuestion={{
          prompt: a.question_prompt,
          choices: a.choices,
          correct: a.correct,
          hint: a.hint,
        }}
        extras={extras}
      />

      <div className="mt-12 rounded-3xl border border-violet-200 bg-white p-6 text-center shadow-sm dark:border-violet-500/30 dark:bg-slate-900/50">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
          Keep exploring
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          Readee adds fresh fact-checked passages every day. Browse another
          topic and keep your reader going.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={`/discover/${a.category}`}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            More {cat?.label?.toLowerCase() ?? "articles"}
          </Link>
          <Link
            href="/discover"
            className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-700 transition hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500/50"
          >
            All of Discover
          </Link>
        </div>
      </div>
    </article>
  );
}
