import { kUnit1Checkpoint as definition } from "@/app/data/checkpoints/k-unit-1-config";
import {
  createCheckpointPlan,
  checkpointTaskQuestion,
  checkpointTaskBudget,
  checkpointPracticeSelection,
} from "@/lib/lesson-engine/production/checkpoint";
export function unitExam() {
  const assigned = [...definition.scoredStandards];
  const plan = createCheckpointPlan({
    pool: definition.probes,
    assigned,
    taught: assigned,
    exposedKeys: [],
    allowedProbeIds: definition.probes.map((p) => p.id),
    maxProbes: assigned.length,
  });
  const closing = definition.scoredClosing ?? [];
  const questions = closing.flatMap((p) =>
    p.tasks.map((t) => ({ ...checkpointTaskQuestion(p, t), phase: "reading-finish" as const })),
  );
  return {
    plan,
    closing,
    pool: [
      ...plan.pool.flatMap((p) => p.tasks.map((t) => checkpointTaskQuestion(p, t))),
      ...questions,
    ],
    count: checkpointTaskBudget(plan, [], questions),
    flow: `${definition.id}-${plan.eligibleStandards.join("-").replace(/[^a-z0-9-]/gi, "")}-core-no-oral-scored-oral-v1`,
    select: checkpointPracticeSelection(
      plan,
      [],
      Object.fromEntries(assigned.map((s) => [s, { band: "core", rightRun: 0, wrongRun: 0 }])),
      questions,
    ),
  };
}
