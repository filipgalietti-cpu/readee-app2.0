import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardPen, Check } from "lucide-react";
import { requireProfile } from "@/lib/auth/helpers";
import { findStandardById, GRADE_LABELS } from "@/lib/data/all-standards";
import QuestionAudioButton from "./_QuestionAudioButton";

export const dynamic = "force-dynamic";

/**
 * Teacher-side preview of a single Readee practice question. The
 * kid-facing /practice route requires a child profile for progress
 * tracking; teachers just want to QA a specific question pulled up
 * by smart search.
 */

const STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

function inferGradeFolderFromStandardId(standardId: string): string {
  // Standard IDs look like RL.K.1, RF.2.3, RI.4.7 etc. — the middle
  // segment is the grade tag.
  const parts = standardId.split(".");
  const tag = parts[1] ?? "K";
  if (tag === "K") return "kindergarten";
  if (tag === "1") return "1st-grade";
  if (tag === "2") return "2nd-grade";
  if (tag === "3") return "3rd-grade";
  if (tag === "4") return "4th-grade";
  return "kindergarten";
}

const GRADE_KEY_BY_TAG: Record<string, string> = {
  K: "kindergarten",
  "1": "1st",
  "2": "2nd",
  "3": "3rd",
  "4": "4th",
};

function gradeKeyFromStandardId(standardId: string): string {
  const tag = standardId.split(".")[1] ?? "K";
  return GRADE_KEY_BY_TAG[tag] ?? "kindergarten";
}

export default async function SampleQuestionPreviewPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId: raw } = await params;
  const questionId = decodeURIComponent(raw);
  const profile = await requireProfile();
  if (profile.role !== "educator") notFound();

  // Question ids look like "RL.K.1-Q1"; the chunk before "-" is the
  // standard id we use to look up the bank.
  const standardId = questionId.split("-")[0] ?? "";
  const standard = findStandardById(standardId);
  const question = standard?.questions.find((q) => q.id === questionId);
  if (!standard || !question) notFound();

  const folder = inferGradeFolderFromStandardId(standardId);
  const gradeKey = gradeKeyFromStandardId(standardId);
  const gradeLabel = GRADE_LABELS[gradeKey] ?? gradeKey;
  const imageUrl = `${STORAGE}/images/${folder}/${standardId}/${questionId}.png`;
  const choices = Array.isArray(question.choices) ? question.choices : [];
  const correct = String(question.correct);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/classroom/library"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-indigo-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to library
      </Link>

      <div className="mt-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
          <ClipboardPen className="h-4 w-4" />
          Practice question preview
          <span className="text-zinc-300">·</span>
          <span>{gradeLabel}</span>
          <span className="text-zinc-300">·</span>
          <span className="font-mono">{standardId}</span>
        </div>
        <h1 className="mt-1 font-mono text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {question.id}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-slate-400">
          {standard.standard_description}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex h-44 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white sm:w-44 dark:border-slate-700 dark:bg-slate-900">
            <ImageWithFallback src={imageUrl} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-slate-800 dark:text-slate-400">
                {question.type.replace(/_/g, " ")}
              </span>
              {typeof question.difficulty === "number" && (
                <span className="text-[10px] text-zinc-400">
                  diff {question.difficulty}
                </span>
              )}
              <QuestionAudioButton
                primary={question.audio_url ?? null}
                hint={question.hint_audio_url ?? null}
              />
            </div>
            <p className="mt-3 whitespace-pre-line text-base text-zinc-900 dark:text-white">
              {question.prompt}
            </p>
          </div>
        </div>

        {choices.length > 0 && (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {choices.map((c) => {
              const isCorrect = c === correct;
              return (
                <li
                  key={c}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    isCorrect
                      ? "border-green-300 bg-green-50 font-semibold text-green-900 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
                      : "border-zinc-200 bg-white text-zinc-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {isCorrect ? (
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-zinc-300 dark:border-slate-600" />
                  )}
                  {c}
                </li>
              );
            })}
          </ul>
        )}

        {question.hint && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            <span className="font-bold">Hint:</span> {question.hint}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageWithFallback({ src }: { src: string }) {
  // Server component fallback — if the image 404s the browser shows
  // alt; we render alongside an icon for the empty case via CSS.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      className="h-full w-full object-cover"
    />
  );
}
