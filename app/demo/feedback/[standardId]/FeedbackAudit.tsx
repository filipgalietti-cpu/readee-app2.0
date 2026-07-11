"use client";

import { useState } from "react";
import type { AuditQuestion } from "./page";

function correctSet(correct: AuditQuestion["correct"]): Set<string> {
  if (Array.isArray(correct)) return new Set(correct.map(String));
  if (typeof correct === "string") return new Set(correct.split("|"));
  return new Set();
}

const MAX_TRIES = 2;

function QuestionCard({ q, revealAll }: { q: AuditQuestion; revealAll: boolean }) {
  const [tried, setTried] = useState<string[]>([]); // wrong picks
  const [solved, setSolved] = useState(false);
  const correct = correctSet(q.correct);
  const hasFb = !!(q.correct_feedback || q.incorrect_feedback);

  const exhausted = !solved && tried.length >= MAX_TRIES;
  const done = solved || exhausted;

  function pick(c: string) {
    if (done || tried.includes(c)) return;
    if (correct.has(c)) setSolved(true);
    else setTried((t) => [...t, c]);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-semibold leading-snug text-zinc-900">{q.prompt}</p>
        <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500">
          {q.id}
        </span>
      </div>
      {!hasFb && (
        <div className="mt-2 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          no custom feedback — falls back to generic
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {(q.choices ?? []).map((c) => {
          const isC = correct.has(c);
          const isTriedWrong = tried.includes(c);
          // Reveal the answer once the kid has used both tries.
          const state = isTriedWrong
            ? "wrong"
            : (solved && isC) || (exhausted && isC)
              ? "right"
              : done
                ? "muted"
                : "idle";
          const cls = {
            idle: "border-zinc-200 bg-white hover:border-violet-300 hover:bg-violet-50 cursor-pointer",
            right: "border-emerald-400 bg-emerald-50 text-emerald-900",
            wrong: "border-zinc-200 bg-zinc-100 text-zinc-400 line-through",
            muted: "border-zinc-200 bg-white text-zinc-400",
          }[state];
          return (
            <button
              key={c}
              onClick={() => pick(c)}
              disabled={done || isTriedWrong}
              className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition-colors ${cls}`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* tries counter */}
      {!done && tried.length > 0 && (
        <div className="mt-2 font-mono text-[11px] text-zinc-400">
          try {tried.length + 1} of {MAX_TRIES}
        </div>
      )}

      {/* Feedback */}
      {solved && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {q.correct_feedback ?? "(generic praise)"}
        </div>
      )}
      {!solved && tried.length > 0 && !exhausted && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {q.incorrect_feedback ?? "(generic encouragement)"}
        </div>
      )}
      {exhausted && (
        <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-900">
          {q.reveal_feedback ?? "Here is the answer, highlighted above."}
        </div>
      )}

      {/* Audit view — both feedback strings side by side */}
      {revealAll && (
        <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50/70 px-3 py-2 text-emerald-900">
            <div className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-600">correct</div>
            {q.correct_feedback ?? <span className="text-zinc-400">—</span>}
          </div>
          <div className="rounded-lg bg-amber-50/70 px-3 py-2 text-amber-900">
            <div className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-600">1st wrong</div>
            {q.incorrect_feedback ?? <span className="text-zinc-400">—</span>}
          </div>
          <div className="rounded-lg bg-violet-50/70 px-3 py-2 text-violet-900">
            <div className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-violet-600">2nd wrong · reveal</div>
            {q.reveal_feedback ?? <span className="text-zinc-400">—</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedbackAudit({
  standardId,
  title,
  questions,
}: {
  standardId: string;
  title: string;
  questions: AuditQuestion[];
}) {
  const [revealAll, setRevealAll] = useState(false);
  const withFb = questions.filter((q) => q.correct_feedback || q.incorrect_feedback).length;

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-1 font-mono text-xs uppercase tracking-widest text-violet-600">
          Feedback audit
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
        <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
          <span className="font-mono">{standardId}</span>
          <span>·</span>
          <span>
            {withFb}/{questions.length} questions have custom feedback
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setRevealAll((v) => !v)}
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            {revealAll ? "Hide all feedback" : "Reveal all feedback (audit)"}
          </button>
          <span className="text-sm text-zinc-500">…or click any answer to see it fire.</span>
        </div>

        <div className="mt-6 space-y-4">
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} revealAll={revealAll} />
          ))}
          {questions.length === 0 && (
            <p className="text-zinc-500">No multiple-choice questions found for {standardId}.</p>
          )}
        </div>
      </div>
    </main>
  );
}
