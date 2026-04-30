"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Wand2,
  Copy,
  Check,
  Calendar,
  Target,
  TriangleAlert,
  Send,
} from "lucide-react";
import { ReadeeAiLoader } from "@/components/loaders/ReadeeAiLoader";
import type { IepGoal } from "../actions";
import { goalLabel } from "./goal-label";
import PushPlanModal from "./PushPlanModal";

type Plan = {
  summary: string;
  focusSkills: string[];
  weeklyBlocks: {
    weekLabel: string;
    sessions: {
      dayLabel: string;
      durationMin: number;
      activity: string;
      materialHint: string;
      expectedOutcome: string;
    }[];
  }[];
  probeSchedule: string;
  expectedCriterion: string;
  escalationTrigger: string;
  caregiverNote: string | null;
};

export default function PlanTab({
  childId,
  activeGoals,
}: {
  childId: string;
  activeGoals: IepGoal[];
}) {
  const [goalMode, setGoalMode] = useState<"saved" | "paste">(
    activeGoals.length > 0 ? "saved" : "paste",
  );
  const [goalId, setGoalId] = useState<string>("");
  const [pastedGoal, setPastedGoal] = useState("");

  // Tabs stay mounted across switches; intervene only when the
  // current selection becomes invalid (goal archived). Don't
  // auto-pick a goal — make the teacher choose consciously.
  useEffect(() => {
    if (activeGoals.length === 0 && goalMode === "saved") {
      setGoalMode("paste");
      setGoalId("");
      return;
    }
    if (goalId && !activeGoals.some((g) => g.id === goalId)) {
      setGoalId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGoals.map((g) => g.id).join("|")]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);
  const [pushedCount, setPushedCount] = useState<number | null>(null);
  const [cycleWeeks, setCycleWeeks] = useState<number>(2);
  const [runway, setRunway] = useState<{
    cycleWeeks: number;
    cyclesRemaining: number | null;
    daysToGoalTarget: number | null;
    goalTargetDate: string | null;
    isFinalCycle: boolean;
  } | null>(null);

  async function submit() {
    setErr(null);
    setPlan(null);
    const annualGoal =
      goalMode === "saved"
        ? activeGoals.find((g) => g.id === goalId)?.goalText ?? ""
        : pastedGoal;
    if (!annualGoal.trim()) {
      setErr(
        goalMode === "saved" ? "Pick a goal or switch to Paste." : "Paste a goal.",
      );
      return;
    }
    setPending(true);
    setPushedCount(null);
    setPlanId(null);
    setRunway(null);
    try {
      const res = await fetch("/api/iep-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          goalId: goalMode === "saved" ? goalId : null,
          annualGoal,
          cycleWeeks,
        }),
      });
      const json = await res.json();
      if (!json.ok) setErr(json.error ?? "Couldn't draft the plan.");
      else {
        setPlan(json.plan as Plan);
        setPlanId(json.persistedId ?? null);
        setRunway(json.runway ?? null);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Couldn't draft the plan.");
    } finally {
      setPending(false);
    }
  }

  function copyPlan() {
    if (!plan) return;
    const lines: string[] = [
      `2-WEEK INTERVENTION PLAN`,
      ``,
      `Summary: ${plan.summary}`,
      `Focus skills: ${plan.focusSkills.join(", ")}`,
      ``,
    ];
    for (const w of plan.weeklyBlocks) {
      lines.push(`— ${w.weekLabel} —`);
      for (const s of w.sessions) {
        lines.push(`  ${s.dayLabel} · ${s.durationMin}min`);
        lines.push(`    ${s.activity}`);
        lines.push(`    Material: ${s.materialHint}`);
        lines.push(`    Expected: ${s.expectedOutcome}`);
      }
      lines.push("");
    }
    lines.push(`Probe schedule: ${plan.probeSchedule}`);
    lines.push(`Expected criterion: ${plan.expectedCriterion}`);
    lines.push(`Escalation trigger: ${plan.escalationTrigger}`);
    if (plan.caregiverNote) {
      lines.push("", `Note for caregiver: ${plan.caregiverNote}`);
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
          Annual goal to plan against
        </div>
        <div className="mt-2 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setGoalMode("saved")}
            disabled={activeGoals.length === 0}
            className={`rounded-full px-3 py-1 transition disabled:opacity-50 ${
              goalMode === "saved"
                ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
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
                ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
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
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {activeGoals.length === 0 ? (
              <option value="">(no active goals — switch to the Goals tab)</option>
            ) : (
              <>
                <option value="">Choose a goal…</option>
                {activeGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {goalLabel(g)}
                  </option>
                ))}
              </>
            )}
          </select>
        ) : (
          <textarea
            value={pastedGoal}
            onChange={(e) => setPastedGoal(e.target.value)}
            rows={4}
            placeholder="Paste the annual goal you want a plan against."
            className="mt-2 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        )}

        <div className="mt-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
            Cycle length
          </div>
          <div className="mt-1 inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCycleWeeks(n)}
                className={`rounded-full px-3 py-1 transition ${
                  cycleWeeks === n
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                {n} {n === 1 ? "week" : "weeks"}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-zinc-500 dark:text-slate-400">
            One cycle of an intervention. Re-probe and re-plan at the end. 2 weeks
            is the SPED standard cadence.
          </p>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wand2 className="h-3.5 w-3.5" />
          )}
          Draft {cycleWeeks}-week plan
        </button>
      </div>

      {err && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          {err}
        </div>
      )}

      {pending && !plan && (
        <div className="rounded-3xl border border-violet-100 bg-white px-5 py-10 shadow-sm dark:border-violet-900/40 dark:bg-slate-900">
          <ReadeeAiLoader
            size={140}
            label="Readee.ai is drafting the intervention plan"
            caption="Mapping goal + recent data to 2-week sessions…"
          />
        </div>
      )}

      {plan && (
        <div className="space-y-3">
          {runway && (runway.cyclesRemaining || runway.goalTargetDate) && (
            <div
              className={`flex flex-wrap items-center gap-2 rounded-2xl border px-4 py-2 text-xs ${
                runway.isFinalCycle
                  ? "border-amber-300 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30"
                  : "border-violet-200 bg-white dark:border-violet-900/40 dark:bg-slate-900"
              }`}
            >
              {runway.goalTargetDate && (
                <span className="font-semibold text-zinc-700 dark:text-slate-200">
                  Goal target:{" "}
                  <span className="font-bold">
                    {new Date(runway.goalTargetDate + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                </span>
              )}
              {typeof runway.daysToGoalTarget === "number" && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 font-bold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                  {runway.daysToGoalTarget} day{runway.daysToGoalTarget === 1 ? "" : "s"} remaining
                </span>
              )}
              {runway.cyclesRemaining && (
                <span
                  className={`rounded-full px-2 py-0.5 font-bold ${
                    runway.isFinalCycle
                      ? "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100"
                      : "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200"
                  }`}
                >
                  {runway.isFinalCycle
                    ? "Final cycle before goal"
                    : `Cycle 1 of ~${runway.cyclesRemaining} (${runway.cycleWeeks}-wk cycles)`}
                </span>
              )}
            </div>
          )}
          <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm dark:border-violet-900/40 dark:bg-violet-950/30">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                  Plan summary
                </div>
                <p className="mt-1 text-sm text-zinc-800 dark:text-slate-200">
                  {plan.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {plan.focusSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-slate-900 dark:text-violet-300"
                    >
                      <Target className="h-3 w-3" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {planId && (
                  <button
                    type="button"
                    onClick={() => setPushOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                  >
                    <Send className="h-3 w-3" />
                    Push to assignments
                  </button>
                )}
                <button
                  type="button"
                  onClick={copyPlan}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-700 px-3 py-1 text-[10px] font-bold text-white hover:bg-violet-800"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy plan"}
                </button>
              </div>
            </div>
            {pushedCount !== null && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-slate-900 dark:text-emerald-300">
                ✓ Pushed {pushedCount} private assignment
                {pushedCount === 1 ? "" : "s"} — only this student sees them. They
                appear in their dashboard.
              </div>
            )}
          </div>

          {plan.weeklyBlocks.map((w, wi) => (
            <div
              key={wi}
              className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                <Calendar className="h-3.5 w-3.5" />
                {w.weekLabel}
              </div>
              <ul className="mt-3 space-y-2">
                {w.sessions.map((s, si) => (
                  <li
                    key={si}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="text-xs font-bold text-zinc-700 dark:text-slate-200">
                        {s.dayLabel}
                      </div>
                      <div className="text-[11px] font-semibold text-violet-600">
                        {s.durationMin} min
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-zinc-800 dark:text-slate-200">
                      {s.activity}
                    </p>
                    <div className="mt-1 text-[11px] text-zinc-500">
                      <span className="font-semibold text-zinc-600 dark:text-slate-400">
                        Material:
                      </span>{" "}
                      {s.materialHint}
                    </div>
                    <div className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                      <span className="font-semibold">Expected:</span> {s.expectedOutcome}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                  Probe schedule
                </div>
                <p className="mt-1 text-zinc-800 dark:text-slate-200">{plan.probeSchedule}</p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm">
              <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  Expected criterion at end of week 2
                </div>
                <p className="mt-1 text-zinc-800 dark:text-slate-200">
                  {plan.expectedCriterion}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm">
              <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Escalation trigger
                </div>
                <p className="mt-1 text-zinc-800 dark:text-slate-200">
                  {plan.escalationTrigger}
                </p>
              </div>
            </div>
            {plan.caregiverNote && (
              <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="text-[10px] font-bold uppercase tracking-widest">
                  Note for caregiver
                </div>
                <p className="mt-1">{plan.caregiverNote}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {pushOpen && planId && (
        <PushPlanModal
          planId={planId}
          onClose={() => setPushOpen(false)}
          onPushed={(count) => {
            setPushedCount(count);
            setPushOpen(false);
          }}
        />
      )}
    </div>
  );
}
