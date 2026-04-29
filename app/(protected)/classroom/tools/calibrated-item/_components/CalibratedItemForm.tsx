"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  Check,
  BookOpen,
  Wand2,
  Save,
  ExternalLink,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";
import {
  aiGeneratePassage,
  listMyCustomQuizzes,
  saveCalibratedItemToQuiz,
} from "@/app/(protected)/classroom/authoring-actions";

type StandardOption = {
  standardId: string;
  /** Kid-friendly lesson name; the teacher reads this, not the ID. */
  title: string;
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
    for (const [, arr] of map) {
      arr.sort((a, b) => a.standardId.localeCompare(b.standardId));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const domains = grouped.map(([d]) => d);
  const [domain, setDomain] = useState<string>(domains[0] ?? "");

  // Reset the domain when the grade changes so it stays valid.
  useEffect(() => {
    if (domains.length === 0) {
      setDomain("");
      return;
    }
    if (!domains.includes(domain)) {
      setDomain(domains[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains.join("|")]);

  const standardsInDomain = useMemo(
    () => filtered.filter((s) => s.domain === domain),
    [filtered, domain],
  );

  const [standardId, setStandardId] = useState<string>(
    () => standardsInDomain[0]?.standardId ?? "",
  );

  // Reset the standard when the domain (or grade) changes.
  useEffect(() => {
    if (standardsInDomain.length === 0) {
      setStandardId("");
      return;
    }
    if (!standardsInDomain.some((s) => s.standardId === standardId)) {
      setStandardId(standardsInDomain[0].standardId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standardsInDomain.map((s) => s.standardId).join("|")]);

  const selectedStandard = standardsInDomain.find(
    (s) => s.standardId === standardId,
  );

  const [targetDifficulty, setTargetDifficulty] = useState(3);
  const [passageContext, setPassageContext] = useState("");
  const [passageMode, setPassageMode] = useState<"paste" | "generate">("paste");
  const [passageTopic, setPassageTopic] = useState("");
  const [passageLength, setPassageLength] = useState<"short" | "medium" | "long">(
    "short",
  );
  const [genPending, setGenPending] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function generatePassageNow() {
    setGenErr(null);
    const topic =
      passageTopic.trim() ||
      (selectedStandard
        ? `A short reading passage suitable for practicing "${selectedStandard.title}" at grade ${gradeLevel}.`
        : "");
    if (!topic) {
      setGenErr("Pick a standard or type a topic first.");
      return;
    }
    setGenPending(true);
    try {
      const res = await aiGeneratePassage({
        topic,
        gradeLevel,
        lengthLevel: passageLength,
      });
      if (!res.ok) {
        setGenErr(res.error);
        return;
      }
      setPassageContext(res.passage.passage);
    } catch (e: any) {
      setGenErr(e?.message ?? "Could not generate.");
    } finally {
      setGenPending(false);
    }
  }

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

        {/* Step 2 — domain (Reading Literature, Phonics, etc.) */}
        <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          2. Domain
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {domains.length === 0 ? (
            <span className="text-xs text-zinc-500">No standards in this grade.</span>
          ) : (
            domains.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDomain(d)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                  domain === d
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {d}
              </button>
            ))
          )}
        </div>

        {/* Step 3 — standard, dependent on grade + domain */}
        <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          3. Standard
        </div>
        <select
          value={standardId}
          onChange={(e) => setStandardId(e.target.value)}
          disabled={standardsInDomain.length === 0}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {standardsInDomain.length === 0 ? (
            <option value="">Pick a domain first</option>
          ) : (
            standardsInDomain.map((s) => (
              <option key={s.standardId} value={s.standardId}>
                {s.title}
              </option>
            ))
          )}
        </select>

        {selectedStandard && (
          <div className="mt-2 flex items-start gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
            <BookOpen className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-bold">{selectedStandard.title}</span>
                <span className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 dark:bg-slate-900/60">
                  {selectedStandard.standardId}
                </span>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-300">
                  · {selectedStandard.domain}
                </span>
              </div>
              <div className="mt-1 text-indigo-800 dark:text-indigo-200">
                {selectedStandard.standardDescription}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — difficulty */}
        <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          4. Difficulty
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

        {/* Step 5 — optional passage anchor */}
        <details className="group mt-4 rounded-2xl border border-zinc-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[11px] font-bold text-zinc-500 [&::-webkit-details-marker]:hidden">
            <span>
              5. Anchor to a passage{" "}
              <span className="font-normal text-zinc-400">(optional)</span>
            </span>
            <span className="text-zinc-400 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-3 pb-3">
            <div className="mb-2 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-bold dark:border-slate-700 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setPassageMode("paste")}
                className={`rounded-full px-2.5 py-0.5 transition ${
                  passageMode === "paste"
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                    : "text-zinc-500"
                }`}
              >
                Paste
              </button>
              <button
                type="button"
                onClick={() => setPassageMode("generate")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 transition ${
                  passageMode === "generate"
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                    : "text-zinc-500"
                }`}
              >
                <Wand2 className="h-3 w-3" />
                Generate
              </button>
            </div>

            {passageMode === "generate" && (
              <div className="mb-2 rounded-2xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                  Theme
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    "animals",
                    "weather",
                    "space",
                    "sports",
                    "food",
                    "friendship",
                    "inventions",
                    "community helpers",
                  ].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPassageTopic(t)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                        passageTopic === t
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-slate-900 dark:text-indigo-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={passageTopic}
                  onChange={(e) => setPassageTopic(e.target.value)}
                  placeholder={
                    selectedStandard
                      ? `Or type a topic (default: passage targeting "${selectedStandard.title}")`
                      : "Or type a topic"
                  }
                  className="mt-2 w-full rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-indigo-900/40 dark:bg-slate-900"
                />
                <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                  Length
                </div>
                <div className="mt-1 flex gap-1.5">
                  {(["short", "medium", "long"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setPassageLength(tier)}
                      className={`flex-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                        passageLength === tier
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/40 dark:bg-slate-900 dark:text-indigo-300"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
                <div className="mt-1 text-[10px] text-indigo-700 dark:text-indigo-300">
                  {gradeRange(gradeLevel, passageLength)}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={generatePassageNow}
                    disabled={genPending}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {genPending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Writing…
                      </>
                    ) : passageContext ? (
                      <>
                        <Wand2 className="h-3 w-3" />
                        Try another
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3" />
                        Generate passage
                      </>
                    )}
                  </button>
                  {genErr && (
                    <span className="text-xs font-semibold text-red-700">{genErr}</span>
                  )}
                </div>
              </div>
            )}

            <textarea
              rows={5}
              value={passageContext}
              onChange={(e) => setPassageContext(e.target.value)}
              placeholder={
                passageMode === "generate"
                  ? "Generated passage will appear here, edit if you like…"
                  : "Paste a passage if you want the question to reference it directly. Leave blank for a standalone question."
              }
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
          <SaveToQuizPanel item={item} gradeLevel={gradeLevel} />
        </div>
      )}
    </div>
  );
}

function SaveToQuizPanel({
  item,
  gradeLevel,
}: {
  item: Item;
  gradeLevel: string;
}) {
  const [quizzes, setQuizzes] = useState<{ id: string; title: string }[]>([]);
  const [target, setTarget] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);

  // Load the teacher's quiz list lazily on first render of this panel.
  useEffect(() => {
    let cancelled = false;
    listMyCustomQuizzes()
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setQuizzes(res.quizzes);
      })
      .catch(() => {
        // Quietly fail; the "Create new" path still works.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset save state if the item changes (teacher hit Generate again).
  useEffect(() => {
    setSavedQuizId(null);
    setErr(null);
  }, [item]);

  async function save() {
    setErr(null);
    setPending(true);
    try {
      const isNew = target === "" || target === "__new__";
      const res = await saveCalibratedItemToQuiz({
        question: {
          prompt: item.prompt,
          choices: item.choices,
          correct: item.correct,
          hint: item.hint,
        },
        ...(isNew
          ? {
              newQuizTitle: newTitle.trim() || "Calibrated items",
              newQuizGradeLevel: gradeLevel,
            }
          : { quizId: target }),
      });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setSavedQuizId(res.quizId);
    } catch (e: any) {
      setErr(e?.message ?? "Could not save.");
    } finally {
      setPending(false);
    }
  }

  if (savedQuizId) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <span className="font-bold text-emerald-800 dark:text-emerald-200">
          <Check className="-mt-0.5 mr-1 inline h-3 w-3" />
          Saved to your quiz.
        </span>
        <Link
          href={`/classroom/authoring/quiz/${savedQuizId}`}
          className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
        >
          Open quiz
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const isNewMode = target === "" || target === "__new__";
  return (
    <div className="mt-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          Save to a quiz
        </span>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={pending}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="__new__">+ New quiz</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
      </div>
      {isNewMode && (
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New quiz title (default: Calibrated items)"
          disabled={pending}
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
        />
      )}
      {err && (
        <p className="mt-2 text-xs font-semibold text-red-600">{err}</p>
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          {isNewMode ? "Create + save" : "Add to quiz"}
        </button>
      </div>
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}

function gradeRange(grade: string, tier: "short" | "medium" | "long"): string {
  // Mirrors lib/ai/readee-ai.ts PASSAGE_SYSTEM word windows so the
  // teacher sees what they're picking before the AI runs.
  const ranges: Record<string, Record<string, string>> = {
    K: { short: "20-35 words", medium: "35-50 words", long: "50-70 words" },
    "1st": { short: "40-70 words", medium: "70-100 words", long: "100-140 words" },
    "2nd": { short: "60-100 words", medium: "100-150 words", long: "150-220 words" },
    "3rd": { short: "100-160 words", medium: "160-240 words", long: "240-340 words" },
    "4th": { short: "150-220 words", medium: "220-320 words", long: "320-450 words" },
  };
  return ranges[grade]?.[tier] ?? "";
}
