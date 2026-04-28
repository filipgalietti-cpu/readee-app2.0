"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";

type Assessment = {
  ideas: number;
  organization: number;
  voice: number;
  conventions: number;
  overallBand: string;
  strength: string;
  growthTip: string;
  encouragingClose: string;
};

const DOMAIN_LABEL = {
  ideas: "Ideas",
  organization: "Organization",
  voice: "Voice",
  conventions: "Conventions",
} as const;

const BAND_LABEL = ["", "Beginning", "Developing", "Proficient", "Above grade"] as const;

export default function WritingRubricForm() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [gradeLevel, setGradeLevel] = useState("2nd");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setAssessment(null);
    if (!prompt.trim() || !response.trim()) {
      setErr("Both prompt and response are required.");
      return;
    }
    setPending(true);
    try {
      const r = await fetch("/api/writing-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, response, gradeLevel }),
      });
      const json = await r.json();
      if (!json.ok) setErr(json.error ?? "Couldn't score that.");
      else setAssessment(json.assessment as Assessment);
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't score that.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-zinc-500">
          Prompt
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write about your favorite season."
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-rose-500 focus:outline-none"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-zinc-500">
          Student&apos;s response
          <textarea
            rows={5}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Paste the student's writing here…"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-rose-500 focus:outline-none"
          />
        </label>
        <label className="mt-3 inline-block text-xs font-semibold text-zinc-500">
          Grade
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="ml-2 rounded-lg border border-zinc-300 px-2 py-1 text-sm"
          >
            {["K", "1st", "2nd", "3rd", "4th"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <div className="mt-4">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Score it
          </button>
        </div>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {err}
        </div>
      )}

      {pending && !assessment && (
        <div className="rounded-3xl border border-rose-100 bg-white px-5 py-10">
          <ReadeeAiLoader
            size={140}
            label="Readee.ai is scoring the writing"
            caption="Scoring against the rubric…"
          />
        </div>
      )}

      {assessment && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-rose-700">
            Score · Grade {gradeLevel}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["ideas", "organization", "voice", "conventions"] as const).map((k) => (
              <div key={k} className="rounded-2xl bg-white p-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {DOMAIN_LABEL[k]}
                </div>
                <div className="mt-0.5 text-3xl font-extrabold text-rose-600">
                  {assessment[k]}
                </div>
                <div className="text-[10px] text-zinc-500">{BAND_LABEL[assessment[k]]}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl bg-white p-3 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Strength
            </div>
            <div className="mt-0.5 text-zinc-800">{assessment.strength}</div>
          </div>
          <div className="mt-2 rounded-2xl bg-white p-3 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
              Growth tip
            </div>
            <div className="mt-0.5 text-zinc-800">{assessment.growthTip}</div>
          </div>
          {assessment.encouragingClose && (
            <p className="mt-3 text-xs italic text-rose-700">
              {assessment.encouragingClose}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
