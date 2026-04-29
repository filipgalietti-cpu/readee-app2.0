"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  X,
  Loader2,
  Trophy,
  Carrot,
  Volume2,
  Pause,
  Play,
  BookOpen,
  RotateCcw,
} from "lucide-react";

type QuestionKind =
  | "multiple_choice"
  | "true_false"
  | "fill_in_blank"
  | "matching_pairs";

type Question = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  choices: string[] | null;
  correct: any;
  hint: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
};

type Phase = "intro" | "questions" | "results";

type SavedProgress = {
  idx?: number;
  answers?: any[];
  correct?: number;
} | null;

const FRIENDLY_FONT =
  '"Comic Neue", "Comic Sans MS", Quicksand, Nunito, ui-rounded, system-ui, -apple-system, sans-serif';

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase();
}

export default function StudentCustomQuizRunner({
  quizId,
  questions,
  passageTitle,
  passageBody,
  passageImage,
  passageAudio,
  passThreshold,
  previewMode = false,
  saveEndpoint = "/api/student/custom-quiz-complete",
  progressEndpoint = "/api/student/custom-quiz-progress",
  childId,
  homeHref = "/student",
  previouslyCompleted = false,
  previousScore = null,
  savedProgress = null,
}: {
  quizId: string;
  questions: Question[];
  passageTitle: string;
  passageBody: string;
  passageImage: string | null;
  passageAudio: string | null;
  passThreshold?: number | null;
  previewMode?: boolean;
  saveEndpoint?: string;
  progressEndpoint?: string;
  childId?: string;
  homeHref?: string;
  previouslyCompleted?: boolean;
  previousScore?: number | null;
  savedProgress?: SavedProgress;
}) {
  const router = useRouter();
  const total = questions.length;

  // Hydrate from saved progress when present. If the kid was mid-quiz
  // they land back on whatever question they were on, with their
  // running correct count intact.
  const initialIdx = clamp(savedProgress?.idx ?? 0, 0, Math.max(0, total - 1));
  const initialCorrect = clamp(
    savedProgress?.correct ?? 0,
    0,
    Math.max(0, initialIdx),
  );
  const hasResume = !!savedProgress && initialIdx > 0;

  const [phase, setPhase] = useState<Phase>(hasResume ? "questions" : "intro");
  const [idx, setIdx] = useState(initialIdx);
  const [correctCount, setCorrectCount] = useState(initialCorrect);
  const [pickedChoice, setPickedChoice] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [perQResults, setPerQResults] = useState<
    { questionId: string; correct: boolean }[]
  >(savedProgress?.answers as any[] ?? []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();

  const q = questions[idx];

  /* ── correctness ─────────────────────────────────────────────── */
  function currentAnswerCorrect(): boolean {
    if (!q) return false;
    if (q.kind === "multiple_choice") {
      return !!pickedChoice && pickedChoice === String(q.correct);
    }
    if (q.kind === "true_false") {
      return pickedChoice === String(q.correct);
    }
    if (q.kind === "fill_in_blank") {
      const accepted = (Array.isArray(q.correct) ? q.correct : []) as string[];
      const user = normalizeAnswer(typedAnswer);
      return user.length > 0 && accepted.some((a) => normalizeAnswer(a) === user);
    }
    if (q.kind === "matching_pairs") {
      const pairs = (q.correct?.pairs ?? []) as { left: string; right: string }[];
      if (pairs.length === 0) return false;
      return pairs.every((p) => matches[p.left] === p.right);
    }
    return false;
  }

  const isPicked = (() => {
    if (!q) return false;
    if (q.kind === "fill_in_blank") return typedAnswer.trim().length > 0;
    if (q.kind === "matching_pairs") {
      const pairs = (q.correct?.pairs ?? []) as { left: string; right: string }[];
      return pairs.length > 0 && pairs.every((p) => matches[p.left]);
    }
    return pickedChoice !== null;
  })();

  /* ── save & resume snapshot ─────────────────────────────────── */
  const lastSnapshotRef = useRef<string>("");
  function saveProgress(nextIdx: number, nextCorrect: number, nextAnswers: any[]) {
    if (previewMode) return;
    const payload = {
      quizId,
      idx: nextIdx,
      answers: nextAnswers,
      correct: nextCorrect,
    };
    const sig = JSON.stringify(payload);
    if (sig === lastSnapshotRef.current) return;
    lastSnapshotRef.current = sig;
    fetch(progressEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Best-effort; the kid still has live state, we'll retry next Check.
    });
  }

  /* ── phase transitions ─────────────────────────────────────── */
  function startQuestions() {
    setPhase("questions");
  }

  function check() {
    if (!isPicked || revealed) return;
    setRevealed(true);
    const wasCorrect = currentAnswerCorrect();
    if (wasCorrect) setCorrectCount((n) => n + 1);
    const nextAnswers = [
      ...perQResults,
      { questionId: q.id, correct: wasCorrect },
    ];
    setPerQResults(nextAnswers);
    saveProgress(idx, correctCount + (wasCorrect ? 1 : 0), nextAnswers);
  }

  function next() {
    if (idx + 1 >= total) {
      finalize();
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setPickedChoice(null);
    setTypedAnswer("");
    setRevealed(false);
    setMatches({});
    setActiveLeft(null);
    saveProgress(nextIdx, correctCount, perQResults);
  }

  function finalize() {
    setPhase("results");
    if (previewMode) return;
    setSaveErr(null);
    startSubmit(async () => {
      const res = await fetch(saveEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          quizId,
          questionsAttempted: total,
          questionsCorrect: correctCount,
          ...(childId ? { childId } : {}),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveErr(body.error ?? "Could not save your score.");
      }
    });
  }

  /* ── derived ─────────────────────────────────────────────── */
  const scorePct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const passed =
    typeof passThreshold !== "number" ? true : scorePct >= passThreshold;
  const carrotsEarned = correctCount * 5;

  /* ── intro screen ────────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <div className="space-y-4">
        {previouslyCompleted && previousScore !== null && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            You finished this one before, scored {previousScore}%. Want to try again?
          </div>
        )}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          {passageImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={passageImage}
              alt="Passage illustration"
              className="mb-4 max-h-72 w-full rounded-2xl object-contain"
            />
          )}
          {passageBody && (
            <article
              className="text-[18px] leading-[1.8] text-zinc-900 dark:text-slate-100"
              style={{ fontFamily: FRIENDLY_FONT, letterSpacing: "0.005em" }}
            >
              <div className="whitespace-pre-line">{passageBody}</div>
            </article>
          )}
          {passageAudio && (
            <div className="mt-4">
              <PassageAudioPlayer src={passageAudio} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
            {total} question{total === 1 ? "" : "s"} · take your time, you can
            re-read the passage anytime.
          </div>
          <button
            type="button"
            onClick={startQuestions}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            I&apos;m ready
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ── results screen ──────────────────────────────────────── */
  if (phase === "results") {
    return (
      <ResultsPanel
        questions={questions}
        perQResults={perQResults}
        correctCount={correctCount}
        total={total}
        scorePct={scorePct}
        passThreshold={passThreshold ?? null}
        passed={passed}
        carrotsEarned={carrotsEarned}
        saveErr={saveErr}
        submitting={submitting}
        previewMode={previewMode}
        homeHref={homeHref}
        quizId={quizId}
        onBack={() => router.push(previewMode ? `/classroom/authoring/quiz/${quizId}` : homeHref)}
      />
    );
  }

  /* ── questions screen ────────────────────────────────────── */
  if (!q) return null;
  const showInlineImage = q.imageUrl && q.imageUrl !== passageImage;
  const showInlineAudio = q.audioUrl && q.audioUrl !== passageAudio;

  return (
    <div>
      {/* Sticky chrome: progress + open-passage */}
      <div className="sticky top-0 z-20 -mx-2 -mt-2 bg-gradient-to-b from-zinc-50/95 via-zinc-50/90 to-transparent px-2 pt-2 pb-3 backdrop-blur-sm dark:from-slate-950/90 dark:via-slate-950/80">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-indigo-600">
            Question {idx + 1} of {total}
          </div>
          <div className="flex items-center gap-2">
            {(passageBody || passageAudio) && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-2.5 py-1 text-[11px] font-bold text-violet-700 transition hover:bg-violet-50 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300"
              >
                <BookOpen className="h-3 w-3" />
                Read passage again
              </button>
            )}
            <div className="font-mono text-xs font-bold text-green-700 dark:text-green-300">
              ✓ {correctCount}
            </div>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
          <div
            className="h-full bg-indigo-500 transition-all"
            style={{ width: `${((idx + (revealed ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        {showInlineImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={q.imageUrl!}
            alt=""
            className="mb-4 max-h-56 w-full rounded-2xl object-contain"
          />
        )}
        <div className="flex items-start gap-3">
          <div className="whitespace-pre-line text-base font-semibold leading-relaxed text-zinc-900 dark:text-white">
            {q.prompt}
          </div>
          {showInlineAudio && (
            <PromptAudioButton src={q.audioUrl!} autoplayKey={q.id} />
          )}
        </div>

        <div className="mt-5 space-y-2">
          {q.kind === "multiple_choice" && Array.isArray(q.choices) &&
            q.choices.map((choice, i) => {
              const isPick = pickedChoice === choice;
              const isCorrect = revealed && choice === String(q.correct);
              const isWrongPick =
                revealed && isPick && choice !== String(q.correct);
              return (
                <button
                  key={`${i}-${choice}`}
                  type="button"
                  disabled={revealed}
                  onClick={() => !revealed && setPickedChoice(choice)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left text-sm font-semibold transition ${
                    isCorrect
                      ? "border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/30 dark:text-green-200"
                      : isWrongPick
                      ? "border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200"
                      : isPick
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

          {q.kind === "true_false" &&
            (["True", "False"] as const).map((choice) => {
              const isPick = pickedChoice === choice;
              const isCorrect = revealed && choice === String(q.correct);
              const isWrongPick =
                revealed && isPick && choice !== String(q.correct);
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={revealed}
                  onClick={() => !revealed && setPickedChoice(choice)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left text-sm font-semibold transition ${
                    isCorrect
                      ? "border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/30 dark:text-green-200"
                      : isWrongPick
                      ? "border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200"
                      : isPick
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

          {q.kind === "fill_in_blank" && (
            <div>
              <input
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={revealed}
                onKeyDown={(e) => {
                  if (e.key === "Enter") check();
                }}
                placeholder="Type your answer"
                className={`w-full rounded-2xl border-2 bg-white px-4 py-3 text-lg font-semibold focus:outline-none dark:bg-slate-900 dark:text-white ${
                  revealed
                    ? currentAnswerCorrect()
                      ? "border-green-500"
                      : "border-red-500"
                    : "border-zinc-200 focus:border-indigo-400"
                }`}
              />
              {revealed && !currentAnswerCorrect() && Array.isArray(q.correct) && (
                <p className="mt-2 text-xs font-semibold text-zinc-600 dark:text-slate-400">
                  Accepted:{" "}
                  <span className="text-green-700 dark:text-green-300">
                    {(q.correct as string[]).join(" / ")}
                  </span>
                </p>
              )}
            </div>
          )}

          {q.kind === "matching_pairs" && (
            <MatchingPairsBoard
              pairs={(q.correct?.pairs ?? []) as { left: string; right: string }[]}
              matches={matches}
              setMatches={setMatches}
              activeLeft={activeLeft}
              setActiveLeft={setActiveLeft}
              revealed={revealed}
            />
          )}
        </div>

        {revealed && q.hint && !currentAnswerCorrect() && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            {q.hint}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          {!revealed ? (
            <button
              type="button"
              onClick={check}
              disabled={!isPicked}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40"
            >
              Check
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              {idx + 1 >= total ? "See my score" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {drawerOpen && (
        <PassageDrawer
          title={passageTitle}
          body={passageBody}
          image={passageImage}
          audio={passageAudio}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

/* ── helpers ────────────────────────────────────────────────────── */

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function PassageDrawer({
  title,
  body,
  image,
  audio,
  onClose,
}: {
  title: string;
  body: string;
  image: string | null;
  audio: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-slate-800"
          aria-label="Close passage"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
          Passage
        </div>
        <h2 className="mt-1 text-xl font-extrabold text-zinc-900 dark:text-white">
          {title}
        </h2>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="mt-4 max-h-56 w-full rounded-2xl object-contain"
          />
        )}
        {body && (
          <article
            className="mt-4 text-[17px] leading-[1.8] text-zinc-900 dark:text-slate-100"
            style={{ fontFamily: FRIENDLY_FONT, letterSpacing: "0.005em" }}
          >
            <div className="whitespace-pre-line">{body}</div>
          </article>
        )}
        {audio && (
          <div className="mt-4">
            <PassageAudioPlayer src={audio} />
          </div>
        )}
      </div>
    </div>
  );
}

function PassageAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function restart() {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-900/40 dark:bg-violet-950/30">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        preload="metadata"
      />
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700"
        aria-label={playing ? "Pause" : "Play passage audio"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={restart}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-300 text-violet-600 transition hover:bg-white dark:border-violet-700 dark:text-violet-300"
        aria-label="Start over"
        title="Start over"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
          Read aloud
        </span>
        <span className="text-xs font-semibold text-violet-900 dark:text-violet-200">
          Listen to the passage
        </span>
      </div>
    </div>
  );
}

function PromptAudioButton({
  src,
  autoplayKey,
}: {
  src: string;
  autoplayKey: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    const p = a.play();
    if (p) {
      p.then(() => setPlaying(true)).catch(() => {
        setPlaying(false);
      });
    }
  }, [autoplayKey, src]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.currentTime = 0;
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause audio" : "Play audio"}
        className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition ${
          playing
            ? "bg-violet-600 text-white"
            : "border border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-950/30"
        }`}
      >
        <Volume2 className="h-4 w-4" />
      </button>
    </>
  );
}

/* ── results ───────────────────────────────────────────────────── */

function ResultsPanel({
  questions,
  perQResults,
  correctCount,
  total,
  scorePct,
  passThreshold,
  passed,
  carrotsEarned,
  saveErr,
  submitting,
  previewMode,
  onBack,
}: {
  questions: Question[];
  perQResults: { questionId: string; correct: boolean }[];
  correctCount: number;
  total: number;
  scorePct: number;
  passThreshold: number | null;
  passed: boolean;
  carrotsEarned: number;
  saveErr: string | null;
  submitting: boolean;
  previewMode: boolean;
  homeHref: string;
  quizId: string;
  onBack: () => void;
}) {
  const resultMap = new Map(perQResults.map((r) => [r.questionId, r.correct]));
  return (
    <div className="space-y-4">
      <div
        className={`rounded-3xl border p-8 text-center ${
          passed
            ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/40 dark:from-green-950/30 dark:to-emerald-950/30"
            : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-orange-950/30"
        }`}
      >
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ${
            passed
              ? "bg-gradient-to-br from-amber-400 to-orange-500"
              : "bg-gradient-to-br from-amber-500 to-orange-600"
          }`}
        >
          <Trophy className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white">
          {passed ? "Great work!" : "Almost there!"}
        </h2>
        <div className="mt-2 font-mono text-3xl font-black text-indigo-700 dark:text-indigo-300">
          {correctCount} / {total}
        </div>
        <div className="text-sm font-semibold text-zinc-500 dark:text-slate-400">
          {scorePct}% correct
        </div>
        {typeof passThreshold === "number" && (
          <div
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
              passed
                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            Goal: {passThreshold}% · {passed ? "Hit it!" : "Try again to pass"}
          </div>
        )}
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <Carrot className="h-4 w-4" />+{carrotsEarned} carrots
        </div>
        {saveErr && (
          <p className="mt-3 text-xs font-semibold text-red-600">{saveErr}</p>
        )}
        {submitting && !saveErr && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </p>
        )}
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {previewMode ? "Back to editor" : "Back to home"}
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          How did you do?
        </div>
        <ul className="mt-3 space-y-2">
          {questions.map((q, i) => {
            const got = resultMap.get(q.id);
            const correct = got === true;
            return (
              <li
                key={q.id}
                className={`flex items-start gap-3 rounded-2xl border px-3 py-2 ${
                  correct
                    ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/30"
                    : got === false
                    ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30"
                    : "border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    correct
                      ? "bg-green-500 text-white"
                      : got === false
                      ? "bg-red-500 text-white"
                      : "bg-zinc-300 text-white"
                  }`}
                >
                  {correct ? <Check className="h-3 w-3" /> : got === false ? <X className="h-3 w-3" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-slate-100">
                    {q.prompt}
                  </div>
                  {!correct && q.hint && (
                    <div className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                      Hint: {q.hint}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ── matching pairs ───────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MatchingPairsBoard({
  pairs,
  matches,
  setMatches,
  activeLeft,
  setActiveLeft,
  revealed,
}: {
  pairs: { left: string; right: string }[];
  matches: Record<string, string>;
  setMatches: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeLeft: string | null;
  setActiveLeft: React.Dispatch<React.SetStateAction<string | null>>;
  revealed: boolean;
}) {
  const shuffledRights = useMemo(
    () => shuffle(pairs.map((p) => p.right)),
    [pairs],
  );

  function pickLeft(left: string) {
    if (revealed) return;
    setActiveLeft((cur) => (cur === left ? null : left));
  }

  function pickRight(right: string) {
    if (revealed || !activeLeft) return;
    setMatches((cur) => {
      const next = { ...cur };
      for (const k of Object.keys(next)) {
        if (next[k] === right && k !== activeLeft) delete next[k];
      }
      next[activeLeft] = right;
      return next;
    });
    setActiveLeft(null);
  }

  function clearMatch(left: string) {
    if (revealed) return;
    setMatches((cur) => {
      const next = { ...cur };
      delete next[left];
      return next;
    });
  }

  const rightToLeft = new Map<string, string>();
  for (const [l, r] of Object.entries(matches)) rightToLeft.set(r, l);

  function correctRightFor(left: string): string | undefined {
    return pairs.find((p) => p.left === left)?.right;
  }

  return (
    <div>
      <div className="mb-3 text-xs font-semibold text-zinc-500 dark:text-slate-400">
        Tap an item on the left, then tap its match on the right.
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p) => {
            const matched = matches[p.left];
            const isActive = activeLeft === p.left;
            const isCorrect = revealed && matched === p.right;
            const isWrong =
              revealed && matched !== undefined && matched !== p.right;
            return (
              <button
                key={p.left}
                type="button"
                onClick={() => pickLeft(p.left)}
                disabled={revealed}
                className={`flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isCorrect
                    ? "border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/30 dark:text-green-200"
                    : isWrong
                    ? "border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200"
                    : isActive
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-200"
                    : matched
                    ? "border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-700 dark:bg-violet-950/30 dark:text-violet-200"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <span className="flex-1">{p.left}</span>
                {matched && !revealed && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearMatch(p.left);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        clearMatch(p.left);
                      }
                    }}
                    className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-violet-700 hover:bg-white dark:bg-slate-800/80"
                    aria-label={`Clear match for ${p.left}`}
                  >
                    ✕
                  </span>
                )}
                {revealed && !isCorrect && (
                  <span className="text-[10px] font-bold text-green-700 dark:text-green-300">
                    → {correctRightFor(p.left)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {shuffledRights.map((right) => {
            const pairedLeft = rightToLeft.get(right);
            const isActiveTarget = activeLeft !== null && !pairedLeft;
            const isCorrect =
              revealed && pairedLeft &&
              pairs.find((p) => p.left === pairedLeft)?.right === right;
            const isWrong =
              revealed && pairedLeft &&
              pairs.find((p) => p.left === pairedLeft)?.right !== right;
            return (
              <button
                key={right}
                type="button"
                onClick={() => pickRight(right)}
                disabled={revealed || !activeLeft}
                className={`flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isCorrect
                    ? "border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/30 dark:text-green-200"
                    : isWrong
                    ? "border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200"
                    : pairedLeft
                    ? "border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-700 dark:bg-violet-950/30 dark:text-violet-200"
                    : isActiveTarget
                    ? "border-indigo-300 bg-white text-zinc-800 hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-slate-900"
                    : "border-zinc-200 bg-white text-zinc-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                } ${!activeLeft && !pairedLeft && !revealed ? "opacity-60" : ""}`}
              >
                {pairedLeft && !revealed && (
                  <span className="rounded-full bg-violet-200 px-1.5 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-violet-900/60 dark:text-violet-200">
                    {pairs.findIndex((p) => p.left === pairedLeft) + 1}
                  </span>
                )}
                <span className="flex-1">{right}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
