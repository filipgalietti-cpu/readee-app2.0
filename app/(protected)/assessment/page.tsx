"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Child } from "@/lib/db/types";
import {
  grades,
  gradeToKey,
  getPlacement,
  type GradeKey,
  type AssessmentQuestion,
  type MatchingQuestion,
} from "@/lib/assessment/questions";
import { generateMatchingSet } from "@/lib/word-bank/generators";
import { safeValidate } from "@/lib/validate";
import { AssessmentResultSchema } from "@/lib/schemas";
import { CategorySort } from "@/app/components/practice/CategorySort";
import { SentenceBuild } from "@/app/components/practice/SentenceBuild";
import { MissingWord } from "@/app/components/practice/MissingWord";
import { useAudio } from "@/lib/audio/use-audio";
import { FileText, Sparkles, Star, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CORRECT_MESSAGES = [
  "Amazing!", "Great job!", "You got it!", "Nice catch!",
  "Super smart!", "Wonderful!", "Nailed it!", "Brilliant!",
];
const CORRECT_EMOJIS = ["star", "sparkles", "sparkle", "star2", "zap", "target"];
const FEEDBACK_ICON_MAP: Record<string, LucideIcon> = {
  star: Star, sparkles: Sparkles, sparkle: Sparkles, star2: Star, zap: Target, target: Target,
};
const INCORRECT_MESSAGES = [
  "Not quite!", "Almost!", "Good try!", "Keep going!",
];

type Phase = "loading" | "intro" | "quiz" | "matching" | "results";

interface AnswerRecord {
  question_id: string;
  selected: string;
  correct: string;
  is_correct: boolean;
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    }>
      <AssessmentContent />
    </Suspense>
  );
}

function AssessmentContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("child");

  const [child, setChild] = useState<Child | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [gradeKey, setGradeKey] = useState<GradeKey>("kindergarten");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [levelName, setLevelName] = useState("");
  const [saving, setSaving] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    { id: number; left: number; color: string; delay: number }[]
  >([]);
  const [matchQuestions, setMatchQuestions] = useState<MatchingQuestion[]>([]);
  const [matchIdx, setMatchIdx] = useState(0);
  const [matchCorrect, setMatchCorrect] = useState(0);
  const [matchAnswered, setMatchAnswered] = useState(false);
  const [matchFeedback, setMatchFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    msg: string;
    emoji: string;
  }>({ show: false, isCorrect: false, msg: "", emoji: "" });
  const { playCorrectChime, playIncorrectBuzz } = useAudio();

  // Load child data
  useEffect(() => {
    async function load() {
      if (!childId) {
        setPhase("loading");
        return;
      }
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
        setQuestions(grades[gk].questions);
        // Skip straight to matching for testing: ?test=matching
        if (searchParams.get("test") === "matching") {
          setMatchQuestions(generateMatchingSet(3, 3));
          setPhase("matching");
          return;
        }
        setPhase("intro");
      }
    }
    load();
  }, [childId]);

  // Save results
  const saveResults = useCallback(
    async (finalAnswers: AnswerRecord[], matchingCorrect = 0, matchingTotal = 0) => {
      if (!child) return;
      setSaving(true);

      const mcCorrect = finalAnswers.filter((a) => a.is_correct).length;
      const correct = mcCorrect + matchingCorrect;
      const totalQuestions = finalAnswers.length + matchingTotal;
      const pct = Math.round((correct / totalQuestions) * 100);
      const placement = getPlacement(pct, gradeKey);

      setScore(correct);
      setLevelName(placement.levelName);

      // Spawn confetti
      const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ["#4338ca", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"][
          Math.floor(Math.random() * 6)
        ],
        delay: Math.random() * 1.5,
      }));
      setConfettiPieces(pieces);

      const supabase = supabaseBrowser();

      // Save assessment — validate payload
      const assessmentPayload = safeValidate(AssessmentResultSchema, {
        child_id: child.id,
        grade_tested: gradeKey,
        score_percent: pct,
        reading_level_placed: placement.levelName,
        answers: finalAnswers,
      });
      await supabase.from("assessments").insert(assessmentPayload);

      // Update child's reading level
      await supabase
        .from("children")
        .update({ reading_level: placement.levelName })
        .eq("id", child.id);

      setSaving(false);
      setPhase("results");
    },
    [child, gradeKey]
  );

  const handleAnswer = (choice: string) => {
    if (selectedChoice) return; // prevent double-click
    setSelectedChoice(choice);

    const q = questions[currentIdx];
    const record: AnswerRecord = {
      question_id: q.id,
      selected: choice,
      correct: q.correct,
      is_correct: choice === q.correct,
    };

    const newAnswers = [...answers, record];
    setAnswers(newAnswers);

    // Brief pause for animation, then advance
    setTimeout(() => {
      setSelectedChoice(null);
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(currentIdx + 1);
      } else if (gradeKey === "kindergarten") {
        // Kindergarten gets the mix & match bonus round
        setMatchQuestions(generateMatchingSet(3, 3));
        setPhase("matching");
      } else {
        saveResults(newAnswers);
      }
    }, 600);
  };

  if (phase === "loading" || !child) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  /* ─── Intro ──────────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-8">
        <div className="w-24 h-24 rounded-2xl bg-indigo-50 mx-auto flex items-center justify-center">
          <FileText className="w-12 h-12 text-indigo-500" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Let&apos;s see where {child.first_name} is!
          </h1>
          <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
            Take a quick {questions.length}-question reading quiz. No pressure — just
            a fun way to find the right starting level.
          </p>
        </div>
        <div className="space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
            {grades[gradeKey].grade_label} Level
          </div>
          <div className="text-sm text-zinc-400">
            {questions.length} questions &middot; About 3 minutes
          </div>
        </div>
        <button
          onClick={() => setPhase("quiz")}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg hover:shadow-xl"
        >
          Start Quiz
        </button>
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Skip for now
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Quiz ───────────────────────────────────────────── */
  if (phase === "quiz") {
    const q = questions[currentIdx];
    const progress = ((currentIdx) / questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-indigo-600">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-zinc-400">
              {grades[gradeKey].grade_label}
            </span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stimulus */}
        {q.stimulus && (
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 text-center">
            {q.stimulus_type === "large_letter" || q.stimulus_type === "segmented_word" ? (
              <div className="text-5xl font-bold text-indigo-700 tracking-widest">
                {q.stimulus}
              </div>
            ) : q.stimulus_type === "word_display" ? (
              <div className="text-4xl font-bold text-indigo-700 tracking-wide">
                {q.stimulus}
              </div>
            ) : q.stimulus_type === "passage" ? (
              <p className="text-lg text-zinc-700 leading-relaxed text-left italic">
                &ldquo;{q.stimulus}&rdquo;
              </p>
            ) : q.stimulus_type === "sentence" ? (
              <p className="text-xl text-zinc-800 font-medium">
                {q.stimulus}
              </p>
            ) : (
              <div className="text-4xl">{q.stimulus}</div>
            )}
          </div>
        )}

        {/* Prompt */}
        <h2 className="text-xl font-bold text-zinc-900 text-center leading-relaxed">
          {q.prompt}
        </h2>

        {/* Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.choices.map((choice, i) => {
            const isSelected = selectedChoice === choice;
            const letters = ["A", "B", "C", "D"];

            return (
              <button
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={!!selectedChoice}
                className={`
                  relative text-left rounded-2xl border-2 p-4 transition-all duration-200
                  ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                      : "border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-md"
                  }
                  ${selectedChoice && !isSelected ? "opacity-50" : ""}
                  disabled:cursor-default
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                    ${isSelected ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-500"}
                  `}
                  >
                    {letters[i]}
                  </div>
                  <span
                    className={`font-medium ${
                      isSelected ? "text-indigo-700" : "text-zinc-800"
                    }`}
                  >
                    {choice}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Matching (kindergarten bonus) ──────────────────── */
  if (phase === "matching") {
    const mq = matchQuestions[matchIdx];
    const matchTotal = matchQuestions.length;
    const matchProgress = (matchIdx / matchTotal) * 100;

    const advanceMatch = (isCorrect: boolean) => {
      if (isCorrect) setMatchCorrect((c) => c + 1);
      setMatchAnswered(true);

      // Play chime/buzz and show feedback banner
      if (isCorrect) {
        playCorrectChime();
      } else {
        playIncorrectBuzz();
      }
      const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
      setMatchFeedback({
        show: true,
        isCorrect,
        msg: isCorrect ? pick(CORRECT_MESSAGES) : pick(INCORRECT_MESSAGES),
        emoji: isCorrect ? pick(CORRECT_EMOJIS) : "",
      });

      setTimeout(() => {
        setMatchFeedback((f) => ({ ...f, show: false }));
        setMatchAnswered(false);
        if (matchIdx + 1 < matchTotal) {
          setMatchIdx(matchIdx + 1);
        } else {
          const finalMatchCorrect = matchCorrect + (isCorrect ? 1 : 0);
          saveResults(answers, finalMatchCorrect, matchTotal);
        }
      }, 1500);
    };

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-indigo-600">
              Activity {matchIdx + 1} of {matchTotal}
            </span>
            <span className="text-zinc-400">Mix &amp; Match</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${matchProgress}%` }}
            />
          </div>
        </div>

        {mq.type === "category_sort" && mq.categories && mq.categoryItems && mq.items && (
          <CategorySort
            key={mq.id}
            prompt={mq.prompt}
            categories={mq.categories}
            categoryItems={mq.categoryItems}
            items={mq.items}
            answered={matchAnswered}
            onAnswer={(isCorrect) => advanceMatch(isCorrect)}
            onCorrectPlace={playCorrectChime}
            onIncorrectPlace={playIncorrectBuzz}
          />
        )}

        {mq.type === "sentence_build" && mq.words && mq.correctSentence && (
          <SentenceBuild
            key={mq.id}
            prompt={mq.prompt}
            passage={null}
            words={mq.words}
            correctSentence={mq.correctSentence}
            sentenceHint={mq.sentenceHint}
            sentenceAudioUrl={mq.sentenceAudioUrl}
            answered={matchAnswered}
            onAnswer={(isCorrect) => advanceMatch(isCorrect)}
          />
        )}

        {mq.type === "missing_word" && mq.sentenceWords && mq.missingChoices && mq.blankIndex !== undefined && (
          <MissingWord
            key={mq.id}
            prompt={mq.prompt}
            sentenceWords={mq.sentenceWords}
            blankIndex={mq.blankIndex}
            choices={mq.missingChoices}
            sentenceHint={mq.sentenceHint}
            sentenceAudioUrl={mq.sentenceAudioUrl}
            answered={matchAnswered}
            onAnswer={(isCorrect) => advanceMatch(isCorrect)}
          />
        )}

        {/* Feedback banner */}
        {matchFeedback.show && (
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
              matchFeedback.isCorrect
                ? "bg-gradient-to-r from-emerald-500 to-green-500"
                : "bg-gradient-to-r from-red-500 to-orange-500"
            }`}
          >
            <div className="max-w-lg mx-auto px-5 py-5 safe-area-bottom">
              <div className="flex items-center gap-3">
                {matchFeedback.isCorrect ? (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    {(() => { const FI = FEEDBACK_ICON_MAP[matchFeedback.emoji] || Star; return <FI className="w-5 h-5 text-white" strokeWidth={1.5} />; })()}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <p className="text-white font-extrabold text-lg">{matchFeedback.msg}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ─── Results ────────────────────────────────────────── */
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
          <div className="text-sm font-medium text-indigo-200">
            You are a
          </div>
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
