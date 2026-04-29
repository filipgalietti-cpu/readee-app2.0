"use client";

import { useState } from "react";
import { Plus, Loader2, Pencil, Archive, Check, X, AlertCircle } from "lucide-react";
import {
  createGoal,
  updateGoal,
  archiveGoal,
  type IepGoal,
  type GoalType,
  type GoalStatus,
} from "../actions";

const GOAL_TYPES: { id: GoalType; label: string }[] = [
  { id: "reading_fluency", label: "Reading fluency" },
  { id: "comprehension", label: "Comprehension" },
  { id: "phonics", label: "Phonics / decoding" },
  { id: "vocabulary", label: "Vocabulary" },
  { id: "writing", label: "Writing" },
  { id: "speaking", label: "Speaking / listening" },
  { id: "behavioral", label: "Behavioral / functional" },
  { id: "other", label: "Other" },
];

const STATUS_LABEL: Record<GoalStatus, string> = {
  active: "Active",
  mastered: "Mastered",
  archived: "Archived",
  superseded: "Superseded",
};

export default function GoalsTab({
  childId,
  goals,
  onChange,
}: {
  childId: string;
  goals: IepGoal[];
  onChange: () => void;
}) {
  const [editing, setEditing] = useState<IepGoal | null>(null);
  const [creating, setCreating] = useState(false);

  const active = goals.filter((g) => g.status === "active");
  const inactive = goals.filter((g) => g.status !== "active");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-slate-400">
          Annual goals
        </h2>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
        >
          <Plus className="h-3.5 w-3.5" />
          New goal
        </button>
      </div>

      {active.length === 0 && !creating && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            No active goals yet. Click &quot;New goal&quot; to add one — paste
            it from the IEP and you&apos;ll never have to type it again.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {active.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            onEdit={() => setEditing(g)}
            onChange={onChange}
          />
        ))}
      </ul>

      {inactive.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-zinc-400 [&::-webkit-details-marker]:hidden">
            Inactive ({inactive.length})
            <span className="ml-1 text-zinc-300 group-open:rotate-180">▾</span>
          </summary>
          <ul className="mt-2 space-y-2 opacity-70">
            {inactive.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onEdit={() => setEditing(g)}
                onChange={onChange}
              />
            ))}
          </ul>
        </details>
      )}

      {(creating || editing) && (
        <GoalEditor
          childId={childId}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function GoalCard({
  goal,
  onEdit,
  onChange,
}: {
  goal: IepGoal;
  onEdit: () => void;
  onChange: () => void;
}) {
  const [pending, setPending] = useState(false);
  async function archive() {
    if (!confirm("Archive this goal? You can restore it later.")) return;
    setPending(true);
    const res = await archiveGoal(goal.id);
    setPending(false);
    if (res.ok) onChange();
  }
  const typeLabel = GOAL_TYPES.find((t) => t.id === goal.goalType)?.label ?? null;
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            {typeLabel && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                {typeLabel}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 ${
                goal.status === "active"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : goal.status === "mastered"
                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                  : "bg-zinc-100 text-zinc-700 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {STATUS_LABEL[goal.status]}
            </span>
            {goal.targetDate && (
              <span className="text-zinc-400 dark:text-slate-500">
                Target: {goal.targetDate}
              </span>
            )}
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-zinc-800 dark:text-slate-200">
            {goal.goalText}
          </p>
          {(goal.baseline || goal.targetCriterion) && (
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-500 dark:text-slate-400">
              {goal.baseline && (
                <span>
                  <span className="font-semibold text-zinc-600 dark:text-slate-300">
                    Baseline:
                  </span>{" "}
                  {goal.baseline}
                </span>
              )}
              {goal.targetCriterion && (
                <span>
                  <span className="font-semibold text-zinc-600 dark:text-slate-300">
                    Target:
                  </span>{" "}
                  {goal.targetCriterion}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-amber-500 transition hover:bg-amber-50 dark:hover:bg-amber-950/30"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {goal.status === "active" && (
            <button
              type="button"
              onClick={archive}
              disabled={pending}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Archive"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function GoalEditor({
  childId,
  initial,
  onClose,
  onSaved,
}: {
  childId: string;
  initial: IepGoal | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [goalText, setGoalText] = useState(initial?.goalText ?? "");
  const [goalType, setGoalType] = useState<GoalType | "">(initial?.goalType ?? "");
  const [baseline, setBaseline] = useState(initial?.baseline ?? "");
  const [target, setTarget] = useState(initial?.targetCriterion ?? "");
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? "");
  const [status, setStatus] = useState<GoalStatus>(initial?.status ?? "active");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    if (!goalText.trim()) {
      setErr("Goal text is required.");
      return;
    }
    setPending(true);
    const res = initial
      ? await updateGoal({
          goalId: initial.id,
          goalText,
          goalType: goalType || null,
          baseline,
          targetCriterion: target,
          targetDate,
          status,
        })
      : await createGoal({
          childId,
          goalText,
          goalType: goalType || null,
          baseline,
          targetCriterion: target,
          targetDate,
        });
    setPending(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-slate-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            {initial ? "Edit goal" : "New annual goal"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
            Goal text (paste from the IEP)
            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              rows={5}
              placeholder="By June 2026, given a grade-level passage, [Student] will read aloud with at least 50 WCPM and 95% accuracy across three consecutive trials, as measured by curriculum-based oral reading fluency probes."
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Goal type
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType | "")}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">— select —</option>
                {GOAL_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Target date
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
            Baseline (where they started this period)
            <input
              type="text"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              placeholder="e.g. 32 WCPM, 88% accuracy on 1st-grade passages (Sep 2025)"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>

          <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
            Target criterion (what mastery looks like)
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 50 WCPM, 95% accuracy across three consecutive trials"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </label>

          {initial && (
            <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="mastered">Mastered</option>
                <option value="archived">Archived</option>
                <option value="superseded">Superseded</option>
              </select>
            </label>
          )}

          {err && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
              {err}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {initial ? "Save changes" : "Create goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
