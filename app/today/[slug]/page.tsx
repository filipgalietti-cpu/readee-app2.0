import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, ArrowLeft, Volume2, BookOpen } from "lucide-react";
import TodayQuestionPlayer from "./_components/TodayQuestionPlayer";

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

  return (
    <article className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/today"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Today's Readee
        </Link>

        <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-violet-600">
          <Sparkles className="h-3 w-3" />
          {d.theme} ·{" "}
          {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          {d.passage_title}
        </h1>

        {d.image_url && (
          <img
            src={d.image_url}
            alt=""
            className="mt-6 w-full rounded-3xl border border-zinc-200 object-cover shadow-sm"
          />
        )}

        <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
          <BookOpen className="h-3.5 w-3.5" />
          {d.passage_body.split(/\s+/).length} words ·{" "}
          {Math.max(1, Math.round(d.passage_body.split(/\s+/).length / 150))} min read
        </div>

        <p
          className="mt-4 whitespace-pre-line text-[18px] leading-[1.7] text-zinc-900"
          style={{
            fontFamily:
              'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
          }}
        >
          {d.passage_body}
        </p>

        <TodayQuestionPlayer
          date={d.date}
          audioUrl={d.audio_url}
          mainQuestion={{
            prompt: d.question_prompt,
            choices: d.choices,
            correct: d.correct,
            hint: d.hint,
          }}
          extras={extras}
        />

        <div className="mt-12 rounded-3xl border border-indigo-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900">
            Want a daily reading boost like this?
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Readee gives K-4 kids 5 minutes of comprehension practice every
            morning — for parents at home or teachers in the classroom.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
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
              I'm a teacher
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
