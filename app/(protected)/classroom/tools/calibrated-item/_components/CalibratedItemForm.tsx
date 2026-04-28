"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Sparkles, Check } from "lucide-react";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";

type Item = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  difficultyActual: number;
  bloomsLevel: string;
  skillMicrolabel: string;
};

const DIFF_LABEL = ["", "Below grade", "Easy on-grade", "On grade (typical)", "Hard on-grade", "Above grade"];

export default function CalibratedItemForm() {
  const [standardId, setStandardId] = useState("RL.2.1");
  const [standardDescription, setStandardDescription] = useState(
    "Ask and answer such questions as who, what, where, when, why, and how to demonstrate understanding of key details in a text.",
  );
  const [gradeLevel, setGradeLevel] = useState("2nd");
  const [targetDifficulty, setTargetDifficulty] = useState(3);
  const [passageContext, setPassageContext] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setItem(null);
    setPending(true);
    try {
      const r = await fetch("/api/calibrated-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standardId,
          standardDescription,
          gradeLevel,
          targetDifficulty,
          passageContext: passageContext || null,
        }),
      });
      const json = await r.json();
      if (!json.ok) setErr(json.error ?? "Couldn't generate.");
      else setItem(json.item as Item);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't generate.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-zinc-500">
            Standard ID
            <input
              value={standardId}
              onChange={(e) => setStandardId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-semibold text-zinc-500">
            Grade
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
            >
              {["K","1st","2nd","3rd","4th"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Standard description
          <textarea
            rows={2}
            value={standardDescription}
            onChange={(e) => setStandardDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Difficulty (1-5): {DIFF_LABEL[targetDifficulty]}
          <input
            type="range"
            min={1}
            max={5}
            value={targetDifficulty}
            onChange={(e) => setTargetDifficulty(Number(e.target.value))}
            className="mt-2 w-full accent-indigo-600"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Optional passage to anchor the question
          <textarea
            rows={3}
            value={passageContext}
            onChange={(e) => setPassageContext(e.target.value)}
            placeholder="(optional)"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Generate
        </button>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {pending && !item && (
        <div className="rounded-3xl border border-indigo-100 bg-white px-5 py-10">
          <ReadeeAiLoader
            size={140}
            label="Readee.ai is generating a calibrated item"
            caption="Calibrating to grade and difficulty…"
          />
        </div>
      )}

      {item && (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
            {standardId} · Grade {gradeLevel} · Difficulty {item.difficultyActual}
            {item.bloomsLevel && ` · ${item.bloomsLevel}`}
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-900">{item.prompt}</p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {item.choices.map((c) => {
              const isCorrect = c === item.correct;
              return (
                <div
                  key={c}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900"
                      : "border-zinc-200 bg-white text-zinc-700"
                  }`}
                >
                  <span>{c}</span>
                  {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
              );
            })}
          </div>
          {item.hint && (
            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <span className="font-bold">Hint: </span>
              {item.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
