"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";
import type { IepGoal } from "../actions";
import { goalLabel } from "./goal-label";

type Note = {
  plop: string;
  evidence: string;
  progressTowardGoal: string;
  recommendedSupports: string;
  progressStatus:
    | "on_track"
    | "adequate_progress"
    | "insufficient_progress"
    | "mastered"
    | "not_yet_introduced";
  oneLineSummary: string;
};

const STATUS_LABEL: Record<Note["progressStatus"], string> = {
  on_track: "On track",
  adequate_progress: "Adequate progress",
  insufficient_progress: "Insufficient progress",
  mastered: "Mastered",
  not_yet_introduced: "Not yet introduced",
};

const STATUS_TONE: Record<Note["progressStatus"], string> = {
  on_track: "bg-emerald-100 text-emerald-800",
  adequate_progress: "bg-blue-100 text-blue-800",
  insufficient_progress: "bg-amber-100 text-amber-800",
  mastered: "bg-indigo-100 text-indigo-800",
  not_yet_introduced: "bg-zinc-100 text-zinc-700",
};

function currentSchoolYear(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = now.getMonth();
  const startYear = m >= 7 ? y : y - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${String(endYear).padStart(2, "0")}`;
}

function defaultPresetId(now: Date = new Date()): string {
  const m = now.getMonth();
  if (m >= 8 && m <= 10) return "Q1";
  if (m === 11 || m <= 1) return "Q2";
  if (m >= 2 && m <= 4) return "Q3";
  return "Q4";
}

const PRESETS: { group: string; items: { id: string; label: string; format: (sy: string) => string }[] }[] = [
  {
    group: "Quarters",
    items: [
      { id: "Q1", label: "Q1 (Sep – Nov)", format: (sy) => `Q1 ${sy}` },
      { id: "Q2", label: "Q2 (Dec – Feb)", format: (sy) => `Q2 ${sy}` },
      { id: "Q3", label: "Q3 (Mar – May)", format: (sy) => `Q3 ${sy}` },
      { id: "Q4", label: "Q4 (Jun – Aug)", format: (sy) => `Q4 ${sy}` },
    ],
  },
  {
    group: "Trimesters",
    items: [
      { id: "T1", label: "Trimester 1 (Sep – Dec)", format: (sy) => `Trimester 1 ${sy}` },
      { id: "T2", label: "Trimester 2 (Jan – Mar)", format: (sy) => `Trimester 2 ${sy}` },
      { id: "T3", label: "Trimester 3 (Apr – Jun)", format: (sy) => `Trimester 3 ${sy}` },
    ],
  },
  {
    group: "Other",
    items: [
      { id: "MID", label: "Mid-year review", format: (sy) => `Mid-year review ${sy}` },
      { id: "EOY", label: "End-of-year report", format: (sy) => `End-of-year report ${sy}` },
      { id: "ANNUAL", label: "Annual IEP review", format: (sy) => `Annual IEP review ${sy}` },
    ],
  },
];

export default function NoteTab({
  childId,
  activeGoals,
  onSwitchToPlan,
}: {
  childId: string;
  activeGoals: IepGoal[];
  onSwitchToPlan: () => void;
}) {
  const defaultSchoolYear = useMemo(() => currentSchoolYear(), []);
  const defaultPreset = useMemo(() => defaultPresetId(), []);
  const [presetId, setPresetId] = useState<string>(defaultPreset);
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear);
  const [customPeriod, setCustomPeriod] = useState("");

  // Goal source: pick from saved goals OR paste an ad-hoc one.
  const [goalMode, setGoalMode] = useState<"saved" | "paste">(
    activeGoals.length > 0 ? "saved" : "paste",
  );
  const [goalId, setGoalId] = useState<string>(activeGoals[0]?.id ?? "");
  const [pastedGoal, setPastedGoal] = useState("");

  // Tabs stay mounted across switches; sync `goalId` whenever the
  // goal list updates so we don't submit with goalId="".
  useEffect(() => {
    if (activeGoals.length === 0) {
      setGoalMode("paste");
      setGoalId("");
      return;
    }
    if (!activeGoals.some((g) => g.id === goalId)) {
      setGoalId(activeGoals[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGoals.map((g) => g.id).join("|")]);

  const [note, setNote] = useState<Note | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedHint, setSavedHint] = useState<{
    hasRunningRecords: boolean;
    hasTrend: boolean;
  } | null>(null);

  const selectedPreset = PRESETS.flatMap((g) => g.items).find((p) => p.id === presetId);
  const reportingPeriod =
    presetId === "CUSTOM"
      ? customPeriod.trim()
      : selectedPreset
      ? selectedPreset.format(schoolYear)
      : "";

  async function submit() {
    setErr(null);
    setNote(null);
    setSavedHint(null);
    if (!reportingPeriod) {
      setErr("Pick a reporting period.");
      return;
    }
    const annualGoal =
      goalMode === "saved"
        ? activeGoals.find((g) => g.id === goalId)?.goalText ?? ""
        : pastedGoal;
    if (!annualGoal.trim()) {
      setErr(
        goalMode === "saved"
          ? "Pick a goal or switch to Paste."
          : "Paste an annual goal.",
      );
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/iep-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          goalId: goalMode === "saved" ? goalId : null,
          annualGoal,
          reportingPeriod,
        }),
      });
      const json = await res.json();
      if (!json.ok) setErr(json.error ?? "Couldn't draft the note.");
      else {
        setNote(json.note as Note);
        setSavedHint(json.inputs ?? null);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't draft the note.");
    } finally {
      setPending(false);
    }
  }

  function copyNote() {
    if (!note) return;
    const text = [
      `PROGRESS STATUS: ${STATUS_LABEL[note.progressStatus]}`,
      ``,
      `PRESENT LEVELS OF PERFORMANCE`,
      note.plop,
      ``,
      `EVIDENCE OF PROGRESS`,
      note.evidence,
      ``,
      `PROGRESS TOWARD ANNUAL GOAL`,
      note.progressTowardGoal,
      ``,
      `RECOMMENDED NEXT SUPPORTS`,
      note.recommendedSupports,
      ``,
      `Summary: ${note.oneLineSummary}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
          Annual goal
        </div>
        <div className="mt-2 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setGoalMode("saved")}
            disabled={activeGoals.length === 0}
            className={`rounded-full px-3 py-1 transition disabled:opacity-50 ${
              goalMode === "saved"
                ? "bg-white text-amber-700 shadow-sm dark:bg-slate-800 dark:text-amber-300"
                : "text-zinc-500"
            }`}
          >
            From saved goals ({activeGoals.length})
          </button>
          <button
            type="button"
            onClick={() => setGoalMode("paste")}
            className={`rounded-full px-3 py-1 transition ${
              goalMode === "paste"
                ? "bg-white text-amber-700 shadow-sm dark:bg-slate-800 dark:text-amber-300"
                : "text-zinc-500"
            }`}
          >
            Paste ad-hoc
          </button>
        </div>

        {goalMode === "saved" ? (
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {activeGoals.length === 0 ? (
              <option>(no active goals — switch to the Goals tab)</option>
            ) : (
              activeGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {goalLabel(g)}
                </option>
              ))
            )}
          </select>
        ) : (
          <textarea
            value={pastedGoal}
            onChange={(e) => setPastedGoal(e.target.value)}
            rows={4}
            placeholder="By the end of Q4, [Student] will…"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px]">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
            Reporting period
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {PRESETS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="CUSTOM">Custom…</option>
            </select>
          </label>
          {presetId !== "CUSTOM" && (
            <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
              School year
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>
          )}
        </div>
        {presetId === "CUSTOM" && (
          <label className="mt-3 block text-xs font-semibold text-zinc-500 dark:text-slate-400">
            Period label
            <input
              type="text"
              value={customPeriod}
              onChange={(e) => setCustomPeriod(e.target.value)}
              placeholder="e.g. 6-week probe window"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Draft progress note
        </button>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {pending && !note && (
        <div className="rounded-3xl border border-amber-100 bg-white px-5 py-10 shadow-sm dark:border-amber-900/40 dark:bg-slate-900">
          <ReadeeAiLoader
            size={140}
            label="Readee.ai is drafting the IEP note"
            caption="Pulling practice, lessons, and running records…"
          />
        </div>
      )}

      {note && (
        <div className="space-y-3">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    STATUS_TONE[note.progressStatus]
                  }`}
                >
                  {STATUS_LABEL[note.progressStatus]}
                </span>
                {savedHint?.hasTrend && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Trend data ✓
                  </span>
                )}
                {savedHint?.hasRunningRecords && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Running records ✓
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={copyNote}
                className="inline-flex items-center gap-1 rounded-full bg-amber-700 px-3 py-1 text-[10px] font-bold text-white hover:bg-amber-800"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy full note"}
              </button>
            </div>
            <p className="mt-3 text-sm font-semibold italic text-amber-900 dark:text-amber-200">
              &ldquo;{note.oneLineSummary}&rdquo;
            </p>
            <Section title="Present Levels of Performance">{note.plop}</Section>
            <Section title="Evidence of Progress">{note.evidence}</Section>
            <Section title="Progress Toward Annual Goal">
              {note.progressTowardGoal}
            </Section>
            <Section title="Recommended Next Supports">
              {note.recommendedSupports}
            </Section>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-900/40 dark:bg-violet-950/30">
            <div className="text-sm">
              <div className="font-bold text-violet-900 dark:text-violet-200">
                Turn this into a 2-week intervention plan
              </div>
              <div className="text-xs text-violet-700 dark:text-violet-300">
                Same goal + same data. Get concrete sessions to run Monday.
              </div>
            </div>
            <button
              type="button"
              onClick={onSwitchToPlan}
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Draft plan
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-2xl bg-white p-3 dark:bg-slate-900">
      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
        {title}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-zinc-800 dark:text-slate-200">
        {children}
      </p>
    </div>
  );
}
