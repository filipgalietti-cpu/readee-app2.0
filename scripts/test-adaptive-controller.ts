/**
 * Calibration / self-test for the adaptive controller (Phase 1 DECIDE).
 * Proves classifyState() behaves across representative kid scenarios.
 *
 *   npx tsx scripts/test-adaptive-controller.ts
 */
import {
  classifyState,
  type AdaptiveEventLite,
  type AdaptiveState,
  type MasterySeed,
} from "../lib/adaptive/controller";

const ok = (correct: boolean, extra: Partial<AdaptiveEventLite> = {}): AdaptiveEventLite => ({
  correct,
  attempts: 1,
  hintUsed: false,
  latencyMs: 3000,
  ...extra,
});

type Case = {
  name: string;
  events: AdaptiveEventLite[];
  seed?: MasterySeed;
  expect: AdaptiveState;
};

const cases: Case[] = [
  { name: "cold start (no data)", events: [], expect: "flow" },
  {
    name: "cold start, prior weakness",
    events: [],
    seed: { totalAttempted: 8, totalCorrect: 2 },
    expect: "struggling",
  },
  {
    name: "all correct, fast, no hints → breezing",
    events: [ok(true), ok(true), ok(true), ok(true)],
    expect: "breezing",
  },
  {
    name: "3 misses in a row → frustrated",
    events: [ok(true), ok(false), ok(false), ok(false)],
    expect: "frustrated",
  },
  {
    name: "2 misses in a row → struggling",
    events: [ok(true), ok(true), ok(false), ok(false)],
    expect: "struggling",
  },
  {
    name: "coin-flip accuracy → struggling",
    events: [ok(true), ok(false), ok(true), ok(false), ok(true), ok(false)],
    expect: "struggling",
  },
  {
    name: "solid but imperfect (5/6) → flow",
    events: [ok(true), ok(true), ok(false), ok(true), ok(true), ok(true)],
    expect: "flow",
  },
  {
    name: "fork needing many tries → struggling",
    events: [ok(true, { surface: "fork", attempts: 3 }), ok(true, { surface: "fork", attempts: 3 }), ok(true, { surface: "fork", attempts: 3 })],
    expect: "struggling",
  },
  {
    name: "leaning on hints → struggling",
    events: [ok(true, { hintUsed: true }), ok(true, { hintUsed: true }), ok(true), ok(true)],
    expect: "struggling",
  },
  {
    name: "slow & shaky (correct but laboring) → struggling",
    events: [ok(true, { latencyMs: 20000 }), ok(false), ok(true, { latencyMs: 22000 }), ok(true, { latencyMs: 19000 })],
    expect: "struggling",
  },
  {
    name: "weak seed + short perfect streak → NOT breezing yet (flow)",
    events: [ok(true), ok(true), ok(true)],
    seed: { totalAttempted: 10, totalCorrect: 3 },
    expect: "flow",
  },
  {
    name: "weak seed + longer perfect streak → breezing (earned it)",
    events: [ok(true), ok(true), ok(true), ok(true), ok(true)],
    seed: { totalAttempted: 10, totalCorrect: 3 },
    expect: "breezing",
  },
  {
    name: "recovery: struggled then nailing it → flow",
    events: [ok(false), ok(false), ok(true), ok(true), ok(true), ok(true)],
    expect: "flow",
  },
];

let pass = 0;
const fails: string[] = [];
console.log("\nADAPTIVE CONTROLLER — calibration\n" + "─".repeat(60));
for (const c of cases) {
  const r = classifyState(c.events, c.seed);
  const good = r.state === c.expect;
  if (good) pass++;
  else fails.push(`${c.name}: expected ${c.expect}, got ${r.state}`);
  console.log(
    `${good ? "✓" : "✗"} ${c.name.padEnd(48)} ${r.state.padEnd(11)} ` +
      `(${r.directive}, throttle ${r.throttle >= 0 ? "+" : ""}${r.throttle}, conf ${r.confidence.toFixed(2)}) — ${r.reason}`,
  );
}
console.log("─".repeat(60));
console.log(`${pass}/${cases.length} cases pass`);
if (fails.length) {
  console.log("\nFAILURES:");
  for (const f of fails) console.log("  ✗ " + f);
  process.exit(1);
}
console.log("all calibration cases pass ✓\n");
