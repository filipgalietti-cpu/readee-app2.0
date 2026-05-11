"use client";

import { useState, useTransition } from "react";
import { Check, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { recordSpotAuditVerdict } from "../actions";

export type SpotAuditItem = {
  kind: "daily_question" | "discovery_article" | "leveled_passage";
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  audioUrl: string | null;
  question: {
    prompt: string;
    choices: string[];
    correct: string;
  } | null;
  extraQuestions: {
    prompt: string;
    choices: string[];
    correct: string;
  }[];
  href: string | null;
  qcOverall: string | null;
};

export default function SpotAuditCard({ item }: { item: SpotAuditItem }) {
  const [verdict, setVerdict] = useState<"pass" | "fail" | null>(null);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(v: "pass" | "fail") {
    if (v === "fail" && !reason.trim()) {
      setVerdict("fail");
      return; // wait for reason
    }
    setVerdict(v);
    start(async () => {
      const res = await recordSpotAuditVerdict({
        targetKind: item.kind,
        targetId: item.id,
        verdict: v,
        reason: v === "fail" ? reason.trim() : null,
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(res.error);
        setVerdict(null);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <Check className="h-4 w-4 inline mr-1" />
        Recorded. Next.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-800">
            {item.kind.replace("_", " ")}
          </span>
          {item.qcOverall && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                item.qcOverall === "pass"
                  ? "bg-emerald-100 text-emerald-800"
                  : item.qcOverall === "warn"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
              }`}
            >
              {item.qcOverall}
            </span>
          )}
        </div>
        {item.href && (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-violet-600 hover:underline"
          >
            Open live →
          </a>
        )}
      </div>

      <div className="p-5 space-y-3">
        <h2 className="text-lg font-bold text-zinc-900">{item.title}</h2>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt=""
            className="w-full max-w-md rounded-xl border border-zinc-200"
          />
        )}
        <p
          className="whitespace-pre-line text-sm leading-relaxed text-zinc-800"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {item.body}
        </p>
        {item.audioUrl && (
          <audio controls src={item.audioUrl} className="w-full" />
        )}
        {item.question && (
          <div className="rounded-xl bg-zinc-50 p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Q1
            </div>
            <p className="text-sm font-semibold text-zinc-900">
              {item.question.prompt}
            </p>
            <ul className="space-y-1 text-sm">
              {item.question.choices.map((c, i) => (
                <li
                  key={i}
                  className={
                    c === item.question?.correct
                      ? "font-bold text-emerald-700"
                      : "text-zinc-700"
                  }
                >
                  {c === item.question?.correct ? "✓ " : "  "}
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {item.extraQuestions.length > 0 && (
          <details className="rounded-xl border border-zinc-100 px-4 py-3">
            <summary className="cursor-pointer text-xs font-semibold text-zinc-600">
              + {item.extraQuestions.length} more questions
            </summary>
            <div className="mt-3 space-y-3">
              {item.extraQuestions.map((q, qi) => (
                <div key={qi} className="text-sm">
                  <p className="font-semibold">{q.prompt}</p>
                  <ul className="mt-1 space-y-0.5 text-xs">
                    {q.choices.map((c, i) => (
                      <li
                        key={i}
                        className={c === q.correct ? "font-bold text-emerald-700" : "text-zinc-700"}
                      >
                        {c === q.correct ? "✓ " : "  "}
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <div className="border-t border-zinc-100 px-5 py-3 space-y-3">
        {verdict === "fail" && (
          <div>
            <label className="text-xs font-semibold text-rose-700 block mb-1.5">
              What's wrong? (this seeds a permanent gate)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-rose-200 p-2 text-sm"
              rows={3}
              placeholder="e.g. Distractor lengths give the answer away. Or: passage claims wrong date for moon landing."
            />
          </div>
        )}
        {error && (
          <div className="text-xs text-rose-600">Error: {error}</div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => submit("pass")}
            disabled={pending}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <ThumbsUp className="h-4 w-4" />
            Looks good
          </button>
          <button
            type="button"
            onClick={() => submit("fail")}
            disabled={pending}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            <ThumbsDown className="h-4 w-4" />
            Found a problem
          </button>
        </div>
      </div>
    </div>
  );
}
