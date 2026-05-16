import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import DiscoveryQuestions from "./_components/DiscoveryQuestions";
import { CATEGORIES } from "@/lib/discover/categories";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

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
  const catLabel =
    (CATEGORIES as any)[d.category]?.label ?? "Discover";
  const desc = (d.body as string).slice(0, 150);
  return {
    title: `${d.title} — ${catLabel} on Readee`,
    description: desc,
    openGraph: {
      title: `${d.title} — Readee`,
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
  const [{ data }, { data: authData }] = await Promise.all([
    supabase
      .from("discovery_articles")
      .select(
        "id, category, slug, title, body, image_url, audio_url, question_prompt, choices, correct, hint, extra_questions, qc_overall",
      )
      .eq("slug", slug)
      .eq("published_state", "live")
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);
  if (!data) notFound();
  const a = data as Article;
  const cat = (CATEGORIES as any)[a.category];
  const extras = Array.isArray(a.extra_questions) ? a.extra_questions : [];
  // Detect signed-in parents so the bottom CTA doesn't pitch
  // "Try Readee free" to someone who already has an account. Public
  // visitors still see the acquisition CTA; signed-in users get a
  // path back into their dashboard / more articles.
  const isSignedIn = !!authData?.user;

  return (
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
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

        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
          <Sparkles className="h-3 w-3" />
          {cat?.label ?? a.category}
        </div>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          {a.title}
        </h1>

        {a.image_url && (
          // aspect-square reserves space before the image loads so
          // the rest of the article doesn't pop down when the image
          // resolves. Imagen 4.0 renders 1:1 by default. Width/height
          // attrs back up the aspect-ratio in older browsers. The
          // bare <img> here used to drop CLS scores on this page to
          // p75 = 5 because the entire article shifted on image load.
          <div className="relative mt-6 w-full overflow-hidden rounded-3xl border border-zinc-200 shadow-sm aspect-square bg-zinc-50">
            <img
              src={a.image_url}
              alt=""
              width={1024}
              height={1024}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
          <BookOpen className="h-3.5 w-3.5" />
          {a.body.split(/\s+/).length} words ·{" "}
          {Math.max(1, Math.round(a.body.split(/\s+/).length / 150))} min read
        </div>

        <p
          className="mt-4 whitespace-pre-line text-lg leading-relaxed text-zinc-900"
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

        <div className="mt-12 rounded-3xl border border-violet-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">
            {isSignedIn ? "Keep your reader going" : "Want more like this?"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {isSignedIn
              ? "Readee adds fresh fact-checked passages every day. Jump back to today's lesson or browse another article."
              : "Readee adds fresh fact-checked reading passages every day — built for K-4 kids, free to try."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                Back to dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                Try Readee free
              </Link>
            )}
            <Link
              href={`/discover/${a.category}`}
              className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-700 transition hover:border-violet-300"
            >
              More {cat?.label?.toLowerCase() ?? "articles"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
