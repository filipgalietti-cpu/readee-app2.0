"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  Check,
  Sparkles,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import KidThumbs from "@/components/feedback/KidThumbs";

type Question = {
  prompt: string;
  choices?: string[];
  correct?: string;
  hint?: string;
  audioUrl?: string | null;
};

type Content = {
  title: string | null;
  topic: string;
  passage_text: string | null;
  image_url: string | null;
  audio_url: string | null;
  questions: Question[] | null;
};

type Phase = "read" | "quiz" | "recap";

type AnswerRecord = {
  choice: string;
  correct: boolean;
  attempts: number;
};

const MOTION_FAST = { duration: 0.18, ease: "easeOut" as const };

export default function KidRunner({
  content,
  contentId,
  childId,
  childName,
  onClose,
}: {
  content: Content;
  contentId: string;
  childId: string;
  childName: string;
  onClose: () => void;
}) {
  const questions = useMemo(
    () => (content.questions ?? []) as Question[],
    [content.questions],
  );
  const hasQuiz = questions.length > 0;

  const [phase, setPhase] = useState<Phase>("read");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerRecord>>({});
  const [muted, setMuted] = useState(false);

  // Lock body scroll while runner is open.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function startQuiz() {
    if (hasQuiz) setPhase("quiz");
    else setPhase("recap");
  }
  function recordAnswer(idx: number, rec: AnswerRecord) {
    setAnswers((prev) => ({ ...prev, [idx]: rec }));
  }
  function nextQuestion() {
    if (qIdx + 1 < questions.length) {
      setQIdx((i) => i + 1);
    } else {
      setPhase("recap");
    }
  }
  function restart() {
    setQIdx(0);
    setAnswers({});
    setPhase("read");
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <X className="h-4 w-4" />
          Done
        </button>
        <div className="flex items-center gap-2">
          <ProgressDots
            phase={phase}
            qIdx={qIdx}
            total={questions.length}
          />
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-900 dark:text-slate-300"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            {phase === "read" && (
              <motion.div
                key="read"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={MOTION_FAST}
              >
                <ReadPhase
                  content={content}
                  childName={childName}
                  muted={muted}
                  onStart={startQuiz}
                  hasQuiz={hasQuiz}
                />
              </motion.div>
            )}
            {phase === "quiz" && (
              <motion.div
                key={`quiz-${qIdx}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={MOTION_FAST}
              >
                <QuestionPhase
                  question={questions[qIdx]!}
                  idx={qIdx}
                  total={questions.length}
                  muted={muted}
                  onAnswer={(rec) => recordAnswer(qIdx, rec)}
                  onNext={nextQuestion}
                  prior={answers[qIdx]}
                />
              </motion.div>
            )}
            {phase === "recap" && (
              <motion.div
                key="recap"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={MOTION_FAST}
              >
                <RecapPhase
                  contentId={contentId}
                  childId={childId}
                  childName={childName}
                  questions={questions}
                  answers={answers}
                  onRestart={restart}
                  onClose={onClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function ProgressDots({
  phase,
  qIdx,
  total,
}: {
  phase: Phase;
  qIdx: number;
  total: number;
}) {
  const totalDots = 1 + total + 1; // read + N questions + recap
  const activeIdx = phase === "read" ? 0 : phase === "quiz" ? 1 + qIdx : totalDots - 1;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalDots }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === activeIdx
              ? "w-5 bg-violet-600"
              : i < activeIdx
              ? "w-1.5 bg-violet-400"
              : "w-1.5 bg-violet-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function ReadPhase({
  content,
  childName,
  muted,
  onStart,
  hasQuiz,
}: {
  content: Content;
  childName: string;
  muted: boolean;
  onStart: () => void;
  hasQuiz: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = muted;
  }, [muted]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  return (
    <div>
      <div className="text-center text-[10px] font-bold uppercase tracking-widest text-violet-600">
        Read with {childName}
      </div>
      <h1 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        {content.title ?? content.topic}
      </h1>

      {content.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.image_url}
          alt={content.title ?? content.topic}
          className="mx-auto mt-6 max-h-72 w-full max-w-md rounded-3xl object-contain shadow-md"
        />
      )}

      {content.audio_url && (
        <button
          type="button"
          onClick={togglePlay}
          className="mx-auto mt-5 flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-violet-700"
        >
          {playing ? (
            <>
              <Pause className="h-4 w-4" />
              Pause read-aloud
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Play read-aloud
            </>
          )}
        </button>
      )}
      {content.audio_url && (
        <audio
          ref={audioRef}
          src={content.audio_url}
          onEnded={() => setPlaying(false)}
          preload="auto"
          className="hidden"
        />
      )}

      {content.passage_text && (
        <article
          className="mt-6 whitespace-pre-line rounded-3xl border border-zinc-200 bg-white p-6 text-lg leading-relaxed text-zinc-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 sm:p-8 sm:text-xl"
          style={{ fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif" }}
        >
          {content.passage_text}
        </article>
      )}

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-3 text-base font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-violet-700 active:scale-[.99]"
        >
          {hasQuiz ? "Start questions" : "Finish"}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function QuestionPhase({
  question,
  idx,
  total,
  muted,
  onAnswer,
  onNext,
  prior,
}: {
  question: Question;
  idx: number;
  total: number;
  muted: boolean;
  onAnswer: (r: AnswerRecord) => void;
  onNext: () => void;
  prior?: AnswerRecord;
}) {
  const [picked, setPicked] = useState<string | null>(prior?.choice ?? null);
  const [revealed, setRevealed] = useState<boolean>(prior !== undefined);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(prior?.attempts ?? 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setPicked(null);
    setRevealed(false);
    setShowHint(false);
    setAttempts(0);
  }, [idx]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = muted;
    if (question.audioUrl) {
      a.play().catch(() => {});
    }
  }, [muted, question.audioUrl, idx]);

  const choices = Array.isArray(question.choices) ? question.choices : [];
  const correct = question.correct ?? "";
  const isCorrect = picked != null && picked === correct;

  function pick(choice: string) {
    if (revealed && isCorrect) return; // can't change after correct
    const nextAttempts = attempts + 1;
    setPicked(choice);
    setAttempts(nextAttempts);
    if (choice === correct) {
      setRevealed(true);
      setShowHint(false);
      onAnswer({ choice, correct: true, attempts: nextAttempts });
    } else {
      // First miss: show hint, allow retry. Second miss: reveal.
      if (nextAttempts >= 2) {
        setRevealed(true);
        onAnswer({ choice, correct: false, attempts: nextAttempts });
      } else {
        setShowHint(true);
        // Don't lock in the answer yet — kid can try again.
      }
    }
  }

  const advanceLabel = idx + 1 < total ? "Next question →" : "See results →";

  return (
    <div>
      <div className="text-center text-[10px] font-bold uppercase tracking-widest text-violet-600">
        Question {idx + 1} of {total}
      </div>

      <h2
        className="mt-3 text-center text-2xl font-extrabold leading-snug text-zinc-900 dark:text-white sm:text-3xl"
        style={{ fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif" }}
      >
        {question.prompt}
      </h2>

      {question.audioUrl && (
        <audio
          ref={audioRef}
          src={question.audioUrl}
          preload="auto"
          className="hidden"
        />
      )}

      <div className="mt-6 grid gap-2.5 sm:gap-3">
        {choices.map((c, i) => {
          const isPicked = picked === c;
          const isThisCorrect = c === correct;
          const showAsCorrect = revealed && isThisCorrect;
          const showAsWrong = revealed && isPicked && !isThisCorrect;
          const showAsTriedWrong =
            !revealed && isPicked && !isThisCorrect;
          return (
            <button
              key={`${i}-${c}`}
              type="button"
              onClick={() => pick(c)}
              disabled={revealed && isCorrect}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-lg font-semibold transition active:scale-[.99] disabled:cursor-default ${
                showAsCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                  : showAsWrong
                  ? "border-red-400 bg-red-50 text-red-900"
                  : showAsTriedWrong
                  ? "border-amber-400 bg-amber-50 text-amber-900 animate-shake"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-violet-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              }`}
              style={{
                fontFamily: "'Atkinson Hyperlegible', system-ui, sans-serif",
              }}
            >
              <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base font-extrabold ${
                  showAsCorrect
                    ? "bg-emerald-500 text-white"
                    : showAsWrong || showAsTriedWrong
                    ? "bg-red-500 text-white"
                    : "bg-violet-100 text-violet-700"
                }`}
              >
                {showAsCorrect ? (
                  <Check className="h-5 w-5" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="flex-1">{c}</span>
            </button>
          );
        })}
      </div>

      {showHint && question.hint && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
        >
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
          <span>
            <strong>Hint:</strong> {question.hint}
          </span>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-3 text-base font-bold text-white shadow-lg hover:scale-[1.02] hover:bg-violet-700 active:scale-[.99]"
          >
            {advanceLabel}
          </button>
        </div>
      )}

      {revealed && isCorrect && (
        <div className="mt-4 text-center text-sm font-semibold text-emerald-700">
          {attempts === 1 ? "Nailed it on the first try!" : "Great — you got it!"}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */

function RecapPhase({
  contentId,
  childId,
  childName,
  questions,
  answers,
  onRestart,
  onClose,
}: {
  contentId: string;
  childId: string;
  childName: string;
  questions: Question[];
  answers: Record<number, AnswerRecord>;
  onRestart: () => void;
  onClose: () => void;
}) {
  const total = questions.length;
  const got = Object.values(answers).filter((a) => a.correct).length;
  const firstTry = Object.values(answers).filter(
    (a) => a.correct && a.attempts === 1,
  ).length;
  const stars = total === 0 ? 0 : Math.max(1, Math.round((got / total) * 3));

  const message =
    total === 0
      ? `Great reading, ${childName}!`
      : got === total
      ? `Nailed it, ${childName}! ${got} out of ${total}.`
      : got >= Math.ceil(total * 0.7)
      ? `Nice work, ${childName} — ${got} out of ${total}.`
      : `Good effort, ${childName}. ${got} out of ${total}. Try again?`;

  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
        <Sparkles className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        {message}
      </h2>

      {total > 0 && (
        <>
          <div className="mt-3 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <Sparkles
                key={i}
                className={`h-7 w-7 ${
                  i < stars ? "text-amber-400" : "text-zinc-200"
                }`}
              />
            ))}
          </div>
          {firstTry > 0 && (
            <p className="mt-2 text-sm text-zinc-500">
              {firstTry} on the first try. ⚡
            </p>
          )}

          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left">
            {questions.map((q, i) => {
              const ans = answers[i];
              const correct = ans?.correct ?? false;
              return (
                <li
                  key={i}
                  className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
                    correct
                      ? "bg-emerald-50 text-emerald-900"
                      : "bg-red-50 text-red-900"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white ${
                      correct ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  >
                    {correct ? "✓" : "✗"}
                  </span>
                  <span className="flex-1">
                    Q{i + 1}. {q.prompt}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Universal kid feedback signal */}
      <div className="mt-7 flex justify-center">
        <KidThumbs
          childId={childId}
          assetKind="ask_readee"
          assetId={contentId}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <RotateCcw className="h-4 w-4" />
          Read it again
        </button>
        <Link
          href="/dashboard/ask-readee"
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
        >
          <Sparkles className="h-4 w-4" />
          Make another
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          Done
        </button>
      </div>
    </div>
  );
}
