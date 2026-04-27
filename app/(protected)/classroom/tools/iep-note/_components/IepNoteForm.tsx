"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Sparkles, Copy, Check } from "lucide-react";

type Note = {
  plop: string;
  evidence: string;
  progressTowardGoal: string;
  recommendedSupports: string;
  oneLineSummary: string;
};

export default function IepNoteForm({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const [childId, setChildId] = useState("");
  const [annualGoal, setAnnualGoal] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("Q3 2025-26");
  const [note, setNote] = useState<Note | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Reporting period
          <input
            type="text"
            value={reportingPeriod}
            onChange={(e) => setReportingPeriod(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </label>

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
