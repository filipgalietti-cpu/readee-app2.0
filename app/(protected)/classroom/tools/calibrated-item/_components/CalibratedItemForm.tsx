"use client";

import { useMemo, useState, useEffect } from "react";
import { Loader2, AlertCircle, Sparkles, Check, BookOpen } from "lucide-react";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";

type StandardOption = {
  standardId: string;
  standardDescription: string;
  domain: string;
  grade: string;
  gradeLabel: string;
};

type Item = {
  prompt: string;
  choices: string[];
  correct: string;
  hint: string | null;
  difficultyActual: number;
  bloomsLevel: string;
  skillMicrolabel: string;
};

const DIFF_LABEL = [
  "",
  "Below grade",
  "Easy on-grade",
  "On grade (typical)",
  "Hard on-grade",
  "Above grade",
];

const GRADES = ["K", "1st", "2nd", "3rd", "4th"] as const;

export default function CalibratedItemForm({
  standards,
}: {
  standards: StandardOption[];
}) {
  const [gradeLevel, setGradeLevel] = useState<string>("2nd");

  // Standards in the picked grade, grouped by domain so the dropdown
  // shows "Reading Literature" / "Reading Informational" / etc. as
  // optgroups for fast scanning.
  const filtered = useMemo(
    () => standards.filter((s) => s.grade === gradeLevel),
    [standards, gradeLevel],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, StandardOption[]>();
    for (const s of filtered) {
      const arr = map.get(s.domain) ?? [];
      arr.push(s);
      map.set(s.domain, arr);
    }
    // Sort entries within each domain by standard_id for stable order.
    for (const [, arr] of map) {
      arr.sort((a, b) => a.standardId.localeCompare(b.standardId));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const [standardId, setStandardId] = useState<string>(
    () => filtered[0]?.standardId ?? "",
  );

  // Resync the picked standard when the grade flips, so we never leave
  // the form pointing at a non-matching standard.
  useEffect(() => {
    if (filtered.length === 0) {
      setStandardId("");
      return;
    }
    if (!filtered.some((s) => s.standardId === standardId)) {
      setStandardId(filtered[0].standardId);
    }
  }, [filtered, standardId]);

  const selectedStandard = filtered.find((s) => s.standardId === standardId);

  const [targetDifficulty, setTargetDifficulty] = useState(3);
  const [passageContext, setPassageContext] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setItem(null);
    if (!selectedStandard) {
      setErr("Pick a standard first.");
      return;
    }
    setPending(true);
    try {
      const r = await fetch("/api/calibrated-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standardId: selectedStandard.standardId,
          standardDescription: selectedStandard.standardDescription,
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
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        {/* Step 1 — grade */}
        <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          1. Grade
        </div>
        <div className="mt-2 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGradeLevel(g)}
              className={`rounded-full px-3 py-1 transition ${
                gradeLevel === g
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                  : "text-zinc-500"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Step 2 — standard, dependent on grade */}
        <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          2. Standard
        </div>
        <select
          value={standardId}
          onChange={(e) => setStandardId(e.target.value)}
          disabled={filtered.length === 0}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {filtered.length === 0 ? (
            <option value="">No standards in this grade</option>
          ) : (
            grouped.map(([domain, items]) => (
              <optgroup key={domain} label={domain}>
                {items.map((s) => (
                  <option key={s.standardId} value={s.standardId}>
                    {s.standardId} · {truncate(s.standardDescription, 80)}
                  </option>
                ))}
              </optgroup>
            ))
          )}
        </select>

        {selectedStandard && (
          <div className="mt-2 flex items-start gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
            <BookOpen className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <div>
              <div className="font-bold">{selectedStandard.standardId} · {selectedStandard.domain}</div>
              <div className="mt-0.5 text-indigo-800 dark:text-indigo-200">
                {selectedStandard.standardDescription}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — difficulty */}
        <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          3. Difficulty
        </div>
        <label className="mt-2 block text-xs font-semibold text-zinc-500 dark:text-slate-400">
          {DIFF_LABEL[targetDifficulty]}
          <input
            type="range"
            min={1}
            max={5}
            value={targetDifficulty}
            onChange={(e) => setTargetDifficulty(Number(e.target.value))}
            className="mt-2 w-full accent-indigo-600"
          />
        </label>

        {/* Step 4 — optional passage anchor */}
        <details className="group mt-4 rounded-2xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[11px] font-bold text-zinc-500 [&::-webkit-details-marker]:hidden">
            <span>4. Anchor to a passage <span className="font-normal text-zinc-400">(optional)</span></span>
            <span className="text-zinc-400 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-3 pb-3">
            <textarea
              rows={3}
              value={passageContext}
              onChange={(e) => setPassageContext(e.target.value)}
              placeholder="Paste a passage if you want the question to reference it directly. Leave blank for a standalone question."
              className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </details>

        <button
          type="button"
          onClick={submit}
          disabled={pending || !selectedStandard}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Generate question
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

      {item && selectedStandard && (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            {selectedStandard.standardId} · Grade {gradeLevel} · Difficulty {item.difficultyActual}
            {item.bloomsLevel && ` · ${item.bloomsLevel}`}
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">
            {item.prompt}
          </p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {item.choices.map((c, i) => {
              const isCorrect = c === item.correct;
              return (
                <div
                  key={`${i}-${c}`}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                      : "border-zinc-200 bg-white text-zinc-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  <span>{c}</span>
                  {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </div>
              );
            })}
          </div>
          {item.hint && (
            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              <span className="font-bold">Hint: </span>
              {item.hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}
