"use client";

import { useState } from "react";

/* ─── Asset URL builder ──────────────────────────────── */
const STORAGE =
  "https://rwlvjtowmfrrqeqvwolo.supabase.co/storage/v1/object/public";

function imgUrl(id: string, grade: string) {
  const standard = id.replace(/-Q\d+$/, "");
  return `${STORAGE}/images/${grade}/${standard}/${id}.png`;
}

/* ─── Demo screens — real questions from the app ─────── */
const screens = [
  {
    id: "RL.K.1-Q1",
    grade: "kindergarten",
    passage:
      "Max the dog ran to the park. He played fetch with a red ball.",
    prompt: "What did Max play with?",
    choices: ["A stick", "A toy car", "A red ball", "A bone"],
    correct: "A red ball",
  },
  {
    id: "RL.K.1-Q2",
    grade: "kindergarten",
    passage:
      "Lily put on her yellow raincoat. She splashed in every puddle on the way to school.",
    prompt: "Where was Lily going?",
    choices: ["To bed", "To the store", "To the park", "To school"],
    correct: "To school",
  },
  {
    id: "RL.K.1-Q4",
    grade: "kindergarten",
    passage:
      "Sam found a tiny kitten under the porch. The kitten was gray with white paws. Sam named her Mittens.",
    prompt: "What did the kitten look like?",
    choices: [
      "Gray with white paws",
      "All white",
      "Black with white spots",
      "Orange and fluffy",
    ],
    correct: "Gray with white paws",
  },
  {
    id: "RL.K.3-Q2",
    grade: "kindergarten",
    passage:
      "Rosa built a sandcastle at the beach. The waves knocked it down!",
    prompt: "WHERE does this story take place?",
    choices: ["At the park", "At the beach", "At school", "At home"],
    correct: "At the beach",
  },
  {
    id: "RL.K.3-Q4",
    grade: "kindergarten",
    passage:
      "Owl sat on a branch in the dark forest. He hooted at the moon.",
    prompt: "WHEN does this story happen?",
    choices: [
      "In the afternoon",
      "At lunchtime",
      "In the morning",
      "At nighttime",
    ],
    correct: "At nighttime",
  },
  {
    id: "RL.K.2-Q4",
    grade: "kindergarten",
    passage:
      "Turtle was slow but kept walking. Rabbit ran fast and took a nap. Turtle passed Rabbit and won the race!",
    prompt: "What happened at the end?",
    choices: [
      "They both stopped",
      "Turtle won the race.",
      "Rabbit won the race.",
      "Turtle gave up",
    ],
    correct: "Turtle won the race.",
  },
];

/* ─── Component ──────────────────────────────────────── */
export default function DemoPage() {
  const [screenIdx, setScreenIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [hideChrome, setHideChrome] = useState(false);

  const q = screens[screenIdx];
  const progress = ((screenIdx + 1) / screens.length) * 100;
  const letters = ["A", "B", "C", "D"];
  const image = imgUrl(q.id, q.grade);

  const handleSelect = (choice: string) => {
    if (selectedChoice) return;
    setSelectedChoice(choice);
    setShowCorrect(true);
  };

  const go = (dir: 1 | -1) => {
    setSelectedChoice(null);
    setShowCorrect(false);
    setScreenIdx((i) => (i + dir + screens.length) % screens.length);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Control bar ── */}
      {!hideChrome && (
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
              Screenshot Demo
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => go(-1)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                &larr; Prev
              </button>
              <span className="text-sm text-zinc-400">
                {screenIdx + 1} / {screens.length}
              </span>
              <button
                onClick={() => go(1)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                Next &rarr;
              </button>
              <div className="w-px h-5 bg-zinc-300" />
              <button
                onClick={() => setHideChrome(true)}
                className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Hide controls
              </button>
            </div>
          </div>
        </div>
      )}

      {hideChrome && (
        <button
          onClick={() => setHideChrome(false)}
          className="fixed top-2 right-2 z-50 px-2 py-1 text-xs bg-black/10 text-black/40 rounded hover:bg-black/20 transition-colors"
        >
          Show controls
        </button>
      )}

      {/* ── Question area ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-indigo-600">
                Question {screenIdx + 1} of {screens.length}
              </span>
              <span className="text-zinc-400 font-medium">Kindergarten</span>
            </div>
            <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="max-h-[220px] sm:max-h-[280px] w-auto object-contain rounded-2xl shadow-md border-2 border-white"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display =
                  "none";
              }}
            />
          </div>

          {/* Passage */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
            <div className="flex items-start gap-4">
              <button className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 hover:bg-indigo-600 transition-colors" aria-label="Listen to passage">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              <p
                className="text-xl leading-loose font-semibold text-gray-800 tracking-wide"
                style={{ lineHeight: "1.9" }}
              >
                &ldquo;{q.passage}&rdquo;
              </p>
            </div>
          </div>

          {/* Prompt */}
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl font-bold text-zinc-900 text-center leading-relaxed">
              {q.prompt}
            </h2>
            <button className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors" aria-label="Replay question audio">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8L10.2 5.1c.9-.9 2.3-.3 2.3 1v11.8c0 1.3-1.4 1.9-2.3 1l-3.7-3.7H4c-.6 0-1-.4-1-1v-4.4c0-.6.4-1 1-1h2.5z"/>
              </svg>
            </button>
          </div>

          {/* Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.choices.map((choice, i) => {
              const isSelected = selectedChoice === choice;
              const isCorrect = showCorrect && choice === q.correct;
              const isWrong =
                showCorrect && isSelected && choice !== q.correct;
              const dimmed = selectedChoice && !isSelected && !isCorrect;

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(choice)}
                  className={`
                    relative text-left rounded-2xl border-2 p-5 transition-all duration-200
                    ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-50 scale-[1.02]"
                        : isWrong
                          ? "border-red-400 bg-red-50"
                          : isSelected
                            ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                            : "border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-md"
                    }
                    ${dimmed ? "opacity-40" : ""}
                    disabled:cursor-default
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${
                          isCorrect
                            ? "bg-emerald-500 text-white"
                            : isWrong
                              ? "bg-red-400 text-white"
                              : isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-zinc-100 text-zinc-500"
                        }
                      `}
                    >
                      {isCorrect ? "✓" : isWrong ? "✗" : letters[i]}
                    </div>
                    <span
                      className={`text-base font-semibold ${
                        isCorrect
                          ? "text-emerald-700"
                          : isWrong
                            ? "text-red-600"
                            : isSelected
                              ? "text-indigo-700"
                              : "text-zinc-800"
                      }`}
                    >
                      {choice}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          {showCorrect && (
            <div className="text-center pt-2">
              <button
                onClick={() => go(1)}
                className="px-8 py-3 rounded-full bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
              >
                Next Question &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
