"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, X, Zap, Trophy } from "lucide-react";

type Question = {
  id: string;
  prompt: string;
  choices: string[];
  correct: string;
};

type Phase = "lobby" | "running" | "ended";

const COLOR_PALETTE = [
  "from-red-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-yellow-600",
  "from-emerald-500 to-green-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-sky-600",
];

export default function LiveQuizPlayer({
  sessionId,
  title,
  questions,
}: {
  sessionId: string;
  title: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [idx, setIdx] = useState(0);
  const [myPick, setMyPick] = useState<string | null>(null);
  const [myResult, setMyResult] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Poll server state every 2s
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const res = await fetch(`/api/student/live/state?sessionId=${sessionId}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const body = await res.json();
      if (cancelled) return;
      const newPhase = body.status as Phase;
      const newIdx = body.currentQuestionIdx as number;
      setPhase(newPhase);
      if (newIdx !== idx) {
        setIdx(newIdx);
        setMyPick(null);
        setMyResult(null);
      }
      // If server says we already answered this question (e.g. reload),
      // reflect that so we don't show the pick buttons again.
      if (body.myAnswerForCurrent && myPick == null) {
        setMyPick(body.myAnswerForCurrent);
      }
    };
    tick();
    pollRef.current = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function submit(choice: string) {
    if (myPick || submitting) return;
    setSubmitting(true);
    const q = questions[idx];
    const correct = choice === q.correct;
    setMyPick(choice);
    setMyResult(correct);
    try {
      await fetch("/api/student/live/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionIdx: idx,
          answer: choice,
          correct,
        }),
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "lobby") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl">
          <Zap className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-zinc-900 dark:text-white">
          You&apos;re in!
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          {title}
        </p>
        <p className="mt-4 text-xs text-zinc-400">
          Waiting for your teacher to start…
        </p>
        <Loader2 className="mt-3 h-5 w-5 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (phase === "ended") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-zinc-900 dark:text-white">
          Great job!
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">
          Your teacher is showing the leaderboard.
        </p>
        <button
          type="button"
          onClick={() => router.push("/student")}
          className="mt-6 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Back home
        </button>
      </div>
    );
  }

  // Running
  const q = questions[idx];
  if (!q) {
    return (
      <div className="p-8 text-center text-sm text-zinc-500">
        Waiting for the next question…
      </div>
    );
  }

  const locked = !!myPick;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold text-indigo-600">
          Question {idx + 1} of {questions.length}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="whitespace-pre-line text-center text-lg font-bold text-zinc-900 dark:text-white sm:text-xl">
          {q.prompt}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {q.choices.map((c, i) => {
          const color = COLOR_PALETTE[i % COLOR_PALETTE.length];
          const isPick = myPick === c;
          const pickClass = isPick
            ? myResult === true
              ? "ring-4 ring-green-400 scale-[0.98]"
              : "ring-4 ring-red-400 scale-[0.98]"
            : "";
          return (
            <button
              key={c}
              type="button"
              disabled={locked}
              onClick={() => submit(c)}
              className={`flex min-h-[72px] items-center justify-between gap-3 rounded-2xl bg-gradient-to-br ${color} px-5 py-4 text-left text-base font-extrabold text-white shadow-md transition hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 ${pickClass}`}
            >
              <span className="flex-1">{c}</span>
              {isPick &&
                (myResult ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <X className="h-6 w-6" />
                ))}
            </button>
          );
        })}
      </div>

      {locked && (
        <div className="mt-5 text-center text-sm font-semibold">
          {myResult ? (
            <span className="text-green-700 dark:text-green-400">
              ✓ Correct — waiting for the next question
            </span>
          ) : (
            <span className="text-amber-700 dark:text-amber-400">
              Got it. Waiting for the next question…
            </span>
          )}
        </div>
      )}
    </div>
  );
}
