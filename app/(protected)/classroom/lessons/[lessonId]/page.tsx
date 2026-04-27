import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Eye,
  Download,
  ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/helpers";
import LessonPlayer from "./_components/LessonPlayer";

export const dynamic = "force-dynamic";

type Slide = {
  position: number;
  body: string;
  display_text: string | null;
  image_url: string | null;
  audio_url: string | null;
};

export default async function LessonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ built?: string; warn?: string }>;
}) {
  const { lessonId } = await params;
  const { built, warn } = await searchParams;
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("custom_lessons")
    .select(
      "id, title, topic, grade_level, slides, question_ids, cover_image_url, qc_overall",
    )
    .eq("id", lessonId)
    .eq("teacher_id", profile.id)
    .maybeSingle();
  if (!lesson) notFound();
  const l = lesson as any;
  const slides = (l.slides ?? []) as Slide[];

  // Comprehension questions (if any).
  const questionIds: string[] = (l.question_ids ?? []) as string[];
  let questions: { id: string; prompt: string; choices: string[]; correct: string; hint: string | null }[] = [];
  if (questionIds.length > 0) {
    const { data: qrows } = await supabase
      .from("custom_questions")
      .select("id, prompt, choices, correct, hint")
      .in("id", questionIds);
    questions = ((qrows ?? []) as any[]).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: (q.choices ?? []) as string[],
      correct: String(q.correct),
      hint: q.hint ?? null,
    }));
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/classroom/lessons"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All lessons
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            <BookOpen className="h-4 w-4" />
            Lesson
            {l.grade_level && (
              <>
                <span className="text-zinc-300">·</span>
                <span>{l.grade_level}</span>
              </>
            )}
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {l.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            {slides.length} slide{slides.length === 1 ? "" : "s"}
            {questions.length > 0
              ? ` · ${questions.length} comprehension question${questions.length === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/lesson/${lessonId}/pptx`}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Download className="h-3.5 w-3.5" />
            Download .pptx
          </a>
        </div>
      </div>

      {/* Build success banner */}
      {built === "1" && warn && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div>
            <div className="font-bold">Lesson built — with warnings.</div>
            <div className="mt-0.5 text-xs">{warn}</div>
          </div>
        </div>
      )}
      {built === "1" && !warn && (
        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 text-sm text-violet-900">
          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600" />
          <div>
            <div className="font-bold">Your lesson is ready.</div>
            <div className="mt-0.5 text-xs">
              Preview each slide below or download as .pptx for Google
              Slides / PowerPoint.
            </div>
          </div>
        </div>
      )}

      {/* Slideshow player */}
      <div className="mt-6">
        <LessonPlayer slides={slides} questions={questions} />
      </div>
    </div>
  );
}
