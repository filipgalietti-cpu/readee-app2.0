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
  | "matching_pairs"
  | "free_response";

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

type PerQResult = {
  questionId: string;
  /** 0..1 fraction of this question's full credit. Binary kinds (MCQ,
   *  T/F, fill-in) are 0 or 1. Matching + free_response give partial. */
  score: number;
  /** True when the kid hit the bar for "got it." Binary kinds: score===1.
   *  Free-response: rubric average >= 3 (proficient). */
  correct: boolean;
  /** Matching only, populated when partial. */
  partial?: { gotPairs: number; totalPairs: number };
  /** Free-response only. The rubric breakdown drives the recap UI. */
  writingRubric?: {
    ideas: number;
    organization: number;
    voice: number;
    conventions: number;
    average: number;
    strength: string;
    growthTip: string;
  };
};

type SavedProgress = {
  idx?: number;
  answers?: PerQResult[];
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
  homeLanguage = null,
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
  /** Two-letter ISO code (es/zh/vi/...). When set, the intro screen
   *  surfaces a "Show in [native name]" chip that translates the
   *  passage on the fly via cached translation API. */
  homeLanguage?: string | null;
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
  const [pickedChoice, setPickedChoice] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const initialResults = (savedProgress?.answers as PerQResult[] | undefined) ?? [];
  const [perQResults, setPerQResults] = useState<PerQResult[]>(initialResults);
  // Weighted score, sum of per-Q scores. Carrots, percent, and the
  // results header all read from this. Matching pairs contribute a
  // fraction so a 4-of-6 match counts as ~0.67 of one question.
  const initialWeighted = initialResults.reduce((acc, r) => acc + (r.score ?? 0), 0);
  const [weightedScore, setWeightedScore] = useState<number>(initialWeighted);
  // Display-only "fully correct so far" count — drives the ✓ counter.
  const initialFullyCorrect = initialResults.filter((r) => r.correct).length;
  const [correctCount, setCorrectCount] = useState(initialFullyCorrect);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();

  // Free-response (writing) state. The rubric assessment, when set,
  // means we've scored this question already and can lock it.
  type WritingScore = {
    ideas: number;
    organization: number;
    voice: number;
    conventions: number;
    overallBand: string;
    strength: string;
    growthTip: string;
    encouragingClose: string;
  };
  const [writingScore, setWritingScore] = useState<WritingScore | null>(null);
  const [scoringWriting, setScoringWriting] = useState(false);
  const [writingErr, setWritingErr] = useState<string | null>(null);

  const q = questions[idx];

  /* ── correctness ─────────────────────────────────────────────── */
  function currentAnswerCorrect(): boolean {
    return scoreCurrent().score === 1;
  }

  /** Score 0..1 for the current question, plus the breakdown matching
   *  needs for its results recap line. */
  function scoreCurrent(): {
    score: number;
    partial?: { gotPairs: number; totalPairs: number };
  } {
    if (!q) return { score: 0 };
    if (q.kind === "multiple_choice") {
      return {
        score: !!pickedChoice && pickedChoice === String(q.correct) ? 1 : 0,
      };
    }
    if (q.kind === "true_false") {
      return { score: pickedChoice === String(q.correct) ? 1 : 0 };
    }
    if (q.kind === "fill_in_blank") {
      const accepted = (Array.isArray(q.correct) ? q.correct : []) as string[];
      const user = normalizeAnswer(typedAnswer);
      const ok =
        user.length > 0 && accepted.some((a) => normalizeAnswer(a) === user);
      return { score: ok ? 1 : 0 };
    }
    if (q.kind === "matching_pairs") {
      const pairs = (q.correct?.pairs ?? []) as {
        left: string;
        right: string;
      }[];
      if (pairs.length === 0) return { score: 0 };
      const got = pairs.filter((p) => matches[p.left] === p.right).length;
      return {
        score: got / pairs.length,
        partial: { gotPairs: got, totalPairs: pairs.length },
      };
    }
    if (q.kind === "free_response") {
      // Average rubric score (1-4) normalized to 0-1.
      if (!writingScore) return { score: 0 };
      const avg =
        (writingScore.ideas +
          writingScore.organization +
          writingScore.voice +
          writingScore.conventions) /
        4;
      return { score: Math.max(0, Math.min(1, (avg - 1) / 3)) };
    }
    return { score: 0 };
  }

  const isPicked = (() => {
    if (!q) return false;
    if (q.kind === "fill_in_blank") return typedAnswer.trim().length > 0;
    if (q.kind === "matching_pairs") {
      const pairs = (q.correct?.pairs ?? []) as { left: string; right: string }[];
      return pairs.length > 0 && pairs.every((p) => matches[p.left]);
    }
    if (q.kind === "free_response") {
      // Need at least ~10 words before scoring; lower bar for K-1.
      const words = typedAnswer.trim().split(/\s+/).filter(Boolean).length;
      return words >= 5;
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
    // Free-response routes through the AI rubric before reveal so we
    // have a writingScore to surface.
    if (q.kind === "free_response") {
      void scoreFreeResponse();
      return;
    }
    finishCheck();
  }

  /** Common path once we have a score — promote to revealed, update
   *  counters, log perQ result, persist progress. Used by every
   *  question kind. */
  function finishCheck() {
    setRevealed(true);
    const result = scoreCurrent();
    // Free-response uses a rubric — rubric average ≥ 3 (proficient)
    // counts as "got it" toward the ✓ counter, even though the
    // weightedScore is fractional. Other kinds stay binary.
    const isFreeResponse = q.kind === "free_response";
    const rubricAvg = writingScore
      ? (writingScore.ideas +
          writingScore.organization +
          writingScore.voice +
          writingScore.conventions) /
        4
      : 0;
    const wasFullyCorrect = isFreeResponse
      ? rubricAvg >= 3
      : result.score === 1;
    const entry: PerQResult = {
      questionId: q.id,
      score: result.score,
      correct: wasFullyCorrect,
      ...(result.partial ? { partial: result.partial } : {}),
      ...(isFreeResponse && writingScore
        ? {
            writingRubric: {
              ideas: writingScore.ideas,
              organization: writingScore.organization,
              voice: writingScore.voice,
              conventions: writingScore.conventions,
              average: rubricAvg,
              strength: writingScore.strength,
              growthTip: writingScore.growthTip,
            },
          }
        : {}),
    };
    if (wasFullyCorrect) setCorrectCount((n) => n + 1);
    setWeightedScore((s) => s + result.score);
    const nextAnswers = [...perQResults, entry];
    setPerQResults(nextAnswers);
    saveProgress(
      idx,
      correctCount + (wasFullyCorrect ? 1 : 0),
      nextAnswers,
    );
  }

  async function scoreFreeResponse() {
    setWritingErr(null);
    setScoringWriting(true);
    try {
      const res = await fetch("/api/student/writing-coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: q.prompt,
          response: typedAnswer,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setWritingErr(json.error ?? "Could not score that.");
        return;
      }
      setWritingScore(json.assessment as WritingScore);
      // Defer one tick so scoreCurrent() reads the new state.
      setTimeout(finishCheck, 0);
    } catch (e: any) {
      setWritingErr(e?.message ?? "Could not reach the coach.");
    } finally {
      setScoringWriting(false);
    }
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
    setWritingScore(null);
    setWritingErr(null);
    saveProgress(nextIdx, correctCount, perQResults);
  }

  function finalize() {
    setPhase("results");
    if (previewMode) return;
    setSaveErr(null);
    startSubmit(async () => {
      // Send the weighted score (rounded to nearest int) as
      // "questionsCorrect" so the existing endpoint logic still works.
      // Matching-pair partial credit feeds in via the rounded total.
      const weightedRounded = Math.round(weightedScore);
      const res = await fetch(saveEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          quizId,
          questionsAttempted: total,
          questionsCorrect: weightedRounded,
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
  const scorePct = total === 0 ? 0 : Math.round((weightedScore / total) * 100);
  const passed =
    typeof passThreshold !== "number" ? true : scorePct >= passThreshold;
  // Carrots scale with weighted score so partial-credit matches still
  // reward the kid for the pairs they got right.
  const carrotsEarned = Math.round(weightedScore * 5);
  // What we put on the score card. "4.5 / 6" feels weird so we round
  // to one decimal only when there's a partial; otherwise show ints.
  const hasPartial = perQResults.some((r) => r.score > 0 && r.score < 1);
  const displayScore = hasPartial
    ? Math.round(weightedScore * 10) / 10
    : Math.round(weightedScore);

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
        displayScore={displayScore}
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

          {q.kind === "free_response" && (
            <FreeResponseInput
              value={typedAnswer}
              onChange={setTypedAnswer}
              revealed={revealed}
              scoring={scoringWriting}
              score={writingScore}
              err={writingErr}
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
              disabled={!isPicked || scoringWriting}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40"
            >
              {scoringWriting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scoring…
                </>
              ) : q.kind === "free_response" ? (
                "Score my writing"
              ) : (
                "Check"
              )}
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

function FreeResponseInput({
  value,
  onChange,
  revealed,
  scoring,
  score,
  err,
}: {
  value: string;
  onChange: (next: string) => void;
  revealed: boolean;
  scoring: boolean;
  score: {
    ideas: number;
    organization: number;
    voice: number;
    conventions: number;
    overallBand: string;
    strength: string;
    growthTip: string;
    encouragingClose: string;
  } | null;
  err: string | null;
}) {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={revealed}
        rows={6}
        placeholder="Type your answer here. Take your time, you can write a few sentences."
        className={`w-full resize-y rounded-2xl border-2 bg-white px-4 py-3 text-base focus:outline-none dark:bg-slate-900 dark:text-white ${
          revealed
            ? "border-emerald-300"
            : "border-zinc-200 focus:border-indigo-400"
        }`}
        style={{ fontFamily: FRIENDLY_FONT, lineHeight: 1.7 }}
      />
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{wordCount} word{wordCount === 1 ? "" : "s"}</span>
        {wordCount < 5 && !revealed && (
          <span className="text-zinc-400">Try at least 5 words.</span>
        )}
      </div>
      {scoring && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Coach is reading your writing…
        </div>
      )}
      {err && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {err}
        </div>
      )}
      {revealed && score && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <RubricStat label="Ideas" v={score.ideas} />
            <RubricStat label="Organization" v={score.organization} />
            <RubricStat label="Voice" v={score.voice} />
            <RubricStat label="Conventions" v={score.conventions} />
          </div>
          {score.strength && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              <span className="font-bold">What worked: </span>
              {score.strength}
            </div>
          )}
          {score.growthTip && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              <span className="font-bold">Try next time: </span>
              {score.growthTip}
            </div>
          )}
          {score.encouragingClose && (
            <p className="text-center text-sm font-semibold text-zinc-600 dark:text-slate-300">
              {score.encouragingClose}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RubricStat({ label, v }: { label: string; v: number }) {
  const tone =
    v >= 4
      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200"
      : v >= 3
      ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-200"
      : v >= 2
      ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200"
      : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200";
  return (
    <div className={`rounded-2xl border-2 p-3 text-center ${tone}`}>
      <div className="text-2xl font-extrabold">{v}/4</div>
      <div className="text-[10px] font-bold uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
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
  displayScore,
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
  perQResults: PerQResult[];
  displayScore: number;
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
  const resultMap = new Map(perQResults.map((r) => [r.questionId, r]));
  return (
    <div className="space-y-4">
      <div
        className={`rounded-3xl border p-6 text-center shadow-sm ${
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
          {displayScore} / {total}
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

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          How did you do?
        </div>
        <ul className="mt-3 grid gap-2">
          {questions.map((q, i) => {
            const got = resultMap.get(q.id);
            const score = got?.score ?? null;
            const isWriting = !!got?.writingRubric;
            // Rubric average ≥ 3 = fully (green); 2 = partial (amber);
            // 1 = none (red). For non-writing questions stick with the
            // existing binary score split.
            const fully = isWriting
              ? (got?.writingRubric?.average ?? 0) >= 3
              : score === 1;
            const none = isWriting
              ? (got?.writingRubric?.average ?? 0) < 2
              : score === 0;
            const partial = isWriting
              ? !fully && !none
              : score !== null && score > 0 && score < 1;
            const tone = fully
              ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/30"
              : partial
              ? "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30"
              : none
              ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30"
              : "border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900";
            const badge = fully
              ? "bg-green-500 text-white"
              : partial
              ? "bg-amber-500 text-white"
              : none
              ? "bg-red-500 text-white"
              : "bg-zinc-300 text-white";
            return (
              <li
                key={q.id}
                className={`flex min-h-[64px] items-start gap-3 rounded-2xl border px-4 py-3 ${tone}`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${badge}`}
                >
                  {fully ? (
                    <Check className="h-3 w-3" />
                  ) : none ? (
                    <X className="h-3 w-3" />
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-slate-100">
                    {q.prompt}
                  </div>
                  {isWriting && got?.writingRubric && (
                    <div className="mt-1.5 text-xs font-semibold text-zinc-700 dark:text-slate-300">
                      Rubric: {got.writingRubric.ideas}/{4} ideas ·{" "}
                      {got.writingRubric.organization}/{4} org ·{" "}
                      {got.writingRubric.voice}/{4} voice ·{" "}
                      {got.writingRubric.conventions}/{4} conv ·{" "}
                      avg {got.writingRubric.average.toFixed(1)}
                    </div>
                  )}
                  {got?.partial && (
                    <div className="mt-1 text-xs font-semibold text-amber-800 dark:text-amber-200">
                      You matched {got.partial.gotPairs} of {got.partial.totalPairs} pairs.
                    </div>
                  )}
                  {!fully && !isWriting && q.hint && (
                    <div className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                      Hint: {q.hint}
                    </div>
                  )}
                  {isWriting && got?.writingRubric?.growthTip && !fully && (
                    <div className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                      Try next time: {got.writingRubric.growthTip}
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
