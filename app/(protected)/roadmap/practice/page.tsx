"use client";

import { Suspense, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
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

type Phase = "loading" | "playing" | "complete";

/* ─── Constants ──────────────────────────────────────── */

const ALL_STANDARDS = (kStandards as { standards: Standard[] }).standards;
const QUESTIONS_PER_SESSION = 5;
const XP_PER_CORRECT = 5;

const CORRECT_MESSAGES = [
  "Great job! ⭐",
  "You got it! 🎉",
  "Amazing! 🌟",
  "Super smart! 🧠",
  "Wonderful! 💫",
  "Nailed it! 🎯",
];

const INCORRECT_MESSAGES = [
  "Almost! Try to remember this one 💪",
  "Not quite, but you're learning! 📖",
  "Good try! Now you know! 🌱",
  "Keep going, you've got this! 💜",
];

/* ─── Helpers ────────────────────────────────────────── */

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Split prompt into passage (optional) and question */
function splitPrompt(prompt: string): { passage: string | null; question: string } {
  // Prompts look like: "🐶 Read: \"Max the dog...\"\n\nWhat did Max play with?"
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

function shortName(desc: string): string {
  const cleaned = desc
    .replace(/^With prompting and support, /i, "")
    .replace(/^Demonstrate understanding of /i, "")
    .replace(/^Recognize and name /i, "")
    .replace(/^Know and apply /i, "");
  const capped = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return capped.length > 50 ? capped.slice(0, 47) + "..." : capped;
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      <p className="text-zinc-400 text-sm font-medium">Loading questions...</p>
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
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="text-5xl">🔍</div>
        <h1 className="text-xl font-bold text-zinc-900">
          {!child ? "No reader selected" : "Standard not found"}
        </h1>
        <p className="text-sm text-zinc-500">
          {!child
            ? "We couldn't find the reader profile."
            : `Standard "${standardId}" doesn't exist in our question bank.`}
        </p>
        <Link href="/dashboard" className="inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          &larr; Back to Dashboard
        </Link>
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

  /* ── Pick questions ── */
  const questions = useMemo(() => {
    if (standard.questions.length <= QUESTIONS_PER_SESSION) return standard.questions;
    return shuffleArray(standard.questions).slice(0, QUESTIONS_PER_SESSION);
  }, [standard]);

  /* ── State ── */
  const [phase, setPhase] = useState<Phase>("playing");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [sessionXP, setSessionXP] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[currentIdx];
  const totalQ = questions.length;

  /* ── Clean up timer ── */
  useEffect(() => {
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); };
  }, []);

  /* ── Handle answer selection ── */
  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return; // already answered

    const correct = choice === q.correct;
    setSelected(choice);
    setIsCorrect(correct);

    if (correct) {
      setFeedbackMsg(pickRandom(CORRECT_MESSAGES));
      setSessionXP((prev) => prev + XP_PER_CORRECT);
    } else {
      setFeedbackMsg(pickRandom(INCORRECT_MESSAGES));
    }

    setAnswers((prev) => [...prev, { questionId: q.id, correct, selected: choice }]);

    // Auto-advance
    const delay = correct ? 1500 : 3000;
    advanceTimer.current = setTimeout(() => {
      if (currentIdx + 1 < totalQ) {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setIsCorrect(null);
        setFeedbackMsg("");
      } else {
        setPhase("complete");
      }
    }, delay);
  }, [selected, q, currentIdx, totalQ]);

  /* ── Exit ── */
  const handleExit = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    router.push(`/roadmap?child=${child.id}`);
  }, [router, child.id]);

  if (phase === "loading") return <LoadingScreen />;

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
        onRestart={() => {
          setPhase("playing");
          setCurrentIdx(0);
          setAnswers([]);
          setSessionXP(0);
          setSelected(null);
          setIsCorrect(null);
          setFeedbackMsg("");
        }}
      />
    );
  }

  const { passage, question } = splitPrompt(q.prompt);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50/50 to-white flex flex-col">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-zinc-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleExit}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors flex-shrink-0"
            aria-label="Exit practice"
          >
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Progress bar */}
          <div className="flex-1">
            <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentIdx) / totalQ) * 100}%` }}
              />
            </div>
          </div>

          {/* Question count */}
          <span className="text-xs font-bold text-zinc-400 flex-shrink-0 tabular-nums">
            {currentIdx + 1}/{totalQ}
          </span>

          {/* XP */}
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full flex-shrink-0">
            <span className="text-xs">⭐</span>
            <span className="text-xs font-bold text-amber-700 tabular-nums">{sessionXP}</span>
          </div>
        </div>
      </div>

      {/* ── Standard name ── */}
      <div className="max-w-lg mx-auto w-full px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
            {standard.standard_id}
          </span>
          <span className="text-xs text-zinc-400 truncate">{shortName(standard.standard_description)}</span>
        </div>
      </div>

      {/* ── Question area ── */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 pb-6 flex flex-col">
        {/* Passage card */}
        {passage && (
          <div className="mb-4 rounded-2xl bg-white border border-indigo-100 p-5 shadow-sm animate-fadeUp">
            <p className="text-lg leading-relaxed text-zinc-800 whitespace-pre-line">{passage}</p>
          </div>
        )}

        {/* Question text */}
        <div className="mb-6 animate-fadeUp" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-xl font-bold text-zinc-900 leading-snug">
            {question}
          </h2>
        </div>

        {/* Answer choices */}
        <div className="space-y-3 flex-1">
          {q.choices.map((choice, i) => {
            const isSelected = selected === choice;
            const isCorrectChoice = choice === q.correct;
            const answered = selected !== null;

            let cardStyle = "bg-white border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/50 active:scale-[0.98]";
            if (answered) {
              if (isSelected && isCorrect) {
                cardStyle = "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30";
              } else if (isSelected && !isCorrect) {
                cardStyle = "bg-red-50 border-red-300 ring-2 ring-red-300/30 animate-wrongShake";
              } else if (isCorrectChoice && !isCorrect) {
                // Reveal correct answer when wrong
                cardStyle = "bg-emerald-50 border-emerald-300";
              } else {
                cardStyle = "bg-zinc-50 border-zinc-100 opacity-50";
              }
            }

            return (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                disabled={answered}
                className={`
                  w-full text-left px-5 py-4 rounded-2xl border-2
                  transition-all duration-200 outline-none
                  animate-fadeUp ${cardStyle}
                  ${answered ? "cursor-default" : "cursor-pointer"}
                `}
                style={{ animationDelay: `${0.08 + i * 0.05}s`, minHeight: 60 }}
              >
                <div className="flex items-center gap-3">
                  {/* Letter badge */}
                  <span className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                    ${answered && isSelected && isCorrect
                      ? "bg-emerald-500 text-white"
                      : answered && isSelected && !isCorrect
                      ? "bg-red-400 text-white"
                      : answered && isCorrectChoice && !isCorrect
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-100 text-zinc-500"
                    }
                  `}>
                    {answered && isSelected && isCorrect ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : answered && isSelected && !isCorrect ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : answered && isCorrectChoice && !isCorrect ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>

                  {/* Choice text */}
                  <span className={`text-base font-medium leading-snug ${
                    answered && isSelected && isCorrect ? "text-emerald-800"
                    : answered && isSelected && !isCorrect ? "text-red-700"
                    : answered && isCorrectChoice && !isCorrect ? "text-emerald-700"
                    : "text-zinc-700"
                  }`}>
                    {choice}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback area */}
        {selected !== null && (
          <div className={`mt-4 rounded-2xl p-4 animate-fadeUp ${
            isCorrect
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-amber-50 border border-amber-200"
          }`}>
            <p className={`text-base font-bold ${isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
              {feedbackMsg}
            </p>
            {!isCorrect && (
              <p className="text-sm text-amber-600 mt-2 leading-relaxed">
                💡 <span className="font-medium">Hint:</span> {q.hint}
              </p>
            )}
            {isCorrect && (
              <p className="text-sm text-emerald-600 mt-1">+{XP_PER_CORRECT} XP</p>
            )}
          </div>
        )}
      </div>
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
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string }[]>([]);
  const totalQ = questions.length;
  const pct = Math.round((correctCount / totalQ) * 100);
  const passed = pct >= 80; // 4/5 or better
  const nextStandard = getNextStandard(standard.standard_id);

  /* ── Celebration tier ── */
  let tier: "amazing" | "good" | "keep-trying";
  let tierEmoji: string;
  let tierTitle: string;
  let tierSub: string;

  if (correctCount >= 4) {
    tier = "amazing";
    tierEmoji = "🏆";
    tierTitle = "Amazing work!";
    tierSub = `You mastered ${standard.standard_id}!`;
  } else if (correctCount >= 2) {
    tier = "good";
    tierEmoji = "💪";
    tierTitle = "Good effort!";
    tierSub = "Keep practicing — you're getting better!";
  } else {
    tier = "keep-trying";
    tierEmoji = "📖";
    tierTitle = "That was tough!";
    tierSub = "Let's try again soon — practice makes perfect!";
  }

  /* ── Confetti for amazing tier ── */
  useEffect(() => {
    if (tier !== "amazing") return;
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#3b82f6"][i % 6],
    }));
    setConfetti(pieces);
  }, [tier]);

  /* ── Save results ── */
  useEffect(() => {
    if (saved || saving) return;
    setSaving(true);

    async function save() {
      const supabase = supabaseBrowser();

      // Insert practice result
      await supabase.from("practice_results").insert({
        child_id: child.id,
        standard_id: standard.standard_id,
        questions_attempted: totalQ,
        questions_correct: correctCount,
        xp_earned: xpEarned,
      });

      // Award XP
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
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50/50 to-white relative overflow-hidden">
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti-fall absolute w-2.5 h-2.5 rounded-sm pointer-events-none"
          style={{
            left: `${c.left}%`,
            top: -10,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <div className="max-w-lg mx-auto px-4 py-8 relative z-10">
        {/* Hero */}
        <div className="text-center mb-8 animate-scaleIn">
          <div className={`
            inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl mb-4
            ${tier === "amazing"
              ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_4px_0_0_#c2410c,0_8px_24px_rgba(245,158,11,0.4)]"
              : tier === "good"
              ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_4px_0_0_#4338ca,0_8px_24px_rgba(99,102,241,0.3)]"
              : "bg-gradient-to-br from-zinc-300 to-zinc-400 shadow-[0_4px_0_0_#a1a1aa,0_8px_24px_rgba(0,0,0,0.1)]"
            }
          `}>
            {tierEmoji}
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">{tierTitle}</h1>
          <p className="text-zinc-500 mt-1">{tierSub}</p>

          {tier === "amazing" && (
            <div className="mt-2 inline-flex items-center gap-1 text-amber-600 text-sm font-bold">
              ⭐ ⭐ ⭐
            </div>
          )}
        </div>

        {/* Score card */}
        <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm p-5 mb-6 dash-slide-up-1">
          <div className="grid grid-cols-3 gap-4 text-center mb-5">
            <div>
              <div className="text-2xl font-extrabold text-zinc-900">{correctCount}/{totalQ}</div>
              <div className="text-xs text-zinc-400 mt-0.5">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-600">+{xpEarned}</div>
              <div className="text-xs text-zinc-400 mt-0.5">XP Earned</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-zinc-900">{pct}%</div>
              <div className="text-xs text-zinc-400 mt-0.5">Score</div>
            </div>
          </div>

          {/* Question breakdown */}
          <div className="space-y-2">
            {questions.map((q, i) => {
              const answer = answers[i];
              if (!answer) return null;
              const { question } = splitPrompt(q.prompt);
              return (
                <div
                  key={q.id}
                  className={`flex items-start gap-3 rounded-xl p-3 ${
                    answer.correct ? "bg-emerald-50" : "bg-red-50"
                  }`}
                >
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${answer.correct ? "bg-emerald-500" : "bg-red-400"}
                  `}>
                    {answer.correct ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 leading-snug">{question}</p>
                    {!answer.correct && (
                      <p className="text-xs text-red-500 mt-1">
                        Your answer: {answer.selected} — Correct: <span className="font-bold">{q.correct}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Passed badge */}
        {passed && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-center mb-6 dash-slide-up-2 shadow-md">
            <p className="text-white font-bold">
              Standard {standard.standard_id} Complete! 🎓
            </p>
            <p className="text-white/70 text-sm mt-0.5">
              {nextStandard ? `${nextStandard.standard_id} is now unlocked!` : "You've finished all standards!"}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3 dash-slide-up-3">
          <button
            onClick={onRestart}
            className="w-full px-5 py-4 rounded-2xl border-2 border-zinc-200 bg-white text-zinc-700 font-bold text-base hover:bg-zinc-50 transition-all active:scale-[0.98]"
          >
            Practice Again
          </button>

          {nextStandard && (
            <Link
              href={`/roadmap/practice?child=${child.id}&standard=${nextStandard.standard_id}`}
              className="block w-full text-center px-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-base hover:from-indigo-700 hover:to-violet-600 transition-all shadow-md active:scale-[0.98]"
            >
              Next Standard: {nextStandard.standard_id} →
            </Link>
          )}

          <Link
            href={`/roadmap?child=${child.id}`}
            className="block w-full text-center px-5 py-3.5 rounded-2xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-all"
          >
            &larr; Back to Roadmap
          </Link>
        </div>

        {/* Saving indicator */}
        {saving && (
          <p className="text-center text-xs text-zinc-400 mt-4 animate-pulse">Saving results...</p>
        )}
      </div>
    </div>
  );
}
