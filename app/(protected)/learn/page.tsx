"use client";

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import { useAudio } from "@/lib/audio/use-audio";
import { getAudioUrl } from "@/lib/audio";
import { usePracticeStore } from "@/lib/stores/practice-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { safeValidate } from "@/lib/validate";
import { PracticeResultSchema } from "@/lib/schemas";
import { levelNameToGradeKey } from "@/lib/assessment/questions";
import { findStandardById } from "@/lib/data/all-standards";
import { fadeUp, fadeIn, staggerContainer, feedbackSlideUp, popIn, scaleIn } from "@/lib/motion/variants";
import { getDailyMultiplier, getSessionStreakTier } from "@/lib/carrots/multipliers";
import { SentenceBuild } from "@/app/components/practice/SentenceBuild";
import { CategorySort } from "@/app/components/practice/CategorySort";
import { MissingWord } from "@/app/components/practice/MissingWord";
import { TapToPair } from "@/app/components/practice/TapToPair";
import { SoundMachine } from "@/app/components/practice/SoundMachine";
import { LessonSlideshow } from "@/app/components/lesson/LessonSlideshow";
import type { SampleLesson } from "@/app/components/lesson/LessonSlideshow";
import sampleLessons from "@/app/data/sample-lessons.json";
import { Star, Carrot } from "lucide-react";

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
  sentence_words?: string[];
  blank_index?: number;
  missing_choices?: string[];
  categories?: string[];
  category_items?: Record<string, string[]>;
  items?: string[];
  left_items?: string[];
  right_items?: string[];
  correct_pairs?: Record<string, string>;
  target_word?: string;
  phonemes?: string[];
  distractors?: string[];
}

interface AnswerRecord {
  questionId: string;
  correct: boolean;
  selected: string;
}

/* ─── Constants ──────────────────────────────────────── */

const QUESTIONS_PER_SESSION = 5;
const CARROTS_PER_CORRECT = 5;

const CHOICE_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700",
  "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700",
  "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700",
];

const CORRECT_MESSAGES = [
  "Amazing!", "Great job!", "You got it!", "Nice catch!",
  "Super smart!", "Wonderful!", "Nailed it!", "Brilliant!",
];
const INCORRECT_MESSAGES = [
  "Not quite!", "Almost!", "Good try!", "Keep learning!",
];
const CORRECT_EMOJIS = ["star", "sparkles", "sparkle", "star2", "zap", "target"];
const CORRECT_AUDIO = ["correct-1", "correct-2", "correct-3", "correct-4", "correct-5"];
const INCORRECT_AUDIO = ["incorrect-1", "incorrect-2", "incorrect-3"];

const FEEDBACK_ICON_MAP: Record<string, typeof Star> = {
  star: Star, sparkles: Star, sparkle: Star, star2: Star, zap: Star, target: Star,
};

const SUPABASE_STORAGE = "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

const GRADE_FOLDER: Record<string, string> = {
  "pre-k": "kindergarten",
  kindergarten: "kindergarten",
  "1st": "1st-grade",
  "2nd": "2nd-grade",
  "3rd": "3rd-grade",
  "4th": "4th-grade",
};

const QUESTION_WORDS = new Set([
  "What","Who","Where","When","Why","How","Which",
]);

/* ─── Helpers ──────────────────────────────────────────── */

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function splitPrompt(prompt: string): { passage: string | null; question: string } {
  const parts = prompt.split("\n\n");
  if (parts.length >= 2) {
    return { passage: parts.slice(0, -1).join("\n\n"), question: parts[parts.length - 1] };
  }
  return { passage: null, question: prompt };
}

function questionImageUrl(questionId: string, gradeKey?: string): string {
  const match = questionId.match(/^(.+)-Q\d+$/i);
  if (!match) return "";
  const standardId = match[1];
  const folder = gradeKey ? GRADE_FOLDER[gradeKey] || gradeKey : "";
  if (!folder) return "";
  return `${SUPABASE_STORAGE}/images/${folder}/${standardId}/${questionId}.png`;
}

function highlightQuestion(text: string): React.ReactNode[] {
  return text.split(/(\s+|(?=[.,!?;:])|(?<=[.,!?;:]))/).map((part, i) => {
    const clean = part.replace(/[^a-zA-Z']/g, "");
    if (clean.length > 1 && QUESTION_WORDS.has(clean)) {
      return <span key={i} className="text-indigo-600 dark:text-indigo-400 font-extrabold">{part}</span>;
    }
    return part;
  });
}

function getStars(correct: number, total: number): number {
  if (correct === total) return 3;
  if (correct >= total - 1) return 2;
  if (correct >= 1) return 1;
  return 0;
}

/* ═══════════════════════════════════════════════════════ */
/*  Page Wrapper                                          */
/* ═══════════════════════════════════════════════════════ */

export default function LearnPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LearnLoader />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
        <p className="text-sm text-zinc-500 dark:text-slate-400">Loading lesson...</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*  Loader — fetch child + find lesson data               */
/* ═══════════════════════════════════════════════════════ */

function LearnLoader() {
  const params = useSearchParams();
  const router = useRouter();
  const standardId = params.get("standard");
  const childId = params.get("child");
  const devMode = params.get("dev") === "1";

  const [child, setChild] = useState<Child | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Find lesson data
  const lesson = useMemo(() => {
    if (!standardId) return null;
    return (sampleLessons as SampleLesson[]).find((l) => l.standardId === standardId) ?? null;
  }, [standardId]);

  // Find MCQ questions from standard data
  const mcqQuestions = useMemo(() => {
    if (!lesson) return [];
    const mcqIds = lesson.slides
      .filter((s): s is { slide: number; type: "mcq"; mcqId: string } => s.type === "mcq")
      .map((s) => s.mcqId);

    const standard = findStandardById(lesson.standardId);
    if (!standard) return [];

    return mcqIds
      .map((id) => standard.questions.find((q) => q.id === id))
      .filter((q): q is Question => q != null)
      .slice(0, QUESTIONS_PER_SESSION);
  }, [lesson]);

  // Fetch child
  useEffect(() => {
    if (!childId) { setError("Missing child parameter"); return; }
    if (!lesson) { setError("Lesson not found"); return; }

    async function fetchChild() {
      const supabase = supabaseBrowser();
      const { data, error: fetchError } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId!)
        .single();
      if (fetchError || !data) {
        setError("Could not load child profile");
        return;
      }
      setChild(data as Child);
    }

    fetchChild();
  }, [childId, lesson]);

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Oops!</p>
          <p className="text-zinc-500 dark:text-slate-400 mb-6">{error}</p>
          <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!child || !lesson) return <LoadingScreen />;

  return <LearnSession child={child} lesson={lesson} mcqQuestions={mcqQuestions} devMode={devMode} />;
}

/* ═══════════════════════════════════════════════════════ */
/*  Learn Session — slideshow → MCQs → completion         */
/* ═══════════════════════════════════════════════════════ */

type Phase = "slideshow" | "practice" | "complete";

function LearnSession({
  child,
  lesson,
  mcqQuestions,
  devMode,
}: {
  child: Child;
  lesson: SampleLesson;
  mcqQuestions: Question[];
  devMode?: boolean;
}) {
  const router = useRouter();
  const { unlockAudio, stop, playUrl, playCorrectChime, playIncorrectBuzz } = useAudio();
  const gradeKey = levelNameToGradeKey(child?.reading_level ?? null);

  const [phase, setPhase] = useState<Phase>("slideshow");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [sessionCarrots, setSessionCarrots] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackEmoji, setFeedbackEmoji] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalQ = mcqQuestions.length;
  const q = mcqQuestions[currentIdx];

  // Slideshow complete → transition to practice
  const handleSlideshowComplete = useCallback(async () => {
    await unlockAudio();
    setAudioUnlocked(true);
    setPhase("practice");
  }, [unlockAudio]);

  // Play question audio when entering practice or advancing
  useEffect(() => {
    if (phase !== "practice" || showFeedback || !audioUnlocked || !q) return;
    const url = q.audio_url;
    if (url) playUrl(url);
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase, showFeedback, audioUnlocked]);

  // Play feedback audio
  useEffect(() => {
    if (!showFeedback) return;
    if (isCorrect) {
      playUrl(getAudioUrl("feedback", pickRandom(CORRECT_AUDIO)));
    } else {
      playUrl(getAudioUrl("feedback", pickRandom(INCORRECT_AUDIO)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback]);

  const playWordAudio = useCallback((word: string) => {
    const clean = word.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(/\s+/g, "_");
    if (!clean) return;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio`
      : "";
    const src = base ? `${base}/words/${clean}.mp3` : `/audio/words/${clean}.mp3`;
    playUrl(src);
  }, [playUrl]);

  const handleReplay = useCallback(() => {
    stop();
    const url = q?.audio_url;
    if (url) playUrl(url);
  }, [q?.audio_url, stop, playUrl]);

  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null || !q) return;
    stop();
    const correct = choice === q.correct;

    setSelected(choice);
    setIsCorrect(correct);
    setShowFeedback(true);
    setAnswers((prev) => [...prev, { questionId: q.id, correct, selected: choice }]);

    if (correct) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      const daily = getDailyMultiplier(child.streak_days);
      const session = getSessionStreakTier(newConsecutive);
      const carrots = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier);
      setSessionCarrots((prev) => prev + carrots);
      setFeedbackMsg(pickRandom(CORRECT_MESSAGES));
      setFeedbackEmoji(pickRandom(CORRECT_EMOJIS));
      playCorrectChime();
    } else {
      setConsecutiveCorrect(0);
      setFeedbackMsg(pickRandom(INCORRECT_MESSAGES));
      setFeedbackEmoji("");
      playIncorrectBuzz();
    }
  }, [selected, q, stop, playCorrectChime, playIncorrectBuzz, consecutiveCorrect, child.streak_days]);

  const handleInteractiveAnswer = useCallback((isCorrectResult: boolean, answer: string) => {
    if (selected !== null || !q) return;
    stop();

    setSelected(answer);
    setIsCorrect(isCorrectResult);
    setShowFeedback(true);
    setAnswers((prev) => [...prev, { questionId: q.id, correct: isCorrectResult, selected: answer }]);

    if (isCorrectResult) {
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      const daily = getDailyMultiplier(child.streak_days);
      const session = getSessionStreakTier(newConsecutive);
      const carrots = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier);
      setSessionCarrots((prev) => prev + carrots);
      setFeedbackMsg(pickRandom(CORRECT_MESSAGES));
      setFeedbackEmoji(pickRandom(CORRECT_EMOJIS));
      playCorrectChime();
    } else {
      setConsecutiveCorrect(0);
      setFeedbackMsg(pickRandom(INCORRECT_MESSAGES));
      setFeedbackEmoji("");
      playIncorrectBuzz();
    }
  }, [selected, q, stop, playCorrectChime, playIncorrectBuzz, consecutiveCorrect, child.streak_days]);

  const handleContinue = useCallback(() => {
    setShowHint(false);
    setShowFeedback(false);
    setSelected(null);
    setIsCorrect(null);
    setFeedbackMsg("");
    setFeedbackEmoji("");

    if (currentIdx + 1 < totalQ) {
      setCurrentIdx((i) => i + 1);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("complete");
    }
  }, [currentIdx, totalQ]);

  /* ── Phase: Slideshow ── */
  if (phase === "slideshow") {
    return <LessonSlideshow lesson={lesson} onComplete={handleSlideshowComplete} devMode={devMode} />;
  }

  /* ── Phase: Complete ── */
  if (phase === "complete") {
    const correctCount = answers.filter((a) => a.correct).length;
    return (
      <CompletionScreen
        child={child}
        lesson={lesson}
        answers={answers}
        questions={mcqQuestions}
        correctCount={correctCount}
        carrotsEarned={sessionCarrots}
      />
    );
  }

  /* ── Phase: Practice (MCQs) ── */
  if (!q) return <LoadingScreen />;

  const { passage, question } = splitPrompt(q.prompt);

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0f172a] flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
          aria-label="Exit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="flex-1 mx-3 h-2.5 rounded-full bg-zinc-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx + (showFeedback ? 1 : 0)) / totalQ) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <MuteToggle />
      </div>

      {/* ── Question area ── */}
      <motion.div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 pb-32"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        key={currentIdx}
      >
        {/* Interactive question types */}
        {q.type === "sentence_build" && q.words ? (
          <SentenceBuild
            prompt={question}
            passage={passage}
            words={q.words}
            correctSentence={q.correct}
            sentenceHint={q.sentence_hint}
            sentenceAudioUrl={q.sentence_audio_url}
            answered={selected !== null}
            onAnswer={handleInteractiveAnswer}
          />
        ) : q.type === "missing_word" && q.sentence_words && q.missing_choices && q.blank_index !== undefined ? (
          <MissingWord
            prompt={question}
            sentenceWords={q.sentence_words}
            blankIndex={q.blank_index}
            choices={q.missing_choices}
            correct={q.correct}
            sentenceHint={q.sentence_hint}
            sentenceAudioUrl={q.sentence_audio_url}
            answered={selected !== null}
            onAnswer={(isCorrect, choice) => handleInteractiveAnswer(isCorrect, choice)}
          />
        ) : q.type === "category_sort" && q.categories && q.category_items && q.items ? (
          <CategorySort
            prompt={question}
            categories={q.categories}
            categoryItems={q.category_items}
            items={q.items}
            answered={selected !== null}
            onAnswer={handleInteractiveAnswer}
            onPlayItem={playWordAudio}
          />
        ) : q.type === "tap_to_pair" && q.left_items && q.right_items && q.correct_pairs ? (
          <TapToPair
            prompt={question}
            leftItems={q.left_items}
            rightItems={q.right_items}
            correctPairs={q.correct_pairs}
            answered={selected !== null}
            onAnswer={(isCorrect, answer) => handleInteractiveAnswer(isCorrect, answer)}
            onPlayItem={playWordAudio}
          />
        ) : q.type === "sound_machine" && q.target_word && q.phonemes ? (
          <SoundMachine
            prompt={question}
            targetWord={q.target_word}
            phonemes={q.phonemes}
            distractors={q.distractors}
            answered={selected !== null}
            onAnswer={(isCorrect, answer) => handleInteractiveAnswer(isCorrect, answer)}
          />
        ) : (
        <>
        {/* Image */}
        {questionImageUrl(q.id, gradeKey) && (
          <motion.div variants={fadeUp} className="flex justify-center mb-3 mt-2">
            <img
              src={questionImageUrl(q.id, gradeKey)}
              alt=""
              className="max-h-[180px] sm:max-h-[220px] md:max-h-[300px] w-auto object-contain rounded-2xl shadow-md border-2 border-white dark:border-slate-700"
              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
            />
          </motion.div>
        )}

        {/* Passage */}
        {passage && (
          <motion.div variants={fadeUp} className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50 px-5 py-4">
            <p className="text-xl md:text-2xl leading-relaxed font-semibold text-gray-800 dark:text-slate-200 tracking-wide whitespace-pre-line text-center">{passage}</p>
          </motion.div>
        )}

        {/* Question + replay */}
        <motion.div variants={fadeUp} className="mb-3">
          <div className="flex items-center gap-2 max-w-[600px] mx-auto justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-snug text-center">
              {highlightQuestion(question)}
            </h2>
            <button
              onClick={handleReplay}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors flex-shrink-0"
              aria-label="Replay audio"
            >
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Progress dots */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: totalQ }).map((_, i) => {
            const answer = answers[i];
            const isCurrent = i === currentIdx;
            let dotClass = "bg-zinc-300 dark:bg-slate-600";
            if (answer) {
              dotClass = answer.correct ? "bg-emerald-500" : "bg-red-400";
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

        {/* Answer choices — 2×2 grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {(q.choices ?? []).map((choice, i) => {
            const isSelected = selected === choice;
            const isCorrectChoice = choice === q.correct;
            const answered = selected !== null;
            const choiceCount = q.choices?.length ?? 0;
            const isLastOdd = choiceCount === 3 && i === 2;

            let bg = CHOICE_COLORS[i % CHOICE_COLORS.length];
            let textColor = "";
            let extra = "";

            if (!answered && isSelected) {
              extra = "ring-2 ring-offset-2 ring-indigo-500";
            } else if (answered) {
              if (isSelected && isCorrect) {
                bg = "bg-emerald-500 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-600";
                textColor = "text-white dark:text-white";
              } else if (isSelected && !isCorrect) {
                bg = "bg-red-400 border-red-500 dark:bg-red-400 dark:border-red-500";
                textColor = "text-white dark:text-white";
              } else if (isCorrectChoice && !isCorrect) {
                bg = "bg-emerald-500 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-600";
                textColor = "text-white dark:text-white";
              } else {
                extra = "opacity-40";
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
                  flex items-center justify-center px-3 py-3 rounded-2xl border-2 relative
                  transition-[background-color,border-color,opacity,box-shadow] duration-200 outline-none
                  min-h-[64px] md:min-h-[80px]
                  ${bg} ${textColor} ${extra}
                  ${answered ? "cursor-default" : "cursor-pointer hover:scale-[1.04] hover:shadow-lg active:scale-[0.95]"}
                  ${isLastOdd ? "col-span-2 max-w-[50%] mx-auto" : ""}
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {answered && isSelected && isCorrect && (
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {answered && isSelected && !isCorrect && (
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {answered && !isSelected && isCorrectChoice && !isCorrect && (
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <span className={`text-base md:text-xl font-bold leading-snug text-center ${textColor}`}>
                    {choice}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
        </>
        )}

        {/* Hint button */}
        {q.hint && (
          <motion.div variants={fadeUp} className="mt-5 flex flex-col items-center gap-2">
            <button
              onClick={() => setShowHint((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Hint
            </button>
            {showHint && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 max-w-sm text-center">
                {q.hint}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ── Feedback bar (Duolingo-style) ── */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            variants={feedbackSlideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed bottom-0 left-0 right-0 z-40 ${
              isCorrect ? "bg-emerald-600" : "bg-red-500"
            }`}
          >
            <div className="max-w-lg mx-auto px-5 py-5 safe-area-bottom">
              <div className="flex items-start gap-3 mb-4">
                {isCorrect ? (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" strokeWidth={1.5} />
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
                    const earned = Math.floor(CARROTS_PER_CORRECT * daily.multiplier * session.multiplier);
                    const hasBonus = daily.multiplier > 1 || session.multiplier > 1;
                    return (
                      <p className="text-white/80 text-sm mt-0.5">
                        +{earned} <Carrot className="w-3.5 h-3.5 inline-block align-text-bottom" strokeWidth={1.5} />{hasBonus ? " (Bonus!)" : ""}
                      </p>
                    );
                  })()}
                  {!isCorrect && (
                    <p className="text-white/90 text-sm font-bold mt-1">
                      Correct answer: {q.correct}
                    </p>
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
/*  Mute Toggle                                           */
/* ═══════════════════════════════════════════════════════ */

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
/*  Completion Screen                                      */
/* ═══════════════════════════════════════════════════════ */

function CompletionScreen({
  child,
  lesson,
  answers,
  questions,
  correctCount,
  carrotsEarned,
}: {
  child: Child;
  lesson: SampleLesson;
  answers: AnswerRecord[];
  questions: Question[];
  correctCount: number;
  carrotsEarned: number;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const darkMode = useThemeStore((s) => s.darkMode);
  const { playUrl: playCompletionUrl } = useAudio();
  const totalQ = questions.length;
  const stars = getStars(correctCount, totalQ);

  // Confetti
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
    subtitle = `You mastered ${lesson.title}!`;
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

  // Play completion audio
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
    playCompletionUrl(getAudioUrl("feedback", file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save results
  useEffect(() => {
    if (saved || saving) return;
    setSaving(true);

    async function save() {
      const supabase = supabaseBrowser();

      const payload = safeValidate(PracticeResultSchema, {
        child_id: child.id,
        standard_id: lesson.standardId,
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
  }, [saved, saving, child.id, lesson.standardId, totalQ, correctCount, carrotsEarned]);

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
          <Link
            href={`/dashboard`}
            className="block w-full text-center py-4 rounded-2xl font-extrabold text-base text-white transition-all active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 0 0 #4f46e5" }}
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
