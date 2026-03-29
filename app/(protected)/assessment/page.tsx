"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import {
  grades,
  gradeToKey,
  getPlacement,
  type GradeKey,
} from "@/lib/assessment/questions";
import { safeValidate } from "@/lib/validate";
import { AssessmentResultSchema } from "@/lib/schemas";
import { useAudio } from "@/lib/audio/use-audio";
import { LoadingImage } from "@/app/components/ui/LoadingImage";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Volume2, Rocket } from "lucide-react";

import { CategorySort } from "@/app/components/practice/CategorySort";
import { MissingWord } from "@/app/components/practice/MissingWord";
import { SentenceBuild } from "@/app/components/practice/SentenceBuild";
import { TapToPair } from "@/app/components/practice/TapToPair";

import manifestRaw from "@/scripts/assessment_mixed_manifest.json";
import bankRaw from "@/lib/assessment/mixed-bank-k4.json";

/* ── Types ─────────────────────────────────────────────── */

type Phase = "loading" | "intro" | "quiz" | "results";
type QuestionType = "mcq" | "category_sort" | "missing_word" | "sentence_build" | "tap_to_pair" | "word_builder";

interface MergedQuestion {
  id: string;
  grade_key: string;
  type: QuestionType;
  difficulty: string;
  prompt: string;
  stimulus: string;
  stimulus2: string;
  audio_url: string;
  hint_audio_url: string;
  image_url: string;
  // mcq
  choices: string[];
  correct: string;
  // category_sort
  categories: string[];
  categoryItems?: Record<string, string[]>;
  items: string[];
  // missing_word
  sentence_words: string[];
  // sentence_build
  words: string[];
  // tap_to_pair
  left_items: string[];
  right_items: string[];
  correct_pairs: Record<string, string>;
  // word_builder
  word_ending: string;
  valid_words: string[];
  max_attempts: number;
}

interface AnswerRecord {
  question_id: string;
  selected: string;
  correct: string;
  is_correct: boolean;
}

/* ── Build merged questions from manifest + bank ───────── */

function buildBankLookup(): Record<string, any> {
  const lookup: Record<string, any> = {};
  for (const qs of Object.values(
    (bankRaw as { grades: Record<string, any[]> }).grades
  )) {
    for (const q of qs) lookup[q.id] = q;
  }
  return lookup;
}

const BANK_LOOKUP = buildBankLookup();

function buildMergedQuestions(gradeKey: string): MergedQuestion[] {
  return (manifestRaw as any[])
    .filter((m: any) => m.grade_key === gradeKey)
    .map((m: any) => {
      const bank = BANK_LOOKUP[m.id] || {};
      return {
        ...m,
        categoryItems: bank.categoryItems ?? undefined,
        left_items: m.left_items ?? [],
        right_items: m.right_items ?? [],
        correct_pairs: m.correct_pairs ?? {},
        stimulus2: m.stimulus2 ?? "",
        word_ending: m.word_ending ?? bank.wordEnding ?? "",
        valid_words: m.valid_words?.length ? m.valid_words : bank.validWords ?? [],
        max_attempts: m.max_attempts || bank.maxAttempts || 10,
      } as MergedQuestion;
    });
}

/* ── Word Builder (inline, only 1 question in bank) ────── */

function WordBuilderInline({
  prompt,
  wordEnding,
  validWords,
  maxAttempts,
  onAnswer,
}: {
  prompt: string;
  wordEnding: string;
  validWords: string[];
  maxAttempts: number;
  onAnswer: (isCorrect: boolean, answer: string) => void;
}) {
  const [input, setInput] = useState("");
  const [found, setFound] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const done = attempts >= maxAttempts;

  const handleTry = () => {
    const word = (input.trim() + wordEnding).toLowerCase();
    setInput("");
    setAttempts((a) => a + 1);

    if (validWords.map((w) => w.toLowerCase()).includes(word) && !found.includes(word)) {
      setFound((f) => [...f, word]);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleDone = () => {
    const threshold = Math.ceil(validWords.length / 2);
    onAnswer(found.length >= threshold, found.join(", "));
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-bold text-zinc-900">{prompt}</h2>

      <div className="text-5xl font-bold text-indigo-600 tracking-wider">-{wordEnding}</div>

      <div className={`flex items-center justify-center gap-2 ${shake ? "animate-shake" : ""}`}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && input.trim() && handleTry()}
          placeholder="Type letters..."
          className="w-32 text-center text-2xl font-bold border-2 border-indigo-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          disabled={done}
          autoFocus
        />
        <span className="text-2xl font-bold text-zinc-400">-{wordEnding}</span>
        <button
          onClick={handleTry}
          disabled={!input.trim() || done}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-40"
        >
          Try
        </button>
      </div>

      {found.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {found.map((w) => (
            <span key={w} className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
              {w}
            </span>
          ))}
        </div>
      )}

      <div className="text-sm text-zinc-400">
        {attempts} / {maxAttempts} tries &middot; {found.length} words found
      </div>

      <button
        onClick={handleDone}
        className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-colors"
      >
        I&apos;m Done
      </button>
    </div>
  );
}

/* ── MCQ choice colors ─────────────────────────────────── */

const CHOICE_COLORS = [
  { bg: "bg-blue-50 hover:bg-blue-100 border-blue-200", selected: "bg-blue-100 border-blue-500", badge: "bg-blue-600", text: "text-blue-800" },
  { bg: "bg-amber-50 hover:bg-amber-100 border-amber-200", selected: "bg-amber-100 border-amber-500", badge: "bg-amber-600", text: "text-amber-800" },
  { bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200", selected: "bg-emerald-100 border-emerald-500", badge: "bg-emerald-600", text: "text-emerald-800" },
  { bg: "bg-rose-50 hover:bg-rose-100 border-rose-200", selected: "bg-rose-100 border-rose-500", badge: "bg-rose-600", text: "text-rose-800" },
];

/* ── Main page ─────────────────────────────────────────── */

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}

function AssessmentContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const { playUrl, playSequence, stop, unlockAudio } = useAudio();

  const [child, setChild] = useState<Child | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [gradeKey, setGradeKey] = useState<GradeKey>("kindergarten");
  const [questions, setQuestions] = useState<MergedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [levelName, setLevelName] = useState("");
  const [saving, setSaving] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; left: number; color: string; delay: number }[]
  >([]);

  // Load child data
  useEffect(() => {
    async function load() {
      if (!childId) return;
      const supabase = supabaseBrowser();
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("id", childId)
        .single();

      if (data) {
        const c = data as Child;
        setChild(c);
        const gk = gradeToKey(c.grade);
        setGradeKey(gk);
        setQuestions(buildMergedQuestions(gk));
        setPhase("intro");
      }
    }
    load();
  }, [childId]);

  // Auto-play question audio
  useEffect(() => {
    if (phase !== "quiz" || !audioReady || !questions.length) return;
    const q = questions[currentIdx];
    if (q.audio_url) {
      if (q.type === "category_sort") {
        const hintUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/ui/category-sort-hint.mp3`;
        playSequence([{ url: q.audio_url }, { delayMs: 400 }, { url: hintUrl }]);
      } else {
        playUrl(q.audio_url);
      }
    }
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase, audioReady]);

  const handleStart = useCallback(() => {
    unlockAudio();
    setAudioReady(true);
    setPhase("quiz");
  }, [unlockAudio]);

  const handleReplay = useCallback(() => {
    const q = questions[currentIdx];
    if (q?.audio_url) playUrl(q.audio_url);
  }, [questions, currentIdx, playUrl]);

  // Save results
  const saveResults = useCallback(
    async (finalAnswers: AnswerRecord[]) => {
      if (!child) return;
      setSaving(true);

      const correct = finalAnswers.filter((a) => a.is_correct).length;
      const pct = Math.round((correct / finalAnswers.length) * 100);
      const placement = getPlacement(pct, gradeKey);

      setScore(correct);
      setLevelName(placement.levelName);

      // Confetti
      setConfettiPieces(
        Array.from({ length: 40 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          color: ["#4338ca", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"][
            Math.floor(Math.random() * 6)
          ],
          delay: Math.random() * 1.5,
        }))
      );

      const supabase = supabaseBrowser();

      const assessmentPayload = safeValidate(AssessmentResultSchema, {
        child_id: child.id,
        grade_tested: gradeKey,
        score_percent: pct,
        reading_level_placed: placement.levelName,
        answers: finalAnswers,
      });
      await supabase.from("assessments").insert(assessmentPayload);

      await supabase
        .from("children")
        .update({ reading_level: placement.levelName })
        .eq("id", child.id);

      setSaving(false);
      setPhase("results");
    },
    [child, gradeKey]
  );

  // Advance to next question or save
  const advance = useCallback(
    (record: AnswerRecord) => {
      const newAnswers = [...answers, record];
      setAnswers(newAnswers);
      setSelectedChoice(null);

      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(currentIdx + 1);
      } else {
        saveResults(newAnswers);
      }
    },
    [answers, currentIdx, questions.length, saveResults]
  );

  // MCQ answer handler
  const handleMcqAnswer = useCallback(
    (choice: string) => {
      if (selectedChoice) return;
      setSelectedChoice(choice);

      const q = questions[currentIdx];
      const record: AnswerRecord = {
        question_id: q.id,
        selected: choice,
        correct: q.correct,
        is_correct: choice === q.correct,
      };

      setTimeout(() => advance(record), 600);
    },
    [selectedChoice, questions, currentIdx, advance]
  );

  // Interactive type answer handler
  const handleInteractiveAnswer = useCallback(
    (isCorrect: boolean, answer: string) => {
      const q = questions[currentIdx];

      let correctStr = q.correct;
      if (q.type === "category_sort" && q.categoryItems) {
        correctStr = Object.entries(q.categoryItems)
          .map(([cat, items]) => `${cat}: ${items.join(", ")}`)
          .join(" | ");
      } else if (q.type === "tap_to_pair") {
        correctStr = Object.entries(q.correct_pairs)
          .map(([l, r]) => `${l}->${r}`)
          .join(", ");
      } else if (q.type === "word_builder") {
        correctStr = q.valid_words.join(", ");
      }

      const record: AnswerRecord = {
        question_id: q.id,
        selected: answer,
        correct: correctStr,
        is_correct: isCorrect,
      };

      advance(record);
    },
    [questions, currentIdx, advance]
  );

  // Current question helper
  const q = questions[currentIdx] ?? null;

  /* ── Loading ─────────────────────────────────────────── */
  if (phase === "loading" || !child) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  /* ── Intro ───────────────────────────────────────────── */
  if (phase === "intro") {
    const sparkles = [
      { top: "10%", left: "8%", size: 6, delay: 0.4 },
      { top: "18%", left: "82%", size: 5, delay: 0.7 },
      { top: "60%", left: "12%", size: 4, delay: 1.0 },
      { top: "45%", left: "90%", size: 5, delay: 0.5 },
      { top: "28%", left: "52%", size: 3, delay: 0.9 },
      { top: "72%", left: "75%", size: 4, delay: 0.6 },
      { top: "8%", left: "38%", size: 3, delay: 1.1 },
      { top: "82%", left: "25%", size: 5, delay: 1.3 },
    ];

    return (
      <div className="max-w-md mx-auto pt-10 pb-10 px-4">
        <motion.div
          className="relative bg-white rounded-3xl shadow-xl overflow-visible"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        >
          {/* Bunny peeking from bottom-left of card */}
          <motion.div
            className="absolute -bottom-8 -left-24 z-10 hidden sm:block"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6, type: "spring", bounce: 0.4 }}
          >
            <Image
              src="/images/bunny-hero.png"
              alt="Readee bunny"
              width={818}
              height={1436}
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-[100px] sm:w-[120px] h-auto"
            />
          </motion.div>

          {/* Gradient header */}
          <div
            className="relative px-6 pt-10 pb-8 text-center overflow-hidden rounded-t-3xl"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)" }}
          >
            {/* Floating sparkles */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {sparkles.map((dot, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white/25"
                  style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
                  animate={{
                    opacity: [0.1, 0.5, 0.1],
                    scale: [0.8, 1.3, 0.8],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: dot.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <motion.h1
              className="relative text-3xl font-extrabold text-white"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              Hi {child.first_name}!
            </motion.h1>

            <motion.p
              className="relative text-indigo-100 text-base mt-2 font-medium"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              Ready for a reading adventure?
            </motion.p>
          </div>

          {/* Content area */}
          <div className="px-6 pt-6 pb-7 text-center">
            {/* Listen button */}
            <motion.button
              onClick={() => {
                unlockAudio();
                playUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/ui/assessment-intro.mp3`);
              }}
              className="mx-auto mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm hover:bg-indigo-100 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Volume2 className="w-4 h-4" />
              Tap to listen
            </motion.button>

            <motion.p
              className="text-lg font-semibold text-zinc-700 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              Answer some fun questions so we can find the best reading level for you!
            </motion.p>

            <motion.p
              className="text-zinc-400 text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
            >
              Just try your best — you got this!
            </motion.p>

            {/* Let's Go button */}
            <motion.button
              onClick={handleStart}
              className="relative w-full py-4 rounded-2xl font-extrabold text-xl text-white transition-all hover:scale-[1.02] active:scale-[0.97] flex items-center justify-center gap-3"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 0 0 #4f46e5",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.85 }}
            >
              <motion.span
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(99,102,241,0.4)",
                    "0 0 0 10px rgba(99,102,241,0)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="relative">Let&apos;s Go!</span>
              <Rocket className="relative w-6 h-6" />
            </motion.button>

            <div className="mt-4">
              <Link
                href="/dashboard"
                className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Maybe later
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Quiz ────────────────────────────────────────────── */
  if (phase === "quiz" && q) {
    const progress = (currentIdx / questions.length) * 100;
    const blankIndex = q.sentence_words?.indexOf("___") ?? -1;

    // Derive correct word for missing_word (not the full sentence)
    const missingCorrectWord =
      q.type === "missing_word" && blankIndex >= 0
        ? q.correct.split(/\s+/)[blankIndex] ?? q.correct
        : q.correct;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-indigo-600">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-zinc-400">{grades[gradeKey].grade_label}</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Image */}
        {q.image_url && (
          <div className="flex justify-center">
            <LoadingImage
              src={q.image_url}
              className="max-h-[180px] sm:max-h-[220px] md:max-h-[300px] w-auto object-contain rounded-2xl shadow-md border-2 border-white"
            />
          </div>
        )}

        {/* Stimulus (MCQ passages/words) */}
        {q.type === "mcq" && q.stimulus && (
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 text-center">
            <p className="text-lg text-zinc-700 leading-relaxed italic">
              {q.stimulus}
            </p>
            {q.stimulus2 && (
              <p className="text-lg text-zinc-700 leading-relaxed italic mt-4 pt-4 border-t border-indigo-200">
                {q.stimulus2}
              </p>
            )}
          </div>
        )}

        {/* Prompt + replay */}
        <div className="flex items-center gap-2 justify-center">
          <h2 className="text-xl font-bold text-zinc-900 text-center leading-relaxed">
            {q.prompt}
          </h2>
          {q.audio_url && (
            <button
              onClick={handleReplay}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 hover:bg-indigo-100 transition-colors flex-shrink-0"
              aria-label="Replay audio"
            >
              <Volume2 className="w-5 h-5 text-indigo-600" />
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {questions.map((_, i) => {
            const isCurrent = i === currentIdx;
            const answered = i < answers.length;
            return (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  answered
                    ? "bg-indigo-400"
                    : isCurrent
                    ? "bg-indigo-500"
                    : "bg-zinc-300"
                } ${isCurrent ? "w-3.5 h-3.5" : "w-2.5 h-2.5"}`}
              />
            );
          })}
        </div>

        {/* ── Question type renderers ── */}

        {q.type === "mcq" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.choices.map((choice, i) => {
              const isSelected = selectedChoice === choice;
              const letters = ["A", "B", "C", "D"];
              const color = CHOICE_COLORS[i % CHOICE_COLORS.length];

              return (
                <button
                  key={i}
                  onClick={() => handleMcqAnswer(choice)}
                  disabled={!!selectedChoice}
                  className={`
                    relative text-left rounded-2xl border-2 p-4 transition-all duration-200
                    ${isSelected ? color.selected + " scale-[1.02]" : color.bg}
                    ${selectedChoice && !isSelected ? "opacity-50" : ""}
                    disabled:cursor-default
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 text-white ${color.badge}`}
                    >
                      {letters[i]}
                    </div>
                    <span className={`font-medium ${color.text}`}>{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {q.type === "category_sort" && q.categoryItems && (
          <CategorySort
            prompt=""
            categories={q.categories}
            categoryItems={q.categoryItems}
            items={q.items}
            answered={false}
            onAnswer={handleInteractiveAnswer}
          />
        )}

        {q.type === "missing_word" && blankIndex >= 0 && (
          <MissingWord
            prompt=""
            sentenceWords={q.sentence_words}
            blankIndex={blankIndex}
            choices={q.choices}
            correct={missingCorrectWord}
            answered={false}
            onAnswer={handleInteractiveAnswer}
          />
        )}

        {q.type === "sentence_build" && q.words.length > 0 && (
          <SentenceBuild
            prompt=""
            passage={q.stimulus || null}
            words={q.words}
            correctSentence={q.correct}
            answered={false}
            onAnswer={handleInteractiveAnswer}
          />
        )}

        {q.type === "tap_to_pair" && q.left_items.length > 0 && (
          <TapToPair
            prompt=""
            leftItems={q.left_items}
            rightItems={q.right_items}
            correctPairs={q.correct_pairs}
            answered={false}
            onAnswer={handleInteractiveAnswer}
          />
        )}

        {q.type === "word_builder" && (
          <WordBuilderInline
            prompt=""
            wordEnding={q.word_ending}
            validWords={q.valid_words}
            maxAttempts={q.max_attempts}
            onAnswer={handleInteractiveAnswer}
          />
        )}
      </div>
    );
  }

  /* ── Results ─────────────────────────────────────────── */
  if (phase === "results") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-8 relative overflow-hidden">
        {/* Confetti */}
        {confettiPieces.map((p) => (
          <div
            key={p.id}
            className="confetti-fall absolute top-0 w-2.5 h-2.5 rounded-sm"
            style={{
              left: `${p.left}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        <Sparkles className="w-16 h-16 text-indigo-500 mx-auto" strokeWidth={1.5} />

        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Awesome, {child.first_name}!
        </h1>

        {/* Level badge */}
        <div className="inline-block rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-8 py-5 text-white">
          <div className="text-sm font-medium text-indigo-200">You are a</div>
          <div className="text-2xl font-bold mt-1">{levelName}</div>
        </div>

        <p className="text-zinc-500 max-w-xs mx-auto">
          We&apos;ve built a personalized reading path just for {child.first_name}!
        </p>

        {saving ? (
          <p className="text-zinc-400 text-sm">Setting up your reading path...</p>
        ) : (
          <div className="space-y-3 pt-4">
            <Link
              href="/dashboard"
              className="block w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
            >
              Let&apos;s Start Reading &rarr;
            </Link>
            <Link
              href="/dashboard"
              className="block text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    );
  }

  return null;
}
