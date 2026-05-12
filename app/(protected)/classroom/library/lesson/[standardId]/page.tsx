import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import sampleLessons from "@/app/data/sample-lessons.json";
import { findStandardById } from "@/lib/data/all-standards";
import LessonPreview from "./_components/LessonPreview";

export const dynamic = "force-dynamic";

/**
 * Teacher-side preview of a Readee sample lesson. The kid-facing
 * /learn route requires a child profile to track progress; teachers
 * just want to QA the content. This surface renders the slideshow
 * (display text, image, audio) and the comprehension MCQs without
 * persisting anything.
 *
 * Routed from the smart-search bar on /classroom/library when a
 * teacher clicks a "Readee lesson" hit.
 */

type Step = {
  sub?: string;
  audioFile?: string;
  ttsScript?: string;
  displayText?: string;
  interaction?: string;
  displayDelay?: number;
};

type Slide =
  | {
      type: "intro";
      slide: number;
      heading?: string;
      imageFile?: string;
      imagePrompt?: string;
      steps: Step[];
    }
  | {
      type: "mcq";
      slide: number;
      mcqId: string;
    };

type SampleLesson = {
  standardId: string;
  grade: string;
  domain?: string;
  title: string;
  slides: Slide[];
};

const STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

function gradeFolder(grade: string): string {
  const g = grade.toLowerCase();
  if (g.startsWith("k")) return "kindergarten";
  if (g.startsWith("1")) return "1st-grade";
  if (g.startsWith("2")) return "2nd-grade";
  if (g.startsWith("3")) return "3rd-grade";
  if (g.startsWith("4")) return "4th-grade";
  return "kindergarten";
}

export default async function SampleLessonPreviewPage({
  params,
}: {
  params: Promise<{ standardId: string }>;
}) {
  const { standardId: raw } = await params;
  const standardId = decodeURIComponent(raw);
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  const lesson = (sampleLessons as SampleLesson[]).find(
    (l) => l.standardId === standardId,
  );
  if (!lesson) notFound();

  const standard = findStandardById(standardId);
  const folder = gradeFolder(lesson.grade);

  // Resolve MCQ ids referenced by slides into full question objects so
  // we can render them inline at the end of the preview.
  const mcqQuestions = lesson.slides
    .filter((s): s is Extract<Slide, { type: "mcq" }> => s.type === "mcq")
    .map((s) => standard?.questions.find((q) => q.id === s.mcqId))
    .filter(
      (q): q is NonNullable<typeof q> => q != null && Array.isArray(q.choices),
    );

  // Build absolute URLs for slide images + step audio so the preview
  // renderer doesn't have to know about Supabase paths.
  const intros = lesson.slides
    .filter((s): s is Extract<Slide, { type: "intro" }> => s.type === "intro")
    .map((s) => ({
      slide: s.slide,
      heading: s.heading ?? null,
      imageUrl: s.imageFile
        ? `${STORAGE}/${s.imageFile.replace(/^\/+/, "")}`
        : null,
      steps: (s.steps ?? []).map((step) => ({
        sub: step.sub ?? null,
        displayText: step.displayText ?? "",
        ttsScript: step.ttsScript ?? "",
        audioUrl: step.audioFile
          ? `${STORAGE}/${step.audioFile.replace(/^\/+/, "")}`
          : null,
      })),
    }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/classroom/library"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to library
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          <BookOpen className="h-4 w-4" />
          Readee lesson preview
          <span className="text-zinc-300">·</span>
          <span>{lesson.grade}</span>
          <span className="text-zinc-300">·</span>
          <span className="font-mono">{lesson.standardId}</span>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {lesson.title}
        </h1>
        {standard?.standard_description && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
            {standard.standard_description}
          </p>
        )}
      </div>

      <div className="mt-6">
        <LessonPreview
          slides={intros}
          mcqs={mcqQuestions.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            choices: q.choices ?? [],
            correct: q.correct,
            hint: q.hint ?? null,
            imageUrl: `${STORAGE}/images/${folder}/${standardId}/${q.id}.png`,
            audioUrl: q.audio_url ?? null,
          }))}
        />
      </div>
    </div>
  );
}
