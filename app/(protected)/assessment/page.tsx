"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "@/lib/assessment/questions";

type Phase = "loading" | "intro" | "quiz" | "results";

interface AnswerRecord {
  question_id: string;
  selected: string;
  correct: string;
  is_correct: boolean;
}

export default function AssessmentPage() {
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
        setPhase("intro");
      }
    }
    load();
  }, [childId]);

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

      // Save assessment
      await supabase.from("assessments").insert({
        child_id: child.id,
        grade_tested: gradeKey,
        score_percent: pct,
        reading_level_placed: placement.levelName,
        answers: finalAnswers,
      });

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
        <div className="w-24 h-24 rounded-2xl bg-indigo-50 mx-auto flex items-center justify-center text-5xl">
          📝
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

  /* ─── Results ────────────────────────────────────────── */
  if (phase === "results") {
    const stars = Array.from({ length: questions.length }, (_, i) => i < score);

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

        <div className="text-6xl">🎉</div>

        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Great job, {child.first_name}!
          </h1>
          <p className="text-zinc-500 mt-2">
            You scored {score} out of {questions.length}
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1.5">
          {stars.map((filled, i) => (
            <span
              key={i}
              className={`text-2xl ${filled ? "" : "opacity-20"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Level badge */}
        <div className="inline-block rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-8 py-4 text-white">
          <div className="text-sm font-medium text-indigo-200">
            Reading Level
          </div>
          <div className="text-2xl font-bold mt-1">{levelName}</div>
        </div>

        {saving ? (
          <p className="text-zinc-400 text-sm">Saving your results...</p>
        ) : (
          <div className="space-y-3 pt-4">
            <Link
              href="/reader/1"
              className="block w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold text-lg hover:from-indigo-700 hover:to-violet-600 transition-all shadow-lg"
            >
              Start Your First Lesson &rarr;
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
