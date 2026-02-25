"use client";

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { useAudio } from "@/lib/audio/use-audio";
import { playAudio as playStaticAudio, playAudioUrl, stopAudio as stopStaticAudio } from "@/lib/audio";
import { usePracticeStore } from "@/lib/stores/practice-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { safeValidate } from "@/lib/validate";
import { StandardsFileSchema, PracticeResultSchema } from "@/lib/schemas";
import { fadeUp, staggerContainer, feedbackSlideUp, popIn, scaleIn } from "@/lib/motion/variants";
import { SentenceBuild } from "@/app/components/practice/SentenceBuild";
import { CategorySort } from "@/app/components/practice/CategorySort";
import { MissingWord } from "@/app/components/practice/MissingWord";
import kStandards from "@/app/data/kindergarten-standards-questions.json";
import { getDailyMultiplier, getSessionStreakTier } from "@/lib/carrots/multipliers";
import { StreakFire } from "@/app/_components/StreakFire";

/* ─── Types ──────────────────────────────────────────── */

interface Question {
  id: string;
  type: string;
  prompt: string;
  choices?: string[];
  correct: string;
  hint: string;
  difficulty: number;
  audio_url?: string;
  hint_audio_url?: string;
  words?: string[];
  sentence_hint?: string;
  sentence_audio_url?: string;
  categories?: string[];
  category_items?: Record<string, string[]>;
  items?: string[];
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
const CARROTS_PER_CORRECT = 5;

/* ─── Kid-friendly lesson titles & prompts ────────────── */

const KID_TITLES: Record<string, string> = {
  "RL.K.1": "Key Details in a Story",
  "RL.K.2": "Retell a Story",
  "RL.K.3": "Story People & Places",
  "RL.K.4": "Discover New Words",
  "RL.K.5": "Book Types",
  "RL.K.6": "Authors & Illustrators",
  "RL.K.7": "Story Art",
  "RL.K.9": "Compare Two Stories",
  "RI.K.1": "Find the Facts",
  "RI.K.2": "What's the Main Topic?",
  "RI.K.3": "Linking Ideas Together",
  "RI.K.4": "Info Words",
  "RI.K.5": "Book Parts",
  "RI.K.6": "Who Wrote This?",
  "RI.K.7": "Art & Text Clues",
  "RI.K.8": "Author's Reasons",
  "RI.K.9": "Compare Two Texts",
  "RF.K.1a": "Word Tracking",
  "RF.K.1b": "Print Concepts",
  "RF.K.1c": "Word Spaces",
  "RF.K.1d": "ABCs",
  "RF.K.2a": "Rhyme Time",
  "RF.K.2b": "Syllable Clap",
  "RF.K.2c": "Blend It Together",
  "RF.K.2d": "Sound It Out",
  "RF.K.2e": "New Sounds",
  "RF.K.3a": "Letter Sounds",
  "RF.K.3b": "Vowel Sounds",
  "RF.K.3c": "Sight Words",
  "RF.K.3d": "Spelling Clues",
  "RF.K.4": "Reading Time",
  "K.L.1": "Grammar Fun",
  "K.L.2": "Punctuation Power",
  "K.L.4": "Word Meaning",
  "K.L.5": "Word Play",
  "K.L.6": "Vocabulary Builder",
};

const KID_PROMPTS: Record<string, string> = {
  "RL.K.1": "Can you find the important parts of a story? Let's find out!",
  "RL.K.2": "Can you retell what happened in a story? Let's try!",
  "RL.K.3": "Who's in the story and where does it happen? Let's explore!",
  "RL.K.4": "Time to discover cool new words hiding in stories!",
  "RL.K.5": "Do you know your book types? Let's see!",
  "RL.K.6": "Let's learn about the people who make books!",
  "RL.K.7": "How do pictures and words work together? Let's look!",
  "RL.K.9": "Two stories, one challenge — spot the differences!",
  "RI.K.1": "Can you hunt for facts and details? Let's go!",
  "RI.K.2": "What's the big idea? Let's figure it out together!",
  "RI.K.3": "How do ideas connect? Let's link them up!",
  "RI.K.4": "Time to unlock tricky words in real texts!",
  "RI.K.5": "Do you know the parts of a book? Let's check!",
  "RI.K.6": "Who wrote this and why? Let's investigate!",
  "RI.K.7": "Pictures + words = clues! Let's put them together!",
  "RI.K.8": "Why did the author write this? Let's figure it out!",
  "RI.K.9": "Two texts, same topic — what's different? Let's compare!",
  "RF.K.1a": "Follow the words with your finger — let's track them!",
  "RF.K.1b": "Let's learn how books and words work!",
  "RF.K.1c": "Can you spot the spaces between words? Let's look!",
  "RF.K.1d": "A-B-C, let's go! Time to practice your letters!",
  "RF.K.2a": "Cat, hat, bat — can you find the rhymes?",
  "RF.K.2b": "Clap it out! How many syllables can you hear?",
  "RF.K.2c": "Put the sounds together to make a word!",
  "RF.K.2d": "Break it apart! What sounds do you hear?",
  "RF.K.2e": "New sounds to discover — let's listen carefully!",
  "RF.K.3a": "What sound does each letter make? Let's practice!",
  "RF.K.3b": "A, E, I, O, U — time to learn vowel sounds!",
  "RF.K.3c": "Can you read these important words super fast?",
  "RF.K.3d": "Use letter clues to figure out new words!",
  "RF.K.4": "Time to read like a superstar! Let's go!",
  "K.L.1": "Nouns, verbs, and more — let's build sentences!",
  "K.L.2": "Capitals and periods — let's get them right!",
  "K.L.4": "What does that word mean? Let's find out!",
  "K.L.5": "Opposites, categories, and more — let's play with words!",
  "K.L.6": "Big words, small words — let's grow your vocabulary!",
};

const DOMAIN_EMOJI: Record<string, string> = {
  "Reading Literature": "📖",
  "Reading Informational Text": "📰",
  "Foundational Skills": "🔤",
  "Language": "💬",
};

const CORRECT_MESSAGES = [
  "Amazing!", "Great job!", "You got it!", "Nice catch!",
  "Super smart!", "Wonderful!", "Nailed it!", "Brilliant!",
];
const CORRECT_EMOJIS = ["⭐", "🎉", "✨", "🌟", "💫", "🎯"];

const INCORRECT_MESSAGES = [
  "Not quite!", "Almost!", "Good try!", "Keep learning!",
];

// Feedback audio files (static .mp3 in /audio/feedback/)
const CORRECT_AUDIO = ["correct-1", "correct-2", "correct-3", "correct-4", "correct-5"];
const INCORRECT_AUDIO = ["incorrect-1", "incorrect-2", "incorrect-3"];

const ACCENT_COLORS = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa"]; // blue, green, orange, purple


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
  const typesParam = params.get("types"); // e.g. "sentence_build,category_sort"
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

  // Build a virtual standard when filtering by question types across all standards
  let standard: Standard | undefined;
  if (typesParam) {
    const types = new Set(typesParam.split(","));
    const filtered = ALL_STANDARDS.flatMap((s) =>
      s.questions.filter((q) => types.has(q.type))
    );
    if (filtered.length > 0) {
      standard = {
        standard_id: "mixed",
        standard_description: "Interactive Questions",
        domain: "Mixed",
        parent_tip: "",
        questions: filtered,
      };
    }
  } else {
    standard = ALL_STANDARDS.find((s) => s.standard_id === standardId);
  }

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
  const { unlockAudio, stop, playCorrectChime, playIncorrectBuzz } = useAudio();

  // Zustand store
  const phase = usePracticeStore((s) => s.phase);
  const currentIdx = usePracticeStore((s) => s.currentIdx);
  const answers = usePracticeStore((s) => s.answers);
  const sessionCarrots = usePracticeStore((s) => s.sessionCarrots);
  const selected = usePracticeStore((s) => s.selected);
  const isCorrect = usePracticeStore((s) => s.isCorrect);
  const feedbackMsg = usePracticeStore((s) => s.feedbackMsg);
  const feedbackEmoji = usePracticeStore((s) => s.feedbackEmoji);
  const selectAnswer = usePracticeStore((s) => s.selectAnswer);
  const nextQuestion = usePracticeStore((s) => s.nextQuestion);
  const resetStore = usePracticeStore((s) => s.reset);

  const [saving, setSaving] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [carrotFlash, setCarrotFlash] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const mysteryBoxMultiplier = usePracticeStore((s) => s.mysteryBoxMultiplier);
  const clearMysteryBoxMultiplier = usePracticeStore((s) => s.clearMysteryBoxMultiplier);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCarrotsRef = useRef(sessionCarrots);

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

  // Carrot sparkle flash
  useEffect(() => {
    if (sessionCarrots > prevCarrotsRef.current) {
      setCarrotFlash(true);
      const timer = setTimeout(() => setCarrotFlash(false), 600);
      prevCarrotsRef.current = sessionCarrots;
      return () => clearTimeout(timer);
    }
  }, [sessionCarrots]);

  const q = questions[currentIdx];
  const totalQ = questions.length;

  /** Handle "Tap to Start" — unlock audio, then begin */
  const handleStart = useCallback(async () => {
    await unlockAudio();
    setAudioReady(true);
  }, [unlockAudio]);

  /* ── Play static audio when question loads ── */
  useEffect(() => {
    if (phase !== "playing" || !audioReady) return;
    // Play question audio from audio_url in JSON (fails silently if not found)
    const url = q.audio_url;
    if (url) playAudioUrl(url);
    return () => { stopStaticAudio(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase, audioReady]);

  /* ── Play feedback audio ── */
  useEffect(() => {
    if (phase !== "feedback") return;
    if (isCorrect) {
      const file = CORRECT_AUDIO[Math.floor(Math.random() * CORRECT_AUDIO.length)];
      playStaticAudio("feedback", file);
    } else {
      const file = INCORRECT_AUDIO[Math.floor(Math.random() * INCORRECT_AUDIO.length)];
      playStaticAudio("feedback", file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Replay audio ── */
  const handleReplay = useCallback(() => {
    stop();
    stopStaticAudio();
    const url = q.audio_url;
    if (url) playAudioUrl(url);
  }, [q.audio_url, stop]);

  /* ── Handle answer selection ── */
  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return;
    stop();
    stopStaticAudio();
    const correct = choice === q.correct;

    if (correct) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      const daily = getDailyMultiplier(child.streak_days);
      const session = getSessionStreakTier(newConsecutive);
      const carrots = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier * mysteryBoxMultiplier);
      selectAnswer(choice, true, q.id, carrots, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playCorrectChime();
    } else {
      setConsecutiveCorrect(0);
      selectAnswer(choice, false, q.id, CARROTS_PER_CORRECT, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playIncorrectBuzz();
    }
  }, [selected, q, selectAnswer, stop, playCorrectChime, playIncorrectBuzz, consecutiveCorrect, child.streak_days, mysteryBoxMultiplier]);

  /* ── Handle sentence build answer ── */
  const handleSentenceBuildAnswer = useCallback((isCorrect: boolean, placedSentence: string) => {
    if (selected !== null) return;
    stop();
    stopStaticAudio();

    if (isCorrect) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      const daily = getDailyMultiplier(child.streak_days);
      const session = getSessionStreakTier(newConsecutive);
      const carrots = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier * mysteryBoxMultiplier);
      selectAnswer(placedSentence, true, q.id, carrots, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playCorrectChime();
    } else {
      setConsecutiveCorrect(0);
      selectAnswer(placedSentence, false, q.id, CARROTS_PER_CORRECT, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playIncorrectBuzz();
    }
  }, [selected, q, selectAnswer, stop, playCorrectChime, playIncorrectBuzz, consecutiveCorrect, child.streak_days, mysteryBoxMultiplier]);

  /* ── Handle category sort answer ── */
  const handleCategorySortAnswer = useCallback((isCorrect: boolean, answer: string) => {
    if (selected !== null) return;
    stop();
    stopStaticAudio();

    if (isCorrect) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      const daily = getDailyMultiplier(child.streak_days);
      const session = getSessionStreakTier(newConsecutive);
      const carrots = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier * mysteryBoxMultiplier);
      selectAnswer(answer, true, q.id, carrots, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playCorrectChime();
    } else {
      setConsecutiveCorrect(0);
      selectAnswer(answer, false, q.id, CARROTS_PER_CORRECT, CORRECT_MESSAGES, CORRECT_EMOJIS, INCORRECT_MESSAGES);
      playIncorrectBuzz();
    }
  }, [selected, q, selectAnswer, stop, playCorrectChime, playIncorrectBuzz, consecutiveCorrect, child.streak_days, mysteryBoxMultiplier]);

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

  // Clear mystery box multiplier when session completes
  useEffect(() => {
    if (phase === "complete" && mysteryBoxMultiplier > 1) {
      clearMysteryBoxMultiplier();
    }
  }, [phase, mysteryBoxMultiplier, clearMysteryBoxMultiplier]);

  if (phase === "complete") {
    const correctCount = answers.filter((a) => a.correct).length;
    return (
      <CompletionScreen
        child={child}
        standard={standard}
        answers={answers}
        questions={questions}
        correctCount={correctCount}
        carrotsEarned={sessionCarrots}
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
    const lessonTitle = KID_TITLES[standard.standard_id] ?? standard.standard_id;
    const lessonPrompt = KID_PROMPTS[standard.standard_id] ?? standard.standard_description;
    const lessonEmoji = DOMAIN_EMOJI[standard.domain] ?? "📖";
    const maxCarrots = totalQ * CARROTS_PER_CORRECT;

    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0f172a] flex flex-col items-center justify-center px-6">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* ── Elevated card ── */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
            {/* ── Gradient header strip ── */}
            <div
              className="relative px-6 pt-8 pb-10 text-center overflow-hidden"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              {/* Decorative dots / sparkles */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-3 left-4 w-2 h-2 rounded-full bg-white/15" />
                <div className="absolute top-6 left-12 w-1.5 h-1.5 rounded-full bg-white/10" />
                <div className="absolute top-4 right-6 w-2.5 h-2.5 rounded-full bg-white/12" />
                <div className="absolute top-8 right-14 w-1.5 h-1.5 rounded-full bg-white/10" />
                <div className="absolute bottom-4 left-8 w-2 h-2 rounded-full bg-white/10" />
                <div className="absolute bottom-6 right-10 w-1 h-1 rounded-full bg-white/15" />
                <div className="absolute top-2 left-1/2 w-1 h-1 rounded-full bg-white/20" />
                <div className="absolute bottom-3 left-1/3 w-1.5 h-1.5 rounded-full bg-white/8" />
              </div>

              <div className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="text-5xl">{lessonEmoji}</span>
              </div>
              <h2 className="relative text-xl font-extrabold text-white">
                Let&apos;s go, {child.first_name}!
              </h2>
            </div>

            {/* ── Content area ── */}
            <div className="px-6 pt-6 pb-6">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-2">
                {lessonTitle}
              </h3>
              <p className="text-zinc-500 dark:text-slate-400 text-sm leading-relaxed mb-5">
                {lessonPrompt}
              </p>

              {/* Info row */}
              <div className="flex flex-col gap-2 text-xs text-zinc-400 dark:text-slate-500 mb-6">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" />
                    </svg>
                    {totalQ} questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                    Audio enabled
                  </span>
                </div>
                <span className="text-orange-500 dark:text-orange-400 font-medium">
                  Earn up to {maxCarrots} XP 🥕
                </span>
              </div>

              {/* Start button */}
              <button
                onClick={handleStart}
                className="w-full py-4 rounded-2xl font-extrabold text-lg text-white transition-all hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 0 0 #4f46e5",
                }}
              >
                Tap to Start
              </button>
            </div>
          </div>

          {/* ── Back link (below card) ── */}
          <div className="text-center mt-5">
            <button
              onClick={handleExit}
              className="text-sm text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300 transition-colors"
            >
              &larr; Back
            </button>
          </div>
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
          animate={carrotFlash ? {
            scale: [1, 1.25, 1],
            boxShadow: ["0 0 0 0px rgba(251,191,36,0)", "0 0 8px 4px rgba(251,191,36,0.5)", "0 0 0 0px rgba(251,191,36,0)"],
          } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm">🥕</span>
          <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">{sessionCarrots}</span>
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
        {/* Streak fire indicator */}
        {consecutiveCorrect >= 3 && (
          <div className="flex justify-center mb-3">
            <StreakFire consecutiveCorrect={consecutiveCorrect} />
          </div>
        )}

        {/* Sentence build — renders its own prompt/passage */}
        {q.type === "sentence_build" && q.words ? (
          <SentenceBuild
            prompt={question}
            passage={passage}
            words={q.words}
            correctSentence={q.correct}
            sentenceHint={q.sentence_hint}
            sentenceAudioUrl={q.sentence_audio_url}
            answered={selected !== null}
            onAnswer={handleSentenceBuildAnswer}
          />
        ) : q.type === "missing_word" && (q as any).sentence_words && (q as any).missing_choices && (q as any).blank_index !== undefined ? (
          <MissingWord
            prompt={question}
            sentenceWords={(q as any).sentence_words}
            blankIndex={(q as any).blank_index}
            choices={(q as any).missing_choices}
            sentenceHint={(q as any).sentence_hint}
            sentenceAudioUrl={(q as any).sentence_audio_url}
            answered={selected !== null}
            onAnswer={(isCorrect, choice) => handleSentenceBuildAnswer(isCorrect, choice)}
          />
        ) : q.type === "category_sort" && q.categories && q.category_items && q.items ? (
          <CategorySort
            prompt={question}
            categories={q.categories}
            categoryItems={q.category_items}
            items={q.items}
            answered={selected !== null}
            onAnswer={handleCategorySortAnswer}
            onCorrectPlace={playCorrectChime}
            onIncorrectPlace={playIncorrectBuzz}
          />
        ) : (
        <>
        {/* ── Progress dots ── */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mb-5">
          {Array.from({ length: totalQ }).map((_, i) => {
            const answer = answers[i];
            const isCurrent = i === currentIdx;
            let dotClass = "bg-zinc-300 dark:bg-slate-600"; // upcoming
            if (answer) {
              dotClass = answer.correct
                ? "bg-emerald-500"
                : "bg-red-400";
            } else if (isCurrent) {
              dotClass = "bg-indigo-500";
            }
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${dotClass} ${
                  isCurrent ? "w-3.5 h-3.5" : "w-2.5 h-2.5"
                }`}
              />
            );
          })}
        </motion.div>

        {/* Passage */}
        {passage && (
          <motion.div variants={fadeUp} className="mb-5 rounded-2xl bg-white border border-zinc-200 dark:bg-slate-800/80 dark:border-slate-700 p-5">
            <p className="text-lg leading-relaxed text-zinc-900 dark:text-white/90 whitespace-pre-line">{passage}</p>
          </motion.div>
        )}

        {/* Question + replay button */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="flex items-start gap-3 max-w-[600px] mx-auto">
            <h2 className="text-[28px] md:text-[36px] font-bold text-zinc-900 dark:text-white leading-[1.5] text-center flex-1">
              {question}
            </h2>
            <button
              onClick={handleReplay}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors flex-shrink-0 mt-1"
              aria-label="Replay audio"
            >
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Answer choices — 2×2 grid */}
        <div className={`grid gap-3 ${
          (q.choices?.length ?? 0) === 2
            ? "grid-cols-2"
            : (q.choices?.length ?? 0) === 3
            ? "grid-cols-2"
            : "grid-cols-2"
        }`}>
          {(q.choices ?? []).map((choice, i) => {
            const isSelected = selected === choice;
            const isCorrectChoice = choice === q.correct;
            const answered = selected !== null;
            const choiceCount = q.choices?.length ?? 0;
            // Center the last item when 3 choices
            const isLastOdd = choiceCount === 3 && i === 2;

            let bg = "bg-white border-zinc-200 dark:bg-slate-800 dark:border-slate-600 shadow-sm";
            let textColor = "text-zinc-900 dark:text-white";
            let borderExtra = "";

            if (!answered && isSelected) {
              borderExtra = "border-indigo-500 ring-2 ring-indigo-500/30";
            } else if (answered) {
              if (isSelected && isCorrect) {
                bg = "bg-emerald-50 border-emerald-500 shadow-sm dark:bg-emerald-900/60";
                textColor = "text-emerald-800 dark:text-emerald-100";
              } else if (isSelected && !isCorrect) {
                bg = "bg-red-50 border-red-500 shadow-sm dark:bg-red-900/40";
                textColor = "text-red-800 dark:text-red-200";
              } else if (isCorrectChoice && !isCorrect) {
                bg = "bg-emerald-50/80 border-emerald-500 shadow-sm dark:bg-emerald-900/40";
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
                  answered && isSelected && !isCorrect
                    ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
                    : answered && isSelected && isCorrect
                    ? { scale: [1, 1.08, 1], transition: { duration: 0.3 } }
                    : {}
                }
                whileTap={!answered ? { scale: 0.95, transition: { duration: 0.1 } } : undefined}
                onClick={() => handleAnswer(choice)}
                disabled={answered}
                className={`
                  flex items-center justify-center px-4 py-4 rounded-2xl border-2 relative
                  transition-[background-color,border-color,opacity,box-shadow] duration-200 outline-none
                  min-h-[80px] md:min-h-[100px]
                  ${bg} ${borderExtra}
                  ${answered ? "cursor-default" : "cursor-pointer hover:scale-[1.04] hover:shadow-lg active:scale-[0.95]"}
                  ${isLastOdd ? "col-span-2 max-w-[50%] mx-auto" : ""}
                `}
              >
                <div className="flex items-center justify-center gap-2">
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
                  <span className={`text-[22px] md:text-[26px] font-bold leading-snug text-center ${textColor}`}>
                    {choice}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
        </>
        )}
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
                  {isCorrect && (() => {
                    const daily = getDailyMultiplier(child.streak_days);
                    const session = getSessionStreakTier(consecutiveCorrect);
                    const earned = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier * mysteryBoxMultiplier);
                    const hasBonus = daily.multiplier > 1 || session.multiplier > 1 || mysteryBoxMultiplier > 1;
                    return (
                      <p className="text-white/80 text-sm mt-0.5">
                        +{earned} 🥕{hasBonus ? " (Bonus!)" : ""}
                      </p>
                    );
                  })()}
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
  carrotsEarned,
  saving,
  setSaving,
  onRestart,
}: {
  child: Child;
  standard: Standard;
  answers: AnswerRecord[];
  questions: Question[];
  correctCount: number;
  carrotsEarned: number;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onRestart: () => void;
}) {
  const [saved, setSaved] = useState(false);
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
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    let file: string;
    if (correctCount === totalQ) {
      file = pick(["complete-perfect-1", "complete-perfect-2", "complete-perfect-3"]);
    } else if (correctCount === totalQ - 1) {
      file = pick(["complete-good-1", "complete-good-2", "complete-good-3"]);
    } else if (correctCount === totalQ - 2) {
      file = pick(["complete-ok-1", "complete-ok-2", "complete-ok-3"]);
    } else {
      file = pick(["complete-try-1", "complete-try-2", "complete-try-3"]);
    }
    playStaticAudio("feedback", file);
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
        carrots_earned: carrotsEarned,
      });

      await supabase.from("practice_results").insert(payload);

      if (carrotsEarned > 0) {
        const { data: current } = await supabase
          .from("children")
          .select("carrots")
          .eq("id", child.id)
          .single();
        if (current) {
          await supabase
            .from("children")
            .update({ carrots: (current.carrots || 0) + carrotsEarned })
            .eq("id", child.id);
        }
      }

      setSaved(true);
      setSaving(false);
    }

    save();
  }, [saved, saving, child.id, standard.standard_id, totalQ, correctCount, carrotsEarned, setSaving]);

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

        {/* Score + Carrots */}
        <motion.div variants={fadeUp} className="flex gap-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-zinc-900 dark:text-white">{correctCount}/{totalQ}</div>
            <div className="text-xs text-zinc-500 dark:text-slate-500 mt-1 font-medium">Correct</div>
          </div>
          <div className="w-px bg-zinc-300 dark:bg-slate-700" />
          <div className="text-center">
            <div className="text-4xl font-extrabold text-orange-600 dark:text-orange-400">+{carrotsEarned}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Carrots Earned</div>
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
