"use client";

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { useAudio } from "@/lib/audio/use-audio";
import { audioManager } from "@/lib/audio/audio-manager";
import { usePracticeStore } from "@/lib/stores/practice-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { safeValidate } from "@/lib/validate";
import { StandardsFileSchema, PracticeResultSchema } from "@/lib/schemas";
import { fadeUp, staggerContainer, wrongShake, feedbackSlideUp, popIn, scaleIn } from "@/lib/motion/variants";
import kStandards from "@/app/data/kindergarten-standards-questions.json";

/* ─── Types ──────────────────────────────────────────── */

interface Question {
  id: string;
  type: string;
  prompt: string;
  choices: string[];
  correct: string;
  hint: string;
  difficulty: number;
  audio_url?: string;
  hint_audio_url?: string;
}

interface Standard {
  standard_id: string;
  standard_description: string;
  domain: string;
  parent_tip: string;
  questions: Question[];
}

interface AnswerRecord {
  questionId: string;
  correct: boolean;
  selected: string;
}

/* ─── Constants ──────────────────────────────────────── */

const ALL_STANDARDS = safeValidate(StandardsFileSchema, kStandards).standards as Standard[];
const QUESTIONS_PER_SESSION = 5;
const XP_PER_CORRECT = 5;

const CORRECT_MESSAGES = [
  "Amazing!", "Great job!", "You got it!", "Nice catch!",
  "Super smart!", "Wonderful!", "Nailed it!", "Brilliant!",
];
const CORRECT_EMOJIS = ["⭐", "🎉", "✨", "🌟", "💫", "🎯"];

const INCORRECT_MESSAGES = [
  "Not quite!", "Almost!", "Good try!", "Keep learning!",
];

// Pre-recorded feedback audio (Google Cloud TTS)
const CORRECT_AUDIO = [
  "/audio/feedback/correct-1.mp3",
  "/audio/feedback/correct-2.mp3",
  "/audio/feedback/correct-3.mp3",
  "/audio/feedback/correct-4.mp3",
  "/audio/feedback/correct-5.mp3",
];
const INCORRECT_AUDIO = [
  "/audio/feedback/incorrect-1.mp3",
  "/audio/feedback/incorrect-2.mp3",
  "/audio/feedback/incorrect-3.mp3",
];

const ACCENT_COLORS = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa"]; // blue, green, orange, purple

// Per-choice highlight styles when TTS reads each card
const CARD_HIGHLIGHTS = [
  { shadow: "0 0 0 2px rgba(96,165,250,0.6), 0 0 12px rgba(96,165,250,0.25)", bg: "bg-blue-50/70 border-blue-300 dark:bg-blue-950/25 dark:border-blue-500/50" },
  { shadow: "0 0 0 2px rgba(74,222,128,0.6), 0 0 12px rgba(74,222,128,0.25)", bg: "bg-green-50/70 border-green-300 dark:bg-green-950/25 dark:border-green-500/50" },
  { shadow: "0 0 0 2px rgba(251,146,60,0.6), 0 0 12px rgba(251,146,60,0.25)", bg: "bg-orange-50/70 border-orange-300 dark:bg-orange-950/25 dark:border-orange-500/50" },
  { shadow: "0 0 0 2px rgba(167,139,250,0.6), 0 0 12px rgba(167,139,250,0.25)", bg: "bg-purple-50/70 border-purple-300 dark:bg-purple-950/25 dark:border-purple-500/50" },
];

/* ─── Helpers ────────────────────────────────────────── */

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function splitPrompt(prompt: string): { passage: string | null; question: string } {
  const parts = prompt.split("\n\n");
  if (parts.length >= 2) {
    return { passage: parts.slice(0, -1).join("\n\n"), question: parts[parts.length - 1] };
  }
  return { passage: null, question: prompt };
}

/** Strip emoji for timing calculation (mirrors generate-audio.js cleanText) */
function cleanForTiming(text: string): string {
  return text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, "").replace(/^Read:\s*/i, "").trim();
}

/** Calculate when each answer choice starts being read (in ms) */
function calculateChoiceTimings(prompt: string, choices: string[]): number[] {
  const CHARS_PER_SEC = 13.5; // ~13.5 chars/sec at 0.75 speaking rate
  const { passage, question } = splitPrompt(prompt);

  let t = 0;
  if (passage) {
    t += cleanForTiming(passage).length / CHARS_PER_SEC;
    t += 1.5; // SSML break after passage
  }
  t += cleanForTiming(question).length / CHARS_PER_SEC;
  t += 1.0; // SSML break after question

  // "Was it " prefix before choices
  t += 7 / CHARS_PER_SEC; // "Was it " = 7 chars

  const timings: number[] = [];
  for (let i = 0; i < choices.length; i++) {
    if (i === choices.length - 1 && choices.length > 1) {
      t += 4 / CHARS_PER_SEC; // "or " with comma pause
    }
    timings.push(t * 1000);
    t += cleanForTiming(choices[i]).length / CHARS_PER_SEC;
    // Commas handle natural pacing between choices
  }
  // End time: after last choice finishes + buffer
  timings.push((t + 0.5) * 1000);
  // Shift highlights 0.3s earlier so card lights up just BEFORE TTS reads it
  return timings.map((ms) => Math.max(0, ms - 300)); // [choice0Start, choice1Start, ..., endTime]
}

function getNextStandard(currentId: string): Standard | null {
  const idx = ALL_STANDARDS.findIndex((s) => s.standard_id === currentId);
  if (idx >= 0 && idx < ALL_STANDARDS.length - 1) return ALL_STANDARDS[idx + 1];
  return null;
}

function getStars(correct: number, total: number): number {
  if (correct === total) return 3;
  if (correct >= total - 1) return 2;
  if (correct >= 1) return 1;
  return 0;
}

/* ─── Audio Helpers ──────────────────────────────────── */

function MuteToggle() {
  const { muted, toggleMute } = useAudio();
  return (
    <button
      onClick={toggleMute}
      className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
        </svg>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Page wrapper                                          */
/* ═══════════════════════════════════════════════════════ */

export default function PracticePage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PracticeLoader />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white dark:bg-[#0f172a] gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-500 dark:border-indigo-900 dark:border-t-indigo-400 animate-spin" />
      <p className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">Loading questions...</p>
    </div>
  );
}

/* ─── Loader ─────────────────────────────────────────── */

function PracticeLoader() {
  const params = useSearchParams();
  const childId = params.get("child");
  const standardId = params.get("standard");
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!childId) { setLoading(false); return; }
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("children").select("*").eq("id", childId).single();
      if (data) setChild(data as Child);
      setLoading(false);
    }
    load();
  }, [childId]);

  if (loading) return <LoadingScreen />;

  const standard = ALL_STANDARDS.find((s) => s.standard_id === standardId);

  if (!child || !standard) {
    return (
      <div className="min-h-[100dvh] bg-white dark:bg-[#0f172a] flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 px-6">
          <div className="text-5xl">🔍</div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            {!child ? "No reader selected" : "Standard not found"}
          </h1>
          <Link href="/dashboard" className="inline-block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <PracticeSession child={child} standard={standard} />;
}

/* ═══════════════════════════════════════════════════════ */
/*  Practice Session                                       */
/* ═══════════════════════════════════════════════════════ */

function PracticeSession({ child, standard }: { child: Child; standard: Standard }) {
  const router = useRouter();
  const { playUrl, playSequence, unlockAudio, stop, preload, playCorrectChime, playIncorrectBuzz } = useAudio();

  // Zustand store
  const phase = usePracticeStore((s) => s.phase);
  const currentIdx = usePracticeStore((s) => s.currentIdx);
  const answers = usePracticeStore((s) => s.answers);
  const sessionXP = usePracticeStore((s) => s.sessionXP);
  const selected = usePracticeStore((s) => s.selected);
  const isCorrect = usePracticeStore((s) => s.isCorrect);
  const feedbackMsg = usePracticeStore((s) => s.feedbackMsg);
  const feedbackEmoji = usePracticeStore((s) => s.feedbackEmoji);
  const selectAnswer = usePracticeStore((s) => s.selectAnswer);
  const nextQuestion = usePracticeStore((s) => s.nextQuestion);
  const resetStore = usePracticeStore((s) => s.reset);

  const [saving, setSaving] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);
  const [xpFlash, setXpFlash] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const highlightTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevXPRef = useRef(sessionXP);

  const questions = useMemo(() => {
    if (standard.questions.length <= QUESTIONS_PER_SESSION) return standard.questions;
    return shuffleArray(standard.questions).slice(0, QUESTIONS_PER_SESSION);
  }, [standard]);

  // Reset store on mount/standard change
  useEffect(() => {
    resetStore();
    setAudioReady(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standard.standard_id]);

  // XP sparkle flash
  useEffect(() => {
    if (sessionXP > prevXPRef.current) {
      setXpFlash(true);
      const timer = setTimeout(() => setXpFlash(false), 600);
      prevXPRef.current = sessionXP;
      return () => clearTimeout(timer);
    }
  }, [sessionXP]);

  const q = questions[currentIdx];
  const totalQ = questions.length;

  /** Clear all highlight timers */
  const clearHighlights = useCallback(() => {
    highlightTimersRef.current.forEach(clearTimeout);
    highlightTimersRef.current = [];
    setHighlightedIdx(null);
  }, []);

  /** Start timed highlight sequence for answer cards */
  const startHighlightSequence = useCallback((question: Question) => {
    clearHighlights();
    if (!question.audio_url) return;

    const timings = calculateChoiceTimings(question.prompt, question.choices);
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < question.choices.length; i++) {
      timers.push(setTimeout(() => setHighlightedIdx(i), timings[i]));
    }
    // Clear highlight after last choice finishes
    const endTime = timings[timings.length - 1]; // the extra end marker
    timers.push(setTimeout(() => setHighlightedIdx(null), endTime));

    highlightTimersRef.current = timers;
  }, [clearHighlights]);

  // Clean up highlight timers on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      highlightTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  /** Handle "Tap to Start" — unlock audio, play intro, then begin */
  const handleStart = useCallback(async () => {
    await unlockAudio();
    if (audioManager) {
      await audioManager.play("/audio/kindergarten/intro.mp3");
    }
    setAudioReady(true);
  }, [unlockAudio]);

  /* ── Preload next question audio ── */
  useEffect(() => {
    if (phase !== "playing" || !audioReady) return;
    const nextIdx = currentIdx + 1;
    if (nextIdx < totalQ && questions[nextIdx]?.audio_url) {
      preload(questions[nextIdx].audio_url!);
    }
  }, [currentIdx, phase, audioReady, questions, totalQ, preload]);

  /* ── Play combined audio when question loads ── */
  useEffect(() => {
    if (phase !== "playing" || !audioReady) return;

    if (q.audio_url) {
      playUrl(q.audio_url);
      startHighlightSequence(q);
    }
    return () => { stop(); clearHighlights(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase, audioReady]);

  /* ── Play feedback audio ── */
  useEffect(() => {
    if (phase !== "feedback") return;
    if (isCorrect) {
      const url = CORRECT_AUDIO[Math.floor(Math.random() * CORRECT_AUDIO.length)];
      playUrl(url);
    } else {
      const url = INCORRECT_AUDIO[Math.floor(Math.random() * INCORRECT_AUDIO.length)];
      const items: Array<{ url?: string; delayMs?: number }> = [{ url }];
      if (q.hint_audio_url) {
        items.push({ delayMs: 500 }, { url: q.hint_audio_url });
      }
      playSequence(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Replay full audio from the beginning ── */
  const handleReplay = useCallback(() => {
    stop();
    clearHighlights();
    if (q.audio_url) {
      playUrl(q.audio_url);
      if (selected === null) {
        startHighlightSequence(q);
      }
    }
  }, [q, stop, clearHighlights, playUrl, startHighlightSequence, selected]);

  /* ── Handle answer selection ── */
  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return;
    // Stop any playing audio and highlights immediately
    stop();
    clearHighlights();
    const correct = choice === q.correct;

    selectAnswer(choice, correct, q.id, XP_PER_CORRECT, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);

    if (correct) {
      playCorrectChime();
    } else {
      playIncorrectBuzz();
    }
  }, [selected, q, selectAnswer, stop, clearHighlights, playCorrectChime, playIncorrectBuzz]);

  /* ── Continue to next question ── */
  const handleContinue = useCallback(() => {
    nextQuestion(totalQ);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [nextQuestion, totalQ]);

  /* ── Exit ── */
  const handleExit = useCallback(() => {
    stop();
    resetStore();
    router.push(`/dashboard`);
  }, [router, stop, resetStore]);

  if (phase === "complete") {
    const correctCount = answers.filter((a) => a.correct).length;
    return (
      <CompletionScreen
        child={child}
        standard={standard}
        answers={answers}
        questions={questions}
        correctCount={correctCount}
        xpEarned={correctCount * XP_PER_CORRECT}
        saving={saving}
        setSaving={setSaving}
        onRestart={resetStore}
      />
    );
  }

  const { passage, question } = splitPrompt(q.prompt);
  const progressPct = ((currentIdx + (phase === "feedback" ? 1 : 0)) / totalQ) * 100;

  /* ── "Tap to Start" intro screen ── */
  if (!audioReady) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0f172a] flex flex-col items-center justify-center px-6">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-6xl mb-6">🎧</div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
            Ready to practice?
          </h2>
          <p className="text-zinc-500 dark:text-slate-400 text-sm mb-2">
            {standard.standard_description}
          </p>
          <p className="text-zinc-400 dark:text-slate-500 text-xs mb-8">
            {totalQ} questions &middot; Audio will read each question aloud
          </p>
          <button
            onClick={handleStart}
            className="w-full max-w-xs mx-auto py-4 rounded-2xl font-extrabold text-lg text-white transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 4px 0 0 #4f46e5",
            }}
          >
            Tap to Start
          </button>
          <button
            onClick={handleExit}
            className="mt-4 text-sm text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 transition-colors"
          >
            &larr; Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="min-h-[100dvh] bg-gray-50 dark:bg-[#0f172a] flex flex-col overflow-y-auto">
      {/* ── Top bar: progress + close ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={handleExit}
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Exit"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 h-4 bg-zinc-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #4ade80, #22c55e)",
              boxShadow: "0 0 8px rgba(74, 222, 128, 0.4)",
            }}
          >
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                width: "50%",
              }}
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
          </div>
        </div>

        <motion.div
          className="flex items-center gap-1 bg-zinc-200 dark:bg-slate-800 px-3 py-1.5 rounded-full flex-shrink-0"
          animate={xpFlash ? {
            scale: [1, 1.25, 1],
            boxShadow: ["0 0 0 0px rgba(251,191,36,0)", "0 0 8px 4px rgba(251,191,36,0.5)", "0 0 0 0px rgba(251,191,36,0)"],
          } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm">⭐</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">{sessionXP}</span>
        </motion.div>

        <MuteToggle />
      </div>

      {/* ── Question area ── */}
      <motion.div
        className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 pb-32 flex flex-col"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        key={currentIdx}
      >
        {/* Passage */}
        {passage && (
          <motion.div variants={fadeUp} className="mb-5 rounded-2xl bg-white border border-zinc-200 dark:bg-slate-800/80 dark:border-slate-700 p-5">
            <p className="text-lg leading-relaxed text-zinc-900 dark:text-white/90 whitespace-pre-line">{passage}</p>
          </motion.div>
        )}

        {/* Question + replay button */}
        <motion.div variants={fadeUp} className="mb-6">
          <div className="flex items-start gap-2">
            <h2 className="text-[22px] font-bold text-zinc-900 dark:text-white leading-snug flex-1">
              {question}
            </h2>
            <button
              onClick={handleReplay}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Replay audio"
            >
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Answer choices */}
        <div className="flex flex-col gap-3">
          {q.choices.map((choice, i) => {
            const isSelected = selected === choice;
            const isCorrectChoice = choice === q.correct;
            const answered = selected !== null;
            const isHighlighted = highlightedIdx === i && !answered;
            const isBreathing = highlightedIdx === null && !answered && phase === "playing";
            const hl = CARD_HIGHLIGHTS[i % 4];

            let bg = isHighlighted
              ? hl.bg
              : "bg-white border-zinc-200 dark:bg-slate-800 dark:border-slate-600";
            let textColor = "text-zinc-900 dark:text-white";

            if (answered) {
              if (isSelected && isCorrect) {
                bg = "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 dark:bg-emerald-900/60";
                textColor = "text-emerald-800 dark:text-emerald-100";
              } else if (isSelected && !isCorrect) {
                bg = "bg-red-50 border-red-500 ring-2 ring-red-500/30 dark:bg-red-900/40";
                textColor = "text-red-800 dark:text-red-200";
              } else if (isCorrectChoice && !isCorrect) {
                bg = "bg-emerald-50/80 border-emerald-500 dark:bg-emerald-900/40";
                textColor = "text-emerald-800 dark:text-emerald-200";
              } else {
                bg = "bg-zinc-100 border-zinc-200 opacity-40 dark:bg-slate-800/40 dark:border-slate-700";
                textColor = "text-zinc-400 dark:text-slate-400";
              }
            }

            return (
              <motion.button
                key={choice}
                variants={fadeUp}
                animate={
                  isSelected && !isCorrect
                    ? { x: [0, -8, 8, -6, 6, -3, 3, 0], boxShadow: "none", transition: { duration: 0.5 } }
                    : isSelected && isCorrect
                    ? { scale: [1, 1.05, 1], boxShadow: "none", transition: { duration: 0.3 } }
                    : isHighlighted
                    ? { boxShadow: hl.shadow, transition: { duration: 0.3 } }
                    : isBreathing
                    ? { scale: [1, 1.01, 1], boxShadow: "0 0 0 0px transparent", transition: { scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }, boxShadow: { duration: 0.3 } } }
                    : { boxShadow: "0 0 0 0px transparent", scale: 1, transition: { duration: 0.3 } }
                }
                whileHover={!answered ? {
                  y: -3,
                  scale: 1.02,
                  boxShadow: `0 8px 20px ${ACCENT_COLORS[i % 4]}30`,
                  transition: { type: "spring", stiffness: 400, damping: 15 },
                } : undefined}
                whileTap={!answered ? { scale: 0.97, transition: { duration: 0.1 } } : undefined}
                onClick={() => handleAnswer(choice)}
                disabled={answered}
                className={`
                  group w-full text-left px-5 py-4 rounded-xl border-2 relative overflow-hidden
                  transition-[background-color,border-color,opacity] duration-200 outline-none
                  ${bg}
                  ${answered ? "cursor-default" : "cursor-pointer"}
                `}
                style={{ minHeight: 64 }}
              >
                {/* Color accent bar — widens on hover */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] group-hover:w-[5px] rounded-l-xl transition-all duration-200"
                  style={{ backgroundColor: ACCENT_COLORS[i % 4] }}
                />
                <div className="flex items-center gap-3">
                  {answered && isSelected && isCorrect && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {answered && isSelected && !isCorrect && (
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {answered && !isSelected && isCorrectChoice && !isCorrect && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className={`text-lg font-medium leading-snug flex-1 ${textColor}`}>
                    {choice}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Bottom feedback bar (Duolingo-style) ── */}
      <AnimatePresence>
        {phase === "feedback" && (
          <motion.div
            variants={feedbackSlideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed bottom-0 left-0 right-0 z-40 ${
              isCorrect
                ? "bg-emerald-600"
                : "bg-red-500"
            }`}
          >
            <div className="max-w-lg mx-auto px-5 py-5 safe-area-bottom">
              <div className="flex items-start gap-3 mb-4">
                {isCorrect ? (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xl">
                    {feedbackEmoji}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-extrabold text-lg">{feedbackMsg}</p>
                  {isCorrect && (
                    <p className="text-white/80 text-sm mt-0.5">+{XP_PER_CORRECT} XP</p>
                  )}
                  {!isCorrect && (
                    <>
                      <p className="text-white/90 text-sm font-bold mt-1">
                        Correct answer: {q.correct}
                      </p>
                      <p className="text-white/70 text-sm mt-1">{q.hint}</p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={handleContinue}
                className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all active:scale-[0.97] ${
                  isCorrect
                    ? "bg-white text-emerald-700 hover:bg-emerald-50"
                    : "bg-white text-red-600 hover:bg-red-50"
                }`}
              >
                CONTINUE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Completion Screen                                      */
/* ═══════════════════════════════════════════════════════ */

function CompletionScreen({
  child,
  standard,
  answers,
  questions,
  correctCount,
  xpEarned,
  saving,
  setSaving,
  onRestart,
}: {
  child: Child;
  standard: Standard;
  answers: AnswerRecord[];
  questions: Question[];
  correctCount: number;
  xpEarned: number;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onRestart: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const { playUrl } = useAudio();
  const darkMode = useThemeStore((s) => s.darkMode);
  const totalQ = questions.length;
  const stars = getStars(correctCount, totalQ);
  const nextStandard = getNextStandard(standard.standard_id);

  // Confetti pieces
  const confettiPieces = useMemo(() => {
    if (correctCount < totalQ - 1) return [];
    const count = correctCount === totalQ ? 80 : 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      size: 6 + Math.random() * 8,
      color: ["#4ade80", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e"][i % 7],
      xDrift: (Math.random() - 0.5) * 100,
    }));
  }, [correctCount, totalQ]);

  let title: string;
  let subtitle: string;

  if (stars === 3) {
    title = "Perfect Score!";
    subtitle = `You mastered ${standard.standard_id}!`;
  } else if (stars === 2) {
    title = "Great Work!";
    subtitle = "Almost perfect — keep it up!";
  } else if (stars === 1) {
    title = "Good Effort!";
    subtitle = "Practice makes perfect!";
  } else {
    title = "Keep Trying!";
    subtitle = "Let's give it another go!";
  }

  /* ── Play completion audio ── */
  useEffect(() => {
    const url = correctCount === totalQ
      ? "/audio/feedback/complete-perfect.mp3"
      : correctCount >= totalQ - 1
      ? "/audio/feedback/complete-good.mp3"
      : "/audio/feedback/complete-ok.mp3";
    playUrl(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Save results ── */
  useEffect(() => {
    if (saved || saving) return;
    setSaving(true);

    async function save() {
      const supabase = supabaseBrowser();

      const payload = safeValidate(PracticeResultSchema, {
        child_id: child.id,
        standard_id: standard.standard_id,
        questions_attempted: totalQ,
        questions_correct: correctCount,
        xp_earned: xpEarned,
      });

      await supabase.from("practice_results").insert(payload);

      if (xpEarned > 0) {
        const { data: current } = await supabase
          .from("children")
          .select("xp")
          .eq("id", child.id)
          .single();
        if (current) {
          await supabase
            .from("children")
            .update({ xp: (current.xp || 0) + xpEarned })
            .eq("id", child.id);
        }
      }

      setSaved(true);
      setSaving(false);
    }

    save();
  }, [saved, saving, child.id, standard.standard_id, totalQ, correctCount, xpEarned, setSaving]);

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0f172a] relative overflow-hidden flex flex-col">
      {/* Confetti */}
      {confettiPieces.map((c) => (
        <motion.div
          key={c.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${c.left}%`,
            top: -20,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
          }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: "100vh",
            x: c.xDrift,
            rotate: 720,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 2.5, delay: c.delay, ease: "easeIn" }}
        />
      ))}

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10 max-w-lg mx-auto w-full"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Stars */}
        <motion.div variants={scaleIn} className="flex items-end gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              variants={popIn}
              className={`${s === 2 ? "mb-2" : ""}`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`${s === 2 ? "w-16 h-16" : "w-12 h-12"}`}
                fill={s <= stars ? "#facc15" : darkMode ? "#334155" : "#d4d4d8"}
                stroke={s <= stars ? "#eab308" : darkMode ? "#475569" : "#a1a1aa"}
                strokeWidth="0.5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* Title */}
        <motion.h1 variants={fadeUp} className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight text-center mb-1">
          {title}
        </motion.h1>
        <motion.p variants={fadeUp} className="text-zinc-500 dark:text-slate-400 text-center mb-8">{subtitle}</motion.p>

        {/* Score + XP */}
        <motion.div variants={fadeUp} className="flex gap-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">{correctCount}/{totalQ}</div>
            <div className="text-xs text-zinc-500 dark:text-slate-500 mt-1 font-medium">Correct</div>
          </div>
          <div className="w-px bg-zinc-300 dark:bg-slate-700" />
          <div className="text-center">
            <div className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">+{xpEarned}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">XP Earned</div>
          </div>
        </motion.div>

        {/* Question results */}
        <motion.div variants={fadeUp} className="w-full space-y-2 mb-8">
          {questions.map((qItem, i) => {
            const answer = answers[i];
            if (!answer) return null;
            const { question: qText } = splitPrompt(qItem.prompt);
            return (
              <div
                key={qItem.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  answer.correct ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  answer.correct ? "bg-emerald-500" : "bg-red-500"
                }`}>
                  {answer.correct ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-zinc-600 dark:text-slate-300 flex-1 min-w-0 truncate">{qText}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={fadeUp} className="w-full space-y-3">
          {nextStandard && (
            <Link
              href={`/practice?child=${child.id}&standard=${nextStandard.standard_id}`}
              className="block w-full text-center py-4 rounded-2xl font-extrabold text-base text-emerald-900 transition-all active:scale-[0.97]"
              style={{ background: "linear-gradient(90deg, #4ade80, #22c55e)", boxShadow: "0 4px 0 0 #16a34a" }}
            >
              Next Standard →
            </Link>
          )}

          <button
            onClick={onRestart}
            className="w-full py-4 rounded-2xl border-2 border-zinc-300 text-zinc-900 dark:border-slate-600 dark:text-white font-bold text-base hover:bg-zinc-100 dark:hover:bg-slate-800 transition-all active:scale-[0.97]"
          >
            Practice Again
          </button>

          <Link
            href={`/dashboard`}
            className="block w-full text-center py-3 rounded-2xl text-zinc-500 dark:text-slate-400 font-semibold text-sm hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Back to Dashboard
          </Link>
        </motion.div>

        {saving && (
          <p className="text-center text-xs text-slate-500 mt-4 animate-pulse">Saving results...</p>
        )}
      </motion.div>
    </div>
  );
}
