"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ImagePlus,
  BookOpenText,
} from "lucide-react";
import { aiBuildBook } from "@/app/(protected)/classroom/authoring-actions";
import {
  estimateBookCredits,
  type BookBrief,
} from "@/lib/ai/build-book";
import { CREDIT_COST } from "@/lib/ai/credits";
import { Progress } from "@/app/components/ui/progress";
import { PATTERNS, type PhonicsPattern } from "@/lib/ai/phonics-patterns";

type Grade = "K" | "1st" | "2nd";
const GRADES: Grade[] = ["K", "1st", "2nd"];

const GROUP_LABELS: Record<string, string> = {
  short_vowels: "Short vowels",
  long_vowels: "Long vowels (Magic e)",
  blends: "Consonant blends",
  digraphs: "Digraphs",
  r_controlled: "R-controlled vowels",
  vowel_teams: "Vowel teams",
  diphthongs: "Diphthongs",
};

function groupPatterns(grade: Grade): Record<string, PhonicsPattern[]> {
  const eligible = PATTERNS.filter((p) => {
    if (grade === "K") return p.grade === "K";
    if (grade === "1st") return p.grade === "K" || p.grade === "1st";
    return true;
  });
  const out: Record<string, PhonicsPattern[]> = {};
  for (const p of eligible) {
    if (!out[p.group]) out[p.group] = [];
    out[p.group].push(p);
  }
  return out;
}

function defaultBrief(): BookBrief {
  return {
    title: "",
    phonicsPattern: "short_a",
    patternLabel: "Short a (cat, hat)",
    gradeLevel: "K",
    pageCount: 8,
    perPageImage: true,
  };
}

export default function BookWizard() {
  const router = useRouter();
  const [brief, setBrief] = useState<BookBrief>(defaultBrief);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState("Getting started…");
  const [budget, setBudget] = useState<{
    used: number;
    limit: number;
    remaining: number;
  } | null>(null);

  const cost = estimateBookCredits(brief);
  const exceedsBudget = budget != null && cost > budget.remaining;
  const grouped = groupPatterns(brief.gradeLevel as Grade);

  useEffect(() => {
    fetch("/api/classroom/ai-budget")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.monthly) {
          setBudget({
            used: j.monthly.used,
            limit: j.monthly.limit,
            remaining: j.monthly.remaining,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!pending) return;
    setProgress(0);
    const labels = [
      [0, "Writing the story…"],
      [25, "Drawing pages…"],
      [85, "Quality-checking…"],
    ] as const;
    const t0 = Date.now();
    const tick = setInterval(() => {
      const elapsed = (Date.now() - t0) / 1000;
      const target = Math.min(95, 100 * (1 - Math.exp(-elapsed / 25)));
      setProgress(Math.round(target));
      const label = labels.find(([pct]) => target >= pct);
      if (label) setStepLabel(label[1]);
    }, 250);
    return () => clearInterval(tick);
  }, [pending]);

  function setField<K extends keyof BookBrief>(k: K, v: BookBrief[K]) {
    setBrief((b) => ({ ...b, [k]: v }));
  }

  function pickPattern(p: PhonicsPattern) {
    setBrief((b) => ({
      ...b,
      phonicsPattern: p.key,
      patternLabel: p.label,
    }));
  }

  function submit() {
    setErr(null);
    if (!brief.phonicsPattern) {
      setErr("Pick a phonics pattern.");
      return;
    }
    start(async () => {
      const res = await aiBuildBook({ brief });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      const warnQuery = res.warnings.length
        ? `&warn=${encodeURIComponent(res.warnings.join(" · ").slice(0, 600))}`
        : "";
      router.push(`/classroom/books/${res.bookId}?built=1${warnQuery}`);
    });
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
      {/* Title */}
      <label className="block">
        <span className="text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Book title <span className="font-normal text-zinc-400">(optional)</span>
        </span>
        <input
          value={brief.title}
          onChange={(e) => setField("title", e.target.value.slice(0, 120))}
          placeholder="Leave blank — Readee will write a title"
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      {/* Grade */}
      <div className="mt-5">
        <span className="block mb-2 text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Grade level
        </span>
        <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setField("gradeLevel", g)}
              className={`rounded-full px-3 py-1 transition ${
                brief.gradeLevel === g
                  ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                  : "text-zinc-500"
              }`}
            >
              {g === "K" ? "Kindergarten" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Phonics pattern picker — grouped */}
      <div className="mt-5">
        <span className="block mb-2 text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Phonics pattern
        </span>
        <div className="space-y-3">
          {Object.entries(grouped).map(([group, patterns]) => (
            <div key={group}>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {GROUP_LABELS[group] ?? group}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patterns.map((p) => {
                  const selected = brief.phonicsPattern === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => pickPattern(p)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        selected
                          ? "border-violet-400 bg-violet-100 font-bold text-violet-800 dark:border-violet-500 dark:bg-violet-900/40 dark:text-violet-200"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page count */}
      <div className="mt-5">
        <span className="block mb-2 text-xs font-semibold text-zinc-500 dark:text-slate-400">
          How many pages?{" "}
          <span className="font-normal text-zinc-400">({brief.pageCount})</span>
        </span>
        <input
          type="range"
          min={4}
          max={16}
          value={brief.pageCount}
          onChange={(e) => setField("pageCount", parseInt(e.target.value, 10))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-400">
          <span>4 (mini)</span>
          <span>16 (full)</span>
        </div>
      </div>

      {/* Image toggle */}
      <div className="mt-6">
        <Toggle
          icon={<ImagePlus className="h-4 w-4" />}
          title="Picture on every page"
          description={`One illustration per page. Costs ${CREDIT_COST.image_generation + CREDIT_COST.quiz_generation} credits per page.`}
          enabled={brief.perPageImage}
          onChange={(v) => setField("perPageImage", v)}
        />
      </div>

      {/* Cost footer */}
      <div className="mt-6 flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-xs dark:bg-slate-900/40">
        <span className="text-zinc-600 dark:text-slate-300">
          Estimated cost:{" "}
          <span className="font-bold text-violet-700 dark:text-violet-300">
            {cost} credits
          </span>
        </span>
        {budget && (
          <span className="text-zinc-500">
            {budget.remaining} / {budget.limit} remaining
          </span>
        )}
      </div>
      {exceedsBudget && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          This book would cost more than your remaining credits.
        </div>
      )}

      {err && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">
          {brief.pageCount}-page book · {brief.patternLabel}
        </span>
        {pending ? (
          <div className="flex w-full max-w-md flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {stepLabel}
              <span className="ml-auto font-mono text-zinc-500">
                {progress}%
              </span>
            </div>
            <Progress value={progress} />
          </div>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={exceedsBudget}
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            <BookOpenText className="h-4 w-4" />
            Build the book
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border p-3 transition ${
        enabled
          ? "border-violet-300 bg-violet-50/40 dark:border-violet-700 dark:bg-violet-950/20"
          : "border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg ${
            enabled
              ? "bg-violet-100 text-violet-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold text-zinc-900 dark:text-white">
            {title}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-slate-400">
            {description}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`mt-1 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition ${
          enabled ? "bg-violet-600" : "bg-zinc-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
