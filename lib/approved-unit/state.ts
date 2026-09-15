import "server-only";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { packages } from "./packages";
import { unitExam } from "./exam";
import { gradeSubmission } from "./grading";
import { receiptVerdict } from "./receipts";
import {
  reduceEvidence,
  practiceCarrots,
  practiceStreak,
  sceneItemIds,
} from "@/lib/lesson-engine/delivery/evidence";
import {
  independentResult,
  validPracticeAttempt,
  nextPracticeQuestion,
  isPerfectPractice,
} from "@/lib/lesson-engine/production/practice";
import { examReadiness } from "@/lib/lesson-engine/production/exam-readiness";
import type { SceneDef } from "@/lib/lesson-engine/types";
import type { Evidence } from "@/lib/lesson-engine/delivery/types";
import type { PracticeAttempt } from "@/lib/lesson-engine/production/practice";
const submission = z.union([
  z.object({ choice: z.string().max(100) }),
  z.object({ choices: z.array(z.string().max(100)).max(30) }),
  z.object({ order: z.array(z.string().max(100)).max(30) }),
  z.object({ bucket: z.string().max(200) }),
  z.object({ pairs: z.record(z.string().max(200), z.string().max(200)) }),
  z.object({ indices: z.array(z.number().int().min(0).max(500)).max(50) }),
  z.object({ receipt: z.string().max(2000) }),
]);
const entry = z.object({
  attempts: z.number().int().min(0).max(50),
  helped: z.boolean(),
  outcome: z.enum([
    "first-try",
    "after-help",
    "after-error",
    "exhausted",
    "skipped",
    "unavailable",
    "practice",
  ]),
  completed: z.boolean(),
  skill: z.string().max(30),
  submissions: z.array(submission).max(50).optional(),
  carrots: z.number().min(0).max(500).optional(),
  rewardOrder: z.number().int().min(0).max(10000).optional(),
  streakAfter: z.number().int().min(0).max(10000).optional(),
  firstResponse: z.enum(["correct", "incorrect", "assisted"]).optional(),
  reading: z
    .object({
      totalWords: z.number().int().min(1).max(500),
      wordsAttempted: z.number().int().min(0).max(500),
      wordsCorrect: z.number().int().min(0).max(500),
      uncertainWords: z.number().int().min(0).max(500),
    })
    .optional(),
  response: z.object({ rubricId: z.string().max(100), verdict: z.literal("accepted") }).optional(),
});
const evidence = z.record(z.string().max(240), entry).refine((v) => Object.keys(v).length <= 300);
const lessonSchema = z.object({
  version: z.literal(1),
  sessionId: z.uuid(),
  flowId: z.string().max(200),
  phase: z.literal(0),
  scene: z.number().int().min(0).max(100),
  evidence,
  finished: z.boolean(),
  warmupDone: z.boolean().optional(),
  warmupAwarded: z.number().int().min(0).max(100).optional(),
});
const practiceSchema = z.object({
  version: z.literal(1),
  id: z.uuid(),
  flowId: z.string().max(250),
  startingStreak: z.number().int().min(0).max(500).optional(),
  sourceAttemptId: z.uuid().optional(),
  asked: z.array(z.string().max(150)).max(50),
  results: z
    .array(
      z.object({
        itemId: z.string().max(150),
        standard: z.string().max(30),
        band: z.enum(["easier", "core", "harder", "challenging"]),
        outcome: z.enum(["correct", "incorrect", "assisted", "practice", "skipped", "unavailable"]),
      }),
    )
    .max(50),
  evidence,
  finished: z.boolean(),
});
export const sessionStateSchema = z.object({
  lesson: lessonSchema.optional(),
  practice: practiceSchema.optional(),
});
export type SessionState = z.infer<typeof sessionStateSchema>;
/** Prevent a subsequent save from erasing first answers, help, or speech failures. */
function monotonic(old: Evidence = {}, next: Evidence = {}) {
  for (const [key, a] of Object.entries(old)) {
    const b = next[key];
    if (!b || b.attempts < a.attempts || (a.helped && !b.helped)) throw Error("Evidence rewind");
    const prior = a.submissions ?? [],
      after = b.submissions ?? [];
    if (prior.some((x, n) => !isDeepStrictEqual(x, after[n]))) throw Error("Answer rewind");
  }
}
function canonicalEvidence(
  raw: Evidence,
  scenes: Map<string, SceneDef>,
  child: string,
  lesson: string,
  startingStreak = 0,
): Evidence {
  let out: Evidence = {};
  for (const [key, e] of Object.entries(raw).sort(
    (a, b) => (a[1].rewardOrder ?? 0) - (b[1].rewardOrder ?? 0),
  )) {
    const split = key.lastIndexOf("/"),
      scene = scenes.get(key.slice(0, split)),
      item = key.slice(split + 1);
    if (!scene || ![...sceneItemIds(scene), "help", "availability", "skip", "scene"].includes(item))
      throw Error("Unknown evidence item");
    const skill = scene.skill ?? e.skill;
    if (e.helped) out = reduceEvidence(out, { key, skill, type: "help" }, startingStreak);
    if (e.outcome === "unavailable") {
      out = reduceEvidence(out, { key, skill, type: "unavailable" }, startingStreak);
      continue;
    }
    const rawAnswers = e.submissions ?? [];
    for (const a of rawAnswers) {
      const correct = gradeSubmission(scene, item, a, (r, rubric) =>
        receiptVerdict(r, child, lesson, rubric),
      );
      if (correct === null) throw Error("Invalid submission");
      out = reduceEvidence(
        out,
        {
          key,
          skill,
          type: "answer",
          correct,
          practice: scene.evidence !== "assessed",
          submission: a,
        },
        startingStreak,
      );
    }
    // Client streaming pronunciation is practice evidence only, never exam mastery.
    if (
      !rawAnswers.length &&
      scene.interaction?.type === "speak" &&
      scene.evidence !== "assessed" &&
      e.completed &&
      e.attempts > 0
    )
      out = reduceEvidence(out, { key, skill, type: "reflection" }, startingStreak);
    if (
      !rawAnswers.length &&
      scene.interaction?.type === "choose" &&
      scene.interaction.mode === "reflection" &&
      e.completed
    )
      out = reduceEvidence(out, { key, skill, type: "reflection" }, startingStreak);
    if (e.outcome === "skipped" || e.outcome === "exhausted")
      out = reduceEvidence(
        out,
        { key, skill, type: e.outcome === "skipped" ? "skip" : "exhausted" },
        startingStreak,
      );
  }
  return out;
}
export function validateState(id: string, child: string, raw: unknown, old: SessionState = {}) {
  const state = sessionStateSchema.parse(raw),
    pack = packages[id],
    exam = id === "k-unit-1-checkpoint" ? unitExam() : null;
  let lessonCarrots = 0,
    lessonStreak = 0;
  if (state.lesson) {
    const a = state.lesson;
    if (!pack || a.flowId !== pack.flow || a.scene >= pack.lesson.scenes.length)
      throw Error("Wrong lesson");
    if (old.lesson && a.sessionId !== old.lesson.sessionId) throw Error("Attempt changed");
    monotonic(old.lesson?.evidence, a.evidence);
    const canonical = canonicalEvidence(
      a.evidence,
      new Map(pack.lesson.scenes.map((s) => [`${pack.lesson.id}/${s.id}`, s])),
      child,
      id,
    );
    lessonStreak = practiceStreak(canonical);
    lessonCarrots =
      practiceCarrots(canonical) +
      (a.warmupDone ? Math.min(a.warmupAwarded ?? 0, 50) : 0) +
      (a.finished ? 5 : 0);
  }
  if (old.lesson && !state.lesson) throw Error("Missing lesson");
  let result: Record<string, unknown> | null = null,
    completed = false,
    carrots = 0;
  if (state.practice) {
    const a = state.practice,
      pool = exam?.pool ?? pack?.pool,
      count = exam?.count ?? pack?.count,
      flow = exam?.flow ?? pack?.practiceFlow;
    if (!pool || !count || !flow || !validPracticeAttempt(a, flow, pool, count))
      throw Error("Invalid practice");
    if (pack && (!state.lesson?.finished || a.sourceAttemptId !== state.lesson.sessionId))
      throw Error("Lesson must finish first");
    if (
      old.practice &&
      (a.id !== old.practice.id ||
        old.practice.asked.some((q, n) => a.asked[n] !== q) ||
        old.practice.results.length > a.results.length)
    )
      throw Error("Practice rewind");
    monotonic(old.practice?.evidence, a.evidence);
    const canonical = canonicalEvidence(
      a.evidence,
      new Map(pool.map((q) => [q.id, q.scene])),
      child,
      id,
      exam ? 0 : lessonStreak,
    );
    const results = a.results.map((r) =>
      independentResult(pool.find((q) => q.id === r.itemId)!, canonical),
    );
    // The server, not a URL band or arbitrary item ID, validates question selection.
    const selector = exam?.select ?? nextPracticeQuestion;
    for (let n = 0; n < a.asked.length; n++) {
      const prefix = {
        ...a,
        asked: a.asked.slice(0, n),
        results: results.slice(0, n),
        evidence: canonical,
        finished: false,
      };
      if (
        selector(
          pool,
          exam?.plan.eligibleStandards ?? [...new Set(pack.pool.map((q) => q.standard))],
          prefix,
          count,
        )?.id !== a.asked[n]
      )
        throw Error("Question assignment mismatch");
    }
    if (a.finished && a.asked.length !== count) throw Error("Incomplete sitting");
    const scored = { ...a, evidence: canonical, results } as PracticeAttempt;
    completed = a.finished;
    result = {
      attempted: results.filter((r) => ["correct", "incorrect", "assisted"].includes(r.outcome))
        .length,
      correct: results.filter((r) => r.outcome === "correct").length,
      results,
      ...(exam ? { readiness: examReadiness(exam.plan, scored, exam.closing) } : {}),
    };
    carrots = exam
      ? results.filter((r) => ["correct", "incorrect", "assisted", "practice"].includes(r.outcome))
          .length + 3
      : lessonCarrots + practiceCarrots(canonical) + 3 + (isPerfectPractice(scored, count) ? 3 : 0);
  }
  if (old.practice && !state.practice) throw Error("Missing practice");
  return { state, completed, result, carrots: Math.min(500, carrots) };
}
export function allowedRubrics(id: string) {
  const pack = packages[id],
    exam = id === "k-unit-1-checkpoint" ? unitExam() : null;
  const scenes = pack
    ? [...pack.lesson.scenes, ...pack.pool.map((q) => q.scene)]
    : (exam?.pool.map((q) => q.scene) ?? []);
  return new Set(
    scenes.flatMap((s) =>
      s.interaction?.type === "speak"
        ? [s.interaction.rubricId, s.interaction.reflection?.followUp.rubricId].filter(
            (x): x is string => !!x,
          )
        : [],
    ),
  );
}
