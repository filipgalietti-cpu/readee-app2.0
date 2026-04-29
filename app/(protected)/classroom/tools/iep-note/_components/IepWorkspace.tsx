"use client";

import { useEffect, useState, useCallback } from "react";
import { Notebook, FileText, Target, Loader2 } from "lucide-react";
import { listGoalsForChild, type IepGoal } from "../actions";
import GoalsTab from "./GoalsTab";
import NoteTab from "./NoteTab";
import PlanTab from "./PlanTab";

type TabKey = "goals" | "note" | "plan";

export default function IepWorkspace({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const [childId, setChildId] = useState("");
  const [tab, setTab] = useState<TabKey>("note");
  const [goals, setGoals] = useState<IepGoal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [goalsErr, setGoalsErr] = useState<string | null>(null);

  const refreshGoals = useCallback(async () => {
    if (!childId) {
      setGoals([]);
      return;
    }
    setLoadingGoals(true);
    setGoalsErr(null);
    const res = await listGoalsForChild(childId);
    if (res.ok) setGoals(res.goals);
    else setGoalsErr(res.error);
    setLoadingGoals(false);
  }, [childId]);

  useEffect(() => {
    refreshGoals();
  }, [refreshGoals]);

  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="block text-xs font-semibold text-zinc-500 dark:text-slate-400">
          Student
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">Choose a student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {childId && (
        <>
          <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
            <TabButton
              active={tab === "goals"}
              onClick={() => setTab("goals")}
              Icon={Target}
              label={`Goals (${activeGoals.length})`}
            />
            <TabButton
              active={tab === "note"}
              onClick={() => setTab("note")}
              Icon={Notebook}
              label="Progress note"
            />
            <TabButton
              active={tab === "plan"}
              onClick={() => setTab("plan")}
              Icon={FileText}
              label="Intervention plan"
            />
          </div>

          {loadingGoals && (
            <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading goals…
            </div>
          )}
          {goalsErr && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {goalsErr}
            </div>
          )}

          {tab === "goals" && (
            <GoalsTab childId={childId} goals={goals} onChange={refreshGoals} />
          )}
          {tab === "note" && (
            <NoteTab
              childId={childId}
              activeGoals={activeGoals}
              onSwitchToPlan={() => setTab("plan")}
            />
          )}
          {tab === "plan" && (
            <PlanTab childId={childId} activeGoals={activeGoals} />
          )}
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: any;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
        active
          ? "bg-white text-amber-700 shadow-sm dark:bg-slate-800 dark:text-amber-300"
          : "text-zinc-500"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
