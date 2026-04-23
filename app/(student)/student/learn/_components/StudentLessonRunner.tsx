"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  Loader2,
  Play,
  Trophy,
  Volume2,
  X,
  Carrot,
} from "lucide-react";

const SUPABASE_STORAGE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

type LessonStep = {
  sub: string;
  audioFile?: string;
  ttsScript?: string;
  displayText?: string;
  interaction?: string;
};

type LessonSlide = {
  slide: number;
  type?: string;
  steps: LessonStep[];
};

type MCQ = {
  id: string;
  prompt: string;
  choices?: string[];
  correct?: string | string[];
  hint?: string;
};

type Phase = "slides" | "practice" | "done";

export default function StudentLessonRunner({
  standardId,
  lessonTitle,
  slides,
  mcqs,
}: {
  standardId: string;
  lessonTitle: string;
  slides: LessonSlide[];
  mcqs: MCQ[];
}) {
  const hasSlides = slides.length > 0;
  const [phase, setPhase] = useState<Phase>(hasSlides ? "slides" : "practice");

  // Slide state
  const [slideIdx, setSlideIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  // MCQ state
  const [mcqIdx, setMcqIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const router = useRouter();
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, start] = useTransition();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSlide = slides[slideIdx];
  const currentStep = currentSlide?.steps?.[stepIdx];

  // Auto-play the current step's audio when it changes.
  useEffect(() => {
    if (phase !== "slides" || !currentStep?.audioFile) return;
    const url = `${SUPABASE_STORAGE}/${currentStep.audioFile}`;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        /* autoplay may be blocked — silent fallback to manual replay */
      });
    }
  }, [phase, slideIdx, stepIdx, currentStep?.audioFile]);

  function replayAudio() {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }

  function nextSlideStep() {
    const slide = slides[slideIdx];
    if (!slide) {
      setPhase("practice");
      return;
    }
    if (stepIdx + 1 < slide.steps.length) {
      setStepIdx(stepIdx + 1);
      return;
    }
    if (slideIdx + 1 < slides.length) {
      setSlideIdx(slideIdx + 1);
      setStepIdx(0);
      return;
    }
    // Slides exhausted — transition to practice.
    if (audioRef.current) audioRef.current.pause();
    if (mcqs.length === 0) {
      completeLesson(0, 0);
      return;
    }
    setPhase("practice");
  }

  const currentMcq = mcqs[mcqIdx];
  const mcqCorrectSet = useMemo(() => {
    if (!currentMcq) return new Set<string>();
    const c = currentMcq.correct;
    if (Array.isArray(c)) return new Set(c);
    if (typeof c === "string") return new Set([c]);
    return new Set<string>();
  }, [currentMcq]);

  function mcqCheck() {
    if (!picked || revealed) return;
    setRevealed(true);
    if (mcqCorrectSet.has(picked)) setCorrectCount((n) => n + 1);
  }

  function mcqNext() {
    if (mcqIdx + 1 >= mcqs.length) {
      completeLesson(mcqs.length, correctCount + (revealed && picked && mcqCorrectSet.has(picked) ? 0 : 0));
      return;
    }
    setMcqIdx(mcqIdx + 1);
    setPicked(null);
    setRevealed(false);
  }

  function completeLesson(totalQ: number, finalCorrect: number) {
    setPhase("done");
    setSaveErr(null);
    start(async () => {
      const res = await fetch("/api/student/practice-complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          standardId,
          questionsAttempted: totalQ,
          questionsCorrect: finalCorrect,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveErr(body.error ?? "Could not save your score.");
      }
    });
  }

  // ── DONE ─────────────────────────────────────────────────────────
  if (phase === "done") {
    const total = mcqs.length;
    const pct = total === 0 ? 100 : Math.round((correctCount / total) * 100);
    const carrots = correctCount * 5;
    return (
      <div className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center dark:border-green-900/40 dark:from-green-950/30 dark:to-emerald-950/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <Trophy className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white">
          Great work!
        </h2>
        {total > 0 && (
          <>
            <div className="mt-2 font-mono text-3xl font-black text-indigo-700 dark:text-indigo-300">
              {correctCount} / {total}
            </div>
            <div className="text-sm font-semibold text-zinc-500 dark:text-slate-400">
              {pct}% correct
            </div>
          </>
        )}
        {carrots > 0 && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <Carrot className="h-4 w-4" />+{carrots} carrots
          </div>
        )}
        {saveErr && <p className="mt-3 text-xs font-semibold text-red-600">{saveErr}</p>}
        {saving && !saveErr && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push("/student")}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          Back to home
        </button>
      </div>
    );
  }

  // ── SLIDES ───────────────────────────────────────────────────────
  if (phase === "slides" && currentStep) {
    const totalSteps = slides.reduce((acc, s) => acc + s.steps.length, 0);
    const stepsBefore = slides.slice(0, slideIdx).reduce((acc, s) => acc + s.steps.length, 0) + stepIdx;
    const progressPct = totalSteps === 0 ? 0 : ((stepsBefore + 1) / totalSteps) * 100;

    return (
      <div>
        <audio ref={audioRef} preload="auto" />
        <div className="mb-3 flex items-center justify-between text-xs font-semibold">
          <span className="inline-flex items-center gap-1 text-indigo-600">
            <BookOpen className="h-3 w-3" />
            Lesson — {lessonTitle}
          </span>
          <span className="text-zinc-500 dark:text-slate-400">
            Slide {slideIdx + 1} of {slides.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-violet-950/30">
          {currentStep.displayText && (
            <div className="text-center text-2xl font-extrabold leading-tight text-zinc-900 dark:text-white sm:text-3xl">
              {renderDisplayText(currentStep.displayText)}
            </div>
          )}
          {currentStep.ttsScript && (
            <p className="mt-4 text-center text-sm leading-relaxed text-zinc-600 dark:text-slate-300">
              {currentStep.ttsScript}
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            {currentStep.audioFile && (
              <button
                type="button"
                onClick={replayAudio}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300 bg-white px-4 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-700 dark:bg-slate-900 dark:text-indigo-300"
                aria-label="Replay audio"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Listen again
              </button>
            )}
            <button
              type="button"
              onClick={nextSlideStep}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              setPhase("practice");
            }}
            className="text-xs font-semibold text-zinc-500 underline hover:text-indigo-600"
          >
            Skip to practice →
          </button>
        </div>
      </div>
    );
  }

  // ── PRACTICE (MCQ) ───────────────────────────────────────────────
  if (mcqs.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <Play className="mx-auto h-10 w-10 text-zinc-300" />
        <p className="mt-3 text-sm text-zinc-500 dark:text-slate-400">
          No practice questions for this lesson yet.
        </p>
        <button
          type="button"
          onClick={() => completeLesson(0, 0)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Mark lesson complete
        </button>
      </div>
    );
  }

  const total = mcqs.length;
  const q = currentMcq!;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold text-indigo-600">
          Practice — Question {mcqIdx + 1} of {total}
        </div>
        <div className="font-mono text-xs font-bold text-green-700 dark:text-green-300">
          ✓ {correctCount}
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${((mcqIdx + (revealed ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="whitespace-pre-line text-base font-semibold leading-relaxed text-zinc-900 dark:text-white">
          {q.prompt}
        </div>

        <div className="mt-5 space-y-2">
          {(q.choices ?? []).map((choice) => {
            const isPicked = picked === choice;
            const isCorrect = revealed && mcqCorrectSet.has(choice);
            const isWrongPick = revealed && isPicked && !mcqCorrectSet.has(choice);
            return (
              <button
                key={choice}
                type="button"
                disabled={revealed}
                onClick={() => !revealed && setPicked(choice)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left text-sm font-semibold transition ${
                  isCorrect
                    ? "border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/30 dark:text-green-200"
                    : isWrongPick
                    ? "border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200"
                    : isPicked
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-200"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <span>{choice}</span>
                {isCorrect && <Check className="h-4 w-4 text-green-600" />}
                {isWrongPick && <X className="h-4 w-4 text-red-600" />}
              </button>
            );
          })}
        </div>

        {revealed && q.hint && !mcqCorrectSet.has(picked ?? "") && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            {q.hint}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          {!revealed ? (
            <button
              type="button"
              onClick={mcqCheck}
              disabled={!picked}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40"
            >
              Check
            </button>
          ) : (
            <button
              type="button"
              onClick={mcqNext}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              {mcqIdx + 1 >= total ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Render **bold** markers in displayText. */
function renderDisplayText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="text-indigo-700 dark:text-indigo-300">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
