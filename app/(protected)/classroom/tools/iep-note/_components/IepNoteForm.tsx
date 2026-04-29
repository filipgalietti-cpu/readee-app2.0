"use client";

import { useState, useMemo } from "react";
import { Loader2, AlertCircle, Sparkles, Copy, Check } from "lucide-react";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";

type Note = {
  plop: string;
  evidence: string;
  progressTowardGoal: string;
  recommendedSupports: string;
  oneLineSummary: string;
};

/**
 * Infer the current US K-12 school year as "YYYY-YY".
 * School years roll over in August: Aug-Dec → that year is the start;
 * Jan-Jul → previous calendar year is the start. April 2026 → "2025-26".
 */
function currentSchoolYear(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed
  const startYear = m >= 7 ? y : y - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${String(endYear).padStart(2, "0")}`;
}

/**
 * Best-guess preset for the period a teacher is reporting on right now.
 * Schools vary, but the four-quarter calendar lines up with most US
 * districts: Q1 = Sep-Nov, Q2 = Dec-Feb, Q3 = Mar-May, Q4 = Jun-Aug.
 */
function defaultPresetId(now: Date = new Date()): string {
  const m = now.getMonth();
  if (m >= 8 && m <= 10) return "Q1";
  if (m === 11 || m <= 1) return "Q2";
  if (m >= 2 && m <= 4) return "Q3";
  return "Q4";
}

type Preset = {
  id: string;
  label: string;
  /** Builds the actual string sent to the AI, given the school year. */
  format: (sy: string) => string;
};

const PRESETS: { group: string; items: Preset[] }[] = [
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

export default function IepNoteForm({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const defaultSchoolYear = useMemo(() => currentSchoolYear(), []);
  const defaultPreset = useMemo(() => defaultPresetId(), []);
  const [childId, setChildId] = useState("");
  const [annualGoal, setAnnualGoal] = useState("");
  const [presetId, setPresetId] = useState<string>(defaultPreset);
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear);
  const [customPeriod, setCustomPeriod] = useState("");
  const [note, setNote] = useState<Note | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedPreset = PRESETS.flatMap((g) => g.items).find(
    (p) => p.id === presetId,
  );
  const reportingPeriod =
    presetId === "CUSTOM"
      ? customPeriod.trim()
      : selectedPreset
      ? selectedPreset.format(schoolYear)
      : "";

  async function submit() {
    setErr(null);
    setNote(null);
    if (!childId) {
      setErr("Pick a student.");
      return;
    }
    if (!annualGoal.trim()) {
      setErr("Annual goal is required.");
      return;
    }
    if (!reportingPeriod) {
      setErr("Pick a reporting period.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/iep-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, annualGoal, reportingPeriod }),
      });
      const json = await res.json();
      if (!json.ok) setErr(json.error ?? "Couldn't draft the note.");
      else setNote(json.note as Note);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't draft the note.");
    } finally {
      setPending(false);
    }
  }

  function copyNote() {
    if (!note) return;
    const text = [
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
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-zinc-500">
          Student
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-amber-500 focus:outline-none"
          >
            <option value="">Choose a student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
          <label className="block text-xs font-semibold text-zinc-500">
            Reporting period
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-amber-500 focus:outline-none"
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
            <label className="block text-xs font-semibold text-zinc-500">
              School year
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                placeholder="2025-26"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </label>
          )}
        </div>
        {presetId === "CUSTOM" && (
          <label className="mt-3 block text-xs font-semibold text-zinc-500">
            Period label
            <input
              type="text"
              value={customPeriod}
              onChange={(e) => setCustomPeriod(e.target.value)}
              placeholder="e.g. 6-week probe window, Spring 2026"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
          </label>
        )}
        {reportingPeriod && presetId !== "CUSTOM" && (
          <div className="mt-2 text-[11px] text-zinc-500">
            Note will reference this as <span className="font-mono font-semibold text-zinc-700">{reportingPeriod}</span>.
          </div>
        )}

        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Annual goal (paste from the IEP)
          <textarea
            rows={3}
            value={annualGoal}
            onChange={(e) => setAnnualGoal(e.target.value)}
            placeholder="By the end of Q4, [Name] will read grade-level passages with 90% accuracy…"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </label>

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
        <div className="rounded-3xl border border-amber-100 bg-white px-5 py-10 shadow-sm">
          <ReadeeAiLoader
            size={140}
            label="Readee.ai is drafting the IEP note"
            caption="Drafting, this takes a few seconds…"
          />
        </div>
      )}

      {note && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Draft note
            </div>
            <button
              type="button"
              onClick={copyNote}
              className="inline-flex items-center gap-1 rounded-full bg-amber-700 px-3 py-1 text-[10px] font-bold text-white hover:bg-amber-800"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <Section title="Present Levels of Performance">{note.plop}</Section>
          <Section title="Evidence of Progress">{note.evidence}</Section>
          <Section title="Progress Toward Annual Goal">
            {note.progressTowardGoal}
          </Section>
          <Section title="Recommended Next Supports">
            {note.recommendedSupports}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-2xl bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
        {title}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm text-zinc-800">{children}</p>
    </div>
  );
}
