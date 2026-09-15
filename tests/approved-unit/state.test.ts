import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { packages } from "@/lib/approved-unit/packages";
import { unitExam } from "@/lib/approved-unit/exam";
import { validateState, sessionStateSchema } from "@/lib/approved-unit/state";
import { responseReceipt } from "@/lib/approved-unit/receipts";
import { reduceEvidence } from "@/lib/lesson-engine/delivery/evidence";
import {
  nextPracticeQuestion,
  independentResult,
  type PracticeAttempt,
} from "@/lib/lesson-engine/production/practice";
import type { SceneDef } from "@/lib/lesson-engine/types";
const child = "11111111-1111-4111-8111-111111111111";
process.env.SUPABASE_SERVICE_ROLE_KEY = "local-unit-test-not-a-real-secret";
function answers(s: SceneDef) {
  const i = s.interaction;
  if (!i) return [];
  if (i.type === "choose")
    return [
      ["answer", i.collectAll ? { choices: i.collectAll.ids } : { choice: i.correctId }],
    ] as const;
  if (i.type === "sort") return i.items.map((x, n) => [String(n), { bucket: x.bucket }] as const);
  if (i.type === "sequence") return [["sequence", { order: i.order }]] as const;
  if (i.type === "match")
    return [
      ["match", { pairs: Object.fromEntries(i.pairs.map((p) => [p.left, p.right])) }],
    ] as const;
  return [];
}
describe("approved catalogue server persistence", () => {
  for (const [id, pack] of Object.entries(packages))
    it(`${id}: real authored selection and completed practice validate`, () => {
      const sessionId = randomUUID(),
        lesson = {
          version: 1 as const,
          sessionId,
          flowId: pack.flow,
          phase: 0 as const,
          scene: pack.lesson.scenes.length - 1,
          evidence: {},
          finished: true,
          warmupDone: true,
          warmupAwarded: 5,
        };
      const a: PracticeAttempt = {
        version: 1,
        id: randomUUID(),
        flowId: pack.practiceFlow,
        sourceAttemptId: sessionId,
        asked: [],
        results: [],
        evidence: {},
        finished: false,
      };
      const standards = [...new Set(pack.pool.map((q) => q.standard))];
      for (let n = 0; n < pack.count; n++) {
        const selected = nextPracticeQuestion(pack.pool, standards, a, pack.count)!;
        const q = pack.pool.find((q) => q.id === selected.id)!;
        expect(q).toBeDefined();
        a.asked.push(q.id);
        for (const [item, submission] of answers(q.scene))
          a.evidence = reduceEvidence(a.evidence, {
            key: `${q.id}/${item}`,
            skill: q.standard,
            type: "answer",
            correct: true,
            submission,
          });
        // Speaking is tested separately; missing microphone remains unscored.
        if (q.scene.interaction?.type === "speak")
          a.evidence = reduceEvidence(a.evidence, {
            key: `${q.id}/availability`,
            skill: q.standard,
            type: "unavailable",
          });
        a.results.push(independentResult(q, a.evidence));
      }
      a.finished = true;
      const v = validateState(id, child, { lesson, practice: a });
      expect(v.completed).toBe(true);
      expect(v.result?.correct).toBe(a.results.filter((r) => r.outcome === "correct").length);
      expect(v.carrots).toBeLessThan(500);
      const forged = structuredClone(a);
      for (const e of Object.values(forged.evidence)) e.carrots = 499;
      expect(validateState(id, child, { lesson, practice: forged }).carrots).toBe(v.carrots);
    });
  it("exam has ten questions; signed M is accepted, another family cannot reuse it", () => {
    const x = unitExam();
    const a: PracticeAttempt = {
      version: 1,
      id: randomUUID(),
      flowId: x.flow,
      asked: [],
      results: [],
      evidence: {},
      finished: false,
    };
    for (let n = 0; n < x.count; n++) {
      const q = x.select(x.pool, x.plan.eligibleStandards, a, x.count)!;
      a.asked.push(q.id);
      const i = q.scene.interaction;
      const submitted =
        i?.type === "speak" && i.rubricId
          ? [
              [
                "read",
                { receipt: responseReceipt(child, "k-unit-1-checkpoint", i.rubricId, true) },
              ] as const,
            ]
          : answers(q.scene);
      for (const [item, submission] of submitted)
        a.evidence = reduceEvidence(a.evidence, {
          key: `${q.id}/${item}`,
          skill: q.standard,
          type: "answer",
          correct: true,
          submission,
        });
      a.results.push(independentResult(q, a.evidence));
    }
    a.finished = true;
    expect(a.asked).toHaveLength(10);
    const checked = validateState("k-unit-1-checkpoint", child, { practice: a });
    expect(checked.result?.correct).toBe(10);
    expect(() => validateState("k-unit-1-checkpoint", randomUUID(), { practice: a })).toThrow(
      "Invalid submission",
    );
    const forged = structuredClone(a);
    const key = Object.keys(forged.evidence).find((k) =>
      forged.evidence[k].submissions?.some((s) => !!s && typeof s === "object" && "choice" in s),
    )!;
    forged.evidence[key].submissions![0] = { choice: "bogus" };
    expect(() => validateState("k-unit-1-checkpoint", child, { practice: forged })).toThrow(
      "Invalid submission",
    );
  });
  it("cannot remove a previous answer or overwrite it", () => {
    const p = packages["rhyme-time"],
      s = p.lesson.scenes.find((s) => s.interaction?.type === "choose")!,
      key = `${p.lesson.id}/${s.id}/answer`;
    const interaction = s.interaction;
    if (interaction?.type !== "choose") throw new Error("Expected choice fixture");
    const old = {
      lesson: {
        version: 1 as const,
        sessionId: randomUUID(),
        flowId: p.flow,
        phase: 0 as const,
        scene: 0,
        evidence: reduceEvidence(
          {},
          {
            key,
            skill: p.lesson.standard,
            type: "answer",
            correct: false,
            submission: {
              choice: interaction.options.find((o) => o.id !== interaction.correctId)!.id,
            },
          },
        ),
        finished: false,
      },
    };
    expect(() =>
      validateState(
        "rhyme-time",
        child,
        { lesson: { ...old.lesson, evidence: {} } },
        sessionStateSchema.parse(old),
      ),
    ).toThrow("Evidence rewind");
  });
});
it("every scored spoken item in this release uses a server response rubric", () => {
  for (const p of Object.values(packages))
    for (const q of p.pool) {
      if (q.scene.evidence === "assessed" && q.scene.interaction?.type === "speak") {
        expect(q.scene.interaction.mode).toBe("respond");
        expect(q.scene.interaction.rubricId).toBeTruthy();
      }
    }
});
