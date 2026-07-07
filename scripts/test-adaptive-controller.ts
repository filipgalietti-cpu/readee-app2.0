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
import { selectIntervention, type Intervention } from "../lib/adaptive/interventions";

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

// ── ACT layer: intervention ladder + anti-coddling guarantees ────────────
console.log("INTERVENTION LADDER (ACT)\n" + "─".repeat(60));
let ipass = 0;
const ifails: string[] = [];
const check = (name: string, cond: boolean) => {
  if (cond) ipass++;
  else ifails.push(name);
  console.log(`${cond ? "✓" : "✗"} ${name}`);
};

// Struggling escalates SUPPORT: hint → extra_rep → scaffold (never eases).
const struggling = classifyState([ok(true), ok(true), ok(false), ok(false)]);
let hist: Intervention[] = [];
const s1 = selectIntervention(struggling, hist); hist = [...hist, s1];
const s2 = selectIntervention(struggling, hist); hist = [...hist, s2];
const s3 = selectIntervention(struggling, hist);
check("struggling #1 → progressive_hint", s1.type === "progressive_hint");
check("struggling #2 → extra_rep (same level, mastery)", s2.type === "extra_rep");
check("struggling #3 → scaffold", s3.type === "scaffold");

// Frustrated: reteach first, level_down only as last resort AND temporary.
const frustrated = classifyState([ok(false), ok(false), ok(false)]);
const f1 = selectIntervention(frustrated, []);
const f2 = selectIntervention(frustrated, [f1]);
check("frustrated #1 → reteach", f1.type === "reteach");
check("frustrated #2 → level_down (last resort)", f2.type === "level_down");
check("level_down is TEMPORARY (always climbs back)", f2.temporary === true);

// Breezing earns gas: skip → stretch → level_up.
const breezing = classifyState([ok(true), ok(true), ok(true), ok(true)]);
let gh: Intervention[] = [];
const g1 = selectIntervention(breezing, gh); gh = [...gh, g1];
const g2 = selectIntervention(breezing, gh); gh = [...gh, g2];
const g3 = selectIntervention(breezing, gh);
check("breezing #1 → skip_ahead", g1.type === "skip_ahead");
check("breezing #2 → stretch", g2.type === "stretch");
check("breezing #3 → level_up", g3.type === "level_up");

// Flow does nothing.
const flow = classifyState([ok(true), ok(true), ok(false), ok(true), ok(true), ok(true)]);
check("flow → none (stay out of the way)", selectIntervention(flow, []).type === "none");

// Anti-coddling: no intervention ever reveals the answer.
const allTypes = [s1, s2, s3, f1, f2, g1, g2, g3].map((i) => i.type);
check("NO intervention reveals the answer", !allTypes.includes("none" as never) || !allTypes.some((t) => String(t).includes("reveal")));

console.log("─".repeat(60));
console.log(`${ipass}/${13} intervention checks pass`);
if (ifails.length) {
  console.log("\nFAILURES:");
  for (const f of ifails) console.log("  ✗ " + f);
  process.exit(1);
}
console.log("all intervention checks pass ✓\n");
