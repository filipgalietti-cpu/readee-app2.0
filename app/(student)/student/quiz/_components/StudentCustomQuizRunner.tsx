"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, X, Loader2, Trophy, Carrot } from "lucide-react";

type QuestionKind = "multiple_choice" | "true_false" | "fill_in_blank";

type Question = {
  id: string;
  kind: QuestionKind;
  prompt: string;
  choices: string[] | null;
  correct: any;
  hint: string | null;
};

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase();
}

export default function StudentCustomQuizRunner({
  quizId,
  questions,
  passThreshold,
}: {
  quizId: string;
  questions: Question[];
  passThreshold?: number | null;
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [pickedChoice, setPickedChoice] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, start] = useTransition();

  const q = questions[idx];
  const total = questions.length;

  function currentAnswerCorrect(): boolean {
    if (!q) return false;
    if (q.kind === "multiple_choice") {
      return !!pickedChoice && pickedChoice === String(q.correct);
    }
    if (q.kind === "true_false") {
      return pickedChoice === String(q.correct);
    }
    if (q.kind === "fill_in_blank") {
      const accepted = (Array.isArray(q.correct) ? q.correct : []) as string[];
      const user = normalizeAnswer(typedAnswer);
      return user.length > 0 && accepted.some((a) => normalizeAnswer(a) === user);
    }
    return false;
  }

  const isPicked =
    q?.kind === "fill_in_blank"
      ? typedAnswer.trim().length > 0
      : pickedChoice !== null;

  function check() {
    if (!isPicked || revealed) return;
    setRevealed(true);
    if (currentAnswerCorrect()) setCorrectCount((n) => n + 1);
  }

  function next() {
    if (idx + 1 >= total) {
      save();
      return;
    }
    setIdx(idx + 1);
    setPickedChoice(null);
    setTypedAnswer("");
    setRevealed(false);
  }

  function save() {
    setDone(true);
    setSaveErr(null);
    start(async () => {
      const res = await fetch("/api/student/custom-quiz-complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          quizId,
          questionsAttempted: total,
          questionsCorrect: correctCount,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setSaveErr(body.error ?? "Could not save your score.");
      }
    });
  }

  if (done) {
    const pct = total === 0 ? 100 : Math.round((correctCount / total) * 100);
    const carrots = correctCount * 5;
    const hasThreshold = typeof passThreshold === "number";
    const passed = !hasThreshold || pct >= (passThreshold ?? 0);
    return (
      <div
        className={`rounded-3xl border p-8 text-center ${
          passed
            ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/40 dark:from-green-950/30 dark:to-emerald-950/30"
            : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-orange-950/30"
        }`}
      >
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ${
            passed
              ? "bg-gradient-to-br from-amber-400 to-orange-500"
              : "bg-gradient-to-br from-amber-500 to-orange-600"
          }`}
        >
          <Trophy className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-white">
          {passed ? "Great work!" : "Almost there!"}
        </h2>
        <div className="mt-2 font-mono text-3xl font-black text-indigo-700 dark:text-indigo-300">
          {correctCount} / {total}
        </div>
        <div className="text-sm font-semibold text-zinc-500 dark:text-slate-400">
          {pct}% correct
        </div>
        {hasThreshold && (
          <div
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
              passed
                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            Goal: {passThreshold}% · {passed ? "Hit it!" : "Try again to pass"}
          </div>
        )}
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <Carrot className="h-4 w-4" />+{carrots} carrots
        </div>
        {saveErr && <p className="mt-3 text-xs font-semibold text-red-600">{saveErr}</p>}
        {saving && !saveErr && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push("/student")}
          disabled={saving}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          Back to home
        </button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold text-indigo-600">
          Question {idx + 1} of {total}
        </div>
        <div className="font-mono text-xs font-bold text-green-700 dark:text-green-300">
          ✓ {correctCount}
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${((idx + (revealed ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="whitespace-pre-line text-base font-semibold leading-relaxed text-zinc-900 dark:text-white">
          {q.prompt}
        </div>

        <div className="mt-5 space-y-2">
          {q.kind === "multiple_choice" && Array.isArray(q.choices) &&
            q.choices.map((choice) => {
              const isPick = pickedChoice === choice;
              const isCorrect = revealed && choice === String(q.correct);
              const isWrongPick = revealed && isPick && choice !== String(q.correct);
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={revealed}
                  onClick={() => !revealed && setPickedChoice(choice)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left text-sm font-semibold transition ${
                    isCorrect
                      ? "border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/30 dark:text-green-200"
                      : isWrongPick
                      ? "border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200"
                      : isPick
                      ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-200"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  <span>{choice}</span>
                  {isCorrect && <Check className="h-4 w-4 text-green-600" />}
                  {isWrongPick && <X className="h-4 w-4 text-red-600" />}
                </button>
              );
            })}

          {q.kind === "true_false" &&
            (["True", "False"] as const).map((choice) => {
              const isPick = pickedChoice === choice;
              const isCorrect = revealed && choice === String(q.correct);
              const isWrongPick = revealed && isPick && choice !== String(q.correct);
              return (
                <button
                  key={choice}
                  type="button"
                  disabled={revealed}
                  onClick={() => !revealed && setPickedChoice(choice)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left text-sm font-semibold transition ${
                    isCorrect
                      ? "border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950/30 dark:text-green-200"
                      : isWrongPick
                      ? "border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/30 dark:text-red-200"
                      : isPick
                      ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-200"
                      : "border-zinc-200 bg-white text-zinc-800 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  <span>{choice}</span>
                  {isCorrect && <Check className="h-4 w-4 text-green-600" />}
                  {isWrongPick && <X className="h-4 w-4 text-red-600" />}
                </button>
              );
            })}

          {q.kind === "fill_in_blank" && (
            <div>
              <input
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={revealed}
                onKeyDown={(e) => {
                  if (e.key === "Enter") check();
                }}
                placeholder="Type your answer"
                className={`w-full rounded-2xl border-2 bg-white px-4 py-3 text-lg font-semibold focus:outline-none dark:bg-slate-900 dark:text-white ${
                  revealed
                    ? currentAnswerCorrect()
                      ? "border-green-500"
                      : "border-red-500"
                    : "border-zinc-200 focus:border-indigo-400"
                }`}
              />
              {revealed && !currentAnswerCorrect() && Array.isArray(q.correct) && (
                <p className="mt-2 text-xs font-semibold text-zinc-600 dark:text-slate-400">
                  Accepted:{" "}
                  <span className="text-green-700 dark:text-green-300">
                    {(q.correct as string[]).join(" / ")}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {revealed && q.hint && !currentAnswerCorrect() && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            {q.hint}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          {!revealed ? (
            <button
              type="button"
              onClick={check}
              disabled={!isPicked}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40"
            >
              Check
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              {idx + 1 >= total ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
