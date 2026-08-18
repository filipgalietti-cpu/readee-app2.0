import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, ArrowLeft, BookOpen } from "lucide-react";
import TodayQuestionPlayer from "./_components/TodayQuestionPlayer";
import ReadAloudButton from "./_components/ReadAloudButton";
import AssignDailyButton from "./_components/AssignDailyButton";

// Static daily content — half-hour revalidate. (No `force-dynamic`: it
// overrode this and re-queried the DB on every navigation, which is what
// made switching pages laggy.)
export const revalidate = 1800;

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

// One fetch per request — React cache() dedupes the generateMetadata read
// and the page read (previously two separate DB round-trips every load).
const getDaily = cache(async (slug: string): Promise<Daily | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_questions")
    .select(
      "date, theme, slug, passage_title, passage_body, image_url, audio_url, question_prompt, choices, correct, hint, extra_questions",
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as Daily) ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const d = await getDaily(slug);
  if (!d) return { title: "Today's Readee" };
  const desc = d.passage_body.slice(0, 150);
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
  const d = await getDaily(slug);
  if (!d) notFound();
  const extras = Array.isArray(d.extra_questions) ? d.extra_questions : [];
  // Daily Readee is a signed-in feature — send logged-out visitors to sign
  // up (turns shared-link traffic into signups rather than free reads).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
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
            href="/daily"
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
              <div className="mt-5 flex justify-center">
                {/* Square (1024²) illustrations — contain, not cover, so the
                    picture is never cropped. Border hugs the image itself. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.image_url}
                  alt=""
                  className="max-h-[460px] w-auto max-w-full rounded-3xl border border-zinc-200 object-contain shadow-sm"
                />
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

      </div>
    </article>
  );
}
