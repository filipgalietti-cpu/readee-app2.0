"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Assessment Questions ───────────────────────────── */

const CHILD_NAME = "Emma";

const screens = [
  {
    stimulus: null,
    stimulusType: null,
    prompt: "Which word rhymes with cat?",
    choices: ["Dog", "Bat", "Cup", "Run"],
    correct: "Bat",
    skill: "Phonics",
  },
  {
    stimulus: "B",
    stimulusType: "large_letter" as const,
    prompt: "What sound does this letter make?",
    choices: ["/b/", "/d/", "/p/", "/m/"],
    correct: "/b/",
    skill: "Letter Sounds",
  },
  {
    stimulus: "The sun is hot. It shines in the sky during the day.",
    stimulusType: "passage" as const,
    prompt: "When does the sun shine?",
    choices: ["At night", "During the day", "In the rain", "In winter"],
    correct: "During the day",
    skill: "Comprehension",
  },
];

/* ─── Choice colors ──────────────────────────────────── */
const LETTER_LABELS = ["A", "B", "C", "D"];
const CHOICE_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", hover: "hover:border-blue-400", badge: "bg-blue-500" },
  { bg: "bg-purple-50", border: "border-purple-200", hover: "hover:border-purple-400", badge: "bg-purple-500" },
  { bg: "bg-amber-50", border: "border-amber-200", hover: "hover:border-amber-400", badge: "bg-amber-500" },
  { bg: "bg-emerald-50", border: "border-emerald-200", hover: "hover:border-emerald-400", badge: "bg-emerald-500" },
];

/* ─── Component ──────────────────────────────────────── */
type Phase = "reading" | "selecting" | "feedback" | "transition";

export default function AssessmentDemoPage() {
  const [screenIdx, setScreenIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("reading");

  const q = screens[screenIdx];
  const progress = ((screenIdx + (phase === "feedback" ? 1 : 0)) / screens.length) * 100;

  const restart = useCallback(() => {
    setScreenIdx(0);
    setPhase("reading");
  }, []);

  /* Auto-play sequence */
  useEffect(() => {
    if (phase === "reading") {
      const t = setTimeout(() => setPhase("selecting"), 2500);
      return () => clearTimeout(t);
    }
    if (phase === "selecting") {
      const t = setTimeout(() => setPhase("feedback"), 1200);
      return () => clearTimeout(t);
    }
    if (phase === "feedback") {
      const t = setTimeout(() => {
        if (screenIdx < screens.length - 1) {
          setPhase("transition");
        }
      }, 2000);
      return () => clearTimeout(t);
    }
    if (phase === "transition") {
      const t = setTimeout(() => {
        setScreenIdx((i) => i + 1);
        setPhase("reading");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [phase, screenIdx]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top bar ── */}
      <div className="max-w-2xl mx-auto w-full px-6 pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-indigo-600">
            Question {screenIdx + 1} of {screens.length}
          </span>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
            {CHILD_NAME}&apos;s Assessment
          </span>
        </div>
        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #4f46e5, #8b5cf6)",
            }}
          />
        </div>
      </div>

      {/* ── Question content ── */}
      <div
        className={`flex-1 max-w-2xl mx-auto w-full px-6 pt-6 pb-20 flex flex-col transition-all duration-300 ${
          phase === "transition" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Stimulus */}
        {q.stimulus && (
          <div className="mb-6 flex justify-center">
            {q.stimulusType === "large_letter" && (
              <div className="w-28 h-28 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center">
                <span className="text-6xl font-extrabold text-indigo-700 tracking-widest">
                  {q.stimulus}
                </span>
              </div>
            )}
            {q.stimulusType === "passage" && (
              <div className="w-full rounded-2xl bg-indigo-50 border border-indigo-200 p-5">
                <div className="flex items-start gap-3">
                  <button className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  </button>
                  <p className="text-lg leading-relaxed font-medium text-gray-800 italic" style={{ lineHeight: "1.8" }}>
                    &ldquo;{q.stimulus}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prompt */}
        <div className="mb-8 text-center">
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-[22px] font-bold text-gray-900 leading-snug">
              {q.prompt}
            </h2>
            <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 flex-shrink-0">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5 font-medium">{q.skill}</p>
        </div>

        {/* Answer choices — 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((choice, i) => {
            const isCorrectChoice = choice === q.correct;
            const isAnswered = phase === "feedback";
            const isSelecting = phase === "selecting" && isCorrectChoice;
            const color = CHOICE_COLORS[i];

            let borderClass = `${color.border}`;
            let bgClass = color.bg;
            let extraClass = "";
            let badgeClass = color.badge;

            if (isSelecting) {
              borderClass = "border-indigo-500";
              bgClass = "bg-indigo-50";
              extraClass = "scale-[1.02] shadow-md";
            } else if (isAnswered && isCorrectChoice) {
              borderClass = "border-emerald-500";
              bgClass = "bg-emerald-50";
              badgeClass = "bg-emerald-500";
              extraClass = "scale-[1.02] shadow-lg shadow-emerald-100";
            } else if (isAnswered) {
              extraClass = "opacity-40";
            }

            return (
              <div
                key={i}
                className={`
                  flex items-center gap-3 p-4 rounded-2xl border-2
                  transition-all duration-300 ${bgClass} ${borderClass} ${extraClass}
                `}
              >
                <div className={`w-8 h-8 rounded-lg ${badgeClass} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-sm font-bold text-white">{LETTER_LABELS[i]}</span>
                </div>
                <span className="text-base font-extrabold text-gray-800 leading-snug">
                  {choice}
                </span>
                {isAnswered && isCorrectChoice && (
                  <svg className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback banner */}
        {phase === "feedback" && (
          <div className="mt-6 animate-in">
            <div className="flex items-center justify-center gap-2 bg-emerald-50 border-2 border-emerald-300 px-6 py-3 rounded-2xl">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-lg font-extrabold text-emerald-700">Correct!</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-in { animation: fadeScaleIn 0.4s ease both; }
        @keyframes fadeScaleIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </div>
  );
}
