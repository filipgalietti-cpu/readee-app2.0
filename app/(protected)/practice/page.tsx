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

type Phase = "playing" | "feedback" | "complete";

/* ─── Constants ──────────────────────────────────────── */

const ALL_STANDARDS = (kStandards as { standards: Standard[] }).standards;
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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#0f172a] gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-indigo-900 border-t-indigo-400 animate-spin" />
      <p className="text-indigo-300 text-sm font-medium">Loading questions...</p>
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
      <div className="min-h-[100dvh] bg-[#0f172a] flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 px-6">
          <div className="text-5xl">🔍</div>
          <h1 className="text-xl font-bold text-white">
            {!child ? "No reader selected" : "Standard not found"}
          </h1>
          <Link href="/dashboard" className="inline-block text-sm text-indigo-400 hover:text-indigo-300 font-medium">
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

  const questions = useMemo(() => {
    if (standard.questions.length <= QUESTIONS_PER_SESSION) return standard.questions;
    return shuffleArray(standard.questions).slice(0, QUESTIONS_PER_SESSION);
  }, [standard]);

  const [phase, setPhase] = useState<Phase>("playing");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [sessionXP, setSessionXP] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackEmoji, setFeedbackEmoji] = useState("");
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const q = questions[currentIdx];
  const totalQ = questions.length;

  /* ── Handle answer selection ── */
  const handleAnswer = useCallback((choice: string) => {
    if (selected !== null) return;

    const correct = choice === q.correct;
    setSelected(choice);
    setIsCorrect(correct);
    setPhase("feedback");

    if (correct) {
      setFeedbackMsg(pickRandom(CORRECT_MESSAGES));
      setFeedbackEmoji(pickRandom(CORRECT_EMOJIS));
      setSessionXP((prev) => prev + XP_PER_CORRECT);
    } else {
      setFeedbackMsg(pickRandom(INCORRECT_MESSAGES));
      setFeedbackEmoji("");
    }

    setAnswers((prev) => [...prev, { questionId: q.id, correct, selected: choice }]);
  }, [selected, q]);

  /* ── Continue to next question ── */
  const handleContinue = useCallback(() => {
    if (currentIdx + 1 < totalQ) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setIsCorrect(null);
      setFeedbackMsg("");
      setFeedbackEmoji("");
      setPhase("playing");
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("complete");
    }
  }, [currentIdx, totalQ]);

  /* ── Exit ── */
  const handleExit = useCallback(() => {
    router.push(`/roadmap?child=${child.id}`);
  }, [router, child.id]);

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
          setFeedbackEmoji("");
        }}
      />
    );
  }

  const { passage, question } = splitPrompt(q.prompt);
  const progressPct = ((currentIdx + (phase === "feedback" ? 1 : 0)) / totalQ) * 100;

  return (
    <div ref={scrollRef} className="min-h-[100dvh] bg-[#0f172a] flex flex-col overflow-y-auto">
      {/* ── Top bar: progress + close ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={handleExit}
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Exit"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #4ade80, #22c55e)",
              boxShadow: "0 0 8px rgba(74, 222, 128, 0.4)",
            }}
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full flex-shrink-0">
          <span className="text-sm">⭐</span>
          <span className="text-sm font-bold text-amber-400 tabular-nums">{sessionXP}</span>
        </div>
      </div>

      {/* ── Question area ── */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 pb-32 flex flex-col">
        {/* Passage */}
        {passage && (
          <div className="mb-5 rounded-2xl bg-slate-800/80 border border-slate-700 p-5 animate-fadeUp">
            <p className="text-lg leading-relaxed text-slate-200 whitespace-pre-line">{passage}</p>
          </div>
        )}

        {/* Question */}
        <div className="mb-6 animate-fadeUp" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-[22px] font-bold text-white leading-snug">
            {question}
          </h2>
        </div>

        {/* Answer choices */}
        <div className="space-y-3">
          {q.choices.map((choice, i) => {
            const isSelected = selected === choice;
            const isCorrectChoice = choice === q.correct;
            const answered = selected !== null;

            let bg = "bg-slate-800 border-slate-600 hover:border-indigo-400 hover:bg-slate-700 active:scale-[0.97]";
            let textColor = "text-white";
            let badgeBg = "bg-slate-700 text-slate-300";

            if (answered) {
              if (isSelected && isCorrect) {
                bg = "bg-emerald-900/60 border-emerald-500 ring-2 ring-emerald-500/30";
                textColor = "text-emerald-100";
                badgeBg = "bg-emerald-500 text-white";
              } else if (isSelected && !isCorrect) {
                bg = "bg-red-900/40 border-red-500 ring-2 ring-red-500/30 animate-wrongShake";
                textColor = "text-red-200";
                badgeBg = "bg-red-500 text-white";
              } else if (isCorrectChoice && !isCorrect) {
                bg = "bg-emerald-900/40 border-emerald-500";
                textColor = "text-emerald-200";
                badgeBg = "bg-emerald-500 text-white";
              } else {
                bg = "bg-slate-800/40 border-slate-700 opacity-40";
                textColor = "text-slate-400";
              }
            }

            return (
              <button
                key={choice}
                onClick={() => handleAnswer(choice)}
                disabled={answered}
                className={`
                  w-full text-left px-5 py-4 rounded-2xl border-2
                  transition-all duration-200 outline-none animate-fadeUp
                  ${bg}
                  ${answered ? "cursor-default" : "cursor-pointer"}
                `}
                style={{ animationDelay: `${0.1 + i * 0.06}s`, minHeight: 60 }}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${badgeBg}`}>
                    {answered && isSelected && isCorrect ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : answered && isSelected && !isCorrect ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : answered && isCorrectChoice && !isCorrect ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  <span className={`text-lg font-medium leading-snug ${textColor}`}>
                    {choice}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bottom feedback bar (Duolingo-style) ── */}
      {phase === "feedback" && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 animate-slideUp ${
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
        </div>
      )}
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
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string; size: number }[]>([]);
  const totalQ = questions.length;
  const stars = getStars(correctCount, totalQ);
  const nextStandard = getNextStandard(standard.standard_id);

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

  /* ── Confetti for 5/5 ── */
  useEffect(() => {
    if (correctCount < totalQ) return;
    const pieces = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      size: 6 + Math.random() * 8,
      color: ["#4ade80", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e"][i % 7],
    }));
    setConfetti(pieces);
  }, [correctCount, totalQ]);

  /* ── Save results ── */
  useEffect(() => {
    if (saved || saving) return;
    setSaving(true);

    async function save() {
      const supabase = supabaseBrowser();

      await supabase.from("practice_results").insert({
        child_id: child.id,
        standard_id: standard.standard_id,
        questions_attempted: totalQ,
        questions_correct: correctCount,
        xp_earned: xpEarned,
      });

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
    <div className="min-h-[100dvh] bg-[#0f172a] relative overflow-hidden flex flex-col">
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti-fall absolute rounded-full pointer-events-none"
          style={{
            left: `${c.left}%`,
            top: -20,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10 max-w-lg mx-auto w-full">
        {/* Stars */}
        <div className="flex items-end gap-2 mb-6 animate-scaleIn">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`transition-all duration-500 ${s === 2 ? "mb-2" : ""}`}
              style={{ animationDelay: `${s * 0.15}s` }}
            >
              <svg
                viewBox="0 0 24 24"
                className={`${s === 2 ? "w-16 h-16" : "w-12 h-12"} transition-all duration-500`}
                fill={s <= stars ? "#facc15" : "#334155"}
                stroke={s <= stars ? "#eab308" : "#475569"}
                strokeWidth="0.5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {s <= stars && (
                <div className="absolute inset-0 animate-popIn" style={{ animationDelay: `${0.3 + s * 0.15}s` }} />
              )}
            </div>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight text-center mb-1 animate-fadeUp">
          {title}
        </h1>
        <p className="text-slate-400 text-center mb-8">{subtitle}</p>

        {/* Score + XP */}
        <div className="flex gap-6 mb-8 dash-slide-up-1">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-white">{correctCount}/{totalQ}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Correct</div>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-4xl font-extrabold text-amber-400">+{xpEarned}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">XP Earned</div>
          </div>
        </div>

        {/* Question results */}
        <div className="w-full space-y-2 mb-8 dash-slide-up-2">
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
                <span className="text-sm text-slate-300 flex-1 min-w-0 truncate">{qText}</span>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-3 dash-slide-up-3">
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
            className="w-full py-4 rounded-2xl border-2 border-slate-600 text-white font-bold text-base hover:bg-slate-800 transition-all active:scale-[0.97]"
          >
            Practice Again
          </button>

          <Link
            href={`/dashboard`}
            className="block w-full text-center py-3 rounded-2xl text-slate-400 font-semibold text-sm hover:text-white transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {saving && (
          <p className="text-center text-xs text-slate-500 mt-4 animate-pulse">Saving results...</p>
        )}
      </div>
    </div>
  );
}
