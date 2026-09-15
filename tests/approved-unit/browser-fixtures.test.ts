import { it, expect } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { printPagePositions } from "@/lib/lesson-engine/delivery/print-page";
import { unitExam } from "@/lib/approved-unit/exam";
import { packages } from "@/lib/approved-unit/packages";
import { validateState } from "@/lib/approved-unit/state";
it("prepares owned-reader fixtures at the first real choice in each approved lesson", () => {
  const child = "33333333-3333-4333-8333-333333333333";
  const fixtures = Object.entries(packages).map(([id, p]) => {
    const scene = p.lesson.scenes.findIndex(
        (s) => s.interaction?.type === "choose" && !s.interaction.collectAll,
      ),
      s = p.lesson.scenes[scene],
      i = s.interaction;
    expect(i?.type).toBe("choose");
    if (i?.type !== "choose") throw Error("No choice");
    const state = {
      lesson: {
        version: 1,
        sessionId: randomUUID(),
        flowId: p.flow,
        phase: 0,
        scene,
        evidence: {},
        finished: false,
        warmupDone: true,
        warmupAwarded: 5,
      },
    };
    validateState(id, child, state);
    const pos = i.printPage
      ? printPagePositions(i.printPage).find((p) => p.id === i.correctId)
      : undefined;
    const choice = pos
      ? pos.kind === "word"
        ? `${pos.label}, line ${pos.line + 1}, word ${pos.index + 1}${i.printPage?.markerId === pos.id ? ", marked word" : ""}`
        : `Space after word ${pos.index + 1} on line ${pos.line + 1}`
      : i.options.find((o) => o.id === i.correctId)!.label;
    return {
      id,
      scene: s.id,
      question: s.prompt,
      choice,
      evidenceKey: `${p.lesson.id}/${s.id}/answer`,
      state,
    };
  });
  if (process.env.READEE_WRITE_FIXTURES === "1") {
    mkdirSync("docs/integration/evidence", { recursive: true });
    writeFileSync("docs/integration/evidence/fixtures.json", JSON.stringify(fixtures, null, 2));
    const letter = unitExam().pool.find(
      (q) => q.scene.interaction?.type === "speak" && q.scene.prompt.includes("letter"),
    )!.scene.interaction;
    if (letter?.type === "speak")
      writeFileSync(
        "docs/integration/evidence/exam-rubric.json",
        JSON.stringify({ id: letter.rubricId }),
      );
  }
  expect(fixtures).toHaveLength(8);
});
