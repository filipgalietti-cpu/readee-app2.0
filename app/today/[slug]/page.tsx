import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, ArrowLeft, BookOpen } from "lucide-react";
import TodayQuestionPlayer from "./_components/TodayQuestionPlayer";
import ReadAloudButton from "./_components/ReadAloudButton";
import AssignDailyButton from "./_components/AssignDailyButton";

export const dynamic = "force-dynamic";
export const revalidate = 1800; // half-hour ISR is plenty for a static daily

type Daily = {
  date: string;
  theme: string;
  slug: string;
  passage_title: string;
  passage_body: string;
  image_url: string | null;
  audio_url: string | null;
  question_prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  extra_questions: any;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_questions")
    .select("theme, passage_title, passage_body, image_url, date")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return { title: "Today's Readee" };
  const d = data as any;
  const desc = (d.passage_body as string).slice(0, 150);
  return {
    title: `${d.passage_title} — Readee Daily`,
    description: desc,
    openGraph: {
      title: `${d.passage_title} — Readee Daily`,
      description: desc,
      images: d.image_url ? [d.image_url] : [],
      type: "article",
    },
  };
}

export default async function TodayDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_questions")
    .select(
      "date, theme, slug, passage_title, passage_body, image_url, audio_url, question_prompt, choices, correct, hint, extra_questions",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!data) notFound();
  const d = data as Daily;
  const extras = Array.isArray(d.extra_questions) ? d.extra_questions : [];
  // The signup CTA is acquisition for logged-out visitors on shared/SEO
  // daily links — hide it for signed-in parents, who don't need it.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const questions = [
    { prompt: d.question_prompt, choices: d.choices, correct: d.correct, hint: d.hint },
    ...extras.map((q: { prompt: string; choices: string[]; correct: string; hint?: string | null }) => ({
      prompt: q.prompt,
      choices: q.choices,
      correct: q.correct,
      hint: q.hint ?? null,
    })),
  ];
  const wordCount = d.passage_body.split(/\s+/).filter(Boolean).length;

  return (
    <article className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-zinc-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-3">
          <Link
            href="/today/archive"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-zinc-500 transition hover:text-violet-700"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            Back
          </Link>
          <span className="font-display text-lg font-extrabold text-zinc-900">Today&apos;s Readee</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-6 py-8 pb-16">
        <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT — the reading */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-violet-700">
              <Sparkles className="h-3 w-3" />
              {d.theme} ·{" "}
              {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <h1 className="mt-2 font-display text-[34px] font-extrabold leading-[1.1] tracking-tight text-zinc-900 sm:text-[38px]">
              {d.passage_title}
            </h1>

            {d.image_url && (
              <div className="mt-5 flex max-h-[420px] overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.image_url} alt="" className="w-full object-cover" />
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
              <BookOpen className="h-3.5 w-3.5" />
              {wordCount} words · {Math.max(1, Math.round(wordCount / 150))} min read
              <ReadAloudButton audioUrl={d.audio_url} />
            </div>

            <div
              className="mt-[18px] flex flex-col gap-[18px] whitespace-pre-line text-[19px] leading-[1.75] text-zinc-900"
              style={{
                fontFamily:
                  'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
              }}
            >
              {d.passage_body}
            </div>
          </div>

          {/* RIGHT — the quiz (sticky on desktop, aligned with the illustration) */}
          <div className="lg:sticky lg:top-[76px] lg:mt-[88px]">
            <TodayQuestionPlayer date={d.date} questions={questions} />
          </div>
        </div>

        {/* Teacher CTA — only renders when authed as a teacher with a classroom. */}
        <div className="mt-10 flex justify-center">
          <AssignDailyButton date={d.date} />
        </div>

        {!user && (
          <div className="mt-10 rounded-3xl border border-violet-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900">
              Want a daily reading boost like this?
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Readee gives K-4 kids 5 minutes of comprehension practice every
              morning — for parents at home or teachers in the classroom.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/signup"
                className="rounded-full bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                Try Readee free
              </Link>
              <Link
                href="/signup?as=teacher"
                className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-700 transition hover:border-violet-300"
              >
                I&apos;m a teacher
              </Link>
              <Link
                href="/today/archive"
                className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-700 transition hover:border-violet-300"
              >
                Browse the archive
              </Link>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
