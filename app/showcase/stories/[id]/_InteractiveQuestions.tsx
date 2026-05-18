"use client";

import { useState } from "react";

type Q = { prompt: string; choices: string[]; correct: string };

export function InteractiveQuestions({ questions }: { questions: Q[] }) {
  // One answer per question — null until tapped.
  const [picks, setPicks] = useState<(string | null)[]>(() => questions.map(() => null));

  function pick(qi: number, choice: string) {
    setPicks((prev) => {
      const next = [...prev];
      next[qi] = choice;
      return next;
    });
  }

  return (
    <div className="mt-6 space-y-8">
      {questions.map((q, qi) => {
        const picked = picks[qi];
        const answered = picked !== null;
        return (
          <div key={qi}>
            <div className="text-base font-extrabold text-zinc-900">
              {qi + 1}. {q.prompt}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.choices.map((c, ci) => {
                const isPicked = picked === c;
                const isCorrect = c === q.correct;
                const showCorrect = answered && isCorrect;
                const showWrongPick = answered && isPicked && !isCorrect;
                const dim = answered && !isPicked && !isCorrect;
                return (
                  <button
                    key={ci}
                    type="button"
                    onClick={() => !answered && pick(qi, c)}
                    disabled={answered}
                    className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] text-left ${
                      showCorrect
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : showWrongPick
                        ? "border-rose-400 bg-rose-50 text-rose-800"
                        : dim
                        ? "border-zinc-200 bg-zinc-50 text-zinc-500"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div
                className={`mt-2 text-xs font-bold ${
                  picked === q.correct ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {picked === q.correct ? "Correct!" : `The answer was: ${q.correct}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
