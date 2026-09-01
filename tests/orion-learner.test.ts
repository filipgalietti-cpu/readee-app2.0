import { describe, it, expect } from "vitest";
import { rankSkills, pickNextSkill, mastery, isDue, type SkillState } from "@/lib/orion/learner";

const NOW = 1_000_000_000_000; // fixed clock
const skill = (id: string, o: number, correct: number, attempted: number, due?: number | null): SkillState => ({
  id, order: o, totalCorrect: correct, totalAttempted: attempted, nextDue: due,
});

describe("isDue / mastery", () => {
  it("treats a missing due-date as due now", () => {
    expect(isDue(skill("a", 0, 0, 0), NOW)).toBe(true);
    expect(isDue(skill("a", 0, 0, 0, null), NOW)).toBe(true);
  });
  it("is due when the date has passed, not yet when it's future", () => {
    expect(isDue(skill("a", 0, 1, 1, NOW - 1000), NOW)).toBe(true);
    expect(isDue(skill("a", 0, 1, 1, NOW + 1000), NOW)).toBe(false);
  });
  it("accepts ISO strings for the due-date", () => {
    expect(isDue(skill("a", 0, 1, 1, undefined), NOW)).toBe(true);
    expect(isDue({ id: "a", order: 0, totalCorrect: 1, totalAttempted: 1, nextDue: new Date(NOW + 1000).toISOString() }, NOW)).toBe(false);
  });
  it("computes mastery, 0 when never attempted", () => {
    expect(mastery(skill("a", 0, 3, 4))).toBeCloseTo(0.75, 5);
    expect(mastery(skill("a", 0, 0, 0))).toBe(0);
  });
});

describe("rankSkills — the adaptive order", () => {
  it("serves brand-new skills first, in teaching order", () => {
    const skills = [
      skill("mastered", 0, 10, 10, NOW - 1000), // attempted
      skill("new-2", 2, 0, 0),
      skill("new-1", 1, 0, 0),
    ];
    expect(rankSkills(skills, NOW).map((s) => s.id)).toEqual(["new-1", "new-2", "mastered"]);
  });

  it("among attempted skills, serves DUE before not-due", () => {
    const skills = [
      skill("not-due", 0, 5, 10, NOW + 100000),
      skill("due", 1, 5, 10, NOW - 100000),
    ];
    expect(rankSkills(skills, NOW).map((s) => s.id)).toEqual(["due", "not-due"]);
  });

  it("among due attempted skills, serves the WEAKEST first", () => {
    const skills = [
      skill("strong", 0, 9, 10, NOW - 1000), // 0.9
      skill("weak", 1, 3, 10, NOW - 1000), // 0.3
      skill("mid", 2, 6, 10, NOW - 1000), // 0.6
    ];
    expect(rankSkills(skills, NOW).map((s) => s.id)).toEqual(["weak", "mid", "strong"]);
  });

  it("does not mutate the input array", () => {
    const skills = [skill("b", 1, 0, 0), skill("a", 0, 0, 0)];
    const before = skills.map((s) => s.id);
    rankSkills(skills, NOW);
    expect(skills.map((s) => s.id)).toEqual(before);
  });
});

describe("pickNextSkill — with interleaving", () => {
  const skills = [
    skill("weak", 0, 3, 10, NOW - 1000),
    skill("mid", 1, 6, 10, NOW - 1000),
  ];

  it("picks the top-ranked skill by default", () => {
    expect(pickNextSkill(skills, NOW)?.id).toBe("weak");
  });

  it("rotates off the just-served skill when an alternative exists", () => {
    expect(pickNextSkill(skills, NOW, { avoidId: "weak" })?.id).toBe("mid");
  });

  it("still serves the only skill even if it's the one to avoid (no starving)", () => {
    expect(pickNextSkill([skills[0]], NOW, { avoidId: "weak" })?.id).toBe("weak");
  });

  it("returns null when there are no skills", () => {
    expect(pickNextSkill([], NOW)).toBeNull();
  });
});
