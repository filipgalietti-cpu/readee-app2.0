"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Carrot } from "lucide-react";

/* ─── Asset URL builder ──────────────────────────────── */
const STORAGE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

function imgUrl(id: string, grade: string) {
  const standard = id.replace(/-Q\d+$/, "");
  return `${STORAGE}/images/${grade}/${standard}/${id}.png`;
}

/* ─── Questions (2 only) ─────────────────────────────── */
const screens = [
  {
    id: "RL.K.1-Q1",
    grade: "kindergarten",
    passage:
      "Max the dog ran to the park. He played fetch with a red ball.",
    prompt: "What did Max play with?",
    choices: ["A stick", "A red ball", "A bone", "A toy car"],
    correct: "A red ball",
  },
  {
    id: "RL.K.1-Q2",
    grade: "kindergarten",
    passage:
      "Lily put on her yellow raincoat. She splashed in every puddle on the way to school.",
    prompt: "Where was Lily going?",
    choices: ["To bed", "To the store", "To school", "To the park"],
    correct: "To school",
  },
];

/* ─── Choice colors (matching real app) ──────────────── */
const CHOICE_BG = [
  "bg-blue-100 text-blue-800 border-blue-300",
  "bg-purple-100 text-purple-800 border-purple-300",
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-emerald-100 text-emerald-800 border-emerald-300",
];

/* ─── Component ──────────────────────────────────────── */
type Phase = "reading" | "selecting" | "feedback" | "transition";

export default function LessonDemoPage() {
  const [screenIdx, setScreenIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("reading");
  const [carrots, setCarrots] = useState(9);

  const q = screens[screenIdx];
  const progress = ((screenIdx + (phase === "feedback" || phase === "transition" ? 1 : 0.5)) / screens.length) * 100;
  const image = imgUrl(q.id, q.grade);

  const dots = screens.map((_, i) => {
    if (i < screenIdx) return true; // completed
    if (i === screenIdx && phase === "feedback") return true;
    if (i === screenIdx) return null; // current
    return undefined; // upcoming
  });

  // Track whether we're in the hidden gap between fade-out and fade-in
  const [hidden, setHidden] = useState(false);

  const restart = useCallback(() => {
    setScreenIdx(0);
    setPhase("reading");
    setCarrots(9);
    setHidden(false);
  }, []);

  /* Preload all question images on mount */
  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    screens.forEach((s) => {
      const img = new Image();
      img.src = imgUrl(s.id, s.grade);
    });
  }, []);

  /* Auto-play sequence — slowed down */
  useEffect(() => {
    if (phase === "reading") {
      const t = setTimeout(() => setPhase("selecting"), 3000);
      return () => clearTimeout(t);
    }
    if (phase === "selecting") {
      const t = setTimeout(() => {
        setPhase("feedback");
        setCarrots((c) => c + 3);
      }, 1200);
      return () => clearTimeout(t);
    }
    if (phase === "feedback") {
      const t = setTimeout(() => {
        if (screenIdx < screens.length - 1) {
          setPhase("transition");
        }
        // Last question stays on feedback
      }, 2500);
      return () => clearTimeout(t);
    }
    if (phase === "transition") {
      // After fade-out completes, swap content while fully hidden, then fade in
      const swapTimer = setTimeout(() => {
        setHidden(true);
        setScreenIdx((i) => i + 1);
        setPhase("reading");
        // Small delay before showing to ensure new content is rendered
        setTimeout(() => setHidden(false), 50);
      }, 600);
      return () => clearTimeout(swapTimer);
    }
  }, [phase, screenIdx]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── App chrome: top bar ── */}
      <div className="flex items-center gap-3 px-6 pt-4 pb-2 max-w-lg mx-auto w-full">
        {/* Close button */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-4 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #4ade80, #22c55e)",
              boxShadow: "0 0 8px rgba(74,222,128,0.4)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                width: "50%",
                animation: "shimmer 2s linear infinite",
              }}
            />
          </div>
        </div>

        {/* Carrot counter — Lucide Carrot icon */}
        <div
          className={`flex items-center gap-1 bg-zinc-200 px-3 py-1.5 rounded-full transition-all ${
            phase === "feedback"
              ? "scale-125 shadow-[0_0_8px_4px_rgba(251,191,36,0.5)]"
              : ""
          }`}
          style={{ transition: "all 0.6s" }}
        >
          <Carrot className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
          <span className="text-sm font-bold text-orange-600 tabular-nums">
            {carrots}
          </span>
        </div>

        {/* Mute */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z"
            />
          </svg>
        </button>
      </div>

      {/* ── Question content ── */}
      <div
        className={`flex-1 max-w-lg mx-auto w-full px-6 pt-2 pb-32 flex flex-col ${
          phase === "transition" || hidden ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
        style={{ transition: hidden ? "none" : "opacity 0.5s ease, transform 0.5s ease" }}
      >
        {/* Image */}
        <div className="flex justify-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="max-h-[160px] sm:max-h-[200px] w-auto object-contain rounded-2xl shadow-md border-2 border-white"
          />
        </div>

        {/* Passage */}
        <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-200 p-5">
          <div className="flex items-start gap-3">
            <button
              className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200"
              aria-label="Listen to passage"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            </button>
            <p
              className="text-lg leading-relaxed font-semibold text-gray-800 tracking-wide"
              style={{ lineHeight: "1.8" }}
            >
              &ldquo;{q.passage}&rdquo;
            </p>
          </div>
        </div>

        {/* Question + replay */}
        <div className="mb-3">
          <div className="flex items-center gap-2 max-w-[600px] mx-auto justify-center">
            <h2 className="text-xl font-bold text-gray-900 leading-snug text-center">
              {q.prompt}
            </h2>
            <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 flex-shrink-0">
              <svg
                className="w-4 h-4 text-indigo-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {dots.map((d, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                d === true
                  ? "bg-emerald-500 w-2.5 h-2.5"
                  : d === null
                    ? "bg-indigo-500 w-3.5 h-3.5"
                    : "bg-zinc-200 w-2.5 h-2.5"
              }`}
            />
          ))}
        </div>

        {/* Answer choices — 2x2 colorful grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {q.choices.map((choice, i) => {
            const isCorrectChoice = choice === q.correct;
            const isAnswered = phase === "feedback";
            const isSelecting = phase === "selecting" && isCorrectChoice;

            let bg = CHOICE_BG[i];
            let textColor = "";
            let extra = "";

            if (isSelecting) {
              extra = "ring-2 ring-offset-2 ring-indigo-500 scale-[0.95]";
            } else if (isAnswered && isCorrectChoice) {
              bg = "bg-emerald-500 border-emerald-600";
              textColor = "text-white";
              extra = "scale-[1.05]";
            } else if (isAnswered) {
              extra = "opacity-40";
            }

            return (
              <div
                key={i}
                className={`
                  flex items-center justify-center px-3 py-3 rounded-2xl border-2 relative
                  transition-all duration-300 min-h-[56px] ${bg} ${textColor} ${extra}
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {isAnswered && isCorrectChoice && (
                    <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  <span
                    className={`text-base font-bold leading-snug text-center ${textColor}`}
                  >
                    {choice}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Correct banner */}
        {phase === "feedback" && (
          <div className="mt-4 text-center animate-in">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-300 px-6 py-3 rounded-2xl">
              <svg
                className="w-6 h-6 text-emerald-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-lg font-extrabold text-emerald-700">
                Correct!
              </span>
              <span className="text-sm font-bold text-orange-500">+3</span>
              <Carrot className="w-4 h-4 text-orange-500" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
        .animate-in { animation: fadeScaleIn 0.4s ease both; }
        @keyframes fadeScaleIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>
    </div>
  );
}
