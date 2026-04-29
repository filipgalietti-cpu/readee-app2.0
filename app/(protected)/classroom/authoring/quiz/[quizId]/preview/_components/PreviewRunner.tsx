"use client";

import { useState } from "react";
import { Eye, Play, Volume2, Check, Lightbulb, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel";
import StudentCustomQuizRunner from "@/app/(student)/student/quiz/_components/StudentCustomQuizRunner";

type Question = {
  id: string;
  kind: "multiple_choice" | "true_false" | "fill_in_blank" | "matching_pairs";
  prompt: string;
  choices: string[] | null;
  correct: any;
  hint: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
};

/**
 * Two-mode teacher preview:
 *
 *   Cards mode — flick through every question as a card carousel.
 *     Lets a teacher scan the whole quiz at a glance: prompt, choices,
 *     correct answer highlighted in green, hint, image + audio. Doesn't
 *     simulate the student experience; it's a content review tool.
 *
 *   Play mode — runs the actual student UX (StudentCustomQuizRunner)
 *     with previewMode on so no DB save fires.
 *
 * Default: cards. Most teachers want to scan first, then optionally
 * play.
 */
export default function PreviewRunner({
  quizId,
  questions,
  quizTitle,
  quizDescription,
}: {
  quizId: string;
  questions: Question[];
  quizTitle: string;
  quizDescription: string;
}) {
  const [mode, setMode] = useState<"cards" | "play">("cards");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => setMode("cards")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
            mode === "cards"
              ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
              : "text-zinc-500"
          }`}
        >
          <Eye className="h-3 w-3" />
          Card view
        </button>
        <button
          type="button"
          onClick={() => setMode("play")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
            mode === "play"
              ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
              : "text-zinc-500"
          }`}
        >
          <Play className="h-3 w-3" />
          Play it
        </button>
      </div>

      {mode === "cards" ? (
        <CardsPreview questions={questions} />
      ) : (
        <StudentCustomQuizRunner
          quizId={quizId}
          questions={questions}
          passageTitle={quizTitle}
          passageBody={quizDescription}
          passageImage={questions[0]?.imageUrl ?? null}
          passageAudio={questions[0]?.audioUrl ?? null}
          previewMode
        />
      )}
    </div>
  );
}

function CardsPreview({ questions }: { questions: Question[] }) {
  return (
    <div className="px-2">
      <Carousel className="w-full">
        <CarouselContent>
          {questions.map((q, i) => (
            <CarouselItem key={q.id} className="md:basis-3/4 lg:basis-2/3">
              <Card className="overflow-hidden">
                <CardHeader className="!p-5 !pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      {kindLabel(q.kind)}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-zinc-400">
                      {i + 1} / {questions.length}
                    </span>
                  </div>
                  <CardTitle className="!text-base !mt-2">
                    <span className="whitespace-pre-line">{q.prompt}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="!p-5 !pt-0 space-y-3">
                  {q.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={q.imageUrl}
                      alt=""
                      className="max-h-44 w-full rounded-xl object-contain"
                    />
                  )}

                  {q.audioUrl && (
                    <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-950/30">
                      <Volume2 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-300" />
                      <audio src={q.audioUrl} controls className="flex-1 max-w-full" />
                    </div>
                  )}

                  {renderChoices(q)}

                  {q.hint && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span>
                        <strong>Hint:</strong> {q.hint}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-slate-400">
        <Sparkles className="h-3 w-3 text-violet-500" />
        Tip: arrow keys also navigate
      </div>
    </div>
  );
}

function kindLabel(k: Question["kind"]): string {
  if (k === "multiple_choice") return "Multiple choice";
  if (k === "true_false") return "True / false";
  if (k === "matching_pairs") return "Matching pairs";
  return "Fill in the blank";
}

function renderChoices(q: Question): React.ReactNode {
  if (q.kind === "multiple_choice" && Array.isArray(q.choices)) {
    const correct = String(q.correct);
    return (
      <ul className="space-y-1.5 text-sm">
        {q.choices.map((c) => {
          const isCorrect = c === correct;
          return (
            <li
              key={c}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                isCorrect
                  ? "border-green-300 bg-green-50 font-semibold text-green-900 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200"
                  : "border-zinc-200 text-zinc-700 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {isCorrect ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <span className="h-3.5 w-3.5" />
              )}
              {c}
            </li>
          );
        })}
      </ul>
    );
  }
  if (q.kind === "true_false") {
    return (
      <div className="flex gap-2 text-sm">
        {(["True", "False"] as const).map((v) => {
          const isCorrect = q.correct === v;
          return (
            <span
              key={v}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 ${
                isCorrect
                  ? "border-green-300 bg-green-50 font-semibold text-green-900 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-200"
                  : "border-zinc-200 text-zinc-500 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {isCorrect && <Check className="h-3 w-3 text-green-600" />}
              {v}
            </span>
          );
        })}
      </div>
    );
  }
  if (q.kind === "fill_in_blank" && Array.isArray(q.correct)) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs dark:border-green-800/40 dark:bg-green-950/30">
        <span className="font-semibold text-green-900 dark:text-green-200">Accepted answers:</span>{" "}
        <span className="text-green-800 dark:text-green-300">
          {(q.correct as string[]).join(" / ")}
        </span>
      </div>
    );
  }
  if (q.kind === "matching_pairs") {
    const pairs = (q.correct?.pairs ?? []) as { left: string; right: string }[];
    return (
      <ul className="space-y-1.5 text-sm">
        {pairs.map((p, i) => (
          <li
            key={i}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-slate-700"
          >
            <span className="font-semibold text-zinc-900 dark:text-white">{p.left}</span>
            <span className="text-violet-500">→</span>
            <span className="text-violet-700 dark:text-violet-300">{p.right}</span>
          </li>
        ))}
      </ul>
    );
  }
  return null;
}
